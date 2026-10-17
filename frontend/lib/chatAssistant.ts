import {
  kpiData,
  revenueTrend,
  riskAlerts,
  productivityData,
} from "@/data/mockData";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatKpis() {
  return kpiData.map((k) => `${k.label}: ${k.value} (${k.change})`).join("\n");
}

function formatRevenue() {
  const last = revenueTrend[revenueTrend.length - 1];
  return `Latest month (${last.month}): revenue ₹${last.revenue}L, expenses ₹${last.expenses}L.`;
}

function formatRisks() {
  if (riskAlerts.length === 0) return "No active risk alerts right now.";
  return riskAlerts
    .map((r) => `• ${r.project} — ${r.risk} (${r.severity} severity)`)
    .join("\n");
}

function formatProductivity() {
  return productivityData
    .map((p) => `${p.team}: ${p.completed}% completed, ${p.pending}% pending`)
    .join("\n");
}

export async function askExecutiveAssistant(question: string): Promise<string> {
  await delay(700 + Math.random() * 500);

  const q = question.toLowerCase();

  if (q.includes("risk")) {
    return `Here are the current project risks:\n\n${formatRisks()}`;
  }
  if (q.includes("revenue") || q.includes("expense") || q.includes("financ")) {
    return `${formatRevenue()}\n\nFull KPI snapshot:\n${formatKpis()}`;
  }
  if (q.includes("productiv") || q.includes("team")) {
    return `Team productivity this sprint:\n\n${formatProductivity()}`;
  }
  if (q.includes("kpi")) {
    return `Current KPIs:\n\n${formatKpis()}`;
  }

  return (
    "I can answer questions about KPIs, revenue and expenses, project risks, " +
    "or team productivity — try asking something like \"what are our current risks?\" " +
    "or \"how is revenue trending?\""
  );

  // --- Once the backend is ready, replace everything above with: ---
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ message: question }),
  // });
  // const data = await res.json();
  // return data.reply;
}