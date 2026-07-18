import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.4.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const workspaceId = (body.workspace_id || '').toString().trim();
    if (!workspaceId) return Response.json({ error: 'workspace_id is required' }, { status: 400 });

    const memberships = await base44.asServiceRole.entities.WorkspaceMembership.filter({
      workspace_id: workspaceId, user_id: user.id, status: 'active',
    });
    if (!memberships.length) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const role = memberships[0].role;
    if (role !== 'owner' && role !== 'admin') {
      return Response.json({ error: 'Only workspace owners/admins can manage billing' }, { status: 403 });
    }

    const workspace = await base44.asServiceRole.entities.Workspace.get(workspaceId);
    if (!workspace.stripe_customer_id) {
      return Response.json({ error: 'No billing account for this workspace yet' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const origin = req.headers.get('origin') || 'https://app.boliviq.com';
    const session = await stripe.billingPortal.sessions.create({
      customer: workspace.stripe_customer_id,
      return_url: origin + '/billing',
    });
    return Response.json({ url: session.url });
  } catch (error) {
    console.log('createBillingPortalSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});