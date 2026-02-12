"""Plugin manifest exposed via Python entry points for Scope discovery."""

from __future__ import annotations

from typing import Any


PLUGIN_ID = "draft-scope"


def get_plugin() -> dict[str, Any]:
    """Return plugin metadata used by host discovery systems.

    The host can use this information to present Draft Scope in plugin pickers
    and know that the JS entrypoint is backed by `src/index.ts` exports.
    """

    return {
        "id": PLUGIN_ID,
        "name": "Draft Scope",
        "description": "Realtime typing-signal visualizer.",
        "entry": "src/index.ts",
        "capabilities": ["selection", "visualization"],
    }
