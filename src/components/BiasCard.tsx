import { AlertTriangle, ScanSearch } from "lucide-react";
import type { BiasAnnotation } from "../types/bias";
import { lensBadgeClass, lensLabel } from "./LensToggle";

interface BiasCardProps {
  annotation: BiasAnnotation;
}

export function BiasCard({ annotation }: BiasCardProps) {
  const confidencePercent = Math.round(annotation.confidence * 100);

  return (
    <aside className="rounded-2xl border border-stone-300/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(240,249,255,0.72),rgba(254,242,242,0.72))] p-5 shadow-[0_18px_40px_-28px_rgba(59,38,16,0.7)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${lensBadgeClass(annotation.lens)}`}>
          {lensLabel(annotation.lens)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-stone-600">
          <ScanSearch size={14} />
          Flag Detail
        </span>
      </div>

      <p className="mb-3 rounded-xl bg-white/80 p-3 font-semibold text-stone-900 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.45)]">“{annotation.flaggedText}”</p>

      <div className="space-y-3 text-sm leading-6 text-stone-700">
        <div>
          <p className="mb-1 flex items-center gap-1 font-semibold text-stone-900">
            <AlertTriangle size={14} /> Why flagged
          </p>
          <p>{annotation.explanation}</p>
        </div>

        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3">
          <p className="mb-1 font-semibold text-emerald-900">Neutral rewrite</p>
          <p className="text-emerald-900">{annotation.suggestion}</p>
        </div>

        <div className="rounded-xl border border-sky-300 bg-sky-50 p-3">
          <p className="mb-1 font-semibold text-sky-900">Counter-bias coach</p>
          <p className="text-sky-900">{annotation.counterBiasArgument}</p>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-[0.09em]">
            <span>Confidence</span>
            <span>{confidencePercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-stone-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 transition-[width] duration-700"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
