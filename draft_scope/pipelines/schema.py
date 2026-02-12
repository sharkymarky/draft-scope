"""Scope schema for the Draft Scope camera + prompt pipeline."""

from scope.core.pipelines.base_schema import BasePipelineConfig, ModeDefaults


class DraftScopePlaceholderConfig(BasePipelineConfig):
    """Simple prompt-driven camera effect shown in Scope's pipeline picker."""

    pipeline_id = "draft-scope-camera-text"
    pipeline_name = "Draft Scope"
    pipeline_description = (
        "Uses camera frames as input and applies a lightweight prompt-driven color effect."
    )

    supports_prompts = True
    modes = {"video": ModeDefaults(default=True)}
