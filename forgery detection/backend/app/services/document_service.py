import os
import uuid
import aiofiles
# pyrefly: ignore [missing-import]
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.core.logger import logger


async def save_uploaded_document(file: UploadFile, user_id: int) -> dict:
    """
    Validates and stores uploaded document file (JPG/JPEG/PNG/PDF).
    Returns file metadata.
    """
    # 1. Validate extension
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS).upper()}"
        )

    # 2. Generate secure UUID filename
    doc_uuid = f"DOC-{uuid.uuid4().hex[:10].upper()}"
    stored_filename = f"{doc_uuid}_{uuid.uuid4().hex[:6]}.{ext}"
    target_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

    # 3. Stream write file and track byte size
    total_bytes = 0
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    async with aiofiles.open(target_path, "wb") as out_file:
        while content := await file.read(1024 * 64):  # 64KB chunks
            total_bytes += len(content)
            if total_bytes > max_bytes:
                # Remove partially written file
                await out_file.close()
                if os.path.exists(target_path):
                    os.remove(target_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB"
                )
            await out_file.write(content)

    logger.info(f"Uploaded file stored: {stored_filename} ({total_bytes} bytes) for user_id={user_id}")

    return {
        "document_uuid": doc_uuid,
        "original_filename": file.filename,
        "stored_filename": stored_filename,
        "file_type": file.content_type or f"image/{ext}",
        "file_size": total_bytes,
        "upload_path": target_path,
    }
