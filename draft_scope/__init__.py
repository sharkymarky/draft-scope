"""Python package metadata bridge for the Draft Scope plugin."""

from .plugin import (
    PIPELINE,
    PLUGIN,
    DraftScopePipeline,
    DraftScopePlugin,
    create_pipelines,
    create_plugin,
    get_pipelines,
    get_plugin,
    pipelines,
    plugin,
    register_pipelines,
)

__all__ = [
    "DraftScopePlugin",
    "DraftScopePipeline",
    "PLUGIN",
    "PIPELINE",
    "get_plugin",
    "plugin",
    "create_plugin",
    "get_pipelines",
    "pipelines",
    "register_pipelines",
    "create_pipelines",
]
