import os
import re
import time
import base64
import logging
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)

def is_cloudinary_configured() -> bool:
    """Check if Cloudinary environment variables or settings are provided."""
    url = getattr(settings, 'CLOUDINARY_URL', None) or os.environ.get('CLOUDINARY_URL')
    name = getattr(settings, 'CLOUDINARY_CLOUD_NAME', None) or os.environ.get('CLOUDINARY_CLOUD_NAME')
    key = getattr(settings, 'CLOUDINARY_API_KEY', None) or os.environ.get('CLOUDINARY_API_KEY')
    secret = getattr(settings, 'CLOUDINARY_API_SECRET', None) or os.environ.get('CLOUDINARY_API_SECRET')
    return bool(url or (name and key and secret))

def upload_avatar(image_data, username: str, request=None) -> str | None:
    """
    Takes an avatar image (Base64 data URI, raw base64 string, or uploaded file),
    uploads it to Cloudinary (or fallback local object storage), and returns
    a clean, lightweight HTTPS URL to store in PostgreSQL.
    """
    if not image_data:
        return None

    # If it's already an HTTP / HTTPS URL, keep it as-is
    if isinstance(image_data, str) and (image_data.startswith("http://") or image_data.startswith("https://") or image_data.startswith("/media/")):
        return image_data

    # 1. Extract bytes and extension
    file_bytes = None
    ext = "jpg"

    if hasattr(image_data, 'read'):
        # Uploaded file object
        file_bytes = image_data.read()
        name = getattr(image_data, 'name', '')
        if '.' in name:
            ext = name.rsplit('.', 1)[-1].lower()
    elif isinstance(image_data, str):
        # Base64 string or Data URI
        match = re.match(r"^data:image/([a-zA-Z0-9+]+);base64,(.+)$", image_data)
        if match:
            ext = match.group(1).lower().replace("jpeg", "jpg")
            raw_b64 = match.group(2)
        else:
            raw_b64 = image_data

        try:
            file_bytes = base64.b64decode(raw_b64)
        except Exception as e:
            logger.error(f"Failed to decode base64 avatar for {username}: {e}")
            return None

    if not file_bytes:
        return None

    timestamp = int(time.time())
    safe_user = re.sub(r'[^a-zA-Z0-9_]', '', str(username))
    public_id = f"avatar_{safe_user}_{timestamp}"

    # 2. Upload to Cloudinary if configured
    if is_cloudinary_configured():
        try:
            import cloudinary
            import cloudinary.uploader

            upload_result = cloudinary.uploader.upload(
                file_bytes,
                folder="thecommonroom/avatars",
                public_id=public_id,
                overwrite=True,
                resource_type="image",
                transformation=[
                    {'width': 400, 'height': 400, 'crop': 'fill', 'gravity': 'face'},
                    {'quality': 'auto', 'fetch_format': 'auto'}
                ]
            )
            secure_url = upload_result.get('secure_url')
            if secure_url:
                logger.info(f"Avatar successfully uploaded to Cloudinary for {username}: {secure_url}")
                return secure_url
        except Exception as e:
            logger.error(f"Cloudinary upload failed for {username}: {e}. Falling back to local storage.")

    # 3. Fallback to local media object storage
    try:
        media_avatars_dir = Path(settings.MEDIA_ROOT) / 'avatars'
        media_avatars_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{public_id}.{ext}"
        filepath = media_avatars_dir / filename

        with open(filepath, 'wb') as f:
            f.write(file_bytes)

        media_url = f"{settings.MEDIA_URL.rstrip('/')}/avatars/{filename}"
        if request is not None and hasattr(request, 'build_absolute_uri'):
            return request.build_absolute_uri(media_url)
        return media_url
    except Exception as e:
        logger.error(f"Failed to save avatar locally for {username}: {e}")
        return None

