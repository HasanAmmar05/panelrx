import { useEffect, useReducer, useState, useCallback } from 'react';
import { STAGES } from './config';
import { StageIndicator } from './StageIndicator';
import { ControlBar } from './ControlBar';
import { StageContent } from './StageContent';
import { NarrationOverlay } from './NarrationOverlay';
import type { EngineAction, EngineState, StageId } from './types';

const TICK_INTERVAL = 100;
const BASE_TICK_DELTA = 50; // at 0.5x

const SPEED_PRESETS = [0.25, 0.5, 1, 1.5, 2] as const;

const initialState: EngineState = {
  currentStage: 1,
  elapsedInStage: 0,
  isPlaying: true,
  hasEnded: false,
};

function engineReducer(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case 'TICK': {
      if (!state.isPlaying || state.hasEnded) return state;
      const stageDuration = STAGES[state.currentStage - 1].durationMs;
      const nextElapsed = state.elapsedInStage + action.deltaMs;
      if (nextElapsed < stageDuration) {
        return { ...state, elapsedInStage: nextElapsed };
      }
      if (state.currentStage === 9) {
        return {
          ...state,
          elapsedInStage: stageDuration,
          isPlaying: false,
          hasEnded: true,
        };
      }
      return {
        ...state,
        currentStage: (state.currentStage + 1) as StageId,
        elapsedInStage: 0,
      };
    }
    case 'NEXT_STAGE': {
      if (state.currentStage === 9) {
        return { ...state, hasEnded: true, isPlaying: false };
      }
      return {
        ...state,
        currentStage: (state.currentStage + 1) as StageId,
        elapsedInStage: 0,
        hasEnded: false,
      };
    }
    case 'PREV_STAGE': {
      if (state.currentStage === 1) return state;
      return {
        ...state,
        currentStage: (state.currentStage - 1) as StageId,
        elapsedInStage: 0,
        hasEnded: false,
      };
    }
    case 'REPLAY':
      return {
        currentStage: 1,
        elapsedInStage: 0,
        isPlaying: true,
        hasEnded: false,
      };
    case 'TOGGLE_PLAY':
      if (state.hasEnded) return state;
      return { ...state, isPlaying: !state.isPlaying };
    case 'JUMP_TO_STAGE':
      return {
        ...state,
        currentStage: action.stage,
        elapsedInStage: 0,
        hasEnded: false,
      };
    case 'SKIP_TO_END':
      return {
        currentStage: 9,
        elapsedInStage: STAGES[8].durationMs,
        isPlaying: false,
        hasEnded: true,
      };
    default:
      return state;
  }
}

export function Engine() {
  const [state, dispatch] = useReducer(engineReducer, initialState);
  const [speedIdx, setSpeedIdx] = useState(1); // default 0.5x (index 1)
  const speed = SPEED_PRESETS[speedIdx];

  const cycleSpeed = useCallback(() => {
    setSpeedIdx((i) => (i + 1) % SPEED_PRESETS.length);
  }, []);

  const setSpeed = useCallback((s: number) => {
    const idx = SPEED_PRESETS.indexOf(s as typeof SPEED_PRESETS[number]);
    if (idx >= 0) setSpeedIdx(idx);
  }, []);

  useEffect(() => {
    if (!state.isPlaying) return;
    const delta = BASE_TICK_DELTA * (speed / 0.5); // normalize so 0.5x = base
    const intervalId = window.setInterval(() => {
      dispatch({ type: 'TICK', deltaMs: delta });
    }, TICK_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, [state.isPlaying, speed]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); dispatch({ type: 'TOGGLE_PLAY' }); break;
        case 'ArrowRight': dispatch({ type: 'NEXT_STAGE' }); break;
        case 'ArrowLeft': dispatch({ type: 'PREV_STAGE' }); break;
        case 'KeyR': dispatch({ type: 'REPLAY' }); break;
        case 'Escape': dispatch({ type: 'SKIP_TO_END' }); break;
        case 'BracketRight': cycleSpeed(); break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cycleSpeed]);

  // Pause on blur
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && state.isPlaying) dispatch({ type: 'TOGGLE_PLAY' });
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.isPlaying]);

  return (
    <div className="cinematic-dark relative min-h-screen bg-background text-ink overflow-hidden select-none">
      <StageIndicator
        currentStage={state.currentStage}
        elapsedInStage={state.elapsedInStage}
        hasEnded={state.hasEnded}
      />
      <NarrationOverlay
        currentStage={state.currentStage}
        elapsedInStage={state.elapsedInStage}
      />
      <StageContent
        currentStage={state.currentStage}
        elapsedInStage={state.elapsedInStage}
      />
      <ControlBar
        currentStage={state.currentStage}
        elapsedInStage={state.elapsedInStage}
        isPlaying={state.isPlaying}
        hasEnded={state.hasEnded}
        speed={speed}
        speedPresets={SPEED_PRESETS as unknown as number[]}
        onTogglePlay={() => dispatch({ type: 'TOGGLE_PLAY' })}
        onNext={() => dispatch({ type: 'NEXT_STAGE' })}
        onPrev={() => dispatch({ type: 'PREV_STAGE' })}
        onSkipToEnd={() => dispatch({ type: 'SKIP_TO_END' })}
        onReplay={() => dispatch({ type: 'REPLAY' })}
        onCycleSpeed={cycleSpeed}
        onSetSpeed={setSpeed}
      />
    </div>
  );
}
