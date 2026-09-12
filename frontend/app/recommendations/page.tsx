import DashboardLayout from "@/components/DashboardLayout";
import { fetchAIRecommendations } from "@/lib/api";

const confidenceColor = {
  High: "bg-[#3FA77C]/15 text-[#3FA77C] border-[#3FA77C]/30",
  Medium: "bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/30",
  Low: "bg-[#8B93A7]/15 text-[#8B93A7] border-[#8B93A7]/30",
};

export default async function RecommendationsPage() {
  const recommendations = await fetchAIRecommendations();

  return (
    <DashboardLayout role="ceo" title="AI Recommendations" subtitle="Evidence-backed suggestions for review — you decide">
      <div data-animate-in className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-[#161C2C] border border-[#242B3D] rounded-lg px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold text-[#E7E4DC]">{rec.title}</h3>
              <span className={`shrink-0 text-[10px] px-2 py-1 rounded border ${confidenceColor[rec.confidence]}`}>
                {rec.confidence.toUpperCase()} CONFIDENCE
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase text-[#5C6580]">Problem</div>
                <p className="text-sm text-[#8B93A7] mt-1 leading-5">{rec.problem}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#5C6580]">Evidence</div>
                <p className="text-sm text-[#8B93A7] mt-1 leading-5">{rec.evidence}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#5C6580]">Suggested action</div>
                <p className="text-sm text-[#E7E4DC] mt-1 leading-5">{rec.action}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#5C6580]">Expected impact</div>
                <p className="text-sm text-[#E7E4DC] mt-1 leading-5">{rec.impact}</p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button className="text-xs rounded-md bg-[#C9A227] text-[#0F1420] font-semibold px-4 py-2 hover:bg-[#DDB646] transition-colors">
                Accept
              </button>
              <button className="text-xs rounded-md border border-[#242B3D] text-[#8B93A7] font-semibold px-4 py-2 hover:bg-[#0F1420] transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}