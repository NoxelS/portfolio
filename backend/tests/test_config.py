from pathlib import Path

from api.core.config import Settings, backend_dir, default_content_root, default_instructions_root, repo_root
from api.core.model_client import get_headers


def test_settings_env_files_include_repo_root_and_backend() -> None:
    env_files = tuple(Path(path) for path in Settings.model_config["env_file"])

    assert env_files == (repo_root / ".env", backend_dir / ".env")


def test_repo_file_roots_are_not_environment_configurable(monkeypatch) -> None:
    monkeypatch.setenv("API_CONTENT_ROOT", "/app/content")
    monkeypatch.setenv("API_INSTRUCTIONS_ROOT", "/app/instructions")

    settings = Settings()

    assert settings.content_root == default_content_root
    assert settings.instructions_root == default_instructions_root


def test_default_http_timeout_is_five_minutes() -> None:
    assert Settings().http_timeout_seconds == 300.0


def test_openwebui_api_key_uses_api_prefixed_env(monkeypatch) -> None:
    monkeypatch.setenv("API_OPENWEBUI_API_KEY", "placeholder-key")

    settings = Settings()

    assert settings.openwebui_api_key is not None
    assert settings.openwebui_api_key.get_secret_value() == "placeholder-key"


def test_openwebui_api_key_is_sent_as_bearer_header() -> None:
    settings = Settings(openwebui_api_key="placeholder-key")

    assert get_headers(settings) == {"Authorization": "Bearer placeholder-key"}
