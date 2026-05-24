import { useEffect, useState } from 'react';

type StreamingTextProps = {
  text: string;
  speedMs?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  delay?: number;
};

export function StreamingText({
  text,
  speedMs = 25,
  onComplete,
  className,
  showCursor = true,
  delay = 0,
}: StreamingTextProps) {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(delay === 0);
  const [done, setDone] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setIndex(0);
    setStarted(delay === 0);
    setDone(false);
    setCursorVisible(true);
  }, [text, delay]);

  useEffect(() => {
    if (started) return;
    const id = window.setTimeout(() => setStarted(true), delay);
    return () => window.clearTimeout(id);
  }, [started, delay]);

  useEffect(() => {
    if (!started || done) return;
    if (index >= text.length) {
      setDone(true);
      onComplete?.();
      const id = window.setTimeout(() => setCursorVisible(false), 800);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setIndex((i) => i + 1), speedMs);
    return () => window.clearTimeout(id);
  }, [index, started, done, text.length, speedMs, onComplete]);

  return (
    <span className={className}>
      <span>{text.slice(0, index)}</span>
      {showCursor && cursorVisible && (
        <span
          className="inline-block w-[2px] h-[1em] align-text-bottom bg-current ml-[1px] animate-blink"
          aria-hidden
        />
      )}
    </span>
  );
}
