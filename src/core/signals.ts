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
  pauseWindow: number[];
  segmentationWindow: number[];
  windowSize: number;
  emaAlpha: number;
};

export type SignalConfig = {
  windowSize?: number;
  emaAlpha?: number;
};

const DEFAULT_WINDOW_SIZE = 10;
const DEFAULT_EMA_ALPHA = 0.3;

function pushWindow(values: number[], value: number, maxLength: number): number[] {
  const next = values.length >= maxLength ? values.slice(1) : values.slice();
  next.push(value);
  return next;
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function ema(previous: number, next: number, alpha: number): number {
  return previous + alpha * (next - previous);
}

function segmentationTransitions(text: string): number {
  if (text.length < 2) {
    return 0;
  }

  let transitions = 0;

  for (let i = 1; i < text.length; i += 1) {
    const prevIsSegmentBreak = /[\s\p{P}]/u.test(text[i - 1]);
    const nextIsSegmentBreak = /[\s\p{P}]/u.test(text[i]);
    if (prevIsSegmentBreak !== nextIsSegmentBreak) {
      transitions += 1;
    }
  }

  return transitions;
}

export function createInitialSignalState(config: SignalConfig = {}): SignalState {
  const windowSize = config.windowSize ?? DEFAULT_WINDOW_SIZE;
  const emaAlpha = config.emaAlpha ?? DEFAULT_EMA_ALPHA;

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
    pauseWindow: [],
    segmentationWindow: [],
    windowSize,
    emaAlpha,
  };
}

export function updateSignals(prevState: SignalState, sample: PromptSample): SignalState {
  const previousSample = prevState.lastSample;
  const totalChars = sample.text.length;

  if (!previousSample) {
    const transitions = segmentationTransitions(sample.text);
    const segmentationRate = sample.text.length > 1 ? transitions / (sample.text.length - 1) : 0;

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
      segmentationWindow: pushWindow(prevState.segmentationWindow, segmentationRate, prevState.windowSize),
    };
  }

  const dtMs = Math.max(0, sample.timestampMs - previousSample.timestampMs);
  const deltaChars = totalChars - previousSample.text.length;
  const changedChars = Math.abs(deltaChars);
  const deletedChars = deltaChars < 0 ? Math.abs(deltaChars) : 0;
  const charDelta = dtMs > 0 ? (deltaChars / dtMs) * 1000 : 0;

  const pauseDurationMs = deltaChars === 0 ? prevState.pauseDurationMs + dtMs : 0;

  const charDeltaWindow = pushWindow(prevState.charDeltaWindow, charDelta, prevState.windowSize);
  const deletedCharsWindow = pushWindow(prevState.deletedCharsWindow, deletedChars, prevState.windowSize);
  const changedCharsWindow = pushWindow(prevState.changedCharsWindow, changedChars, prevState.windowSize);
  const pauseWindow = pushWindow(prevState.pauseWindow, pauseDurationMs, prevState.windowSize);

  const transitions = segmentationTransitions(sample.text);
  const frameSegmentationRate = sample.text.length > 1 ? transitions / (sample.text.length - 1) : 0;
  const segmentationWindow = pushWindow(prevState.segmentationWindow, frameSegmentationRate, prevState.windowSize);

  const deleteDensity = sum(deletedCharsWindow) / Math.max(1, sum(changedCharsWindow));
  const segmentationRate = sum(segmentationWindow) / segmentationWindow.length;
  const charDeltaAverage = sum(charDeltaWindow) / charDeltaWindow.length;

  return {
    ...prevState,
    lastSample: sample,
    totalChars,
    charDelta: charDeltaAverage,
    deleteDensity,
    pauseDurationMs,
    segmentationRate,
    smoothedTotalChars: ema(prevState.smoothedTotalChars, totalChars, prevState.emaAlpha),
    smoothedCharDelta: ema(prevState.smoothedCharDelta, charDeltaAverage, prevState.emaAlpha),
    smoothedDeleteDensity: ema(prevState.smoothedDeleteDensity, deleteDensity, prevState.emaAlpha),
    smoothedPauseDurationMs: ema(prevState.smoothedPauseDurationMs, pauseDurationMs, prevState.emaAlpha),
    smoothedSegmentationRate: ema(prevState.smoothedSegmentationRate, segmentationRate, prevState.emaAlpha),
    charDeltaWindow,
    deletedCharsWindow,
    changedCharsWindow,
    pauseWindow,
    segmentationWindow,
  };
}
