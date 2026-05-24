import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type ReasoningTraceProps = {
  lines: readonly string[];
  startMs: number;
  elapsedMs: number;
};

const CHAR_SPEED_MS = 25;
const LINE_GAP_MS = 400;

export function ReasoningTrace({ lines, startMs, elapsedMs }: ReasoningTraceProps) {
  const elapsed = elapsedMs - startMs;
  const [punchLanded, setPunchLanded] = useState(false);

  // Calculate how many characters should be visible
  let charBudget = Math.max(0, elapsed / CHAR_SPEED_MS);
  const visibleLines: { text: string; isComplete: boolean }[] = [];
  let totalGaps = 0;

  for (let i = 0; i < lines.length; i++) {
    const gapChars = (i * LINE_GAP_MS) / CHAR_SPEED_MS;
    const adjustedBudget = charBudget - gapChars;
    if (adjustedBudget <= 0) break;

    const lineLen = lines[i].length;
    const charsToShow = Math.min(Math.floor(adjustedBudget - totalGaps), lineLen);
    if (charsToShow <= 0) break;

    visibleLines.push({
      text: lines[i].slice(0, charsToShow),
      isComplete: charsToShow >= lineLen,
    });
    totalGaps += 0; // gaps already handled via gapChars
  }

  const lastLine = visibleLines[visibleLines.length - 1];
  const isUnexplainedVisible =
    lastLine?.text.includes('UNEXPLAINED') && lastLine.isComplete;

  useEffect(() => {
    if (isUnexplainedVisible && !punchLanded) {
      setPunchLanded(true);
    }
  }, [isUnexplainedVisible, punchLanded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-surface rounded-md p-4 mt-2 max-w-lg font-mono text-sm"
    >
      {visibleLines.map((vl, i) => {
        const isLastLine = i === lines.length - 1;
        const hasUnexplained = isLastLine && vl.text.includes('UNEXPLAINED');

        if (hasUnexplained) {
          const parts = vl.text.split('UNEXPLAINED');
          return (
            <p key={i} className="text-body leading-relaxed">
              {parts[0]}
              <motion.span
                className="text-danger font-semibold"
                initial={{ scale: 1 }}
                animate={punchLanded ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                UNEXPLAINED
              </motion.span>
              {parts[1]}
            </p>
          );
        }

        return (
          <p key={i} className="text-body leading-relaxed">
            {vl.text}
            {!vl.isComplete && (
              <span
                className="inline-block w-[2px] h-[1em] align-text-bottom bg-current ml-[1px] animate-blink"
                aria-hidden
              />
            )}
          </p>
        );
      })}
    </motion.div>
  );
}
