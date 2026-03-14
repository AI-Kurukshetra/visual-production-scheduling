import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type AiRecommendation = {
  id: string;
  title: string;
  action: string;
  impact: string;
  eta: string;
  confidence: number;
};

export function AiRecommendationsPanel({ recommendations }: { recommendations: AiRecommendation[] }) {
  return (
    <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.2)]">
      <CardHeader>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Recommendations</p>
          <CardTitle>Recent Optimizations</CardTitle>
        </div>
        <Badge className="border-slate-200 bg-slate-50 text-slate-700">{recommendations.length} Suggestions</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-sm text-slate-400">No recommendations generated yet.</p>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{rec.title}</p>
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {Math.round(rec.confidence * 100)}% confidence
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500">{rec.action}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{rec.impact}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">ETA {rec.eta}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
