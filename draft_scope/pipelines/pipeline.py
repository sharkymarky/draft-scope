"""Minimal text-only pipeline for Scope menu visibility."""

from typing import TYPE_CHECKING

import torch
from scope.core.pipelines.interface import Pipeline

from .schema import DraftScopePlaceholderConfig

if TYPE_CHECKING:
    from scope.core.pipelines.base_schema import BasePipelineConfig


class DraftScopePlaceholderPipeline(Pipeline):
    """A simple black-frame generator used as a selectable placeholder."""

    @classmethod
    def get_config_class(cls) -> type["BasePipelineConfig"]:
        return DraftScopePlaceholderConfig

    def __init__(self, height: int = 512, width: int = 512, **kwargs):
        self.height = height
        self.width = width

    def __call__(self, **kwargs) -> dict:
        frame = torch.zeros((1, self.height, self.width, 3), dtype=torch.float32)
        return {"video": frame}
