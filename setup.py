from setuptools import find_packages, setup

PLUGIN_TARGET = "draft_scope.plugin:get_plugin"
PIPELINES_TARGET = "draft_scope.plugin:get_pipelines"

setup(
    name="draft-scope",
    version="0.1.3",
    description="Draft Scope plugin package metadata for Daydream Scope",
    packages=find_packages(),
    include_package_data=True,
    entry_points={
        "scope.plugins": [
            f"draft-scope = {PLUGIN_TARGET}",
        ],
        "scope.plugin": [
            f"draft-scope = {PLUGIN_TARGET}",
        ],
        "daydream_scope.plugins": [
            f"draft-scope = {PLUGIN_TARGET}",
        ],
        "daydream.plugins": [
            f"draft-scope = {PLUGIN_TARGET}",
        ],
        "scope.pipelines": [
            f"draft-scope = {PIPELINES_TARGET}",
        ],
        "daydream_scope.pipelines": [
            f"draft-scope = {PIPELINES_TARGET}",
        ],
        "daydream.pipelines": [
            f"draft-scope = {PIPELINES_TARGET}",
        ],
    },
)
