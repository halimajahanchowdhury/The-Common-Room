# The Common Room

<div align="center">

### *Where Students Learn, Collaborate & Grow Together*

![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Lucide Icons](https://img.shields.io/badge/Icons-Lucide%20React-violet?style=for-the-badge)
![Django](https://img.shields.io/badge/Backend-Django-darkgreen?style=for-the-badge&logo=django)
![Django REST Framework](https://img.shields.io/badge/API-Django%20REST-A30000?style=for-the-badge&logo=django)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens)

</div>

---

## Project Overview

**The Common Room** is a modern, peer-to-peer campus collaboration platform designed to connect university students for peer tutoring, skill exchange, and academic project partnerships.

The platform bridges the gap between students who have skills to teach and students seeking to learn — featuring an automated **Skill Exchange Match Engine**, **1-on-1 Realtime Messaging with Read Receipts**, **Dual Sign-In Support**, and **Strong Password Security Validation**.

---

## Features & Architecture

### Authentication & Security
- **Dual Sign-In Support**: Log in using either your **Username OR Email address**.
- **Strong Password Validation**: Enforces 5 security criteria on `/register`, `/forgot-password`, and `/profile/edit`:
  - 8+ characters
  - At least 1 uppercase letter (`A-Z`)
  - At least 1 lowercase letter (`a-z`)
  - At least 1 number (`0-9`)
  - At least 1 special character (`!@#$%^&*...`)
- **Realtime Requirement Checklist**: Visual feedback indicators (`Check` / `X`) while typing passwords.
- **Confirm Password Matching**: Real-time validation preventing form submission when confirmation fields mismatch.
- **Password Visibility Toggles**: Interactive `Eye` / `EyeOff` icons on all password fields.
- **Password Recovery**: Integrated `/forgot-password` flow enforcing strong password rules.
- **JWT Session Security**: Authentic access & refresh tokens via SimpleJWT with protected API routes.

### Profile System & Portfolio Customization
- **Profile Customization**: Edit full name, university, department, semester, bio, and skill portfolios.
- **Canvas Profile Picture Upload**: Client-side HTML5 canvas compression (300×300 JPEG) for fast, lightweight avatar persistence in PostgreSQL.
- **Skill Portfolios**:
  - **Skills I Can Teach** — list skills available to share with peers.
  - **Skills I Want to Learn** — list skills the student is actively seeking.

### Skill Exchange Match Engine
- Automatically detects mutual skill overlaps between student portfolios.
- Highlights potential matches prominently on student detail pages (`/students/[id]`) and student directory cards:
  - *Skills You Can Learn From Peer*
  - *Skills You Can Teach To Peer*

### Collaboration Requests & Privacy Controls
- Send and receive peer collaboration requests across campus.
- Manage incoming/outgoing requests on the Dashboard (`Pending`, `Accepted`, `Declined`).
- **Strict Privacy Enforcement**: Messaging and collaborator comment features are restricted to accepted student collaborators.

### 1-on-1 Realtime Messaging & Read Receipts
- Modern split-pane messaging app interface at `/chat`.
- Live message polling with automatic updates.
- **Status Receipts**: Visual indicators for `Delivered` vs `Seen` messages.
- **Unread Notification Badge**: Realtime message badge in the persistent navigation bar.

### Directory Search & Skill Filtering
- **Search Bar**: Instant client-side & server-side search across student names, universities, departments, bios, and skills.
- **Quick Skill Filter Chips**: One-click filtering by popular tech/academic skills (`Python`, `React`, `Django`, `C++`, `AI`, `Design`, `Math`).
- **Active Filter Bar**: Clear visual feedback of active filters with one-click reset.

### UI/UX Design System
- **Lucide React Icon System**: Clean, professional icon set replacing all decorative UI emojis.
- **Dark & Light Mode Balance**: Intentional dark slate theme (`#0b0f17` background, `#111827` card surfaces) and crisp light theme with glassmorphic navbar styling.
- **Responsive Layout**: Designed for seamless use on desktop, tablet, and mobile screens.

---

## Application Pages

| Route | Description |
|---|---|
| `/` | Landing page highlighting platform features and auth-aware call-to-action buttons. |
| `/login` | Dual username/email sign-in form with password visibility toggle. |
| `/register` | Account registration form with realtime 5-criteria password checklist and confirm password field. |
| `/forgot-password` | Password recovery page enforcing strong password criteria and confirmation matching. |
| `/dashboard` | Student hub displaying profile summary, skill cards, received requests, and sent request tracking. |
| `/students` | Student Directory with search bar, quick skill pills, active filter chips, and peer profile cards. |
| `/students/[id]` | Peer profile detail page highlighting Skill Exchange Matches, collaboration actions, and discussion comments. |
| `/profile/edit` | Profile customization form for avatar upload, academic info, skill portfolios, and security password updates. |
| `/chat` | 1-on-1 split-pane messaging interface with active peer list, message history, read receipts, and unread badges. |

---

## Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icon System**: Lucide React (`lucide-react`)

### Backend
- **Framework**: Django 6
- **API Framework**: Django REST Framework
- **Authentication**: SimpleJWT (`rest_framework_simplejwt`)

### Database
- **Engine**: PostgreSQL (`commonroom_db`)

---

## Project Structure

```text
TheCommonRoom/
├── backend/
│   ├── accounts/          # User registration, dual login, password validation & reset
│   ├── profiles/          # Student profile management & avatar storage
│   ├── collaborations/    # Collaboration request workflow (pending/accepted/declined)
│   ├── posts/             # Profile collaborator feedback comments
│   ├── chat/              # 1-on-1 private messaging, unread counts & read receipts
│   └── common_room_backend/ # Django project configuration & settings
│
└── frontend/
    ├── app/               # Next.js App Router pages
    │   ├── page.tsx           # Auth-aware landing homepage
    │   ├── dashboard/         # Student dashboard hub
    │   ├── login/             # Dual sign-in page
    │   ├── register/          # User registration page
    │   ├── forgot-password/   # Password recovery page
    │   ├── profile/edit/      # Edit profile & security settings page
    │   ├── chat/              # 1-on-1 realtime messaging page
    │   └── students/
    │       ├── page.tsx       # Browse student directory
    │       └── [id]/          # Peer student profile & match detail page
    ├── components/
    │   ├── Navbar.tsx         # Persistent navigation bar & theme toggle
    │   └── Avatar.tsx         # Multi-size avatar & initials fallback component
    ├── utils/
    │   └── passwordValidation.ts # Shared password security criteria evaluator
    └── services/
        ├── api.ts             # Axios instance configuration
        └── auth.ts            # REST API service functions
```

---

## Local Development Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database (`commonroom_db`)

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary requests
   ```

4. Configure PostgreSQL in `common_room_backend/settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'commonroom_db',
           'USER': 'postgres',
           'PASSWORD': '54321',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

5. Run database migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the Django backend server:
   ```bash
   python manage.py runserver 8000
   ```
   > Backend API runs at `http://127.0.0.1:8000/api/`

---

### 3. Frontend Setup

1. Navigate to the `frontend` directory in a new terminal:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   > Frontend runs at `http://localhost:3000/`

---

## Automated Testing

Run the test suite in `backend/`:

- **Password Validation Unit Tests**:
  ```bash
  python test_password_validation.py
  ```
- **Django Configuration Check**:
  ```bash
  python manage.py check
  ```
- **Stage 1–8 Full System Tests**:
  ```bash
  python test_stage1.py
  python test_stage8.py
  ```

---

## License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
