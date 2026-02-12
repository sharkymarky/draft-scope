"""Compatibility shims for Scope/Daydream plugin discovery.

This module intentionally exposes several symbols because Scope plugin APIs have
changed across versions (plugin vs pipeline-centric loading).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


PLUGIN_ID = "draft-scope"
PIPELINE_ID = "draft-scope"


@dataclass(frozen=True)
class DraftScopePlugin:
    """Metadata descriptor for plugin-tab discovery."""

    id: str = PLUGIN_ID
    name: str = "Draft Scope"
    description: str = "Realtime typing-signal visualizer."
    entry: str = "src/index.ts"
    capabilities: tuple[str, ...] = ("selection", "visualization")

    def as_manifest(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "entry": self.entry,
            "capabilities": list(self.capabilities),
        }


@dataclass(frozen=True)
class DraftScopePipeline:
    """Minimal pipeline descriptor for pipeline-centric plugin managers."""

    id: str = PIPELINE_ID
    name: str = "Draft Scope"
    description: str = "Draft Scope passthrough pipeline shim."
    stage: str = "effect"

    def as_manifest(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "stage": self.stage,
        }

    def process(self, frame: Any, **_: Any) -> Any:  # pragma: no cover - runtime shim
        """No-op process hook to satisfy class-based pipeline loaders."""

        return frame


PLUGIN = DraftScopePlugin()
PIPELINE = DraftScopePipeline()


def get_plugin() -> dict[str, Any]:
    return PLUGIN.as_manifest()


def plugin() -> dict[str, Any]:
    return get_plugin()


def create_plugin() -> dict[str, Any]:
    return get_plugin()


def get_pipelines() -> list[dict[str, Any]]:
    """Return pipeline manifests for loaders that read static descriptors."""

    return [PIPELINE.as_manifest()]


def pipelines() -> list[dict[str, Any]]:
    return get_pipelines()


def register_pipelines() -> list[dict[str, Any]]:
    return get_pipelines()


def create_pipelines() -> list[DraftScopePipeline]:
    """Return class instances for loaders that expect pipeline objects."""

    return [PIPELINE]
