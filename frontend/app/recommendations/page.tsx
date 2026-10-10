import DashboardLayout from "@/components/DashboardLayout";
import RecommendationsList from "@/components/RecommendationsList";
import { fetchAIRecommendations } from "@/lib/api";

export default async function RecommendationsPage() {
  const recommendations = await fetchAIRecommendations();

  return (
    <DashboardLayout role="ceo" title="AI Recommendations" subtitle="Evidence-backed suggestions for review — you decide">
      <RecommendationsList recommendations={recommendations} />
    </DashboardLayout>
  );
}