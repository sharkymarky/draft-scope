"""Scope plugin hooks and compatibility metadata for Draft Scope."""

from __future__ import annotations

from typing import Any

PLUGIN_ID = "draft-scope"

try:
    from scope.core.plugins.hookspecs import hookimpl
except Exception:  # pragma: no cover - allows import outside Scope runtime
    def hookimpl(func):
        return func


@hookimpl
def register_pipelines(register: Any) -> None:
    """Register pipelines so Draft Scope appears in Scope pipeline pickers."""

    from .pipelines import DraftScopePlaceholderPipeline

    register(DraftScopePlaceholderPipeline)


def get_plugin() -> dict[str, Any]:
    """Backward-compatible metadata payload used by older discovery code."""

    return {
        "id": PLUGIN_ID,
        "name": "Draft Scope",
        "description": "Realtime typing-signal visualizer.",
        "entry": "src/index.ts",
        "capabilities": ["selection", "visualization"],
    }
