import logging


def configure_logging(level: str) -> None:
    """Configure process-wide structured-enough logging for the API."""

    logging.basicConfig(
        level=level.upper(),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
