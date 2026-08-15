import requests

BASE_URL = "http://127.0.0.1:8000/api"

# 1. Login test user
login_res = requests.post(f"{BASE_URL}/token/", json={"username": "test_student", "password": "Password123!"})
print("Login status:", login_res.status_code)
if login_res.status_code == 200:
    token = login_res.json()["access"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. PUT update profile with base64 picture
    dummy_base64 = "data:image/jpeg;base64," + "A" * 5000
    payload = {
        "full_name": "Test Student Updated",
        "university": "Test University",
        "department": "Computer Science",
        "semester": "5th",
        "bio": "Testing bio update",
        "skills_can_teach": "Python, Django",
        "skills_want_to_learn": "React, Next.js",
        "profile_picture": dummy_base64
    }

    put_res = requests.put(f"{BASE_URL}/profiles/me/", json=payload, headers=headers)
    print("PUT profile status:", put_res.status_code)
    print("PUT profile content:", put_res.content.decode('utf-8', errors='ignore')[:1500])
