import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EditorSkeleton, SidebarSkeleton } from "./components/AnalysisSkeletons";
import { AnnotatedText } from "./components/AnnotatedText";
import { BiasCard } from "./components/BiasCard";
import { LiveStats } from "./components/LiveStats";
import { LensToggle } from "./components/LensToggle";
import { ScoreSummary } from "./components/ScoreSummary";
import { TextEditor } from "./components/TextEditor";
import { useBiasAnalysis } from "./hooks/useBiasAnalysis";
import type { BiasAnnotation } from "./types/bias";

const SAMPLE_TEXTS = {
  oped:
    "Only a blind supporter would deny that this policy is a total disaster. Anyone with common sense knows the other side is intentionally misleading the public.",
  briefing:
    "Our proposal is likely to improve outcomes in the short term, but several assumptions rely on incomplete data. A broader set of stakeholders should review these claims.",
  campaign:
    "They always fail families while we always deliver real results. Their argument is full of excuses, and our plan is the only serious solution.",
} as const;

type ViewMode = "write" | "review";

function App() {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<BiasAnnotation | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("write");
  const { status, errorMessage, result, activeLenses, setActiveLenses, analyze } = useBiasAnalysis();

  const averageScore = useMemo(() => {
    if (!result) {
      return 0;
    }

    const values = Object.values(result.overallScores);
    if (values.length === 0) {
      return 0;
    }

    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100);
  }, [result]);

  async function handleAnalyze() {
    setSelected(null);
    await analyze(text);
    setViewMode("review");
  }

  function loadSample(key: keyof typeof SAMPLE_TEXTS) {
    setText(SAMPLE_TEXTS[key]);
    setSelected(null);
    setViewMode("write");
  }

  function clearDraft() {
    setText("");
    setSelected(null);
    setViewMode("write");
  }

  const isLoading = status === "loading";
  const hasResult = status === "done" && Boolean(result);
  const showReview = hasResult && viewMode === "review";
  const hasText = text.trim().length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#ffe7cc_0%,_#f8f2e8_42%,_#efe9dd_100%)] px-4 py-6 text-stone-800 sm:px-6 lg:px-10">
      <div className="ambient-blob ambient-blob-fast left-[-80px] top-[60px] h-56 w-56 bg-orange-300/70" />
      <div className="ambient-blob ambient-blob-slow right-[-90px] top-[220px] h-64 w-64 bg-cyan-300/70" />
      <div className="ambient-blob bottom-[-100px] left-[28%] h-64 w-64 bg-rose-300/70" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <main>
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-6 rounded-3xl border border-amber-200/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,237,213,0.72),rgba(224,242,254,0.66))] p-6 shadow-[0_25px_60px_-35px_rgba(59,38,16,0.65)] backdrop-blur"
          >
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-attention" />
              Bias Auditor
            </motion.p>
            <h1 className="animated-gradient-text mt-3 font-['Space_Grotesk',sans-serif] text-3xl font-bold leading-tight sm:text-4xl">
              Audit writing for framing, language, and logic
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Paste your draft, run the four bias lenses, and inspect highlighted phrases with explanations and neutral rewrites.
            </p>
          </motion.header>

          <LensToggle activeLenses={activeLenses} onChange={setActiveLenses} />

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-stone-300/80 bg-[linear-gradient(130deg,rgba(255,255,255,0.88),rgba(252,231,243,0.55),rgba(207,250,254,0.5))] p-3"
          >
            <p className="mr-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Quick Actions</p>
            <motion.button
              type="button"
              onClick={() => loadSample("oped")}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-stone-500"
            >
              Load Op-Ed Sample
            </motion.button>
            <motion.button
              type="button"
              onClick={() => loadSample("briefing")}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-stone-500"
            >
              Load Briefing Sample
            </motion.button>
            <motion.button
              type="button"
              onClick={() => loadSample("campaign")}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-stone-500"
            >
              Load Campaign Sample
            </motion.button>
            <motion.button
              type="button"
              onClick={clearDraft}
              whileHover={{ y: -1, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-200"
            >
              Clear
            </motion.button>

            {hasResult && (
              <div className="ml-auto inline-flex rounded-full border border-stone-300 bg-white p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode("write")}
                  className={`rounded-full px-3 py-1 transition ${
                    viewMode === "write" ? "bg-stone-900 text-white shadow-lg" : "text-stone-700"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("review")}
                  className={`rounded-full px-3 py-1 transition ${
                    viewMode === "review" ? "bg-stone-900 text-white shadow-lg" : "text-stone-700"
                  }`}
                >
                  Review
                </button>
              </div>
            )}
          </motion.section>

          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              {isLoading ? (
                <motion.div
                  key="editor-loading"
                  initial={{ opacity: 0, y: 8, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.995 }}
                  transition={{ duration: 0.25 }}
                >
                  <EditorSkeleton />
                </motion.div>
              ) : showReview && result ? (
                <motion.div
                  key="editor-annotated"
                  initial={{ opacity: 0, y: 8, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.995 }}
                  transition={{ duration: 0.28 }}
                >
                  <AnnotatedText text={text} annotations={result.annotations} onSelect={setSelected} selectedId={selected?.id} />
                </motion.div>
              ) : (
                <motion.div
                  key="editor-input"
                  initial={{ opacity: 0, y: 8, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.995 }}
                  transition={{ duration: 0.25 }}
                >
                  <TextEditor value={text} onChange={setText} onAnalyze={handleAnalyze} analyzeDisabled={isLoading} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <LiveStats text={text} />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-xl border border-stone-900 bg-[linear-gradient(130deg,#292524,#0f172a,#292524)] bg-[length:200%_200%] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-16px_rgba(15,23,42,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleAnalyze}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Analyzing..." : "Audit Writing"}
            </motion.button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={status}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-stone-600"
              >
                {status === "loading" && "Analyzing writing and mapping highlights..."}
                {status === "error" && (errorMessage || "Analysis failed.")}
                {status === "done" && result && `Found ${result.annotations.length} flagged phrase(s). Select one to inspect details.`}
                {status === "idle" && "Ready when you are."}
              </motion.p>
            </AnimatePresence>
          </div>

          {!hasText && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-xs text-stone-500"
            >
              Tip: Start with a sample, then press Ctrl/Cmd + Enter to analyze quickly.
            </motion.p>
          )}
        </main>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div
                key="sidebar-loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SidebarSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key="sidebar-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {result && <ScoreSummary scores={result.overallScores} />}

                {result && (
                  <section className="rounded-2xl border border-stone-300/80 bg-white/80 p-5 text-sm text-stone-700 shadow-[0_18px_40px_-30px_rgba(59,38,16,0.65)]">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Overall Profile</p>
                    <p className="font-semibold text-stone-900">Average Bias Score: {averageScore}%</p>
                    <p className="mt-2 leading-6">{result.summary}</p>
                  </section>
                )}

                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.22 }}
                  >
                    <BiasCard annotation={selected} />
                  </motion.div>
                ) : (
                  <section className="rounded-2xl border border-dashed border-stone-300 bg-white/70 p-5 text-sm leading-6 text-stone-600">
                    Click any highlighted phrase to inspect why it was flagged and how to rewrite it.
                  </section>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </motion.div>
    </div>
  );
}

export default App;
