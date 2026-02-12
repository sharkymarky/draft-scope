"""Scope schema for the Draft Scope selectable pipeline."""

from scope.core.pipelines.base_schema import BasePipelineConfig, ModeDefaults


class DraftScopePlaceholderConfig(BasePipelineConfig):
    """Minimal config so Draft Scope appears in Scope's pipeline picker."""

    pipeline_id = "draft-scope"
    pipeline_name = "Draft Scope"
    pipeline_description = "Pass-through placeholder pipeline for Draft Scope UI wiring."

    supports_prompts = False
    # Keep video as default so it is visible in the primary side-menu mode.
    modes = {
        "video": ModeDefaults(default=True),
        "text": ModeDefaults(default=False),
    }
