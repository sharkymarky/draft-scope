"""Minimal video pass-through pipeline for Scope menu visibility."""

from typing import TYPE_CHECKING

from scope.core.pipelines.interface import Pipeline, Requirements

from .schema import DraftScopePlaceholderConfig

if TYPE_CHECKING:
    from scope.core.pipelines.base_schema import BasePipelineConfig


class DraftScopePlaceholderPipeline(Pipeline):
    """Passes through the latest input frame with basic normalization."""

    @classmethod
    def get_config_class(cls) -> type["BasePipelineConfig"]:
        return DraftScopePlaceholderConfig

    def prepare(self, **kwargs) -> Requirements:
        return Requirements(input_size=1)

    def __call__(self, **kwargs) -> dict:
        video = kwargs.get("video")
        if not video:
            raise ValueError("Input video cannot be empty for DraftScopePlaceholderPipeline")

        frame = video[-1]

        # Keep this generic so we don't hard-depend on torch at import-time.
        if hasattr(frame, "float"):
            frame = frame.float() / 255.0
        if hasattr(frame, "clamp"):
            frame = frame.clamp(0, 1)

        return {"video": frame}
