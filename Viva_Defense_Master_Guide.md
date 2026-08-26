# 🎓 THE COMMON ROOM — VIVA & PROJECT DEFENSE MASTER GUIDE

> **Comprehensive Technical Companion & Oral Defense Preparation Guide**  
> *Everything you need to know about The Common Room codebase, architecture, database design, security, and feature implementations.*

---

## 📋 TABLE OF CONTENTS
1. [Project Overview & Core Value Proposition](#1-project-overview--core-value-proposition)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Database Schema & ERD Breakdown](#3-database-schema--erd-breakdown)
4. [Authentication & Password Security Deep Dive](#4-authentication--password-security-deep-dive)
5. [Feature-by-Feature Technical Implementation](#5-feature-by-feature-technical-implementation)
   - [5.1 Dual Sign-In Support](#51-dual-sign-in-support)
   - [5.2 Skill Exchange Match Engine](#52-skill-exchange-match-engine)
   - [5.3 Collaboration Request Workflow](#53-collaboration-request-workflow)
   - [5.4 1-on-1 Realtime Messaging & Read Receipts](#54-1-on-1-realtime-messaging--read-receipts)
   - [5.5 Canvas Profile Picture Processing](#55-canvas-profile-picture-processing)
   - [5.6 Directory Search & Skill Filtering](#56-directory-search--skill-filtering)
6. [Top 25 Expected Viva Questions & Answers](#6-top-25-expected-viva-questions--answers)
7. [Core Code Snippets Cheat Sheet](#7-core-code-snippets-cheat-sheet)

---

## 1. PROJECT OVERVIEW & CORE VALUE PROPOSITION

### What is The Common Room?
**The Common Room** is a peer-to-peer campus collaboration platform designed to connect university students for peer tutoring, skill sharing, and academic project partnerships.

### The Problem It Solves:
- Students often struggle to find peers who possess specific skills they want to learn (e.g., Python, Machine Learning, UI/UX Design).
- Finding academic project partners within a university department or across departments is fragmented.
- Campus learning lacks a dedicated, privacy-focused platform where students can safely connect, exchange knowledge, and communicate.

### Key Solution Delivered:
- **Skill Portfolios**: Students publish skills they can teach and skills they want to learn.
- **Skill Exchange Match Engine**: Algorithmic detection of mutual learning/teaching synergies between peers.
- **Collaboration Workflow**: Formal request system (`pending`, `accepted`, `declined`) with privacy boundaries.
- **1-on-1 Messaging**: Private chat system with live polling and read receipts (`delivered` vs `seen`).
- **Enterprise Security**: Strong 5-rule password enforcement, dual sign-in (Username or Email), and JWT session management.

---

## 2. HIGH-LEVEL SYSTEM ARCHITECTURE

The Common Room uses a **decoupled Client-Server Architecture** communicating over a RESTful API:

```text
+-------------------------------------------------------+
|                 NEXT.JS FRONTEND                      |
| (TypeScript, React 19, Tailwind CSS, Lucide Icons)   |
|   - Port 3000 (Development)                           |
+---------------------------+---------------------------+
                            |
                     HTTP / REST API (JSON)
                     JWT Bearer Headers
                            |
+---------------------------v---------------------------+
|                 DJANGO REST BACKEND                   |
| (Python 3.14+, DRF, SimpleJWT Authentication)         |
|   - Port 8000 (Development)                           |
+---------------------------+---------------------------+
                            |
                   Object-Relational Mapping (ORM)
                            |
+---------------------------v---------------------------+
|                POSTGRESQL DATABASE                    |
| (Database: commonroom_db on Port 5432)                |
+-------------------------------------------------------+
```

### Why Decoupled Architecture?
1. **Separation of Concerns**: Frontend focuses exclusively on user interface rendering and UX; Backend handles business logic, security validation, and database persistence.
2. **Scalability**: The REST API backend can serve mobile applications, desktop wrappers, or third-party campus integrations without modifying core logic.
3. **Independent Deployment**: Frontend (e.g., Vercel) and Backend (e.g., Render/Railway) can scale independently.

---

## 3. DATABASE SCHEMA & ERD BREAKDOWN

The database contains 5 primary domain entities built on PostgreSQL:

```text
 +------------------+           +----------------------+
 |    auth_user     | 1       1 |   profiles_profile   |
 |------------------|-----------|----------------------|
 | id (PK)          |           | id (PK)              |
 | username         |           | user_id (FK, OneToOne|
 | email            |           | full_name            |
 | password (hash)  |           | university           |
 +--------+---------+           | department           |
          |                     | semester             |
          |                     | bio                  |
          |                     | skills_can_teach     |
          | 1                   | skills_want_to_learn |
          |                     | profile_picture      |
          |                     +----------+-----------+
          |                                |
          +-------------------+            |
          |                   |            | 1
          | 1                 | 1          |
 +--------v---------+ +-------v--------+  |
 | collaborations_  | |   posts_comment|  |
 | collaboration... | |----------------|  |
 |------------------| | id (PK)        |  |
 | id (PK)          | | author_id (FK) |--+ (author)
 | sender_id (FK)   | | profile_id(FK) |----+ (target profile)
 | receiver_id (FK) | | text           |
 | status           | | created_at     |
 | created_at       | +----------------+
 +------------------+
          |
          | 1
 +--------v---------+
 |  chat_chatmessage|
 |------------------|
 | id (PK)          |
 | sender_id (FK)   |
 | receiver_id (FK) |
 | message          |
 | is_read (bool)   |
 | timestamp        |
 +------------------+
```

### Table Relationships Explained:
1. **User <-> Profile (1 : 1)**: Each `auth_user` record has exactly one corresponding `Profile` storing academic background and skills.
2. **User <-> CollaborationRequest (1 : N)**: A user can be the `sender` of many requests and `receiver` of many requests.
3. **User / Profile <-> Comment (1 : N)**: An `auth_user` creates comments on a target `Profile`.
4. **User <-> ChatMessage (1 : N)**: Messages link a `sender` user to a `receiver` user.

---

## 4. AUTHENTICATION & PASSWORD SECURITY DEEP DIVE

### 1. JSON Web Token (JWT) Flow
When a student logs in:
1. Client POSTs credentials to `/api/token/`.
2. Backend returns an **Access Token** (short-lived, 5-60 min) and a **Refresh Token** (long-lived, 1-7 days).
3. Client stores tokens in `localStorage`.
4. Subsequent API requests include the access token in HTTP Headers: `Authorization: Bearer <access_token>`.

### 2. Dual Sign-In Implementation
Students can log in with **Username OR Email**:
- `CustomTokenObtainPairSerializer` inspects the input string `username_or_email`.
- If it contains `@`, it queries `User.objects.get(email__iexact=...)`.
- Otherwise, it queries `User.objects.get(username__iexact=...)`.
- Resolves to the internal username before validating password hashes.

### 3. Password Validation System (5 Rules)
Both client and server enforce the exact same 5 rules:
1. **Length**: Minimum 8 characters
2. **Uppercase**: At least 1 uppercase letter (`A-Z`)
3. **Lowercase**: At least 1 lowercase letter (`a-z`)
4. **Number**: At least 1 numeric digit (`0-9`)
5. **Special Character**: At least 1 symbol (`!@#$%^&*()_+-=[]{}|;:,.<>?`)

#### Server-Side Enforcement:
- Created custom `ComplexPasswordValidator` in `accounts/validators.py`.
- Registered in Django `settings.py` (`AUTH_PASSWORD_VALIDATORS`).
- Invoked via `validate_password()` in `UserRegisterSerializer` and `PasswordResetView`.

#### Client-Side Enforcement:
- `frontend/utils/passwordValidation.ts` evaluates criteria in real time.
- Renders live checklist UI with green `Check` / slate `X` indicators.
- Form submit button remains disabled until all 5 rules AND password confirmation match pass.
- Password visibility toggles using Lucide `Eye` / `EyeOff` icons.

---

## 5. FEATURE-BY-FEATURE TECHNICAL IMPLEMENTATION

### 5.1 Dual Sign-In Support
- Endpoint: `POST /api/token/`
- Class: `CustomTokenObtainPairSerializer`
- Behavior: Accepts email or username seamlessly without requiring separate login forms.

### 5.2 Skill Exchange Match Engine
- Located in: `backend/profiles/serializers.py` & `Profile.skill_matches` property.
- Algorithm:
  1. Parse comma-separated strings into lowercase normalized sets:
     - `my_teach = set(user.skills_can_teach.split(','))`
     - `my_learn = set(user.skills_want_to_learn.split(','))`
     - `peer_teach = set(peer.skills_can_teach.split(','))`
     - `peer_learn = set(peer.skills_want_to_learn.split(','))`
  2. Compute set intersections:
     - `can_learn_from_peer = peer_teach & my_learn`
     - `can_teach_to_peer = my_teach & peer_learn`
  3. Returns `has_match: True` if either intersection is non-empty.

### 5.3 Collaboration Request Workflow
- Endpoint: `/api/collaborations/`
- Status States:
  - `pending`: Request sent, waiting for peer approval.
  - `accepted`: Request accepted; unlocks chat and comment access.
  - `declined`: Request rejected.
- Guards:
  - Cannot send collaboration request to yourself (`sender != receiver`).
  - Cannot send duplicate pending/accepted requests.

### 5.4 1-on-1 Realtime Messaging & Read Receipts
- Endpoints:
  - `GET /api/chat/messages/?peer=<username>` (fetch chat history & mark incoming messages as read).
  - `POST /api/chat/messages/` (send new message).
  - `GET /api/chat/unread_count/` (fetch unread badge number).
- Read Receipt Logic:
  - `is_read` boolean field on `ChatMessage`.
  - When receiver opens chat with sender, backend updates `is_read=True`.
  - Sender receives `seen` status receipt icon (`CheckCheck` in indigo); otherwise `delivered` (slate `CheckCheck`).

### 5.5 Canvas Profile Picture Processing
- Problem: Storing large uncompressed images directly in database bloats DB size.
- Solution:
  - Client-side HTML5 `<canvas>` scales uploaded image to **300x300 pixels** compressed JPEG at 80% quality (`canvas.toDataURL('image/jpeg', 0.8)`).
  - Base64 string saved directly into `Profile.profile_picture` text field.
  - Zero external S3 dependencies needed for storage.

### 5.6 Directory Search & Skill Filtering
- Client-side and server-side filtering on `/students`:
  - Search query matches against `full_name`, `university`, `department`, `bio`, `skills_can_teach`, `skills_want_to_learn`.
  - One-click filter chips (`Python`, `React`, `Django`, `C++`, `AI`, `Design`, `Math`).

---

## 6. TOP 25 EXPECTED VIVA QUESTIONS & ANSWERS

### Architecture & Frameworks

#### Q1: Why did you choose Next.js for the frontend and Django for the backend?
**Answer**: Next.js provides modern React components, fast client-side routing, and optimal rendering performance. Django provides a robust, battery-included framework with built-in ORM, admin portal, security controls, and DRF integration for clean REST API endpoints.

#### Q2: What is Django REST Framework (DRF) and why is it used?
**Answer**: DRF is a powerful toolkit built on top of Django that simplifies serializing database models into JSON data and converting incoming JSON requests back into Python data structures, managing authentication, permissions, and API views.

#### Q3: What is CORS and how did you configure it?
**Answer**: CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts web pages from making API requests to a different domain/port. We used `django-cors-headers` to whitelist `http://localhost:3000` (`CORS_ALLOWED_ORIGINS`), allowing the Next.js client to communicate with Django on port 8000.

---

### Authentication & Security

#### Q4: How does JWT authentication work in your application?
**Answer**: When a user logs in via `/api/token/`, Django returns an Access Token and a Refresh Token. The frontend includes the Access Token in the HTTP `Authorization: Bearer <token>` header for all protected endpoints. SimpleJWT authenticates the token on the server.

#### Q5: What is the difference between Access Tokens and Refresh Tokens?
**Answer**: Access Tokens are short-lived tokens used to authenticate API requests. Refresh Tokens are longer-lived tokens used to request a new Access Token when the current one expires, without requiring the user to re-type their credentials.

#### Q6: How is password security enforced on the backend?
**Answer**: We implemented a custom `ComplexPasswordValidator` in `accounts/validators.py` and registered it in `settings.py` (`AUTH_PASSWORD_VALIDATORS`). It enforces 8+ characters, uppercase, lowercase, number, and special character. DRF serializers invoke `django.contrib.auth.password_validation.validate_password()` during registration and password resets.

#### Q7: How does Dual Sign-In work?
**Answer**: `CustomTokenObtainPairSerializer` inspects the input `username`. If it contains `@`, it resolves the corresponding user via `User.objects.get(email__iexact=...)`; otherwise via `User.objects.get(username__iexact=...)`, allowing seamless login with either credential.

---

### Database & ORM

#### Q8: Explain the relationship between `User` and `Profile`.
**Answer**: It is a One-to-One relationship (`OneToOneField`). The built-in `User` model handles core credentials (`username`, `email`, `password`), while `Profile` extends `User` with application-specific metadata (`university`, `department`, `skills`, `profile_picture`).

#### Q9: What is the difference between `manage.py makemigrations` and `manage.py migrate`?
**Answer**: `makemigrations` inspects changes in `models.py` and generates Python migration files describing database schema changes. `migrate` executes those migration files against the PostgreSQL database to alter actual tables and columns.

#### Q10: How do you prevent duplicate collaboration requests between two students?
**Answer**: Before creating a `CollaborationRequest`, the backend checks if a request already exists between the sender and receiver using `.filter(sender=user, receiver=peer)`. On the frontend, status endpoints disable or hide the request button if status is pending or accepted.

---

### Feature Implementation Details

#### Q11: How does the Skill Exchange Match Engine work?
**Answer**: It converts comma-separated skill strings into normalized sets (`set()`). It performs set intersection between User A's `skills_can_teach` and User B's `skills_want_to_learn` (and vice versa). If an intersection exists, it flags a mutual skill match.

#### Q12: How are Read Receipts (`delivered` / `seen`) implemented in Chat?
**Answer**: `ChatMessage` contains an `is_read` boolean field. When User A opens the chat with User B, the backend updates `is_read=True` for all incoming messages from User B. User B's frontend checks `is_read` to display a colored `seen` indicator.

#### Q13: How did you implement Profile Picture Upload without cloud storage?
**Answer**: When a user selects an image file, the browser uses HTML5 Canvas to scale and compress the image to 300x300 JPEG base64 data URL. That base64 string is stored directly in the `Profile.profile_picture` text field in PostgreSQL.

#### Q14: How is authorization enforced for comments?
**Answer**: In `posts/views.py`, before creating a `Comment`, the view checks if an `accepted` `CollaborationRequest` exists between the comment author and the profile owner. If not, DRF returns a `403 Forbidden` response.

---

### Testing & Quality Assurance

#### Q15: How did you verify password validation rules?
**Answer**: We wrote `backend/test_password_validation.py` which executes unit tests against 6 invalid password scenarios (too short, missing upper, missing lower, missing number, missing special char, mismatch) and verifies they are rejected, plus 1 valid password scenario verified to pass.

#### Q16: How do you clean up temporary test accounts?
**Answer**: Test scripts run automatic deletion routines (`user.delete()`) at the end of execution to ensure 0 test users remain in the PostgreSQL database.

#### Q17: What is `python manage.py check` used for?
**Answer**: It is Django's built-in system check framework that inspects installed models, settings, routing, and database configurations for potential runtime issues without starting the HTTP server.

---

### Scalability, Performance & Security

#### Q18: What measures prevent SQL injection attacks in your app?
**Answer**: Django ORM uses parameterized queries for all database operations, automatically escaping inputs and preventing malicious SQL payload execution.

#### Q19: What measures prevent Cross-Site Scripting (XSS) in React?
**Answer**: React automatically escapes values rendered in JSX before inserting them into the DOM, preventing script injection.

#### Q20: How is sensitive password information stored?
**Answer**: Passwords are never stored in plain text. Django hashes passwords using the **PBKDF2** algorithm with SHA-256 and a random salt before saving to PostgreSQL.

#### Q21: How would you scale the chat feature for production?
**Answer**: Replace HTTP polling with **WebSockets** using **Django Channels** and **Redis** for real-time pub/sub bidirectional event broadcasting.

#### Q22: What is the purpose of `serializers.SerializerMethodField` in DRF?
**Answer**: It allows adding custom dynamic fields to serialized JSON output that are computed on the fly by calling a method on the serializer class (e.g., computing `skills_can_teach_list` or `skill_matches`).

#### Q23: Why do we use `localStorage` for tokens in Next.js?
**Answer**: It persists authentication tokens across page reloads and browser sessions so the student remains logged in until explicit logout.

#### Q24: What happens when an unauthenticated user tries to access a protected page?
**Answer**: Next.js pages inspect the presence of JWT tokens in `localStorage`. If absent or invalid, the app redirects the user to `/login`.

#### Q25: What are future improvements for The Common Room?
**Answer**: WebSocket realtime messaging, Redis notification queues, WebRTC video study sessions, and cloud media storage (AWS S3).

---

## 7. CORE CODE SNIPPETS CHEAT SHEET

### 1. Custom Password Validator (`backend/accounts/validators.py`)
```python
import re
from django.core.exceptions import ValidationError

class ComplexPasswordValidator:
    def validate(self, password, user=None):
        if not password or len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", password):
            raise ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", password):
            raise ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r"[0-9]", password):
            raise ValidationError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?`~]", password):
            raise ValidationError("Password must contain at least one special character.")

    def get_help_text(self):
        return "Must contain 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char."
```

### 2. Dual Sign-In Serializer (`backend/accounts/serializers.py`)
```python
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username", "").strip()
        if "@" in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                attrs["username"] = user_obj.username
            except User.DoesNotExist:
                pass
        else:
            try:
                user_obj = User.objects.get(username__iexact=username_or_email)
                attrs["username"] = user_obj.username
            except User.DoesNotExist:
                pass
        return super().validate(attrs)
```

### 3. Skill Match Engine Logic (`backend/profiles/serializers.py`)
```python
def get_skill_matches(self, obj):
    request = self.context.get('request')
    if not request or not request.user.is_authenticated:
        return {'has_match': False, 'can_learn_from_peer': [], 'can_teach_to_peer': []}
    
    current_profile = getattr(request.user, 'profile', None)
    if not current_profile or current_profile.id == obj.id:
        return {'has_match': False, 'can_learn_from_peer': [], 'can_teach_to_peer': []}

    my_teach = set([s.strip().lower() for s in current_profile.skills_can_teach.split(',') if s.strip()])
    my_learn = set([s.strip().lower() for s in current_profile.skills_want_to_learn.split(',') if s.strip()])
    peer_teach = set([s.strip().lower() for s in obj.skills_can_teach.split(',') if s.strip()])
    peer_learn = set([s.strip().lower() for s in obj.skills_want_to_learn.split(',') if s.strip()])

    can_learn = list(peer_teach.intersection(my_learn))
    can_teach = list(my_teach.intersection(peer_learn))

    return {
        'has_match': len(can_learn) > 0 or len(can_teach) > 0,
        'can_learn_from_peer': can_learn,
        'can_teach_to_peer': can_teach,
    }
```

### 4. Client-Side Password Criteria Evaluator (`frontend/utils/passwordValidation.ts`)
```typescript
export interface PasswordCriteria {
    length: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}

export function evaluatePassword(password: string): PasswordCriteria {
    return {
        length: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(password),
    };
}
```

---

## 🎯 GOOD LUCK WITH YOUR VIVA DEFENSE!
*You are 100% prepared to excel in your oral defense. Master the questions in Section 6 and review the architecture diagram in Section 2!*
