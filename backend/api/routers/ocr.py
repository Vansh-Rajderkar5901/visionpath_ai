"""Optical character recognition over an uploaded image."""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from api.deps import CurrentUser
from services import ocr_service

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/tiff",
}


@router.get("/status")
def ocr_status() -> dict:
    """Lets the UI tell the user up front whether OCR will work on this server."""
    available = ocr_service.is_available()
    return {
        "available": available,
        "message": (
            "OCR engine ready"
            if available
            else "Tesseract is not installed on the server. See backend/.env.example."
        ),
    }


@router.post("/extract")
async def extract(
    user: CurrentUser,
    file: UploadFile = File(...),
    language: str = Form(default="en"),
) -> dict:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type or 'unknown'}. Upload an image.",
        )

    contents = await file.read()

    try:
        return ocr_service.extract_text(contents, language=language)
    except ocr_service.OCRUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        )
    except ocr_service.OCRError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
