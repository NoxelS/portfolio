from pathlib import Path

from api.core.config import Settings, backend_dir, repo_root


def test_settings_env_files_include_repo_root_and_backend() -> None:
    env_files = tuple(Path(path) for path in Settings.model_config["env_file"])

    assert env_files == (repo_root / ".env", backend_dir / ".env")
