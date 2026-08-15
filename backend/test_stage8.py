import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

print("--- STARTING STAGE 8 INTEGRATION & STABILITY VERIFICATION ---")

ts = int(time.time())
u1 = f"stage8_user1_{ts}"
u2 = f"stage8_user2_{ts}"

# 1. Register & Authenticate User 1 & User 2
r_reg1 = requests.post(f"{BASE_URL}/accounts/register/", json={"username": u1, "email": f"{u1}@gmail.com", "password": "Password123!"})
r_reg2 = requests.post(f"{BASE_URL}/accounts/register/", json={"username": u2, "email": f"{u2}@gmail.com", "password": "Password123!"})
print(f"1. Registration Status: User1={r_reg1.status_code}, User2={r_reg2.status_code} (Expected 201)")

token1 = requests.post(f"{BASE_URL}/token/", json={"username": u1, "password": "Password123!"}).json()["access"]
token2 = requests.post(f"{BASE_URL}/token/", json={"username": u2, "password": "Password123!"}).json()["access"]

h1 = {"Authorization": f"Bearer {token1}"}
h2 = {"Authorization": f"Bearer {token2}"}

# 2. Update Profile & Skills
requests.put(f"{BASE_URL}/profiles/me/", json={"full_name": f"Alice_{ts}", "university": "State Tech", "skills_can_teach": "Python, Django", "skills_want_to_learn": "React"}, headers=h1)
requests.put(f"{BASE_URL}/profiles/me/", json={"full_name": f"Bob_{ts}", "university": "State Tech", "skills_can_teach": "React", "skills_want_to_learn": "Python"}, headers=h2)
print("2. Profiles & Skills updated for User 1 & User 2.")

# 3. Directory Search & Skill Matching Verification targeting User 1 specifically
r_search = requests.get(f"{BASE_URL}/profiles/?search={u1}&skill=django", headers=h2)
print(f"3. Search & Skill Filter Status: {r_search.status_code}, Count: {len(r_search.json())}")
assert len(r_search.json()) == 1
p1_data = r_search.json()[0]
assert p1_data["skill_matches"]["has_match"] is True, "Expected skill match between Alice and Bob!"
print(f"   Skill Match Detected: {p1_data['skill_matches']['matching_skills']}")

# 4. Collaboration Request Lifecycle
r_collab = requests.post(f"{BASE_URL}/collaborations/create/", json={"receiver": p1_data["id"], "skills": "Python <-> React"}, headers=h2)
print(f"4. Send Collaboration Request Status: {r_collab.status_code} (Expected 201)")
req_id = r_collab.json()["id"]

r_accept = requests.patch(f"{BASE_URL}/collaborations/{req_id}/", json={"status": "accepted"}, headers=h1)
print(f"5. Accept Collaboration Request Status: {r_accept.status_code} (Expected 200)")
assert r_accept.status_code == 200, f"Expected 200, got {r_accept.status_code}"

# 5. Peer-to-Peer Chat & Read Receipts
r_msg = requests.post(f"{BASE_URL}/chat/messages/", json={"recipient": u1, "text": "Hi Alice! Let's start learning React and Python."}, headers=h2)
print(f"6. Send Chat Message Status: {r_msg.status_code} (Expected 201)")

r_get_chat = requests.get(f"{BASE_URL}/chat/messages/?peer={u2}", headers=h1)
print(f"7. Retrieve Messages Status: {r_get_chat.status_code}, Read Status: '{r_get_chat.json()[0]['status']}' (Expected 'seen')")

r_unread = requests.get(f"{BASE_URL}/chat/unread_count/", headers=h1)
print(f"8. Unread Message Count Status: {r_unread.status_code}, Count: {r_unread.json()['unread_count']}")

# 6. Posts & Comments
r_post = requests.post(f"{BASE_URL}/posts/", json={"content": "Welcome to Stage 8 integration testing!"}, headers=h1)
print(f"9. Create Post Status: {r_post.status_code}")
post_id = r_post.json()["id"]

r_comment = requests.post(f"{BASE_URL}/posts/{post_id}/comments/", json={"content": "Awesome progress!"}, headers=h2)
print(f"10. Create Comment Status: {r_comment.status_code}")

print("--- STAGE 8 INTEGRATION & STABILITY VERIFICATION COMPLETED ---")
