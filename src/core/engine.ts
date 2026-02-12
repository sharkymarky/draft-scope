import { extractTypingMetrics, type TypingSnapshot } from "./signals.js";
import type { TypingMetrics } from "./signals.js";

export interface EngineState {
  readonly now: number;
  readonly metrics: TypingMetrics;
}

export interface EngineHooks {
  readSnapshot(): TypingSnapshot;
  update(state: EngineState): void;
}

export interface EngineController {
  start(): void;
  stop(): void;
}

export function createEngine(hooks: EngineHooks): EngineController {
  let frameHandle = 0;
  let previousSnapshot: TypingSnapshot | null = null;

  const frame = () => {
    const snapshot = hooks.readSnapshot();
    const metrics = extractTypingMetrics(snapshot, previousSnapshot);

    hooks.update({
      now: snapshot.timestamp,
      metrics
    });

    previousSnapshot = snapshot;
    frameHandle = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (frameHandle !== 0) {
        return;
      }

      frameHandle = requestAnimationFrame(frame);
    },
    stop() {
      if (frameHandle === 0) {
        return;
      }

      cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    }
  };
}
