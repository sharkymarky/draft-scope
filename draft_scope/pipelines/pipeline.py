"""Minimal camera-input pipeline with prompt-reactive image edits."""

from typing import TYPE_CHECKING, Any

import torch
from scope.core.pipelines.interface import Pipeline

from .schema import DraftScopePlaceholderConfig

if TYPE_CHECKING:
    from scope.core.pipelines.base_schema import BasePipelineConfig


class DraftScopePlaceholderPipeline(Pipeline):
    """Use incoming camera video and apply a tiny prompt-driven color grade."""

    @classmethod
    def get_config_class(cls) -> type["BasePipelineConfig"]:
        return DraftScopePlaceholderConfig

    def __init__(self, height: int = 512, width: int = 512, **kwargs: Any):
        self.height = height
        self.width = width

    def _prompt_strength(self, prompt: str) -> float:
        if not prompt:
            return 0.0
        # Stable value in [0, 1) from user text, so typing changes output.
        return (sum(ord(ch) for ch in prompt) % 100) / 100.0

    def __call__(self, prompt: str = "", video: torch.Tensor | None = None, **kwargs: Any) -> dict:
        if video is None:
            video = kwargs.get("image")

        if video is None:
            frame = torch.zeros((1, self.height, self.width, 3), dtype=torch.float32)
        else:
            frame = video.float().clone()

        strength = self._prompt_strength(prompt)
        if strength > 0:
            tint = torch.tensor([1.0 + (0.35 * strength), 1.0, 1.0 - (0.35 * strength)], dtype=frame.dtype, device=frame.device)
            frame = frame * tint

        frame = frame.clamp(0.0, 1.0)
        return {"video": frame}
