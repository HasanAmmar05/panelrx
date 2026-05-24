import { useEffect, useReducer } from 'react';
import { STAGES } from './config';
import { StageIndicator } from './StageIndicator';
import { ControlBar } from './ControlBar';
import { StageContent } from './StageContent';
import type { EngineAction, EngineState, StageId } from './types';

const TICK_MS = 100;

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

  useEffect(() => {
    if (!state.isPlaying) return;
    const intervalId = window.setInterval(() => {
      dispatch({ type: 'TICK', deltaMs: TICK_MS });
    }, TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [state.isPlaying]);

  return (
    <div className="relative min-h-screen bg-background text-ink overflow-hidden select-none">
      <StageIndicator
        currentStage={state.currentStage}
        elapsedInStage={state.elapsedInStage}
        hasEnded={state.hasEnded}
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
        onTogglePlay={() => dispatch({ type: 'TOGGLE_PLAY' })}
        onNext={() => dispatch({ type: 'NEXT_STAGE' })}
        onPrev={() => dispatch({ type: 'PREV_STAGE' })}
        onSkipToEnd={() => dispatch({ type: 'SKIP_TO_END' })}
        onReplay={() => dispatch({ type: 'REPLAY' })}
      />
    </div>
  );
}
