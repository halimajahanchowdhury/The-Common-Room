# ☕ The Common Room

<div align="center">

### *Where Students Learn, Collaborate & Grow Together*

![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Django](https://img.shields.io/badge/Backend-Django-darkgreen?style=for-the-badge&logo=django)
![Django REST Framework](https://img.shields.io/badge/API-Django%20REST-A30000?style=for-the-badge&logo=django)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens)

</div>

---

## 📖 Project Description

**The Common Room** is a collaborative student learning platform where students can create profiles, share skills, discover other students, send collaboration requests, and communicate through profile comments after becoming collaborators.

The platform is designed to bridge the gap between students who have skills to teach and students who want to learn — helping them connect, collaborate, and grow together on campus.

---

## ✅ Features

### 🔐 Authentication
- User registration
- User login
- JWT authentication (access & refresh tokens)
- Protected routes (token-based access control)

### 👤 Profile System
- View own profile
- Edit profile (full name, university, department, semester, bio, skills)
- View other students' profiles
- Browse all registered students

### 🎓 Skill Exchange
- **Skills I Can Teach** — list skills available to share
- **Skills I Want to Learn** — list skills the student is seeking
- **University** and **Department** fields
- **Bio** — personal description

### 🤝 Collaboration Requests
- Send a collaboration request to another student
- Receive collaboration requests from other students
- Accept a collaboration request
- Reject a collaboration request
- Collaboration status display (None, Pending, Accepted, Rejected)
- Prevent duplicate collaboration requests
- Hide or disable the request button based on current collaboration status

### 💬 Comments
- View profile comments on a student's profile page
- Post a comment on a collaborator's profile
- Only accepted collaborators can post comments (enforced on the backend)

### 🖥️ Frontend Pages
- **Homepage** (`/`) — Landing page with smart redirect (sign in / go to dashboard based on auth state)
- **Login** (`/login`) — User login page
- **Register** (`/register`) — User registration page
- **Dashboard** (`/dashboard`) — Logged-in user's hub with profile info and received collaboration requests
- **Browse Students** (`/students`) — Browse all registered student profiles
- **Student Profile Page** (`/students/[id]`) — View a specific student's profile, skills, bio, collaboration controls, and comments
- **Edit Profile** (`/profile/edit`) — Edit the authenticated user's own profile
- **Navigation Bar** — Persistent navbar across authenticated pages with links to Dashboard, Browse Students, My Profile, and Logout

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

### Backend
- **Framework**: Django
- **API Framework**: Django REST Framework

### Database
- **Engine**: PostgreSQL

### Authentication
- Django's built-in `User` model
- JWT via `djangorestframework-simplejwt`

---

## 📁 Project Structure

```text
TheCommonRoom/
├── backend/
│   ├── accounts/          # User registration, login, current user endpoint
│   ├── profiles/          # Student profile management (CRUD)
│   ├── collaborations/    # Collaboration request system
│   ├── posts/             # Profile comments system
│   ├── chat/              # Chat app (scaffolded, not yet fully implemented)
│   ├── study_sessions/    # Study sessions app (scaffolded, not yet fully implemented)
│   └── config/            # Django project settings and root URL configuration
│
└── frontend/
    ├── app/               # Next.js App Router pages
    │   ├── page.tsx           # Homepage with auth-aware landing
    │   ├── dashboard/         # Dashboard page
    │   ├── login/             # Login page
    │   ├── register/          # Registration page
    │   ├── profile/edit/      # Edit profile page
    │   └── students/
    │       ├── page.tsx       # Browse all students
    │       └── [id]/          # Individual student profile page
    ├── components/
    │   ├── Navbar.tsx         # Persistent navigation bar
    │   └── Avatar.tsx         # Avatar/initials component
    └── services/
        ├── api.ts             # Axios instance with base URL
        └── auth.ts            # Auth API calls (login, register, profile, collaborations, comments)
```

---

## 🗃️ Database Overview

| Model | App | Description |
|---|---|---|
| `User` | Django built-in | Core authentication model (username, email, password) |
| `Profile` | `profiles` | Extends `User` with full name, university, department, semester, bio, skills |
| `CollaborationRequest` | `collaborations` | Tracks requests between two users with a status: `pending`, `accepted`, or `rejected` |
| `Comment` | `posts` | A comment posted by a `User` on another user's `Profile` |

### Relationships
- Each `User` has exactly one `Profile` (OneToOne).
- A `CollaborationRequest` links a **sender** and a **receiver** (both `User` FK).
- A `Comment` links an **author** (`User` FK) to a **profile** (`Profile` FK).
- Comments can only be created if the collaboration between the author and the profile owner is `accepted` (enforced in the backend view).

---

## 🔌 API Overview

All API routes are prefixed with `/api/`.

### Authentication
| Endpoint | Method | Description |
|---|---|---|
| `/api/token/` | POST | Obtain JWT access & refresh tokens (login) |
| `/api/token/refresh/` | POST | Refresh an access token |
| `/api/accounts/register/` | POST | Register a new user |
| `/api/accounts/me/` | GET | Get the currently authenticated user |

### Profiles
| Endpoint | Method | Description |
|---|---|---|
| `/api/profiles/` | GET | List all student profiles |
| `/api/profiles/me/` | GET / PUT | View or update the current user's profile |
| `/api/profiles/<id>/` | GET | View a specific student's profile |

### Collaboration Requests
| Endpoint | Method | Description |
|---|---|---|
| `/api/collaborations/create/` | POST | Send a collaboration request |
| `/api/collaborations/received/` | GET | View received collaboration requests |
| `/api/collaborations/sent/` | GET | View sent collaboration requests |
| `/api/collaborations/status/<user_id>/` | GET | Check collaboration status with a specific user |
| `/api/collaborations/<id>/` | PATCH | Accept or reject a collaboration request |

### Comments
| Endpoint | Method | Description |
|---|---|---|
| `/api/posts/create/` | POST | Post a comment on a profile (collaborators only) |
| `/api/posts/profile/<profile_id>/` | GET | Retrieve all comments on a specific profile |

---

## ⚙️ Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows:**
     ```cmd
     venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Configure PostgreSQL — open `backend/config/settings.py` and update the `DATABASES` block with your local PostgreSQL credentials:
   ```python
   DATABASES = {
       "default": {
           "ENGINE": "django.db.backends.postgresql",
           "NAME": "your_db_name",
           "USER": "your_db_user",
           "PASSWORD": "your_db_password",
           "HOST": "localhost",
           "PORT": "5432",
       }
   }
   ```

6. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

7. (Optional) Create a superuser for the Django admin panel:
   ```bash
   python manage.py createsuperuser
   ```

8. Start the development server:
   ```bash
   python manage.py runserver
   ```

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

3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🚀 Running the Project

Start both servers concurrently in separate terminals.

**Backend:**
```bash
python manage.py runserver
```
> Runs at: `http://localhost:8000/`

**Frontend:**
```bash
npm run dev
```
> Runs at: `http://localhost:3000/`

The frontend communicates with the backend via the REST API on port `8000`. Ensure both servers are running simultaneously for the application to function correctly.

---

## 📸 Screenshots

> Screenshots to be added upon final UI completion.

| Page | Description |
|---|---|
| Login | User login form |
| Register | New user registration form |
| Dashboard | Logged-in user's profile summary and incoming collaboration requests |
| Browse Students | Grid/list of all registered student profiles |
| Student Profile | Individual profile with skills, bio, collaboration controls, and comments |
| Edit Profile | Editable form for updating your own profile |
| Collaboration Requests | Accept or reject incoming requests directly from the dashboard |
| Comments Section | Post and view comments on a collaborator's profile |

---

## 🔮 Future Improvements

These features are **not yet implemented** and represent planned enhancements:

- 💬 **Real-time chat** between accepted collaborators
- 🔔 **Notifications** for new collaboration requests and comments
- 🔍 **Search and filtering** on the Browse Students page (by skill, university, department)
- 🖼️ **Profile picture upload** support
- 📅 **Study sessions** scheduling between collaborators
- 📱 **Responsive mobile improvements**
- ☁️ **Deployment** to a cloud platform (e.g., Render, Vercel, Railway)

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
