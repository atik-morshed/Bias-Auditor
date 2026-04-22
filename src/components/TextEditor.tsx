interface TextEditorProps {
  value: string;
  onChange: (next: string) => void;
  onAnalyze?: () => void;
  analyzeDisabled?: boolean;
}

export function TextEditor({ value, onChange, onAnalyze, analyzeDisabled }: TextEditorProps) {
  return (
    <div className="relative">
      <label htmlFor="text-editor" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
        Writing Sample
      </label>
      <textarea
        id="text-editor"
        className="h-[48vh] w-full resize-none rounded-2xl border border-stone-300/70 bg-white/90 p-5 font-['IBM_Plex_Sans',sans-serif] text-base leading-7 text-stone-800 shadow-[0_20px_45px_-30px_rgba(59,38,16,0.55)] outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50"
        placeholder="Paste an article, speech draft, or social post here to audit tone and framing."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && onAnalyze && !analyzeDisabled) {
            event.preventDefault();
            onAnalyze();
          }
        }}
      />
      <p className="mt-2 text-xs text-stone-500">Shortcut: Ctrl/Cmd + Enter to run analysis</p>
    </div>
  );
}
