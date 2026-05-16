from pathlib import Path

from api.core.config import Settings, backend_dir, default_content_root, default_instructions_root, repo_root


def test_settings_env_files_include_repo_root_and_backend() -> None:
    env_files = tuple(Path(path) for path in Settings.model_config["env_file"])

    assert env_files == (repo_root / ".env", backend_dir / ".env")


def test_repo_file_roots_are_not_environment_configurable(monkeypatch) -> None:
    monkeypatch.setenv("API_CONTENT_ROOT", "/app/content")
    monkeypatch.setenv("API_INSTRUCTIONS_ROOT", "/app/instructions")

    settings = Settings()

    assert settings.content_root == default_content_root
    assert settings.instructions_root == default_instructions_root
