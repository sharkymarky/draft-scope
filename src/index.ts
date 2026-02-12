import { createEngine } from "./core/engine.js";
import { createVisualLayer } from "./core/render.js";

export interface DraftScopePlugin {
  mount(host: HTMLElement): Promise<void>;
  unmount(): void;
}

export function createDraftScopePlugin(): DraftScopePlugin {
  let engine: ReturnType<typeof createEngine> | null = null;
  let host: HTMLElement | null = null;
  let destroyVisual: (() => void) | null = null;

  return {
    async mount(nextHost) {
      host = nextHost;
      const layer = await createVisualLayer(host);
      destroyVisual = () => layer.destroy();

      engine = createEngine({
        readSnapshot: () => ({
          timestamp: performance.now(),
          input: host?.dataset.typingInput ?? ""
        }),
        update: (state) => {
          layer.update(state);
        }
      });

      engine.start();
    },
    unmount() {
      engine?.stop();

      destroyVisual?.();

      if (host) {
        host.replaceChildren();
      }

      destroyVisual = null;
      engine = null;
      host = null;
    }
  };
}

export default createDraftScopePlugin;
