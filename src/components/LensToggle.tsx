import clsx from "clsx";
import { ALL_LENSES } from "../types/bias";
import type { BiasLens } from "../types/bias";

interface LensToggleProps {
  activeLenses: BiasLens[];
  onChange: (next: BiasLens[]) => void;
}

const LENS_LABELS: Record<BiasLens, string> = {
  political_framing: "Political Framing",
  gender_language: "Gender Language",
  emotional_loading: "Emotional Loading",
  logical_fallacy: "Logical Fallacy",
};

const LENS_CLASSES: Record<BiasLens, string> = {
  political_framing: "border-rose-300 bg-rose-100 text-rose-700",
  gender_language: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700",
  emotional_loading: "border-amber-300 bg-amber-100 text-amber-700",
  logical_fallacy: "border-sky-300 bg-sky-100 text-sky-700",
};

export function lensBadgeClass(lens: BiasLens): string {
  return LENS_CLASSES[lens];
}

export function lensLabel(lens: BiasLens): string {
  return LENS_LABELS[lens];
}

export function LensToggle({ activeLenses, onChange }: LensToggleProps) {
  function toggleLens(lens: BiasLens) {
    if (activeLenses.includes(lens)) {
      onChange(activeLenses.filter((value) => value !== lens));
      return;
    }

    onChange([...activeLenses, lens]);
  }

  return (
    <div className="mb-5 rounded-2xl border border-stone-300/80 bg-[linear-gradient(140deg,rgba(255,255,255,0.84),rgba(254,242,242,0.6),rgba(240,249,255,0.6))] p-4 shadow-[0_18px_40px_-30px_rgba(59,38,16,0.5)] backdrop-blur-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Bias Lenses</p>
      <div className="flex flex-wrap gap-2">
        {ALL_LENSES.map((lens) => {
          const isActive = activeLenses.includes(lens);

          return (
            <button
              key={lens}
              type="button"
              onClick={() => toggleLens(lens)}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-semibold transition duration-300",
                lensBadgeClass(lens),
                isActive
                  ? "translate-y-0 opacity-100 shadow-[0_12px_22px_-14px_rgba(0,0,0,0.7)]"
                  : "opacity-45 hover:-translate-y-1 hover:opacity-95 hover:shadow-[0_10px_18px_-14px_rgba(15,23,42,0.7)]",
              )}
              aria-pressed={isActive}
            >
              {lensLabel(lens)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
