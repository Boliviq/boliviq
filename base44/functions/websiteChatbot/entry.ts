import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Public-facing website chatbot — no auth required.
// Rate-limited by visitor ID. Uses Base44's built-in InvokeLLM integration.
// Captures leads (name, email, phone) with consent for follow-up.

const RATE_LIMIT = new Map();

function assertRateLimit(visitorId) {
  const now = Date.now();
  const current = RATE_LIMIT.get(visitorId);
  if (!current || current.reset < now) {
    RATE_LIMIT.set(visitorId, { count: 1, reset: now + 60000 });
    return;
  }
  if (current.count >= 12) {
    throw new Error('Please wait a moment before sending another message.');
  }
  current.count += 1;
}

const BASE_KNOWLEDGE = `Boliviq is an AI-powered real estate investing and construction intelligence platform.
It helps users find and organize properties, analyze deals, estimate construction costs, create material takeoffs and scopes of work, manage leads and pipelines, generate reports, and automate workflows.
Brand promise: AI That Builds Better Investors.
Never promise guaranteed profits, legal outcomes, financing approval, exact construction pricing, or investment returns.
Encourage users to verify investment, construction, legal, tax, lending, and property information with qualified professionals.
When a visitor shows buying intent, offer to collect their name and email or phone. Email and SMS follow-up require explicit opt-in.
Do not claim that Boliviq can contact a visitor who has not voluntarily supplied contact information and consent.
Boliviq offers these plans: Homeowner (free), Homeowner + AI ($9.99/mo), Professional ($49.99/mo), Team Professional ($199/mo), Professional + AI ($149.99/mo), Team Professional + AI ($699/mo), Professional AI Unlimited ($499/mo), Team AI Unlimited ($1,299/mo).
Boliviq's marketplace connects homeowners, contractors, agents, investors, and vendors.
Key features: deal analyzer (flip, rental, BRRRR), construction estimator with 20% time buffer, CRM pipeline, AI assistant, credit economy, referrals.`;

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const visitorId = (body.visitorId || '').toString().trim();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const locale = (body.locale || 'en').toString().trim();
    const pageUrl = (body.pageUrl || '').toString().trim();

    if (!visitorId || visitorId.length < 8) {
      return Response.json({ error: 'A valid visitorId is required' }, { status: 400 });
    }
    if (!messages.length || messages.length > 20) {
      return Response.json({ error: '1-20 messages required' }, { status: 400 });
    }

    assertRateLimit(visitorId);

    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // Build conversation prompt for the LLM
    const conversationText = messages
      .map(m => `${m.role === 'assistant' ? 'Assistant' : 'Visitor'}: ${m.content}`)
      .join('\n');

    const prompt = `${BASE_KNOWLEDGE}

Respond in the visitor's selected language (${locale}). Be concise, friendly, and helpful. Keep responses under 200 words unless the visitor asks for detail.

Conversation so far:
${conversationText}

Respond as the Assistant to the last Visitor message:`;

    let reply;
    try {
      const llmResp = await sr.integrations.Core.InvokeLLM({
        prompt,
        model: 'gemini_3_flash',
      });
      reply = typeof llmResp === 'string' ? llmResp : (llmResp?.response || llmResp?.text || JSON.stringify(llmResp));
    } catch (llmErr) {
      console.log('websiteChatbot LLM error:', llmErr.message);
      reply = 'Thanks for visiting Boliviq. I can help explain our property analysis, construction planning, CRM, automation, and pricing tools. What are you trying to accomplish?';
    }

    // Store conversation + capture lead
    let conversationId = body.conversationId;
    try {
      if (!conversationId) {
        const conv = await sr.entities.Conversation.create({
          workspace_id: 'public',
          title: `Website chat — ${visitorId.slice(0, 8)}`,
        });
        conversationId = conv.id;
      }

      const lastUserMsg = messages.filter(m => m.role === 'user').pop();
      if (lastUserMsg) {
        await sr.entities.Message.create({
          conversation_id: conversationId,
          role: 'user',
          content: (lastUserMsg.content || '').toString().slice(0, 4000),
        });
      }

      await sr.entities.Message.create({
        conversation_id: conversationId,
        role: 'assistant',
        content: reply.slice(0, 4000),
      });

      // Capture lead if provided
      const lead = body.lead;
      if (lead && (lead.email || lead.phone)) {
        const existingContacts = lead.email
          ? await sr.entities.Contact.filter({ email: lead.email })
          : [];
        if (!existingContacts.length) {
          await sr.entities.Contact.create({
            workspace_id: 'public',
            full_name: lead.name || 'Website Lead',
            email: lead.email || undefined,
            phone: lead.phone || undefined,
            type: 'other',
            stage: 'new',
            notes: `Captured via website chatbot. Source: ${pageUrl || 'unknown'}. Consent: email=${lead.consentEmail}, sms=${lead.consentSms}`,
            tags: ['website_chatbot', 'lead'],
          });
        }
      }
    } catch (persistErr) {
      console.log('websiteChatbot persistence error:', persistErr.message);
    }

    return Response.json({
      conversationId,
      reply,
      leadCaptured: Boolean(body.lead && (body.lead.email || body.lead.phone)),
    });
  } catch (error) {
    console.log('websiteChatbot error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}