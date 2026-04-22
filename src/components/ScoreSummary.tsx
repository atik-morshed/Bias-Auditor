import { ALL_LENSES } from "../types/bias";
import type { BiasLens } from "../types/bias";
import { lensLabel } from "./LensToggle";

interface ScoreSummaryProps {
  scores: Record<BiasLens, number>;
}

function scoreColor(percent: number): string {
  if (percent <= 30) {
    return "bg-emerald-500";
  }

  if (percent <= 60) {
    return "bg-amber-500";
  }

  return "bg-rose-500";
}

export function ScoreSummary({ scores }: ScoreSummaryProps) {
  return (
    <section className="rounded-2xl border border-stone-300/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(254,242,242,0.62),rgba(240,249,255,0.62))] p-5 shadow-[0_18px_40px_-30px_rgba(59,38,16,0.65)]">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Bias Scores</p>
      <div className="space-y-3">
        {ALL_LENSES.map((lens) => {
          const percent = Math.round((scores[lens] ?? 0) * 100);

          return (
            <div key={lens}>
              <div className="mb-1 flex items-center justify-between text-sm font-semibold text-stone-700">
                <span>{lensLabel(lens)}</span>
                <span>{percent}</span>
              </div>
              <div className="h-2 rounded-full bg-stone-200/90">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${scoreColor(percent)}`}
                  style={{ width: `${percent}%`, boxShadow: "0 0 16px rgba(59,130,246,0.25)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
