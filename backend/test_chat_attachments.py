import os
import django
import io

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'common_room_backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory, force_authenticate
from chat.views import ChatAttachmentUploadView, MessageListCreateView
from chat.models import Message

print("=== STARTING CHAT ATTACHMENTS VERIFICATION ===")

factory = APIRequestFactory()

user1, _ = User.objects.get_or_create(username="att_sender", defaults={"email": "sender@test.com"})
user2, _ = User.objects.get_or_create(username="att_receiver", defaults={"email": "recv@test.com"})

# 1. Test successful upload of a PDF document
pdf_content = b"%PDF-1.4 dummy pdf content for study notes"
pdf_file = SimpleUploadedFile("Algorithms_CheatSheet.pdf", pdf_content, content_type="application/pdf")

upload_view = ChatAttachmentUploadView.as_view()
req1 = factory.post('/api/chat/upload/', {'file': pdf_file}, format='multipart')
force_authenticate(req1, user=user1)
res1 = upload_view(req1)

print(f"1. PDF Upload Status: {res1.status_code}")
assert res1.status_code == 201, f"Expected 201, got {res1.status_code}"
assert res1.data['attachment_name'] == "Algorithms_CheatSheet.pdf"
assert res1.data['attachment_type'] == "document"
assert res1.data['attachment_url'].startswith("http") or res1.data['attachment_url'].startswith("/media/")
print(f"   Generated URL: {res1.data['attachment_url']}")

# 2. Test file size validation (> 10MB rejected)
huge_file = SimpleUploadedFile("huge_movie.mp4", b"0" * (11 * 1024 * 1024), content_type="video/mp4")

req_huge = factory.post('/api/chat/upload/', {'file': huge_file}, format='multipart')
force_authenticate(req_huge, user=user1)
res_huge = upload_view(req_huge)

print(f"2. >10MB Upload Rejection Status: {res_huge.status_code} (Expected 400)")
assert res_huge.status_code == 400, f"Expected 400, got {res_huge.status_code}"
assert "exceeds" in str(res_huge.data.get('error', '')).lower(), "Expected error message mentioning limit"

# 3. Test dangerous file type validation (.exe rejected)
exe_file = SimpleUploadedFile("malware.exe", b"fake binary", content_type="application/x-msdownload")
req_exe = factory.post('/api/chat/upload/', {'file': exe_file}, format='multipart')
force_authenticate(req_exe, user=user1)
res_exe = upload_view(req_exe)

print(f"3. Dangerous .exe Upload Rejection Status: {res_exe.status_code} (Expected 400)")
assert res_exe.status_code == 400, f"Expected 400, got {res_exe.status_code}"
assert "prohibited" in str(res_exe.data.get('error', '')).lower(), "Expected error message mentioning prohibited"

# 4. Test image upload
img_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
img_file = SimpleUploadedFile("Diagram.png", img_content, content_type="image/png")
req_img = factory.post('/api/chat/upload/', {'file': img_file}, format='multipart')
force_authenticate(req_img, user=user1)
res_img = upload_view(req_img)

print(f"4. Image Upload Status: {res_img.status_code}")
assert res_img.status_code == 201
assert res_img.data['attachment_type'] == "image"
img_url = res_img.data['attachment_url']

# 5. Send message with attachment via MessageListCreateView
msg_view = MessageListCreateView.as_view()
msg_payload = {
    "recipient": user2.username,
    "text": "Here is the system architecture diagram!",
    "attachment_url": img_url,
    "attachment_name": "Diagram.png",
    "attachment_type": "image",
    "attachment_size": len(img_content)
}

req_msg = factory.post('/api/chat/messages/', msg_payload, format='json')
force_authenticate(req_msg, user=user1)
res_msg = msg_view(req_msg)

print(f"5. Send Message with Attachment Status: {res_msg.status_code}")
assert res_msg.status_code == 201, f"Expected 201, got {res_msg.status_code}"
assert res_msg.data['attachment_url'] == img_url
assert res_msg.data['attachment_type'] == "image"

# 6. Send attachment-only message (empty text)
msg_att_only = {
    "recipient": user2.username,
    "text": "",
    "attachment_url": res1.data['attachment_url'],
    "attachment_name": "Algorithms_CheatSheet.pdf",
    "attachment_type": "document",
    "attachment_size": len(pdf_content)
}

req_att_only = factory.post('/api/chat/messages/', msg_att_only, format='json')
force_authenticate(req_att_only, user=user1)
res_att_only = msg_view(req_att_only)

print(f"6. Send Attachment-Only Message Status: {res_att_only.status_code}")
assert res_att_only.status_code == 201, f"Expected 201, got {res_att_only.status_code}"

# 7. Retrieve message list between user1 and user2
req_get = factory.get(f'/api/chat/messages/?peer={user2.username}')
force_authenticate(req_get, user=user1)
res_get = msg_view(req_get)

print(f"7. Retrieve Conversation Status: {res_get.status_code}, Message Count: {len(res_get.data)}")
assert len(res_get.data) >= 2
last_msg = res_get.data[-1]
assert last_msg['attachment_name'] == "Algorithms_CheatSheet.pdf"

print("=== ALL CHAT ATTACHMENTS TESTS PASSED SUCCESSFULLY! ===")
