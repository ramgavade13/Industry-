import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import RecommendationsList from "@/components/RecommendationsList";
import { fetchRecommendations } from "@/lib/recommendationsApi";
import { setRecommendationStatus } from "./actions";

const TABS = [
  { key: "", label: "All" },
  { key: "New", label: "To review" },
  { key: "Accepted", label: "Accepted" },
  { key: "Dismissed", label: "Dismissed" },
];

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = await searchParams;
  const all = await fetchRecommendations();

  const count = (key: string) => (key ? all.filter((r) => r.status === key).length : all.length);
  const visible = status ? all.filter((r) => r.status === status) : all;

  return (
    <DashboardLayout role="ceo" title="AI Recommendations" subtitle="Evidence-backed suggestions for review — you decide">
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => {
          const active = status === tab.key;
          return (
            <Link
              key={tab.key || "all"}
              href={tab.key ? `/recommendations?status=${tab.key}` : "/recommendations"}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                active
                  ? "border-[#C9A227] bg-[#C9A227]/10 text-[#E7E4DC]"
                  : "border-[#242B3D] text-[#8B93A7] hover:text-[#E7E4DC]"
              }`}
            >
              {tab.label} <span className="text-[#5C6580]">{count(tab.key)}</span>
            </Link>
          );
        })}
      </div>

      <RecommendationsList recommendations={visible} setStatus={setRecommendationStatus} />
    </DashboardLayout>
  );
}