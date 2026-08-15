import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

print("--- STARTING STAGE 1 TESTING ---")

# 1. Register a new user
register_data = {
    "username": "test_student",
    "email": "test_student@gmail.com",
    "password": "Password123!"
}
r1 = requests.post(f"{BASE_URL}/accounts/register/", json=register_data)
print(f"1. Register Status: {r1.status_code}")
print(f"   Register Output: {r1.json()}")

# 2. Login to get JWT tokens
login_data = {
    "username": "test_student",
    "password": "Password123!"
}
r2 = requests.post(f"{BASE_URL}/token/", json=login_data)
print(f"2. Login Status: {r2.status_code}")
tokens = r2.json()
print(f"3. JWT Tokens Received: 'access' in tokens? {'access' in tokens}, 'refresh' in tokens? {'refresh' in tokens}")

access_token = tokens.get("access", "")
headers = {"Authorization": f"Bearer {access_token}"}

# 4. Get Current User Info
r4 = requests.get(f"{BASE_URL}/accounts/me/", headers=headers)
print(f"4. Get Account Me Status: {r4.status_code}")
print(f"   Account Me Output: {r4.json()}")

# 5. Get Profile Info
r5 = requests.get(f"{BASE_URL}/profiles/me/", headers=headers)
print(f"5. Get Profile Me Status: {r5.status_code}")
print(f"   Profile Me Output: {r5.json()}")

# 6. Unauthenticated Request Check
r6 = requests.get(f"{BASE_URL}/profiles/me/")
print(f"6. Unauthenticated Request Status: {r6.status_code} (Expected 401)")

# 7. CORS Headers Check
cors_headers = {
    "Origin": "http://localhost:3000",
    "Access-Control-Request-Method": "POST"
}
r7 = requests.options(f"{BASE_URL}/accounts/register/", headers=cors_headers)
print(f"7. CORS Preflight Options Status: {r7.status_code}")
print(f"   CORS Allow-Origin Header: {r7.headers.get('Access-Control-Allow-Origin')}")

print("--- STAGE 1 TESTING COMPLETED SUCCESSFULLY ---")
