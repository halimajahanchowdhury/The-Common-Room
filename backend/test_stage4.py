import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

print("--- STARTING STAGE 4 BACKEND VERIFICATION ---")

ts = int(time.time())
u1 = f"post_user1_{ts}"
u2 = f"post_user2_{ts}"

# 1. Register User 1 & User 2
requests.post(f"{BASE_URL}/accounts/register/", json={"username": u1, "email": f"{u1}@gmail.com", "password": "Password123!"})
requests.post(f"{BASE_URL}/accounts/register/", json={"username": u2, "email": f"{u2}@gmail.com", "password": "Password123!"})

token1 = requests.post(f"{BASE_URL}/token/", json={"username": u1, "password": "Password123!"}).json()["access"]
token2 = requests.post(f"{BASE_URL}/token/", json={"username": u2, "password": "Password123!"}).json()["access"]

h1 = {"Authorization": f"Bearer {token1}"}
h2 = {"Authorization": f"Bearer {token2}"}

# Test 2: Unauthenticated user cannot create post -> 401
r_unauth_create = requests.post(f"{BASE_URL}/posts/", json={"content": "Test Post"})
print(f"1. Unauthenticated Post Create Status: {r_unauth_create.status_code} (Expected 401)")

# Test 5: Empty post content rejected -> 400
r_empty_post = requests.post(f"{BASE_URL}/posts/", json={"content": "  "}, headers=h1)
print(f"2. Empty Post Content Status: {r_empty_post.status_code} (Expected 400)")

# Test 1: Authenticated user creates post -> 201
r_post = requests.post(f"{BASE_URL}/posts/", json={"content": "Hello Common Room! This is a test post."}, headers=h1)
print(f"3. Authenticated Post Create Status: {r_post.status_code}")
post_id = r_post.json()["id"]

# Test 3: List posts -> 200
r_list = requests.get(f"{BASE_URL}/posts/", headers=h1)
print(f"4. List Posts Status: {r_list.status_code}, Count: {len(r_list.json())}")

# Test 4: Retrieve individual post -> 200
r_get = requests.get(f"{BASE_URL}/posts/{post_id}/", headers=h1)
print(f"5. Get Individual Post Status: {r_get.status_code}, Content: '{r_get.json().get('content')}'")

# Test 7: Empty comment content rejected -> 400
r_empty_comment = requests.post(f"{BASE_URL}/posts/{post_id}/comments/", json={"content": ""}, headers=h2)
print(f"6. Empty Comment Content Status: {r_empty_comment.status_code} (Expected 400)")

# Test 6: Authenticated user 2 creates comment -> 201
r_comment = requests.post(f"{BASE_URL}/posts/{post_id}/comments/", json={"content": "Great first post!"}, headers=h2)
print(f"7. Create Comment Status: {r_comment.status_code}")
comment_id = r_comment.json()["id"]

# Test 11: User 1 tries to delete User 2's comment -> 403
r_del_comment_unauth = requests.delete(f"{BASE_URL}/comments/{comment_id}/", headers=h1)
print(f"8. Unauthorized Comment Delete Status: {r_del_comment_unauth.status_code} (Expected 403)")

# Test 10: Comment author (User 2) deletes comment -> 200
r_del_comment = requests.delete(f"{BASE_URL}/comments/{comment_id}/", headers=h2)
print(f"9. Comment Author Delete Status: {r_del_comment.status_code}")

# Test 9: User 2 tries to delete User 1's post -> 403
r_del_post_unauth = requests.delete(f"{BASE_URL}/posts/{post_id}/", headers=h2)
print(f"10. Unauthorized Post Delete Status: {r_del_post_unauth.status_code} (Expected 403)")

# Test 8: Post author (User 1) deletes post -> 200
r_del_post = requests.delete(f"{BASE_URL}/posts/{post_id}/", headers=h1)
print(f"11. Post Author Delete Status: {r_del_post.status_code}")

# Test 12: Non-existent post retrieval -> 404
r_404 = requests.get(f"{BASE_URL}/posts/999999/", headers=h1)
print(f"12. Non-existent Post Get Status: {r_404.status_code} (Expected 404)")

print("--- STAGE 4 BACKEND VERIFICATION COMPLETED ---")
