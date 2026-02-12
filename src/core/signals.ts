export type PromptSample = {
  text: string;
  timestampMs: number;
};

export type SignalState = {
  lastSample: PromptSample | null;
  totalChars: number;
  charDelta: number;
  deleteDensity: number;
  pauseDurationMs: number;
  segmentationRate: number;
  smoothedTotalChars: number;
  smoothedCharDelta: number;
  smoothedDeleteDensity: number;
  smoothedPauseDurationMs: number;
  smoothedSegmentationRate: number;
  charDeltaWindow: number[];
  deletedCharsWindow: number[];
  changedCharsWindow: number[];
  pauseDurationWindow: number[];
  segmentationRateWindow: number[];
  windowSize: number;
  emaAlpha: number;
};

export type SignalConfig = {
  windowSize?: number;
  emaAlpha?: number;
};

const DEFAULT_WINDOW_SIZE = 10;
const DEFAULT_EMA_ALPHA = 0.3;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pushWindow(values: number[], value: number, maxLength: number): number[] {
  const next = values.length >= maxLength ? values.slice(1) : values.slice();
  next.push(value);
  return next;
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

function ema(previous: number, next: number, alpha: number): number {
  return previous + alpha * (next - previous);
}

function isSegmentBoundaryChar(char: string): boolean {
  return /[\s.,!?;:'"()[\]{}\-_/\\]/.test(char);
}

function segmentationTransitions(text: string): number {
  if (text.length < 2) {
    return 0;
  }

  let transitions = 0;
  for (let i = 1; i < text.length; i += 1) {
    const prevBoundary = isSegmentBoundaryChar(text[i - 1]);
    const nextBoundary = isSegmentBoundaryChar(text[i]);
    if (prevBoundary !== nextBoundary) {
      transitions += 1;
    }
  }

  return transitions;
}

function computeSegmentationRate(text: string): number {
  if (text.length < 2) {
    return 0;
  }

  return segmentationTransitions(text) / (text.length - 1);
}

export function createInitialSignalState(config: SignalConfig = {}): SignalState {
  const windowSize = Math.max(1, Math.floor(config.windowSize ?? DEFAULT_WINDOW_SIZE));
  const emaAlpha = clamp(config.emaAlpha ?? DEFAULT_EMA_ALPHA, 0, 1);

  return {
    lastSample: null,
    totalChars: 0,
    charDelta: 0,
    deleteDensity: 0,
    pauseDurationMs: 0,
    segmentationRate: 0,
    smoothedTotalChars: 0,
    smoothedCharDelta: 0,
    smoothedDeleteDensity: 0,
    smoothedPauseDurationMs: 0,
    smoothedSegmentationRate: 0,
    charDeltaWindow: [],
    deletedCharsWindow: [],
    changedCharsWindow: [],
    pauseDurationWindow: [],
    segmentationRateWindow: [],
    windowSize,
    emaAlpha,
  };
}

export function updateSignals(prevState: SignalState, sample: PromptSample): SignalState {
  const previousSample = prevState.lastSample;
  const totalChars = sample.text.length;

  if (!previousSample) {
    const segmentationRate = computeSegmentationRate(sample.text);
    const segmentationRateWindow = pushWindow(prevState.segmentationRateWindow, segmentationRate, prevState.windowSize);

    return {
      ...prevState,
      lastSample: sample,
      totalChars,
      charDelta: 0,
      deleteDensity: 0,
      pauseDurationMs: 0,
      segmentationRate,
      smoothedTotalChars: ema(prevState.smoothedTotalChars, totalChars, prevState.emaAlpha),
      smoothedSegmentationRate: ema(prevState.smoothedSegmentationRate, segmentationRate, prevState.emaAlpha),
      segmentationRateWindow,
    };
  }

  const dtMs = Math.max(0, sample.timestampMs - previousSample.timestampMs);
  const deltaChars = totalChars - previousSample.text.length;
  const changedChars = Math.abs(deltaChars);
  const deletedChars = Math.max(0, -deltaChars);
  const frameCharDelta = dtMs === 0 ? 0 : (deltaChars / dtMs) * 1000;
  const pauseDurationMs = deltaChars === 0 ? prevState.pauseDurationMs + dtMs : 0;

  const charDeltaWindow = pushWindow(prevState.charDeltaWindow, frameCharDelta, prevState.windowSize);
  const deletedCharsWindow = pushWindow(prevState.deletedCharsWindow, deletedChars, prevState.windowSize);
  const changedCharsWindow = pushWindow(prevState.changedCharsWindow, changedChars, prevState.windowSize);
  const pauseDurationWindow = pushWindow(prevState.pauseDurationWindow, pauseDurationMs, prevState.windowSize);

  const frameSegmentationRate = computeSegmentationRate(sample.text);
  const segmentationRateWindow = pushWindow(prevState.segmentationRateWindow, frameSegmentationRate, prevState.windowSize);

  const windowChangedChars = sum(changedCharsWindow);
  const deleteDensity = windowChangedChars === 0 ? 0 : sum(deletedCharsWindow) / windowChangedChars;
  const charDelta = average(charDeltaWindow);
  const segmentationRate = average(segmentationRateWindow);

  return {
    ...prevState,
    lastSample: sample,
    totalChars,
    charDelta,
    deleteDensity,
    pauseDurationMs,
    segmentationRate,
    smoothedTotalChars: ema(prevState.smoothedTotalChars, totalChars, prevState.emaAlpha),
    smoothedCharDelta: ema(prevState.smoothedCharDelta, charDelta, prevState.emaAlpha),
    smoothedDeleteDensity: ema(prevState.smoothedDeleteDensity, deleteDensity, prevState.emaAlpha),
    smoothedPauseDurationMs: ema(prevState.smoothedPauseDurationMs, pauseDurationMs, prevState.emaAlpha),
    smoothedSegmentationRate: ema(prevState.smoothedSegmentationRate, segmentationRate, prevState.emaAlpha),
    charDeltaWindow,
    deletedCharsWindow,
    changedCharsWindow,
    pauseDurationWindow,
    segmentationRateWindow,
  };
}
