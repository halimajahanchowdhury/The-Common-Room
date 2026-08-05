# The Common Room

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/Django_REST_Framework-A30000?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

## Project Overview

**The Common Room** is a collaborative student learning platform where students can connect with each other based on skills they can teach and skills they want to learn. The goal of the platform is to help students find learning partners, collaborate, and exchange knowledge.

### Implemented Core Features

- **User Authentication**: Registration and login using JWT-based authentication.
- **User Dashboard**: Displays logged-in user details, profile information, and received collaboration requests.
- **Student Profile Management**: Manage student profiles, view own profile, and explore other students' profiles.
- **Browse & View Students**: Browse available student profiles and view individual student pages with skills and bio information.
- **Collaboration Request System**: Send, accept, or reject collaboration requests with collaboration status indicators.
- **Profile Comment System**: Comment on student profiles with restrictions enforced (comments allowed only after a collaboration request is accepted).
- **Navigation Bar**: Persistent navigation bar with links to Dashboard, Browse Students, My Profile, and Logout.

---

## Technology Stack

### Frontend
- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS

### Backend
- **Framework**: Django
- **API Framework**: Django REST Framework
- **Authentication**: JWT authentication (`djangorestframework-simplejwt`)

### Database
- **Database Engine**: PostgreSQL

---

## Project Structure

```text
TheCommonRoom/
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── students/[id]/
│   │   ├── profile/
│   │   ├── login/
│   │   └── register/
│   └── services/
│       ├── api.ts
│       └── auth.ts
│
└── backend/
    ├── accounts/          # User registration, authentication, current user endpoint
    ├── profiles/          # Student profile management
    ├── collaborations/    # Collaboration request system
    ├── posts/             # Profile comments system
    ├── chat/              # Chat application
    └── study_sessions/    # Study sessions application
```

---

## Implemented Features

### Backend Features

- **Authentication (`accounts`)**:
  - Register new users
  - Login users using JWT tokens
  - Retrieve current authenticated user
- **Profiles (`profiles`)**:
  - Create/update user profile
  - View own profile
  - View all student profiles
  - View individual student profiles
- **Collaboration (`collaborations`)**:
  - Create collaboration requests
  - View received requests
  - Accept collaboration requests
  - Reject collaboration requests
  - Check collaboration status between users
- **Posts (`posts`)**:
  - Create comments on profiles
  - View profile comments
  - Restrict comments unless collaboration is accepted

### Frontend Features

- **Authentication Pages**:
  - Register page
  - Login page
- **Dashboard**:
  - Displays logged-in user's information
  - Displays profile information
  - Displays collaboration requests
  - Allows accepting/rejecting collaboration requests
- **Browse Students**:
  - View available student profiles
  - Open individual student profile pages
- **Student Profile Page**:
  - View student information
  - View skills
  - View bio
  - Send collaboration request
  - Display collaboration status
  - Add comments
  - View comments

---

## Authentication Flow

The application utilizes JWT (JSON Web Token) authentication.

1. User registers for an account.
2. User logs in with credentials.
3. Backend provides `access` and `refresh` JWT tokens.
4. Frontend stores tokens locally.
5. Authenticated requests send token in header:
   ```http
   Authorization: Bearer <access_token>
   ```

---

## Database Configuration

The application uses **PostgreSQL**.

Database configuration settings are stored in:
`backend/config/settings.py`

---

## Setup & Execution Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment (Windows):
   ```cmd
   venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start Django server:
   ```bash
   python manage.py runserver
   ```

Backend server runs at: `http://127.0.0.1:8000/`

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install packages:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

Frontend server runs at: `http://localhost:3000/`

---

## Current Project Status

The current version includes the core MVP features:
- Authentication
- Profiles
- Student browsing
- Collaboration requests
- Collaboration acceptance/rejection
- Profile comments

Future improvements may include UI improvements and additional features, but they are not part of the current implementation.
