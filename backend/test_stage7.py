import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

print("--- STARTING STAGE 7 BACKEND VERIFICATION ---")

ts = int(time.time())
u1 = f"search_user1_{ts}"
u2 = f"search_user2_{ts}"

# 1. Register User 1 & User 2
requests.post(f"{BASE_URL}/accounts/register/", json={"username": u1, "email": f"{u1}@gmail.com", "password": "Password123!"})
requests.post(f"{BASE_URL}/accounts/register/", json={"username": u2, "email": f"{u2}@gmail.com", "password": "Password123!"})

token1 = requests.post(f"{BASE_URL}/token/", json={"username": u1, "password": "Password123!"}).json()["access"]
token2 = requests.post(f"{BASE_URL}/token/", json={"username": u2, "password": "Password123!"}).json()["access"]

h1 = {"Authorization": f"Bearer {token1}"}
h2 = {"Authorization": f"Bearer {token2}"}

# Test 1: Unauthenticated request returns 401
r_unauth = requests.get(f"{BASE_URL}/profiles/")
print(f"1. Unauthenticated Directory Get Status: {r_unauth.status_code} (Expected 401)")

# Populate specific details for User 2
# Full Name: "Halima Jahan", Dept: "Computer Science", University: "Metropolitan University"
# Teaching: "Python, Django", Learning: "Rust, Machine Learning"
requests.put(
    f"{BASE_URL}/profiles/me/",
    json={
        "full_name": "Halima Jahan",
        "university": "Metropolitan University",
        "department": "Computer Science",
        "bio": "Passionate about full-stack web development and AI.",
        "skills_can_teach": "Python, Django",
        "skills_want_to_learn": "Rust, Machine Learning"
    },
    headers=h2
)

# Test 2 & 3: Normal authenticated directory request -> 200 OK
r_dir = requests.get(f"{BASE_URL}/profiles/", headers=h1)
print(f"2. Authenticated Directory Get Status: {r_dir.status_code}, Profiles Count: {len(r_dir.json())}")

# Test 4, 5, 6: Search by full name / partial / case-insensitive -> "halima"
r_search_name = requests.get(f"{BASE_URL}/profiles/?search=halima", headers=h1)
print(f"3. Search 'halima' Status: {r_search_name.status_code}, Found Count: {len(r_search_name.json())}")
assert any("Halima" in p.get("full_name", "") for p in r_search_name.json()), "Expected Halima profile in search results!"

# Test 4: Search by department -> "computer science"
r_search_dept = requests.get(f"{BASE_URL}/profiles/?search=computer%20science", headers=h1)
print(f"4. Search 'computer science' Status: {r_search_dept.status_code}, Found Count: {len(r_search_dept.json())}")

# Test 7: Empty search query does not break endpoint
r_empty_search = requests.get(f"{BASE_URL}/profiles/?search=", headers=h1)
print(f"5. Empty Search Query Status: {r_empty_search.status_code}")

# Test 8, 10: Filter by teaching skill -> "python"
r_skill_teach = requests.get(f"{BASE_URL}/profiles/?skill=python", headers=h1)
print(f"6. Filter Skill 'python' Status: {r_skill_teach.status_code}, Found Count: {len(r_skill_teach.json())}")

# Test 9, 10: Filter by learning skill -> "rust"
r_skill_learn = requests.get(f"{BASE_URL}/profiles/?skill=rust", headers=h1)
print(f"7. Filter Skill 'rust' Status: {r_skill_learn.status_code}, Found Count: {len(r_skill_learn.json())}")

# Test 11: Non-existent skill returns empty list
r_skill_none = requests.get(f"{BASE_URL}/profiles/?skill=non_existent_skill_xyz123", headers=h1)
print(f"8. Non-existent Skill Filter Status: {r_skill_none.status_code}, Count: {len(r_skill_none.json())} (Expected 0)")
assert len(r_skill_none.json()) == 0

# Test 12: Combined search + skill filtering
r_combined = requests.get(f"{BASE_URL}/profiles/?search=halima&skill=python", headers=h1)
print(f"9. Combined Search 'halima' + Skill 'python' Status: {r_combined.status_code}, Count: {len(r_combined.json())}")

# Test 13 & 14: Stage 6 skill lists and skill_matches still present in search results
if len(r_combined.json()) > 0:
    target_p = r_combined.json()[0]
    print(f"10. Stage 6 Fields Present? 'skills_can_teach_list': {'skills_can_teach_list' in target_p}, 'skill_matches': {'skill_matches' in target_p}")

# Test 15: Existing student detail endpoint still works
u2_me = requests.get(f"{BASE_URL}/profiles/me/", headers=h2).json()
u2_id = u2_me["id"]
r_detail = requests.get(f"{BASE_URL}/profiles/{u2_id}/", headers=h1)
print(f"11. Student Detail Get Status: {r_detail.status_code}, Full Name: '{r_detail.json().get('full_name')}'")

print("--- STAGE 7 BACKEND VERIFICATION COMPLETED ---")
