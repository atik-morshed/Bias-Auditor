import * as Tooltip from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { BiasAnnotation } from "../types/bias";
import { splitTextIntoSegments } from "../utils/textParser";
import { lensBadgeClass } from "./LensToggle";

interface AnnotatedTextProps {
  text: string;
  annotations: BiasAnnotation[];
  onSelect: (annotation: BiasAnnotation) => void;
  selectedId?: string;
}

export function AnnotatedText({ text, annotations, onSelect, selectedId }: AnnotatedTextProps) {
  const segments = splitTextIntoSegments(text, annotations);
  const nodeMap = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const node = nodeMap.current.get(selectedId);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedId]);

  return (
    <Tooltip.Provider delayDuration={120}>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-[48vh] overflow-auto rounded-2xl border border-stone-300/80 bg-white/90 p-5 font-['IBM_Plex_Sans',sans-serif] text-base leading-7 text-stone-800 shadow-[0_22px_50px_-32px_rgba(59,38,16,0.7)]"
      >
        {segments.length === 0 ? (
          <p className="text-stone-500">No text available.</p>
        ) : (
          <p className="whitespace-pre-wrap">
            {segments.map((segment, index) => {
              if (!segment.annotation) {
                return <span key={`plain-${index}`}>{segment.text}</span>;
              }

              const ann = segment.annotation;
              const selected = selectedId === ann.id;

              return (
                <Tooltip.Root key={ann.id}>
                  <Tooltip.Trigger asChild>
                    <mark
                      ref={(element) => {
                        if (element) {
                          nodeMap.current.set(ann.id, element);
                        } else {
                          nodeMap.current.delete(ann.id);
                        }
                      }}
                      onClick={() => onSelect(ann)}
                      data-annotation-id={ann.id}
                      className={`mx-[1px] cursor-pointer rounded px-1 py-0.5 no-underline transition duration-300 hover:-translate-y-[1px] hover:shadow-[0_8px_14px_-12px_rgba(15,23,42,0.85)] ${lensBadgeClass(ann.lens)} ${
                        selected ? "ring-2 ring-stone-800/70 ring-offset-1 animate-pulse shadow-[0_0_0_2px_rgba(255,255,255,0.6)]" : ""
                      }`}
                    >
                      {segment.text}
                    </mark>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      sideOffset={8}
                      className="max-w-xs rounded-lg border border-stone-200 bg-stone-900/95 px-3 py-2 text-sm text-stone-50 shadow-xl"
                    >
                      <p className="font-semibold">{Math.round(ann.confidence * 100)}% confidence</p>
                      <p className="mt-1 text-stone-200">{ann.explanation}</p>
                      <Tooltip.Arrow className="fill-stone-900/95" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
          </p>
        )}
      </motion.article>
    </Tooltip.Provider>
  );
}
