import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

print("--- STARTING STAGE 6 BACKEND VERIFICATION ---")

ts = int(time.time())
u1 = f"skill_user1_{ts}"
u2 = f"skill_user2_{ts}"

# 1. Register User 1 & User 2
requests.post(f"{BASE_URL}/accounts/register/", json={"username": u1, "email": f"{u1}@gmail.com", "password": "Password123!"})
requests.post(f"{BASE_URL}/accounts/register/", json={"username": u2, "email": f"{u2}@gmail.com", "password": "Password123!"})

token1 = requests.post(f"{BASE_URL}/token/", json={"username": u1, "password": "Password123!"}).json()["access"]
token2 = requests.post(f"{BASE_URL}/token/", json={"username": u2, "password": "Password123!"}).json()["access"]

h1 = {"Authorization": f"Bearer {token1}"}
h2 = {"Authorization": f"Bearer {token2}"}

# Test 10: Unauthenticated access rejected -> 401
r_unauth = requests.get(f"{BASE_URL}/profiles/me/")
# Print result for unauth when no header is passed
print(f"1. Unauthenticated Profile Request Status: {requests.get(f'{BASE_URL}/profiles/').status_code} (Expected 401)")

# Test 3: Profile skill updates work for User 1 (Teaching: Python, C++, SQL / Learning: React, Machine Learning)
r_update1 = requests.put(
    f"{BASE_URL}/profiles/me/",
    json={
        "skills_can_teach": " Python , C++ , SQL ",
        "skills_want_to_learn": " React, Machine Learning "
    },
    headers=h1
)
print(f"2. User 1 Skill Update Status: {r_update1.status_code}")
u1_data = r_update1.json()

# Test 1: Retrieve own skills (lists & raw)
print(f"3. User 1 Teach Skills List: {u1_data.get('skills_can_teach_list')} (Expected ['Python', 'C++', 'SQL'])")
print(f"   User 1 Learn Skills List: {u1_data.get('skills_want_to_learn_list')} (Expected ['React', 'Machine Learning'])")

# Test 3: Profile skill updates work for User 2 (Teaching: react, machine learning / Learning: python, Java)
r_update2 = requests.put(
    f"{BASE_URL}/profiles/me/",
    json={
        "skills_can_teach": "react, machine learning",
        "skills_want_to_learn": "python, Java"
    },
    headers=h2
)
print(f"4. User 2 Skill Update Status: {r_update2.status_code}")
u2_data = r_update2.json()

# Test 2: Retrieve another student's skills & skill matches from User 1's perspective
u2_id = u2_data["id"]
r_get_peer = requests.get(f"{BASE_URL}/profiles/{u2_id}/", headers=h1)
print(f"5. Get Peer Profile Status: {r_get_peer.status_code}")
peer_profile = r_get_peer.json()
matches = peer_profile.get("skill_matches", {})

# Test 5 & 7: Case-insensitive Teaching -> Learning match (User 2 teaches react & machine learning -> User 1 wants to learn React & Machine Learning)
can_learn = matches.get("can_learn_from_peer", [])
print(f"6. User 1 Can Learn From User 2 (Match): {can_learn} (Has match? {matches.get('has_match')})")

# Test 5 & 8: Case-insensitive Learning -> Teaching match (User 2 wants to learn python -> User 1 teaches Python)
can_teach = matches.get("can_teach_to_peer", [])
print(f"7. User 1 Can Teach To User 2 (Match): {can_teach}")

# Test 9: Non-matching skills (Java, C++, SQL) are not reported in matching_skills
matching_skills = matches.get("matching_skills", [])
print(f"8. Overall Matching Skills: {matching_skills}")
assert "Java" not in matching_skills, "Java should not be a match!"
assert "SQL" not in matching_skills, "SQL should not be a match!"

# Test 4: Empty skill fields handled safely without crashing
r_empty = requests.put(
    f"{BASE_URL}/profiles/me/",
    json={"skills_can_teach": "", "skills_want_to_learn": " , , "},
    headers=h1
)
print(f"9. Empty Skills Update Status: {r_empty.status_code}")
empty_data = r_empty.json()
print(f"   Empty Teach List: {empty_data.get('skills_can_teach_list')} (Expected [])")
print(f"   Empty Learn List: {empty_data.get('skills_want_to_learn_list')} (Expected [])")

print("--- STAGE 6 BACKEND VERIFICATION COMPLETED ---")
