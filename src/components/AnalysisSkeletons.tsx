import { motion } from "framer-motion";

const shimmer = {
  initial: { backgroundPositionX: "100%" },
  animate: { backgroundPositionX: "-100%" },
  transition: { duration: 1.25, repeat: Infinity, ease: "linear" as const },
};

function ShimmerBar({ className }: { className: string }) {
  return (
    <motion.div
      {...shimmer}
      className={`rounded-md bg-[linear-gradient(90deg,rgba(231,225,216,0.65),rgba(255,255,255,0.95),rgba(231,225,216,0.65))] bg-[length:200%_100%] ${className}`}
    />
  );
}

export function EditorSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[48vh] rounded-2xl border border-stone-300/70 bg-white/85 p-5 shadow-[0_20px_45px_-30px_rgba(59,38,16,0.55)]"
    >
      <div className="space-y-3">
        <ShimmerBar className="h-4 w-1/3" />
        <ShimmerBar className="h-4 w-full" />
        <ShimmerBar className="h-4 w-[94%]" />
        <ShimmerBar className="h-4 w-[88%]" />
        <ShimmerBar className="h-4 w-[92%]" />
        <ShimmerBar className="h-4 w-[80%]" />
        <ShimmerBar className="h-4 w-[86%]" />
      </div>
    </motion.section>
  );
}

export function SidebarSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-2xl border border-stone-300/80 bg-white/80 p-5 shadow-[0_18px_40px_-30px_rgba(59,38,16,0.65)]">
        <ShimmerBar className="mb-3 h-3 w-1/2" />
        <ShimmerBar className="mb-2 h-3 w-full" />
        <ShimmerBar className="mb-2 h-3 w-[90%]" />
        <ShimmerBar className="h-3 w-[95%]" />
      </div>

      <div className="rounded-2xl border border-stone-300/80 bg-white/80 p-5 shadow-[0_18px_40px_-30px_rgba(59,38,16,0.65)]">
        <ShimmerBar className="mb-4 h-3 w-1/3" />
        <ShimmerBar className="mb-2 h-4 w-full" />
        <ShimmerBar className="mb-2 h-4 w-[94%]" />
        <ShimmerBar className="h-4 w-[82%]" />
      </div>
    </motion.section>
  );
}
