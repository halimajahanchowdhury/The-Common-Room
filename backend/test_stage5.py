import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

print("--- STARTING STAGE 5 BACKEND VERIFICATION ---")

ts = int(time.time())
u1 = f"chat_user1_{ts}"
u2 = f"chat_user2_{ts}"
u3 = f"chat_user3_{ts}"

# Register users
requests.post(f"{BASE_URL}/accounts/register/", json={"username": u1, "email": f"{u1}@gmail.com", "password": "Password123!"})
requests.post(f"{BASE_URL}/accounts/register/", json={"username": u2, "email": f"{u2}@gmail.com", "password": "Password123!"})
requests.post(f"{BASE_URL}/accounts/register/", json={"username": u3, "email": f"{u3}@gmail.com", "password": "Password123!"})

token1 = requests.post(f"{BASE_URL}/token/", json={"username": u1, "password": "Password123!"}).json()["access"]
token2 = requests.post(f"{BASE_URL}/token/", json={"username": u2, "password": "Password123!"}).json()["access"]
token3 = requests.post(f"{BASE_URL}/token/", json={"username": u3, "password": "Password123!"}).json()["access"]

h1 = {"Authorization": f"Bearer {token1}"}
h2 = {"Authorization": f"Bearer {token2}"}
h3 = {"Authorization": f"Bearer {token3}"}

# Test 4: Unauthenticated request returns 401
r_unauth = requests.get(f"{BASE_URL}/chat/messages/")
print(f"1. Unauthenticated Chat Get Status: {r_unauth.status_code} (Expected 401)")

# Test 1: User 1 sends message to User 2 -> 201 Created
r_send = requests.post(f"{BASE_URL}/chat/messages/", json={"recipient": u2, "text": "Hey there! Ready to study Python?"}, headers=h1)
print(f"2. Send Message Status: {r_send.status_code}")
msg_id = r_send.json()["id"]

# Test 2: User 2 retrieves messages from User 1 -> 200 OK (automatically updates status to 'seen')
r_get = requests.get(f"{BASE_URL}/chat/messages/?peer={u1}", headers=h2)
print(f"3. Retrieve Messages Status: {r_get.status_code}, Count: {len(r_get.json())}")
if len(r_get.json()) > 0:
    print(f"   Message Status Updated To: '{r_get.json()[0]['status']}' (Expected 'seen')")

# Test 3: User 3 cannot access User 1 & User 2 private conversation
r_user3_peek = requests.get(f"{BASE_URL}/chat/messages/?peer={u1}", headers=h3)
print(f"4. User 3 Private Conversation Fetch Count: {len(r_user3_peek.json())} (Expected 0 private messages)")

# Test 5: Invalid/non-existent peer -> 404
r_404 = requests.get(f"{BASE_URL}/chat/messages/?peer=non_existent_student_xyz", headers=h1)
print(f"5. Non-existent Peer Fetch Status: {r_404.status_code} (Expected 404)")

# Test Conversations List endpoint -> 200
r_convs = requests.get(f"{BASE_URL}/chat/conversations/", headers=h1)
print(f"6. Conversations List Status: {r_convs.status_code}, Conversations Count: {len(r_convs.json())}")

# Test Unread Count endpoint -> 200
r_unread = requests.get(f"{BASE_URL}/chat/unread_count/", headers=h2)
print(f"7. Unread Count Status: {r_unread.status_code}, Unread Count Output: {r_unread.json()}")

print("--- STAGE 5 BACKEND VERIFICATION COMPLETED ---")
