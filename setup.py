from setuptools import find_packages, setup

setup(
    name="draft-scope",
    version="0.1.4",
    description="Draft Scope plugin package metadata for Daydream Scope",
    packages=find_packages(),
    include_package_data=True,
    entry_points={
        "scope": [
            "draft_scope = draft_scope.plugin",
        ],
        "scope.plugins": [
            "draft-scope = draft_scope.plugin:get_plugin",
        ],
        "daydream_scope.plugins": [
            "draft-scope = draft_scope.plugin:get_plugin",
        ],
    },
)
