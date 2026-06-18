const validatorForm = document.getElementById("validatorForm");
const loadDemoBtn = document.getElementById("loadDemoBtn");
const emptyState = document.getElementById("emptyState");
const results = document.getElementById("results");
const scoreValue = document.getElementById("scoreValue");
const scoreLabel = document.getElementById("scoreLabel");
const verdict = document.getElementById("verdict");
const metricGrid = document.getElementById("metricGrid");
const strengthList = document.getElementById("strengthList");
const riskList = document.getElementById("riskList");
const nextStepList = document.getElementById("nextStepList");
const investorSnapshot = document.getElementById("investorSnapshot");
const scoreRing = document.querySelector(".score-ring");

const demoData = {
  startupName: "LedgerFlow AI",
  sector: "fintech",
  problem:
    "Finance teams in mid-market companies waste days each month reconciling invoices, ERP entries, and cash movement across fragmented systems.",
  solution:
    "LedgerFlow AI automates reconciliation with AI-assisted anomaly detection, workflow approvals, and direct integrations into accounting systems.",
  customer:
    "Mid-market CFOs, controllers, and finance operations teams managing high invoice volume and multi-entity accounting.",
  moat:
    "ERP integrations, workflow lock-in, finance-specific historical data, and a feedback loop that improves exception detection over time.",
  businessModel: "subscription",
  gtm: "sales",
  marketSize: "1200000000",
  revenue: "42000",
  growthRate: "18",
  founderExperience: "high",
  stage: "beta",
  aiDepth: "core",
  regulatoryRisk: true,
};

const metricConfig = [
  { key: "problemUrgency", label: "Problem urgency" },
  { key: "marketPotential", label: "Market potential" },
  { key: "productClarity", label: "Product clarity" },
  { key: "businessViability", label: "Business model" },
  { key: "traction", label: "Traction" },
  { key: "defensibility", label: "Defensibility" },
  { key: "executionReadiness", label: "Founder readiness" },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function includesAny(text, keywords) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function scoreProblem(problemText) {
  let score = 45;
  if (wordCount(problemText) >= 18) score += 18;
  if (includesAny(problemText, ["expensive", "slow", "manual", "urgent", "compliance", "waste", "delay"])) score += 17;
  if (includesAny(problemText, ["monthly", "daily", "weekly", "repeated", "high volume"])) score += 12;
  return clamp(score, 25, 100);
}

function scoreMarket(marketSize, sector) {
  let score = 30;
  if (marketSize >= 1000000000) score += 35;
  else if (marketSize >= 250000000) score += 24;
  else if (marketSize >= 50000000) score += 14;

  if (["saas", "fintech", "healthtech", "marketplace"].includes(sector)) score += 15;
  if (sector === "other") score -= 6;
  return clamp(score, 20, 100);
}

function scoreClarity(solution, customer) {
  let score = 40;
  if (wordCount(solution) >= 16) score += 18;
  if (wordCount(customer) >= 10) score += 12;
  if (includesAny(solution, ["automate", "platform", "dashboard", "workflow", "predict", "integrate"])) score += 14;
  if (includesAny(customer, ["manager", "team", "founder", "operations", "cfo", "developer"])) score += 10;
  return clamp(score, 25, 100);
}

function scoreBusinessModel(model, gtm) {
  let score = 45;
  if (["subscription", "usage", "enterprise"].includes(model)) score += 25;
  if (model === "ads") score -= 12;
  if (["sales", "product-led", "hybrid", "partnerships"].includes(gtm)) score += 18;
  if (gtm === "paid") score -= 6;
  return clamp(score, 20, 100);
}

function scoreTraction(stage, revenue, growthRate) {
  let score = 18;
  const stageScores = {
    idea: 6,
    mvp: 16,
    beta: 28,
    live: 40,
    scaling: 55,
  };
  score += stageScores[stage] || 0;
  if (revenue >= 50000) score += 18;
  else if (revenue >= 10000) score += 12;
  if (growthRate >= 15) score += 16;
  else if (growthRate >= 7) score += 10;
  return clamp(score, 10, 100);
}

function scoreDefensibility(moat, aiDepth) {
  let score = 28;
  if (wordCount(moat) >= 10) score += 20;
  if (includesAny(moat, ["data", "network", "workflow", "integration", "brand", "community", "distribution", "patent"])) score += 24;
  if (aiDepth === "core") score += 18;
  else if (aiDepth === "assistive") score += 10;
  else if (aiDepth === "none") score -= 12;
  return clamp(score, 15, 100);
}

function scoreExecution(founderExperience, stage, regulatoryRisk) {
  let score = 38;
  if (founderExperience === "high") score += 26;
  else if (founderExperience === "medium") score += 14;
  if (["beta", "live", "scaling"].includes(stage)) score += 14;
  if (regulatoryRisk) score -= 8;
  return clamp(score, 20, 100);
}

function getVerdict(score) {
  if (score >= 80) {
    return {
      label: "High potential",
      message: "This startup idea looks investable for an early-stage prototype, with a strong signal across problem, market, and execution.",
      tone: "good",
    };
  }
  if (score >= 60) {
    return {
      label: "Promising",
      message: "The concept is promising, but the score suggests a few risks must be tightened before this becomes clearly fundable.",
      tone: "warn",
    };
  }
  return {
    label: "Needs work",
    message: "The idea has some signal, but the core assumptions need stronger proof before scaling or fundraising.",
    tone: "bad",
  };
}

function buildInsights(input, metrics, totalScore) {
  const strengths = [];
  const risks = [];
  const nextSteps = [];

  if (metrics.problemUrgency >= 75) strengths.push("The problem appears frequent and painful enough to justify budget or behavior change.");
  if (metrics.marketPotential >= 70) strengths.push("The market is large enough to support a venture-scale business if distribution works.");
  if (metrics.traction >= 60) strengths.push("Existing traction reduces risk and gives the story more credibility.");
  if (metrics.defensibility >= 70) strengths.push("The proposed moat could become durable if the product keeps learning from usage.");
  if (metrics.executionReadiness >= 70) strengths.push("Founder and product readiness suggest the team can execute near-term milestones.");

  if (metrics.problemUrgency < 65) risks.push("The problem statement is not yet specific enough to prove urgency.");
  if (metrics.productClarity < 65) risks.push("The value proposition needs a clearer explanation of user workflow and benefit.");
  if (metrics.traction < 55) risks.push("Traction is still limited, which makes market adoption assumptions harder to trust.");
  if (metrics.defensibility < 60) risks.push("The moat is weak or too generic, so competitors could copy the offering quickly.");
  if (input.regulatoryRisk) risks.push("Compliance and regulatory complexity may slow onboarding, sales cycles, or product rollout.");
  if (metrics.businessViability < 65) risks.push("The pricing model or go-to-market path may be less efficient than it looks.");

  if (input.stage === "idea" || input.stage === "mvp") nextSteps.push("Interview at least 15 target buyers and map the top three objections in plain language.");
  if (toNumber(input.revenue) < 10000) nextSteps.push("Run a narrow pilot with one customer segment and measure willingness to pay before broad expansion.");
  if (metrics.defensibility < 70) nextSteps.push("Strengthen the moat with proprietary data capture, integrations, or embedded workflow usage.");
  if (input.regulatoryRisk) nextSteps.push("Add a compliance roadmap covering data privacy, auditability, and approval workflows.");
  if (totalScore >= 80) nextSteps.push("Package the story into an investor memo with traction, ROI proof, and a focused 18-month milestone plan.");

  if (!strengths.length) strengths.push("The concept has early promise, but its strongest edge depends on sharper positioning.");
  if (!risks.length) risks.push("No major structural risk stands out yet, though pricing and customer retention still need proof.");
  if (!nextSteps.length) nextSteps.push("Focus on repeatable customer acquisition and retention proof over feature expansion.");

  return { strengths, risks, nextSteps };
}

function buildInvestorSnapshot(input, totalScore, metrics) {
  const readiness = totalScore >= 80 ? "Seed-ready" : totalScore >= 65 ? "Pre-seed promising" : "Too early";
  const acquisitionRisk = input.gtm === "paid" ? "High" : input.gtm === "hybrid" ? "Medium" : "Manageable";
  const moatStatus = metrics.defensibility >= 70 ? "Emerging" : metrics.defensibility >= 55 ? "Developing" : "Weak";
  const revenueQuality =
    toNumber(input.revenue) >= 50000 ? "Strong" : toNumber(input.revenue) >= 10000 ? "Early" : "Pre-revenue";

  return [
    ["Funding posture", readiness, totalScore >= 80 ? "good" : totalScore >= 65 ? "warn" : "bad"],
    ["Revenue signal", revenueQuality, revenueQuality === "Strong" ? "good" : revenueQuality === "Early" ? "warn" : "bad"],
    ["Customer acquisition risk", acquisitionRisk, acquisitionRisk === "Manageable" ? "good" : acquisitionRisk === "Medium" ? "warn" : "bad"],
    ["Moat status", moatStatus, moatStatus === "Emerging" ? "good" : moatStatus === "Developing" ? "warn" : "bad"],
  ];
}

function renderList(element, items) {
  element.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderMetrics(metrics) {
  metricGrid.innerHTML = metricConfig
    .map(({ key, label }) => {
      const value = Math.round(metrics[key]);
      const helper =
        value >= 75
          ? "Strong"
          : value >= 60
            ? "Moderate"
            : "Weak";
      return `
        <article class="metric-card">
          <h4>${label}</h4>
          <strong>${value}</strong>
          <p>${helper} signal based on the submitted profile.</p>
        </article>
      `;
    })
    .join("");
}

function renderSnapshot(snapshotRows) {
  investorSnapshot.innerHTML = snapshotRows
    .map(
      ([label, value, tone]) => `
        <div class="snapshot-line">
          <span>${label}</span>
          <strong class="${tone}">${value}</strong>
        </div>
      `,
    )
    .join("");
}

function analyzeStartup(input) {
  const metrics = {
    problemUrgency: scoreProblem(input.problem),
    marketPotential: scoreMarket(toNumber(input.marketSize), input.sector),
    productClarity: scoreClarity(input.solution, input.customer),
    businessViability: scoreBusinessModel(input.businessModel, input.gtm),
    traction: scoreTraction(input.stage, toNumber(input.revenue), toNumber(input.growthRate)),
    defensibility: scoreDefensibility(input.moat, input.aiDepth),
    executionReadiness: scoreExecution(input.founderExperience, input.stage, input.regulatoryRisk),
  };

  const weightedScore = Math.round(
    metrics.problemUrgency * 0.17 +
      metrics.marketPotential * 0.16 +
      metrics.productClarity * 0.13 +
      metrics.businessViability * 0.12 +
      metrics.traction * 0.15 +
      metrics.defensibility * 0.15 +
      metrics.executionReadiness * 0.12,
  );

  const overall = getVerdict(weightedScore);
  const insights = buildInsights(input, metrics, weightedScore);
  const snapshot = buildInvestorSnapshot(input, weightedScore, metrics);

  return { metrics, weightedScore, overall, insights, snapshot };
}

function showResults(analysis, startupName) {
  emptyState.classList.add("hidden");
  results.classList.remove("hidden");

  scoreValue.textContent = analysis.weightedScore;
  scoreLabel.textContent = analysis.overall.label;
  scoreLabel.className = `score-label ${analysis.overall.tone}`;
  verdict.textContent = `${startupName} scores ${analysis.weightedScore}/100. ${analysis.overall.message}`;
  scoreRing.style.setProperty("--score", analysis.weightedScore);

  renderMetrics(analysis.metrics);
  renderList(strengthList, analysis.insights.strengths);
  renderList(riskList, analysis.insights.risks);
  renderList(nextStepList, analysis.insights.nextSteps);
  renderSnapshot(analysis.snapshot);
}

function getFormInput() {
  const formData = new FormData(validatorForm);
  return {
    startupName: formData.get("startupName")?.toString().trim() || "This startup",
    sector: formData.get("sector")?.toString() || "other",
    problem: formData.get("problem")?.toString().trim() || "",
    solution: formData.get("solution")?.toString().trim() || "",
    customer: formData.get("customer")?.toString().trim() || "",
    moat: formData.get("moat")?.toString().trim() || "",
    businessModel: formData.get("businessModel")?.toString() || "subscription",
    gtm: formData.get("gtm")?.toString() || "sales",
    marketSize: formData.get("marketSize")?.toString() || "0",
    revenue: formData.get("revenue")?.toString() || "0",
    growthRate: formData.get("growthRate")?.toString() || "0",
    founderExperience: formData.get("founderExperience")?.toString() || "low",
    stage: formData.get("stage")?.toString() || "idea",
    aiDepth: formData.get("aiDepth")?.toString() || "none",
    regulatoryRisk: formData.get("regulatoryRisk") === "on",
  };
}

function loadDemo() {
  Object.entries(demoData).forEach(([key, value]) => {
    const field = validatorForm.elements.namedItem(key);
    if (!field) return;
    if (field.type === "checkbox") {
      field.checked = Boolean(value);
      return;
    }
    field.value = value;
  });
}

validatorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = getFormInput();
  const analysis = analyzeStartup(input);
  showResults(analysis, input.startupName);
});

validatorForm.addEventListener("reset", () => {
  window.setTimeout(() => {
    emptyState.classList.remove("hidden");
    results.classList.add("hidden");
  }, 0);
});

loadDemoBtn.addEventListener("click", () => {
  loadDemo();
});

loadDemo();
