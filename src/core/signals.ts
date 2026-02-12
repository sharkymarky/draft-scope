export interface TypingSnapshot {
  readonly timestamp: number;
  readonly input: string;
}

export interface TypingMetrics {
  readonly charsPerSecond: number;
  readonly wordsPerMinute: number;
  readonly burstScore: number;
  readonly inputLength: number;
}

const MS_PER_SECOND = 1000;
const CHARS_PER_WORD = 5;

export function extractTypingMetrics(
  current: TypingSnapshot,
  previous: TypingSnapshot | null
): TypingMetrics {
  if (!previous) {
    return {
      charsPerSecond: 0,
      wordsPerMinute: 0,
      burstScore: 0,
      inputLength: current.input.length
    };
  }

  const elapsedMs = Math.max(1, current.timestamp - previous.timestamp);
  const charDelta = Math.max(0, current.input.length - previous.input.length);
  const charsPerSecond = (charDelta / elapsedMs) * MS_PER_SECOND;
  const wordsPerMinute = (charsPerSecond / CHARS_PER_WORD) * 60;

  return {
    charsPerSecond,
    wordsPerMinute,
    burstScore: Math.min(1, charsPerSecond / 12),
    inputLength: current.input.length
  };
}
