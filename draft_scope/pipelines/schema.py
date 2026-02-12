"""Scope schema for the Draft Scope placeholder pipeline."""

from scope.core.pipelines.base_schema import BasePipelineConfig, ModeDefaults


class DraftScopePlaceholderConfig(BasePipelineConfig):
    """Minimal config so Draft Scope appears in Scope's pipeline picker."""

    pipeline_id = "draft-scope-placeholder"
    pipeline_name = "Draft Scope"
    pipeline_description = "Placeholder pipeline that keeps Draft Scope selectable in Scope UI."

    supports_prompts = False
    modes = {"text": ModeDefaults(default=True)}
