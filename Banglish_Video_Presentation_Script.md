# 🎥 The Common Room — Banglish Video Voiceover Script & Recording Guide

> **Project Title**: The Common Room (Peer-to-Peer Campus Collaboration Platform)  
> **Script Language**: Banglish (Bengali in Latin Script) + English UI Terms  
> **Target Duration**: ~7 to 8 Minutes  

---

## 📋 Pre-Recording Setup & Checklists

1. **Backend Server**: Ensure running at `http://127.0.0.1:8000/` (`python manage.py runserver 8000` in `backend/`).
2. **Frontend Server**: Ensure running at `http://localhost:3000/` (`npm run dev` in `frontend/`).
3. **Browser Window 1 (Main)**: Logged in as **`halima`** (Password: `Password123!`).
4. **Browser Window 2 (Incognito)**: Open `Ctrl + Shift + N`, logged in as **`Ema`** (Password: `Password123!`).

---

## 🎙️ Complete Scene-by-Scene Script

### **Scene 1: Intro & Dark/Light Theme Switcher**
* **Time**: `0:00 - 0:35`  
* **Screen**: Home page (`http://localhost:3000`)
* **Action**: Scroll slightly on the home page, then click the **Dark / Light Mode** button in the top-right navbar.
* **Banglish Script**:  
> *"Hello everyone! Welcome to the video demonstration of **The Common Room** — ekta peer-to-peer campus collaboration platform, jeta university student der peer tutoring, skill exchange, ebong project partnership er jonno build kora hoyeche.*  
> *Header e top-right corner e amader **Dark Mode / Light Mode** toggle feature ache, jeta diye user easily dark ebong light theme er moddhe switch korte pare.*  
> *Cholun amader main features gulo dekhe neowa jak."*

---

### **Scene 2: User Authentication, Dual Login & Password Reset**
* **Time**: `0:35 - 1:35`  
* **Screen**: Navigate to `/register`, then `/login`, then `/forgot-password`
* **Action**: Show registration inputs, then login page, then forgot password input.
* **Banglish Script**:  
> *"Amader 1st feature holo **User Onboarding & Secure Authentication**.*  
> *New student ra `/register` page e giye tader details r password diye sign up korte parbe.*  
> *Login er jonno amra **Dual Sign-In Support** implement korechi — mane student ra **Username** ba **Email address** jekono ekta diye login korte parbe.*  
> *R jodi kono student password bhule jay, `/forgot-password` page e giye easily account password reset korte parbe."*

---

### **Scene 3: Profile Edit & Canvas Image Compression**
* **Time**: `1:35 - 2:35`  
* **Screen**: Navigate to `/profile/edit`
* **Action**: Upload profile picture, type skills in textboxes, click "Save Profile Changes".
* **Banglish Script**:  
> *"2nd feature holo **Profile & Skill Portfolio Customization** on `/profile/edit`.*  
> *Ekhaney student ra profile picture upload korte pare, jeta automatic client-side canvas scaling diye 300x300 pixel compressed avatar e convert hoy — jate website speed fast thake.*  
> *Skill portfolio doi ta category te organized: **Skills I Can Teach** (jamon Python ba C++) ebong **Skills I Want to Learn** (jamon React ba Machine Learning), shaath e bio & academic details."*

---

### **Scene 4: Student Directory, Search & Skill Filters**
* **Time**: `2:35 - 3:50`  
* **Screen**: Navigate to `/students`
* **Action**: Type a name or department in search bar, then click skill filter chips (e.g. `Python`, `React`).
* **Banglish Script**:  
> *"3rd feature holo **Student Directory & Discovery Engine** on `/students`.*  
> *Directory ta current logged-in student ke auto-exclude kore, jate shudhu campus peer der profile grid e dekha jay.*  
> *Student ra **Search Bar** a name, university, department, ba bio diye real-time search korte pare.*  
> *Shaathe **Skill Filter Chips** (jamon Python, React, Django) click korle instantly oi specific skill er student ra filter hoye jay."*

---

### **Scene 5: Smart Skill Exchange Match Engine**
* **Time**: `3:50 - 4:50`  
* **Screen**: Click a student card on `/students` to open `/students/[id]`
* **Action**: Point mouse to the green **Potential Skill Exchange Match** banner.
* **Banglish Script**:  
> *"4th feature holo amader **Smart Skill Match Engine**.*  
> *Jokhoni kono peer er profile open kora hoy, system automatic check kore — ami jeta shikhte chai r peer student jeta shikhabe, tader moddhe skill overlap ache kina.*  
> *Skill overlap thakle ekta highlighted green **Potential Skill Exchange Match** badge show kore, jate easily peer tutoring opportunity identify kora jay!"*

---

### **Scene 6: Collaboration Requests & Student Dashboard**
* **Time**: `4:50 - 6:05`  
* **Screen**: Click "Send Collaboration Request" on peer profile, then switch to `/dashboard`
* **Action**: Show "Sent Requests" and "Received Requests", click Accept ✅ on a request.
* **Banglish Script**:  
> *"5th feature holo **Collaboration Request Lifecycle**.*  
> *Peer profile e **Send Collaboration Request** button click korle request send hoye jay.*  
> *Recipient er **Student Dashboard** (`/dashboard`) e requests gulo **Received Requests** ebong **Sent Requests** tab e organize kora thake.*  
> *Recipient **Accept ✅** ba **Decline ❌** korte pare. Accept korle 2 jon student er moddhe private messaging unlock hoye jay."*

---

### **Scene 7: Private 1-on-1 Messaging & Read Receipts**
* **Time**: `6:05 - 7:20`  
* **Screen**: Navigate to `/chat`
* **Action**: Select an accepted connection, type message, click send. Point to `delivered` / `seen` read receipt badge.
* **Banglish Script**:  
> *"6th feature holo **Private 1-on-1 Peer Chat** on `/chat`.*  
> *Messaging completely private ebong shudhu accepted collaborator der moddhe restricted.*  
> *Student ra live messaging er shaathe **`delivered`** ebong **`seen`** status receipts dekhte pare — jate bojha jay peer message ta read koreche kina.*  
> *Shaathe header e unread message counter badge o ache.*  
> *Eiguloi amader **The Common Room** er main features. Thank you so much!"*
