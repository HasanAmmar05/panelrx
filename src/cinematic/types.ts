export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Stage = {
  id: StageId;
  name: string;
  durationMs: number;
  description: string;
};

export type EngineState = {
  currentStage: StageId;
  elapsedInStage: number;
  isPlaying: boolean;
  hasEnded: boolean;
};

export type EngineAction =
  | { type: 'TICK'; deltaMs: number }
  | { type: 'NEXT_STAGE' }
  | { type: 'PREV_STAGE' }
  | { type: 'REPLAY' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'JUMP_TO_STAGE'; stage: StageId }
  | { type: 'SKIP_TO_END' }
  | { type: 'SEEK'; deltaMs: number };
