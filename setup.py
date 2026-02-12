from setuptools import find_packages, setup

ENTRY_TARGET = "draft_scope.plugin:get_plugin"

setup(
    name="draft-scope",
    version="0.1.2",
    description="Draft Scope plugin package metadata for Daydream Scope",
    packages=find_packages(),
    include_package_data=True,
    entry_points={
        "scope.plugins": [
            f"draft-scope = {ENTRY_TARGET}",
        ],
        "scope.plugin": [
            f"draft-scope = {ENTRY_TARGET}",
        ],
        "daydream_scope.plugins": [
            f"draft-scope = {ENTRY_TARGET}",
        ],
        "daydream.plugins": [
            f"draft-scope = {ENTRY_TARGET}",
        ],
    },
)
