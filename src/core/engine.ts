import {
  createRenderState,
  defaultRenderConfig,
  renderFrame,
  type FrameOutput,
  type RenderConfig,
  type RenderSignals,
  type RenderState,
} from './render';

export interface EngineInput {
  charDelta: number;
  deleteDensity: number;
  pauseDurationMs: number;
  segmentIndex: number;
  majorPunctuationCount: number;
  newlineCount: number;
}

export interface EngineFrame extends FrameOutput {
  timestampMs: number;
}

export class RenderEngine {
  private readonly config: RenderConfig;

  private readonly state: RenderState;

  private lastTimestampMs: number | null = null;

  constructor(config: Partial<RenderConfig> = {}) {
    this.config = { ...defaultRenderConfig, ...config };
    this.state = createRenderState(this.config);
  }

  public step(input: EngineInput, timestampMs: number): EngineFrame {
    const dt = this.lastTimestampMs === null ? 16 : Math.max(0, timestampMs - this.lastTimestampMs);
    this.lastTimestampMs = timestampMs;

    const signals: RenderSignals = {
      charDelta: input.charDelta,
      deleteDensity: input.deleteDensity,
      pauseDurationMs: input.pauseDurationMs,
      segmentIndex: input.segmentIndex,
      majorPunctuationCount: input.majorPunctuationCount,
      newlineCount: input.newlineCount,
    };

    const frame = renderFrame(signals, dt, this.state, this.config);

    return {
      ...frame,
      timestampMs,
    };
  }

  public snapshot(): RenderState {
    return {
      ...this.state,
      fastLayer: this.state.fastLayer.slice(),
      slowLayer: this.state.slowLayer.slice(),
    };
  }
}
