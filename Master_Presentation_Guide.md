# 🎓 The Common Room — Master Presentation & Teacher Defense Guide

---

## 📌 1. Project Overview & Architecture

### 🎯 Application Mission
**The Common Room** is a peer-to-peer campus collaboration platform built to connect university students for peer tutoring, skill sharing, and academic project partnerships.

### 🛠️ Technology Stack
* **Framework**: Next.js 14+ (React 18 with App Router paradigm)
* **Language**: TypeScript (Strict typing for robust state and component contracts)
* **Styling**: Tailwind CSS (Modern, responsive UI design system with micro-interactions)
* **State & Data Persistence**: Client-side `LocalStorage` Engine & Local Storage Synchronization Layer

---

## ⚙️ 2. Core System Features & Technical Deep-Dive

---

### 🔑 Feature 1: Registration, Login & Strict Password Authentication
* **Files**: `app/register/page.tsx`, `app/signup/page.tsx`, `app/login/page.tsx`
* **How it Works**:
  1. **Form Validation**: Submitting an empty form is intercepted by HTML5 `required` attributes and JavaScript `handleSubmit` checks, displaying error alerts.
  2. **Account Registration**: Newly created accounts are stored inside the `all_registered_students` array in browser memory, saving `username`, `email`, `full_name`, and `password`.
  3. **Strict Login Authentication**: Upon logging in, the app searches `all_registered_students` for a matching `username` or `email`. If found, it compares the entered password against the stored password:
     * **Incorrect Password**: Login is blocked with `"❌ Invalid password. Please enter the correct password."`
     * **Unregistered User**: Login is blocked with `"❌ Account not found. Please check your username or Sign Up."`

---

### 🖼️ Feature 2: Profile Customization & Base64 Image Persistence
* **Files**: `app/profile/edit/page.tsx`, `components/Avatar.tsx`
* **How it Works**:
  1. **File Reading via `FileReader`**: When a user selects a profile image file, JavaScript reads the file as a Base64 Data URL (`FileReader.readAsDataURL(file)`).
  2. **Data URL Storage**: The image data string (`data:image/png;base64,...`) is saved into `user_profile` and synced to `all_registered_students`.
  3. **Avatar Renderer**: The `<Avatar />` component detects strings starting with `data:` or `http` and renders them inside a circular `<img>` tag. If no picture exists, it automatically computes initials from the student's name.

---

### 🔍 Feature 3: Dynamic Student Directory, Real-Time Search & Skill Filters
* **File**: `app/students/page.tsx`
* **How it Works**:
  1. **Self-Exclusion Filter**: On page mount, the directory loads `all_registered_students` and filters out the currently logged-in user (`username !== currentUser`). This guarantees that a user sees **only other registered campus peers** and can never send a collaboration request to themselves.
  2. **Real-Time Live Search**: Typing in the search bar dynamically filters cards by matching search strings against full names, universities, and skills in real time.
  3. **Skill Filter Pills**: Clicking a pill (**Python**, **React**, **C++**, **Design**, **AI**, **Math**) filters cards by skill category instantly.

---

### 📩 Feature 4: Collaboration Request Engine (Sent & Received)
* **Files**: `app/students/page.tsx`, `app/dashboard/page.tsx`
* **How it Works**:
  1. **Request Object Structure**: Clicking **"Send Request"** creates a structured request object:
     ```json
     {
       "id": 1723389100000,
       "from_username": "ema",
       "from_user": "Ema Watson",
       "to_username": "sarah",
       "to_user": "Sarah Chen",
       "skills": "Python, Machine Learning",
       "status": "Pending",
       "date": "8/11/2026"
     }
     ```
  2. **Interactive UI Feedback**: Displays a green toast notification (*"Collaboration request sent to Sarah Chen successfully!"*) and transforms the card button into a green disabled **"✓ Request Sent"** badge.

---

### 🛡️ Feature 5: Accept / Decline Actions & 100% Account Privacy
* **File**: `app/dashboard/page.tsx`
* **How it Works**:
  1. **Strict User Matching**: The Student Dashboard separates requests into two distinct, user-filtered sections:
     * **Sent Requests**: Matches `from_username === currentUsername` or `from_user === currentUsername`.
     * **Received Requests**: Matches `to_username === currentUsername` or `to_user === currentUsername`.
  2. **100% Account Privacy**: Each user sees **only** their own sent and received requests. No other user can view another account's collaboration data.
  3. **Accept / Decline Actions**: On the recipient's Dashboard, clicking **Accept ✅** updates the status to `"Accepted"`. Both sender and recipient instantly see the status update to **Accepted ✅** on their dashboards.

---

## 🙋‍♂️ 3. Teacher Defense Questions & Answers

---

### ❓ Q1: "How does your application store data and keep users logged in?"
> **Answer**:  
> "Our application uses Next.js client-side state management backed by browser `LocalStorage`. When a user registers or updates their profile, the data is serialized into JSON arrays (`all_registered_students`, `sent_requests`, `user_profile`). Active sessions are maintained through `user_name`, `user_email`, and session tokens stored in `LocalStorage`, ensuring data persists across page refreshes and browser restarts."

---

### ❓ Q2: "How do you handle password security during login?"
> **Answer**:  
> "When a user signs up on `/register`, their account credentials—including their password—are saved into `all_registered_students`. During login on `/login`, the system locates the registered account matching the entered username/email and compares the submitted password against the stored password. If the password does not match, login is blocked with an explicit error alert, preventing unauthorized access."

---

### ❓ Q3: "How do you ensure data privacy so students don't see each other's private requests?"
> **Answer**:  
> "We implement strict user-level filtering on the Dashboard (`app/dashboard/page.tsx`). When rendering the Sent and Received request sections, the system filters the request list using dual identity parameters (`from_username` and `to_username`) against the active session's username. This ensures student A can never view student B's requests."

---

### ❓ Q4: "Why can't a logged-in user see their own card in Browse Students or send a request to themselves?"
> **Answer**:  
> "In `app/students/page.tsx`, we apply a self-exclusion filter (`username !== currentUsername`) when populating the directory grid. This filters out the active user's profile card, ensuring students only discover and interact with external peers."

---

### ❓ Q5: "How do profile pictures work without a traditional image upload server?"
> **Answer**:  
> "We use the HTML5 `FileReader` API in `app/profile/edit/page.tsx`. When a student selects an image, `FileReader.readAsDataURL()` converts the image file into a Base64 Data URL string. This string is stored directly in browser memory and rendered by our `<Avatar />` component."
