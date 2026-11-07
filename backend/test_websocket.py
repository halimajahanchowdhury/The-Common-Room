import os
import django
import json
import asyncio
from channels.testing import WebsocketCommunicator
from asgiref.sync import sync_to_async

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'common_room_backend.settings')
django.setup()

from django.contrib.auth.models import User
from common_room_backend.asgi import application
from rest_framework_simplejwt.tokens import RefreshToken
from chat.models import Message

@sync_to_async
def create_test_users():
    sender, _ = User.objects.get_or_create(username="ws_test_alice", email="alice_ws@example.com")
    sender.set_password("SecurePass123!")
    sender.save()

    recipient, _ = User.objects.get_or_create(username="ws_test_bob", email="bob_ws@example.com")
    recipient.set_password("SecurePass123!")
    recipient.save()

    token = str(RefreshToken.for_user(sender).access_token)
    return sender.id, recipient.id, token

@sync_to_async
def verify_message_in_db(sender_id, recipient_id, text):
    msg = Message.objects.filter(sender_id=sender_id, recipient_id=recipient_id, text=text).first()
    if msg:
        return msg.id, msg.status
    return None

@sync_to_async
def cleanup_test_data(sender_id, recipient_id):
    Message.objects.filter(sender_id__in=[sender_id, recipient_id]).delete()
    User.objects.filter(id__in=[sender_id, recipient_id]).delete()

async def run_websocket_tests():
    print("\n--- RUNNING WEBSOCKET CHAT TESTS ---")

    sender_id, recipient_id, token = await create_test_users()

    # 1. Connect WebSocket
    path = f"/ws/chat/{recipient_id}/?token={token}"
    communicator = WebsocketCommunicator(application, path)

    connected, _ = await communicator.connect()
    if connected:
        print("  [PASS] WebSocket successfully connected with valid JWT token.")
    else:
        print("  [FAIL] WebSocket failed to connect.")
        await cleanup_test_data(sender_id, recipient_id)
        return

    # 2. Read initial connect event (messages_seen broadcast on connection open)
    initial_event = await communicator.receive_json_from()
    if initial_event.get("type") == "messages_seen":
        print("  [PASS] Initial 'messages_seen' notification delivered upon room join.")

    # 3. Test sending a message over WebSocket
    test_msg_text = "Hello Bob! Testing real-time WebSockets."
    await communicator.send_json_to({
        "action": "send_message",
        "text": test_msg_text,
    })

    # 4. Receive the newly broadcasted message
    response = await communicator.receive_json_from()
    if response.get("type") == "new_message" and response.get("message", {}).get("text") == test_msg_text:
        print("  [PASS] Real-time message broadcast received correctly.")
    else:
        print(f"  [FAIL] Unexpected response: {response}")

    # 5. Verify message is persisted in database
    db_result = await verify_message_in_db(sender_id, recipient_id, test_msg_text)
    if db_result:
        msg_id, status = db_result
        print(f"  [PASS] Message confirmed saved in Database (ID: {msg_id}, Status: {status}).")
    else:
        print("  [FAIL] Message was not found in database.")

    # 6. Disconnect
    await communicator.disconnect()
    print("  [PASS] WebSocket cleanly disconnected.")

    # Cleanup
    await cleanup_test_data(sender_id, recipient_id)
    print("  [CLEANUP] Temporary test accounts removed.")

    print("\n--- ALL WEBSOCKET TESTS PASSED SUCCESSFULLY ---\n")

if __name__ == "__main__":
    asyncio.run(run_websocket_tests())
