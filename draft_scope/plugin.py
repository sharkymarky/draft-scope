"""Plugin manifest exposed via Python entry points for Scope discovery."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


PLUGIN_ID = "draft-scope"


@dataclass(frozen=True)
class DraftScopePlugin:
    """Simple plugin descriptor compatible with metadata-driven loaders."""

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


PLUGIN = DraftScopePlugin()


def get_plugin() -> dict[str, Any]:
    """Return plugin metadata dictionary for discovery systems."""

    return PLUGIN.as_manifest()


def plugin() -> dict[str, Any]:
    """Alias used by some plugin managers expecting a `plugin` symbol."""

    return get_plugin()


def create_plugin() -> dict[str, Any]:
    """Alias used by some plugin managers expecting factory semantics."""

    return get_plugin()
