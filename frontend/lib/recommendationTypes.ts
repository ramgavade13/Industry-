export type DecisionStatus = "New" | "Accepted" | "Dismissed";

export type RecommendationRow = {
  id: string;
  title: string;
  problem: string;
  evidence: string;
  action: string;
  impact: string;
  confidence: string;
  status: string;
  decided_by: string;
  decided_at: string | null;
};