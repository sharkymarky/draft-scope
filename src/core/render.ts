import type { EngineState } from "./engine.js";

export interface VisualLayer {
  update(state: EngineState): void;
  destroy(): void;
}

export async function createVisualLayer(host: HTMLElement): Promise<VisualLayer> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create 2D rendering context.");
  }

  const resize = () => {
    canvas.width = Math.max(320, host.clientWidth || 800);
    canvas.height = 240;
  };

  resize();
  host.appendChild(canvas);

  const update = (state: EngineState) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#121212";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = Math.min(canvas.width - 32, Math.round(state.metrics.burstScore * (canvas.width - 32)));

    context.fillStyle = "#5eead4";
    context.fillRect(16, 56, barWidth, 24);

    context.fillStyle = "#f5f5f5";
    context.font = "16px monospace";
    context.fillText(
      `chars/s: ${state.metrics.charsPerSecond.toFixed(2)} | wpm: ${state.metrics.wordsPerMinute.toFixed(1)} | length: ${state.metrics.inputLength}`,
      16,
      32
    );
  };

  return {
    update,
    destroy() {
      canvas.remove();
    }
  };
}
