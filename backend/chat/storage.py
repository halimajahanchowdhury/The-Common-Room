import os
import re
import time
import logging
from pathlib import Path
from django.conf import settings
from profiles.storage import is_cloudinary_configured

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB exact limit

DANGEROUS_EXTENSIONS = {
    'exe', 'bat', 'cmd', 'sh', 'vbs', 'msi', 'dll', 'scr', 'jar', 'pif', 'com', 'application', 'gadget'
}

IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'}
AUDIO_EXTENSIONS = {'mp3', 'wav', 'ogg', 'm4a', 'aac'}
VIDEO_EXTENSIONS = {'mp4', 'webm', 'mov', 'mkv', 'avi'}
DOC_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'zip', 'tar', 'gz'}

def get_attachment_type(filename: str, content_type: str = '') -> str:
    """Classifies file into 'image', 'document', 'audio', or 'video'."""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext in IMAGE_EXTENSIONS or (content_type and content_type.startswith('image/')):
        return 'image'
    if ext in AUDIO_EXTENSIONS or (content_type and content_type.startswith('audio/')):
        return 'audio'
    if ext in VIDEO_EXTENSIONS or (content_type and content_type.startswith('video/')):
        return 'video'
    return 'document'

def validate_chat_file(file_obj) -> tuple[bool, str]:
    """
    Validates file size (max 10MB) and prohibits dangerous executables.
    Returns (is_valid, error_message).
    """
    if not file_obj:
        return False, "No file uploaded."

    if file_obj.size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE / (1024 * 1024)
        actual_mb = round(file_obj.size / (1024 * 1024), 2)
        return False, f"File size exceeds the {max_mb:.0f}MB limit (your file: {actual_mb}MB)."

    filename = getattr(file_obj, 'name', '')
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''

    if ext in DANGEROUS_EXTENSIONS:
        return False, f"File type '.{ext}' is prohibited for security reasons."

    return True, ""

def upload_chat_attachment(file_obj, username: str, request=None) -> dict:
    """
    Uploads a validated file to Cloudinary (or fallback local object storage),
    returning { 'attachment_url', 'attachment_name', 'attachment_type', 'attachment_size' }.
    """
    is_valid, err = validate_chat_file(file_obj)
    if not is_valid:
        raise ValueError(err)

    original_name = getattr(file_obj, 'name', 'attachment')
    file_size = file_obj.size
    content_type = getattr(file_obj, 'content_type', '')
    attachment_type = get_attachment_type(original_name, content_type)

    timestamp = int(time.time())
    safe_user = re.sub(r'[^a-zA-Z0-9_]', '', str(username))
    clean_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', original_name)
    public_id = f"chat_{safe_user}_{timestamp}_{clean_name}"

    # 1. Cloudinary upload if configured
    if is_cloudinary_configured():
        try:
            import cloudinary
            import cloudinary.uploader

            file_obj.seek(0)
            upload_result = cloudinary.uploader.upload(
                file_obj,
                folder="thecommonroom/chat_attachments",
                public_id=public_id,
                resource_type="auto"
            )
            secure_url = upload_result.get('secure_url')
            if secure_url:
                logger.info(f"Chat attachment uploaded to Cloudinary: {secure_url}")
                return {
                    'attachment_url': secure_url,
                    'attachment_name': original_name,
                    'attachment_type': attachment_type,
                    'attachment_size': file_size,
                }
        except Exception as e:
            logger.error(f"Cloudinary attachment upload failed: {e}. Falling back to local storage.")

    # 2. Local object storage fallback
    media_chat_dir = Path(settings.MEDIA_ROOT) / 'chat_attachments'
    media_chat_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{safe_user}_{timestamp}_{clean_name}"
    filepath = media_chat_dir / filename

    file_obj.seek(0)
    with open(filepath, 'wb') as f:
        for chunk in file_obj.chunks():
            f.write(chunk)

    media_url = f"{settings.MEDIA_URL.rstrip('/')}/chat_attachments/{filename}"
    if request is not None and hasattr(request, 'build_absolute_uri'):
        full_url = request.build_absolute_uri(media_url)
    else:
        full_url = media_url

    return {
        'attachment_url': full_url,
        'attachment_name': original_name,
        'attachment_type': attachment_type,
        'attachment_size': file_size,
    }

