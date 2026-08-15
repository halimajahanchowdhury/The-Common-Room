import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

print("--- STARTING STAGE 3 BACKEND VERIFICATION ---")

ts = int(time.time())
u1 = f"collab_user1_{ts}"
u2 = f"collab_user2_{ts}"
u3 = f"collab_user3_{ts}"

# 1. Register User 1, User 2, User 3
r1 = requests.post(f"{BASE_URL}/accounts/register/", json={"username": u1, "email": f"{u1}@gmail.com", "password": "Password123!"})
user1_id = r1.json()["user"]["id"]

r2 = requests.post(f"{BASE_URL}/accounts/register/", json={"username": u2, "email": f"{u2}@gmail.com", "password": "Password123!"})
user2_id = r2.json()["user"]["id"]

r3 = requests.post(f"{BASE_URL}/accounts/register/", json={"username": u3, "email": f"{u3}@gmail.com", "password": "Password123!"})
user3_id = r3.json()["user"]["id"]

# Login tokens
token1 = requests.post(f"{BASE_URL}/token/", json={"username": u1, "password": "Password123!"}).json()["access"]
token2 = requests.post(f"{BASE_URL}/token/", json={"username": u2, "password": "Password123!"}).json()["access"]
token3 = requests.post(f"{BASE_URL}/token/", json={"username": u3, "password": "Password123!"}).json()["access"]

h1 = {"Authorization": f"Bearer {token1}"}
h2 = {"Authorization": f"Bearer {token2}"}
h3 = {"Authorization": f"Bearer {token3}"}

# Test 9: Self request guard -> 400
r_self = requests.post(f"{BASE_URL}/collaborations/create/", json={"receiver": user1_id}, headers=h1)
print(f"1. Self-request Status: {r_self.status_code} (Expected 400)")

# Test 1: User 1 sends request to User 2 -> 201 Created
r_create = requests.post(f"{BASE_URL}/collaborations/create/", json={"receiver": user2_id, "skills": "Python, React"}, headers=h1)
print(f"2. Create Collab Request Status: {r_create.status_code}")
collab_id = r_create.json()["id"]

# Test 10: Duplicate pending request guard -> 400
r_dup = requests.post(f"{BASE_URL}/collaborations/create/", json={"receiver": user2_id}, headers=h1)
print(f"3. Duplicate Request Status: {r_dup.status_code} (Expected 400)")

# Test 3: Sender retrieves sent requests -> 200
r_sent = requests.get(f"{BASE_URL}/collaborations/sent/", headers=h1)
print(f"4. Get Sent Requests Status: {r_sent.status_code}, Count: {len(r_sent.json())}")

# Test 4: Receiver retrieves received requests -> 200
r_recv = requests.get(f"{BASE_URL}/collaborations/received/", headers=h2)
print(f"5. Get Received Requests Status: {r_recv.status_code}, Count: {len(r_recv.json())}")

# Test 7: Check collaboration status -> 200
r_status = requests.get(f"{BASE_URL}/collaborations/status/{user2_id}/", headers=h1)
print(f"6. Collab Status View Output: {r_status.json()}")

# Test 11: Sender tries to modify own request -> 403 Forbidden
r_unauth_mod = requests.patch(f"{BASE_URL}/collaborations/{collab_id}/", json={"status": "accepted"}, headers=h1)
print(f"7. Sender Modify Request Status: {r_unauth_mod.status_code} (Expected 403)")

# Test 5: Receiver accepts request -> 200 OK
r_accept = requests.patch(f"{BASE_URL}/collaborations/{collab_id}/", json={"status": "accepted"}, headers=h2)
print(f"8. Receiver Accept Status: {r_accept.status_code}, New Status: {r_accept.json().get('status')}")

# Test 12: Non-existent request ID -> 404
r_404 = requests.patch(f"{BASE_URL}/collaborations/999999/", json={"status": "accepted"}, headers=h2)
print(f"9. Non-existent Request Status: {r_404.status_code} (Expected 404)")

# Test 8: Unauthenticated request -> 401
r_unauth = requests.get(f"{BASE_URL}/collaborations/sent/")
print(f"10. Unauthenticated Request Status: {r_unauth.status_code} (Expected 401)")

# Test 6: User 1 sends request to User 3 and User 3 rejects it
r_c2 = requests.post(f"{BASE_URL}/collaborations/create/", json={"receiver": user3_id}, headers=h1)
c2_id = r_c2.json()["id"]
r_reject = requests.patch(f"{BASE_URL}/collaborations/{c2_id}/", json={"status": "rejected"}, headers=h3)
print(f"11. Receiver Reject Status: {r_reject.status_code}, New Status: {r_reject.json().get('status')}")

print("--- STAGE 3 BACKEND VERIFICATION COMPLETED ---")
