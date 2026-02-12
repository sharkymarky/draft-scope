import test from 'node:test';
import assert from 'node:assert/strict';

import { createInitialSignalState, updateSignals, type PromptSample } from '../src/core/signals.ts';

function runSamples(samples: PromptSample[]) {
  return samples.reduce(
    (state, sample) => updateSignals(state, sample),
    createInitialSignalState({ windowSize: 6, emaAlpha: 0.5 }),
  );
}

test('updateSignals: burst typing produces positive character velocity', () => {
  const state = runSamples([
    { text: '', timestampMs: 0 },
    { text: 'h', timestampMs: 50 },
    { text: 'he', timestampMs: 100 },
    { text: 'hello', timestampMs: 180 },
  ]);

  assert.equal(state.totalChars, 5);
  assert.ok(state.charDelta > 0);
  assert.ok(state.smoothedCharDelta > 0);
  assert.equal(state.deleteDensity, 0);
});

test('updateSignals: deletion-heavy editing increases delete density', () => {
  const state = runSamples([
    { text: 'drafting sentence', timestampMs: 0 },
    { text: 'drafting sentence!!!', timestampMs: 100 },
    { text: 'drafting sent', timestampMs: 220 },
    { text: 'draft', timestampMs: 340 },
  ]);

  assert.ok(state.deleteDensity > 0.45);
  assert.ok(state.smoothedDeleteDensity > 0.2);
});

test('updateSignals: long unchanged periods accumulate pause duration', () => {
  const state = runSamples([
    { text: 'thinking', timestampMs: 0 },
    { text: 'thinking', timestampMs: 500 },
    { text: 'thinking', timestampMs: 1400 },
    { text: 'thinking!', timestampMs: 1500 },
  ]);

  assert.equal(state.pauseDurationMs, 0);
  assert.ok(state.smoothedPauseDurationMs > 0);
});

test('updateSignals: punctuation-heavy text raises segmentation rate', () => {
  const plainState = runSamples([
    { text: 'this is mostly plain words', timestampMs: 0 },
    { text: 'this is mostly plain words with extras', timestampMs: 200 },
  ]);

  const punctuatedState = runSamples([
    { text: 'hi, there! wait... now?', timestampMs: 0 },
    { text: 'hi, there! wait... now? yes, now.', timestampMs: 200 },
  ]);

  assert.ok(punctuatedState.segmentationRate > plainState.segmentationRate);
  assert.ok(punctuatedState.smoothedSegmentationRate > plainState.smoothedSegmentationRate);
});

test('updateSignals: unchanged windows keep delete density at zero', () => {
  const state = runSamples([
    { text: 'steady text', timestampMs: 0 },
    { text: 'steady text', timestampMs: 250 },
    { text: 'steady text', timestampMs: 500 },
  ]);

  assert.equal(state.deleteDensity, 0);
  assert.equal(state.pauseDurationMs, 500);
});

test('updateSignals: non-monotonic timestamps do not produce infinities', () => {
  const state = runSamples([
    { text: 'abc', timestampMs: 200 },
    { text: 'abcd', timestampMs: 100 },
    { text: 'abcde', timestampMs: 300 },
  ]);

  assert.equal(Number.isFinite(state.charDelta), true);
  assert.equal(Number.isFinite(state.smoothedCharDelta), true);
});
