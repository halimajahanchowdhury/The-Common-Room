import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

print("--- STARTING STAGE 2 BACKEND VERIFICATION ---")

ts = int(time.time())
u1 = f"student1_{ts}"
u2 = f"student2_{ts}"

# 1. Register & Login Student 1
s1_data = {"username": u1, "email": f"{u1}@gmail.com", "password": "Password123!"}
requests.post(f"{BASE_URL}/accounts/register/", json=s1_data)

login_data = {"username": u1, "password": "Password123!"}
r_login = requests.post(f"{BASE_URL}/token/", json=login_data)
tokens = r_login.json()
token1 = tokens.get("access", "")
headers1 = {"Authorization": f"Bearer {token1}"}

# Register Student 2
s2_data = {"username": u2, "email": f"{u2}@gmail.com", "password": "Password123!"}
r_reg2 = requests.post(f"{BASE_URL}/accounts/register/", json=s2_data)
s2_id = r_reg2.json().get("user", {}).get("id")

# 1. Authenticated GET /api/profiles/
r_list = requests.get(f"{BASE_URL}/profiles/", headers=headers1)
print(f"1. Authenticated GET /api/profiles/ Status: {r_list.status_code}")
print(f"   Profiles count: {len(r_list.json())}")

# 2. Authenticated GET /api/profiles/<id>/
r_detail = requests.get(f"{BASE_URL}/profiles/{s2_id}/", headers=headers1)
print(f"2. Authenticated GET /api/profiles/{s2_id}/ Status: {r_detail.status_code}")
print(f"   Profile output: {r_detail.json()}")

# 3. Unauthenticated GET /api/profiles/
r_unauth_list = requests.get(f"{BASE_URL}/profiles/")
print(f"3. Unauthenticated GET /api/profiles/ Status: {r_unauth_list.status_code} (Expected 401)")

# 4. Unauthenticated GET /api/profiles/<id>/
r_unauth_detail = requests.get(f"{BASE_URL}/profiles/{s2_id}/")
print(f"4. Unauthenticated GET /api/profiles/{s2_id}/ Status: {r_unauth_detail.status_code} (Expected 401)")

# 5. Non-existent profile ID -> 404
r_404 = requests.get(f"{BASE_URL}/profiles/999999/", headers=headers1)
print(f"5. Non-existent profile GET /api/profiles/999999/ Status: {r_404.status_code} (Expected 404)")

print("--- STAGE 2 BACKEND VERIFICATION COMPLETED ---")
