"""
Image-to-text extraction.

Tesseract is an external binary, not a Python package, so it may legitimately
be absent on a fresh machine. When it is, this service raises OCRUnavailable
and the router answers 503 with an actionable message instead of pretending to
have read the image.
"""

import io
from typing import Optional

from core.config import settings


class OCRError(Exception):
    """The image could not be processed."""


class OCRUnavailable(Exception):
    """Tesseract is not installed or not reachable on this machine."""


_INSTALL_HINT = (
    "OCR requires the Tesseract engine. Install it from "
    "https://github.com/UB-Mannheim/tesseract/wiki and, if it is not on PATH, "
    "set TESSERACT_CMD in backend/.env to the full path of tesseract.exe."
)


def _load_pytesseract():
    try:
        import pytesseract
    except ImportError as exc:  # pragma: no cover - depends on the environment
        raise OCRUnavailable(_INSTALL_HINT) from exc

    if settings.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd
    return pytesseract


def is_available() -> bool:
    try:
        pytesseract = _load_pytesseract()
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False


def extract_text(image_bytes: bytes, language: Optional[str] = None) -> dict:
    """Return the recognised text plus a mean confidence in the range 0..1."""
    if not image_bytes:
        raise OCRError("The uploaded file was empty")
    if len(image_bytes) > settings.max_upload_bytes:
        limit_mb = settings.max_upload_bytes / (1024 * 1024)
        raise OCRError(f"Image is larger than the {limit_mb:.0f} MB limit")

    pytesseract = _load_pytesseract()

    try:
        from PIL import Image, UnidentifiedImageError
    except ImportError as exc:  # pragma: no cover
        raise OCRUnavailable("Pillow is not installed on the server") from exc

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    except UnidentifiedImageError as exc:
        raise OCRError("That file is not a readable image") from exc
    except Exception as exc:
        raise OCRError(f"Could not open the image: {exc}") from exc

    if image.mode not in ("L", "RGB"):
        image = image.convert("RGB")

    tesseract_lang = _to_tesseract_lang(language)

    try:
        text = pytesseract.image_to_string(image, lang=tesseract_lang)
        data = pytesseract.image_to_data(
            image, lang=tesseract_lang, output_type=pytesseract.Output.DICT
        )
    except pytesseract.TesseractNotFoundError as exc:
        raise OCRUnavailable(_INSTALL_HINT) from exc
    except Exception as exc:
        raise OCRError(f"Text extraction failed: {exc}") from exc

    confidences = [
        float(value)
        for value in data.get("conf", [])
        if value not in ("-1", -1, "", None)
    ]
    confidence = (sum(confidences) / len(confidences) / 100) if confidences else 0.0

    cleaned = "\n".join(line.rstrip() for line in text.splitlines() if line.strip())

    return {
        "text": cleaned,
        "confidence": round(confidence, 3),
        "language": language or "en",
        "characterCount": len(cleaned),
    }


# Tesseract uses ISO 639-2 codes; the UI speaks ISO 639-1.
_LANG_MAP = {
    "en": "eng",
    "es": "spa",
    "fr": "fra",
    "de": "deu",
    "hi": "hin",
}


def _to_tesseract_lang(language: Optional[str]) -> str:
    if not language:
        return "eng"
    return _LANG_MAP.get(language.lower(), "eng")
