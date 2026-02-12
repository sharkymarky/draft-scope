import { describe, expect, test } from 'bun:test';

import { createInitialSignalState, updateSignals, type PromptSample } from '../src/core/signals';

function runSamples(samples: PromptSample[]) {
  return samples.reduce((state, sample) => updateSignals(state, sample), createInitialSignalState({ windowSize: 6, emaAlpha: 0.5 }));
}

describe('updateSignals', () => {
  test('burst typing produces positive character velocity', () => {
    const state = runSamples([
      { text: '', timestampMs: 0 },
      { text: 'h', timestampMs: 50 },
      { text: 'he', timestampMs: 100 },
      { text: 'hello', timestampMs: 180 },
    ]);

    expect(state.totalChars).toBe(5);
    expect(state.charDelta).toBeGreaterThan(0);
    expect(state.smoothedCharDelta).toBeGreaterThan(0);
    expect(state.deleteDensity).toBe(0);
  });

  test('deletion-heavy editing increases delete density', () => {
    const state = runSamples([
      { text: 'drafting sentence', timestampMs: 0 },
      { text: 'drafting sentence!!!', timestampMs: 100 },
      { text: 'drafting sent', timestampMs: 220 },
      { text: 'draft', timestampMs: 340 },
    ]);

    expect(state.deleteDensity).toBeGreaterThan(0.45);
    expect(state.smoothedDeleteDensity).toBeGreaterThan(0.2);
  });

  test('long unchanged periods accumulate pause duration', () => {
    const state = runSamples([
      { text: 'thinking', timestampMs: 0 },
      { text: 'thinking', timestampMs: 500 },
      { text: 'thinking', timestampMs: 1400 },
      { text: 'thinking!', timestampMs: 1500 },
    ]);

    expect(state.pauseDurationMs).toBe(0);
    expect(state.smoothedPauseDurationMs).toBeGreaterThan(0);
  });

  test('punctuation-heavy text raises segmentation rate', () => {
    const plainState = runSamples([
      { text: 'this is mostly plain words', timestampMs: 0 },
      { text: 'this is mostly plain words with extras', timestampMs: 200 },
    ]);

    const punctuatedState = runSamples([
      { text: 'hi, there! wait... now?', timestampMs: 0 },
      { text: 'hi, there! wait... now? yes, now.', timestampMs: 200 },
    ]);

    expect(punctuatedState.segmentationRate).toBeGreaterThan(plainState.segmentationRate);
    expect(punctuatedState.smoothedSegmentationRate).toBeGreaterThan(plainState.smoothedSegmentationRate);
  });
});
