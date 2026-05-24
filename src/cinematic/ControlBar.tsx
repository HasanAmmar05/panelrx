import {
  ChevronsRight,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Gauge,
  Sun,
  Moon,
} from 'lucide-react';
import { STAGES, TOTAL_DURATION_MS } from './config';
import type { StageId } from './types';

type ControlBarProps = {
  currentStage: StageId;
  elapsedInStage: number;
  isPlaying: boolean;
  hasEnded: boolean;
  speed: number;
  speedPresets: number[];
  lightTheme: boolean;
  onToggleTheme: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSkipToEnd: () => void;
  onReplay: () => void;
  onSetSpeed: (s: number) => void;
  onSeek: (deltaMs: number) => void;
};

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ControlBar({
  currentStage,
  elapsedInStage,
  isPlaying,
  hasEnded,
  speed,
  speedPresets,
  lightTheme,
  onToggleTheme,
  onTogglePlay,
  onNext,
  onPrev,
  onSkipToEnd,
  onReplay,
  onSetSpeed,
  onSeek,
}: ControlBarProps) {
  const completedBefore = STAGES.slice(0, currentStage - 1).reduce(
    (sum, s) => sum + s.durationMs,
    0,
  );
  const elapsedTotal = completedBefore + elapsedInStage;

  const btn =
    'p-2 rounded-md text-ink hover:bg-primary-soft hover:text-primary transition-colors';
  const btnDisabled =
    'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-ink';



  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1.5rem)]">
      <div className="flex items-center gap-2 sm:gap-3 bg-surface-elevated border border-border rounded-full px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
        <button
          type="button"
          aria-label="Previous stage"
          disabled={currentStage === 1}
          className={`${btn} ${currentStage === 1 ? btnDisabled : ''}`}
          onClick={onPrev}
        >
          <SkipBack size={20} />
        </button>
        <button
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={`${btn} ${hasEnded ? btnDisabled : ''}`}
          disabled={hasEnded}
          onClick={onTogglePlay}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          type="button"
          aria-label="Next stage"
          className={btn}
          onClick={onNext}
        >
          <SkipForward size={20} />
        </button>

        <span className="block w-px h-5 bg-border-strong" aria-hidden />

        {/* Seek Controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onSeek(-15000)}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted hover:text-ink hover:bg-primary-soft/30 transition-colors"
            title="Seek back 15s"
          >
            -15s
          </button>
          <button
            type="button"
            onClick={() => onSeek(-5000)}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted hover:text-ink hover:bg-primary-soft/30 transition-colors"
            title="Seek back 5s"
          >
            -5s
          </button>
          <button
            type="button"
            onClick={() => onSeek(-1000)}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted hover:text-ink hover:bg-primary-soft/30 transition-colors"
            title="Seek back 1s"
          >
            -1s
          </button>
          <button
            type="button"
            onClick={() => onSeek(1000)}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted hover:text-ink hover:bg-primary-soft/30 transition-colors"
            title="Seek forward 1s"
          >
            +1s
          </button>
          <button
            type="button"
            onClick={() => onSeek(5000)}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted hover:text-ink hover:bg-primary-soft/30 transition-colors"
            title="Seek forward 5s"
          >
            +5s
          </button>
          <button
            type="button"
            onClick={() => onSeek(15000)}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted hover:text-ink hover:bg-primary-soft/30 transition-colors"
            title="Seek forward 15s"
          >
            +15s
          </button>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-1">
          <Gauge size={14} className="text-muted" />
          <div className="flex items-center gap-0.5">
            {speedPresets.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSetSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                  s === speed
                    ? 'bg-primary text-white font-medium'
                    : 'text-muted hover:text-ink hover:bg-primary-soft/30'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <span className="block w-px h-5 bg-border-strong" aria-hidden />

        {/* Theme toggle */}
        <button
          type="button"
          aria-label={lightTheme ? 'Switch to dark theme' : 'Switch to light theme'}
          className={`${btn} flex items-center gap-1`}
          onClick={onToggleTheme}
        >
          {lightTheme ? <Moon size={16} /> : <Sun size={16} />}
          <span className="font-mono text-[10px] hidden sm:inline">{lightTheme ? 'Dark' : 'Light'}</span>
        </button>

        <span className="block w-px h-5 bg-border-strong" aria-hidden />

        <span className="font-mono text-xs text-body">
          Stage {currentStage}/9
        </span>
        <span className="font-mono text-xs text-muted tabular-nums">
          {formatTime(elapsedTotal)} / {formatTime(TOTAL_DURATION_MS)}
        </span>

        {currentStage < 9 && (
          <>
            <span className="block w-px h-5 bg-border-strong" aria-hidden />
            <button
              type="button"
              aria-label="Skip to end"
              className={`${btn} flex items-center gap-1`}
              onClick={onSkipToEnd}
            >
              <ChevronsRight size={18} />
              <span className="font-mono text-xs hidden sm:inline">End</span>
            </button>
          </>
        )}

        <span className="block w-px h-5 bg-border-strong" aria-hidden />
        <button
          type="button"
          aria-label="Replay / Restart from beginning"
          className={`${btn} flex items-center gap-1`}
          onClick={onReplay}
          title="Restart from beginning"
        >
          <RotateCcw size={18} />
          <span className="font-mono text-xs hidden sm:inline">Replay</span>
        </button>
      </div>
    </div>
  );
}
