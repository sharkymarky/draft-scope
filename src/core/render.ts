export interface RenderSignals {
  charDelta: number;
  deleteDensity: number;
  pauseDurationMs: number;
  segmentIndex: number;
  majorPunctuationCount: number;
  newlineCount: number;
}

export interface RenderConfig {
  fastGain: number;
  memoryHalfLife: number;
  eraseRate: number;
  phaseThreshold: number;
  bufferSize: number;
}

export interface RenderState {
  fastLayer: Float32Array;
  slowLayer: Float32Array;
  writeHead: number;
  phase: number;
  lastSegmentIndex: number;
  lastMajorPunctuationCount: number;
  lastNewlineCount: number;
}

export interface FrameOutput {
  fastLayer: Float32Array;
  slowLayer: Float32Array;
  phase: number;
  resetTriggered: boolean;
}

export const defaultRenderConfig: RenderConfig = {
  fastGain: 0.9,
  memoryHalfLife: 1300,
  eraseRate: 0.35,
  phaseThreshold: 2,
  bufferSize: 128,
};

const EPSILON = 1e-6;

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const createRenderState = (config: RenderConfig = defaultRenderConfig): RenderState => ({
  fastLayer: new Float32Array(config.bufferSize),
  slowLayer: new Float32Array(config.bufferSize),
  writeHead: 0,
  phase: 0,
  lastSegmentIndex: 0,
  lastMajorPunctuationCount: 0,
  lastNewlineCount: 0,
});

const shouldResetStructure = (
  signals: RenderSignals,
  state: RenderState,
  config: RenderConfig,
): boolean => {
  const punctuationJump = signals.majorPunctuationCount - state.lastMajorPunctuationCount;
  const newlineJump = signals.newlineCount - state.lastNewlineCount;

  return punctuationJump >= config.phaseThreshold || newlineJump >= 1;
};

const updateFastLayer = (
  signals: RenderSignals,
  state: RenderState,
  config: RenderConfig,
): void => {
  const pulse = Math.abs(signals.charDelta) * config.fastGain;
  const turbulence = signals.deleteDensity * config.fastGain;
  const occlusion = clamp01(signals.deleteDensity) * pulse;
  const fastValue = Math.max(0, pulse + turbulence - occlusion);

  state.fastLayer[state.writeHead] = fastValue;

  const smoothing = 0.88;
  for (let i = 0; i < state.fastLayer.length; i += 1) {
    if (i === state.writeHead) continue;
    state.fastLayer[i] *= smoothing;
  }
};

const updateSlowLayer = (
  signals: RenderSignals,
  dt: number,
  state: RenderState,
  config: RenderConfig,
): void => {
  const safeHalfLife = Math.max(config.memoryHalfLife, EPSILON);
  const decay = Math.exp((-Math.max(dt, 0) * Math.LN2) / safeHalfLife);
  const erase = clamp01(config.eraseRate * signals.deleteDensity);

  const segmentDrift = Math.max(0, signals.segmentIndex - state.lastSegmentIndex);
  const pauseDrive = clamp01(signals.pauseDurationMs / Math.max(config.phaseThreshold * 300, 1));
  const accumulation = pauseDrive * (1 + segmentDrift * 0.25);

  for (let i = 0; i < state.slowLayer.length; i += 1) {
    const decayed = state.slowLayer[i] * decay;
    state.slowLayer[i] = decayed * (1 - erase);
  }

  const previousIndex = (state.writeHead - 1 + state.slowLayer.length) % state.slowLayer.length;
  const stack = state.slowLayer[previousIndex] * 0.45;
  const smear = state.slowLayer[(state.writeHead + 1) % state.slowLayer.length] * 0.25;
  state.slowLayer[state.writeHead] += accumulation + stack + smear;
};

const applyStructuralReset = (state: RenderState): void => {
  state.phase = 0;

  for (let i = 0; i < state.fastLayer.length; i += 1) {
    state.fastLayer[i] *= 0.2;
  }

  for (let i = 0; i < state.slowLayer.length; i += 1) {
    state.slowLayer[i] *= 0.55;
  }
};

export const renderFrame = (
  signals: RenderSignals,
  dt: number,
  state: RenderState,
  config: RenderConfig = defaultRenderConfig,
): FrameOutput => {
  const resetTriggered = shouldResetStructure(signals, state, config);

  if (resetTriggered) {
    applyStructuralReset(state);
  }

  updateFastLayer(signals, state, config);
  updateSlowLayer(signals, dt, state, config);

  const segmentAdvance = Math.max(0, signals.segmentIndex - state.lastSegmentIndex);
  state.phase += segmentAdvance;

  state.lastSegmentIndex = signals.segmentIndex;
  state.lastMajorPunctuationCount = signals.majorPunctuationCount;
  state.lastNewlineCount = signals.newlineCount;

  state.writeHead = (state.writeHead + 1) % state.fastLayer.length;

  return {
    fastLayer: state.fastLayer,
    slowLayer: state.slowLayer,
    phase: state.phase,
    resetTriggered,
  };
};
