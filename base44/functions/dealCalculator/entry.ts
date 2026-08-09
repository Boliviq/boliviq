import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// --- Helpers ---
const num = (v, d = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : d;
};

// --- Mortgage ---
function monthlyMortgage(principal, annualRatePct, years) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

// --- MAO / 70% rule ---
function mao(arv, rehab, pct = 0.7, desiredProfit = 0, otherCosts = 0) {
  return arv * pct - rehab - desiredProfit - otherCosts;
}

// --- Cap rate ---
function capRate(noiAnnual, price) {
  return price > 0 ? noiAnnual / price : 0;
}

// --- Cash on cash ---
function cashOnCash(annualCashFlow, cashInvested) {
  return cashInvested > 0 ? annualCashFlow / cashInvested : 0;
}

// --- ROI ---
function roi(netProfit, invested) {
  return invested > 0 ? netProfit / invested : 0;
}

// --- Flip analysis ---
function analyzeFlip(i) {
  const buyClosing = i.purchasePrice * (i.closingBuyPct / 100);
  const sellClosing = i.arv * (i.closingSellPct / 100);
  const commissions = i.arv * ((i.sellingCostsPct ?? 6) / 100);
  const holding = i.monthlyHolding * i.holdingMonths;
  const totalCost = i.purchasePrice + i.rehab + buyClosing + sellClosing + commissions + holding + i.financingCost;
  const netProfit = i.arv - totalCost;
  const returnOnInvestment = roi(netProfit, totalCost);
  const margin = i.arv > 0 ? netProfit / i.arv : 0;
  const maoVal = mao(i.arv, i.rehab, 0.7, i.desiredProfit ?? 0, buyClosing + holding + i.financingCost);
  return {
    buyClosing, sellClosing, commissions, holding, totalCost,
    netProfit, roi: returnOnInvestment, margin, mao: maoVal,
    breakEven: totalCost,
  };
}

// --- Rental analysis ---
function analyzeRental(i) {
  const loan = i.purchasePrice * (1 - i.downPct / 100);
  const down = i.purchasePrice * (i.downPct / 100);
  const mtg = monthlyMortgage(loan, i.ratePct, i.loanYears);
  const grossRent = i.monthlyRent;
  const vacancy = grossRent * (i.vacancyPct / 100);
  const effRent = grossRent - vacancy;
  const opex =
    i.taxesAnnual / 12 +
    i.insuranceAnnual / 12 +
    grossRent * (i.maintenancePct / 100) +
    grossRent * (i.mgmtPct / 100) +
    grossRent * (i.capexPct / 100) +
    i.utilitiesMonthly +
    i.hoaMonthly;
  const noiMonthly = effRent - opex;
  const cashFlow = noiMonthly - mtg;
  const noiAnnual = noiMonthly * 12;
  const cashInvested = down + i.rehab;
  return {
    loan, down, mortgage: mtg, vacancy, opex,
    noiMonthly, noiAnnual, cashFlow, annualCashFlow: cashFlow * 12,
    capRate: capRate(noiAnnual, i.purchasePrice + i.rehab),
    cashOnCash: cashOnCash(cashFlow * 12, cashInvested),
    dscr: mtg > 0 ? noiMonthly / mtg : 0,
  };
}

// --- BRRRR ---
function analyzeBrrrr(i) {
  const totalBasis = i.purchasePrice + i.rehab + i.closingCosts;
  const refiLoan = i.arv * (i.refiLtvPct / 100);
  const cashLeft = totalBasis - refiLoan;
  const mtg = monthlyMortgage(refiLoan, i.refiRatePct, i.refiYears);
  const cashFlow = i.monthlyRent - i.monthlyOpex - mtg;
  return {
    totalBasis, refiLoan, cashLeft, mortgage: mtg, cashFlow,
    annualCashFlow: cashFlow * 12,
    cashOnCash: cashOnCash(cashFlow * 12, totalBasis - refiLoan),
    capRate: capRate(i.monthlyRent * 12, totalBasis),
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const type = (body.type || '').toString().trim();
    const inputs = body.inputs || {};

    let result;
    switch (type) {
      case 'mortgage':
        result = {
          monthlyPayment: monthlyMortgage(
            num(inputs.principal), num(inputs.annualRatePct), num(inputs.years, 30)
          ),
        };
        break;
      case 'mao':
        result = {
          mao: mao(
            num(inputs.arv), num(inputs.rehab),
            num(inputs.pct, 0.7), num(inputs.desiredProfit), num(inputs.otherCosts)
          ),
        };
        break;
      case 'flip':
        result = analyzeFlip({
          purchasePrice: num(inputs.purchasePrice),
          rehab: num(inputs.rehab),
          arv: num(inputs.arv),
          closingBuyPct: num(inputs.closingBuyPct, 3),
          closingSellPct: num(inputs.closingSellPct, 3),
          holdingMonths: num(inputs.holdingMonths, 6),
          monthlyHolding: num(inputs.monthlyHolding),
          financingCost: num(inputs.financingCost),
          desiredProfit: num(inputs.desiredProfit),
          sellingCostsPct: num(inputs.sellingCostsPct, 6),
        });
        break;
      case 'rental':
        result = analyzeRental({
          purchasePrice: num(inputs.purchasePrice),
          rehab: num(inputs.rehab),
          downPct: num(inputs.downPct, 25),
          ratePct: num(inputs.ratePct, 7),
          loanYears: num(inputs.loanYears, 30),
          monthlyRent: num(inputs.monthlyRent),
          vacancyPct: num(inputs.vacancyPct, 5),
          taxesAnnual: num(inputs.taxesAnnual),
          insuranceAnnual: num(inputs.insuranceAnnual),
          maintenancePct: num(inputs.maintenancePct, 8),
          mgmtPct: num(inputs.mgmtPct, 8),
          utilitiesMonthly: num(inputs.utilitiesMonthly),
          hoaMonthly: num(inputs.hoaMonthly),
          capexPct: num(inputs.capexPct, 5),
        });
        break;
      case 'brrrr':
        result = analyzeBrrrr({
          purchasePrice: num(inputs.purchasePrice),
          rehab: num(inputs.rehab),
          closingCosts: num(inputs.closingCosts),
          arv: num(inputs.arv),
          refiLtvPct: num(inputs.refiLtvPct, 75),
          refiRatePct: num(inputs.refiRatePct, 7),
          refiYears: num(inputs.refiYears, 30),
          monthlyRent: num(inputs.monthlyRent),
          monthlyOpex: num(inputs.monthlyOpex),
        });
        break;
      default:
        return Response.json({ error: 'Invalid type. Use: mortgage, mao, flip, rental, or brrrr' }, { status: 400 });
    }

    return Response.json({ type, result });
  } catch (error) {
    console.log('dealCalculator error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}