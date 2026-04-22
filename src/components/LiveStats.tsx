interface LiveStatsProps {
  text: string;
}

function readingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200));
}

export function LiveStats({ text }: LiveStatsProps) {
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = text.length;
  const sentenceCount = trimmed ? (trimmed.match(/[.!?]+/g)?.length ?? 1) : 0;
  const readingTime = readingTimeMinutes(wordCount);

  return (
    <section className="mt-4 rounded-2xl border border-stone-300/80 bg-white/75 p-4 shadow-[0_14px_35px_-30px_rgba(59,38,16,0.85)]">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Live Writing Stats</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-xs uppercase tracking-[0.1em] text-stone-500">Words</p>
          <p className="mt-1 text-lg font-bold text-stone-900">{wordCount}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-xs uppercase tracking-[0.1em] text-stone-500">Characters</p>
          <p className="mt-1 text-lg font-bold text-stone-900">{charCount}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-xs uppercase tracking-[0.1em] text-stone-500">Sentences</p>
          <p className="mt-1 text-lg font-bold text-stone-900">{sentenceCount}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-xs uppercase tracking-[0.1em] text-stone-500">Read Time</p>
          <p className="mt-1 text-lg font-bold text-stone-900">{readingTime}m</p>
        </div>
      </div>
    </section>
  );
}
