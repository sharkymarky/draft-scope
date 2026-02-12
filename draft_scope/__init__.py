"""Python package metadata bridge for the Draft Scope plugin."""

from .plugin import PLUGIN, DraftScopePlugin, create_plugin, get_plugin, plugin

__all__ = ["DraftScopePlugin", "PLUGIN", "get_plugin", "plugin", "create_plugin"]
