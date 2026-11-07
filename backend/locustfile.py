"""
Locust Load & Stress Testing Suite
Project: The Common Room - Student Academic & Skill Collaboration Platform

Target Host:
  - Local Dev: http://localhost:8000
  - Cloud Render: https://thecommonroom-backend.onrender.com

Usage:
  1. Headless run (e.g., 30 users, 5 users/sec spawn, 30s duration):
     locust -f backend/locustfile.py --headless -u 30 -r 5 --run-time 30s --host http://localhost:8000

  2. Interactive Web Dashboard:
     locust -f backend/locustfile.py --host http://localhost:8000
     Then open http://localhost:8089 in your browser.
"""

import random
from locust import HttpUser, task, between, tag

TEST_STUDENTS = [
    ("loadtest_student", "TestPass123!"),
]

SEARCH_QUERIES = ["Python", "React", "AI", "Machine Learning", "CSE", "Data", ""]

class StudentUser(HttpUser):
    # Simulated realistic think time between actions: 1 to 3 seconds
    wait_time = between(1, 3)

    def on_start(self):
        """Authenticates user on startup and caches the JWT Bearer token."""
        self.access_token = None
        self.username, self.password = random.choice(TEST_STUDENTS)

        # Attempt JWT authentication
        res = self.client.post("/api/token/", json={
            "username": self.username,
            "password": self.password
        }, name="/api/token/ [Login]")

        if res.status_code == 200:
            self.access_token = res.json().get("access")
        else:
            # Fallback: obtain token for att_sender or proceed as anonymous guest
            self.access_token = None

    def auth_headers(self):
        """Returns Authorization header if token is present."""
        if self.access_token:
            return {"Authorization": f"Bearer {self.access_token}"}
        return {}

    @task(4)
    @tag("directory", "read")
    def browse_student_directory(self):
        """Simulates browsing the peer directory and searching by skill pills."""
        query = random.choice(SEARCH_QUERIES)
        url = f"/api/profiles/?q={query}" if query else "/api/profiles/"
        self.client.get(url, headers=self.auth_headers(), name="/api/profiles/ [Search & Filter]")

    @task(3)
    @tag("profile", "read")
    def view_my_profile(self):
        """Simulates student checking their own profile and skills."""
        if self.access_token:
            self.client.get("/api/profiles/me/", headers=self.auth_headers(), name="/api/profiles/me/ [My Profile]")

    @task(3)
    @tag("collaboration", "read")
    def view_collaboration_requests(self):
        """Simulates student opening their dashboard to view incoming/outgoing collaboration requests."""
        if self.access_token:
            self.client.get("/api/collaborations/received/", headers=self.auth_headers(), name="/api/collaborations/received/ [Dashboard Collabs]")

    @task(2)
    @tag("chat", "read")
    def view_chat_conversations(self):
        """Simulates opening the real-time chat sidebar to check peer list and unread message badges."""
        if self.access_token:
            self.client.get("/api/chat/conversations/", headers=self.auth_headers(), name="/api/chat/conversations/ [Chat Peers]")

    @task(2)
    @tag("chat", "read")
    def check_chat_history(self):
        """Simulates student opening a conversation with a peer."""
        if self.access_token:
            self.client.get("/api/chat/messages/", headers=self.auth_headers(), name="/api/chat/messages/ [Message History]")

    @task(1)
    @tag("chat", "write")
    def send_chat_message(self):
        """Simulates student sending a peer chat message."""
        if self.access_token:
            payload = {
                "recipient": "att_receiver",
                "text": f"Locust load test automated ping: {random.randint(1000, 9999)}",
            }
            self.client.post("/api/chat/messages/", json=payload, headers=self.auth_headers(), name="/api/chat/messages/ [Send Message]")
