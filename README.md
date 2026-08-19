# DevBridge

**AI-Powered Developer Collaboration Platform** — a unified workspace where student developer teams can manage projects, communicate in real time, and get AI-assisted coding help, all in one place.

Built as a mini-project for the Bachelor of Technology (CSE) program at Pranveer Singh Institute of Technology.

---

## Why DevBridge

Student teams typically juggle GitHub for code, Discord/Slack for chat, and ChatGPT for coding help — three disconnected tools with no shared context. DevBridge combines project management, real-time collaboration, and context-aware AI assistance into a single platform, so teams don't lose context switching between apps.

---

## Features

* **Authentication** — Email/password (JWT) and Google Sign-In
* **Project & Task Management** — Create projects, invite teammates (invite/accept/decline flow), Kanban-style task board with role-based access
* **Real-Time Chat** — Project-scoped live messaging via Socket.IO, with persistent history
* **AI Assistant** — Powered by Google Gemini: explain code, suggest bug fixes, generate documentation, and summarize team chat discussions
* **File Sharing** — Upload and share project files via Cloudinary
* **Learning Recommendations** — Personalized resource suggestions based on user interests
* **Analytics** — Live task-completion progress tracking per project
* **Notifications** — In-app notification system for invites and project activity
* **Modern UI** — Dark/light mode, responsive sidebar navigation, glassmorphism auth screens

---

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Socket.IO Client
**Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.IO
**Auth:** JWT, Google OAuth 2.0
**AI:** Google Gemini API
**File Storage:** Cloudinary
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

---

## Project Structure

```text
devbridge-starter/
├── client/          # React frontend
│   └── src/
│       ├── api/          # Axios instance
│       ├── components/  # Sidebar, Layout, NotificationBell, etc.
│       ├── context/      # Theme (dark/light mode) context
│       └── pages/        # Login, Register, Dashboard, Profile, ProjectWorkspace
└── server/          # Express backend
    ├── config/          # DB and Cloudinary configuration
    ├── controllers/     # Route logic
    ├── middleware/      # JWT auth middleware
    ├── models/          # Mongoose schemas
    ├── routes/          # API route definitions
    ├── services/        # AI service, notification service
    └── sockets/         # Socket.IO chat logic
```

---

## Core Modules (per project synopsis)

| Module                              | Description                                                          |
| ----------------------------------- | -------------------------------------------------------------------- |
| User & Authentication               | JWT-based auth with role-based access, Google OAuth                  |
| Project & Task Management           | CRUD operations, team invitations, Kanban board                      |
| AI Assistant                        | Gemini-powered code explanation, debugging, docs, chat summarization |
| Real-Time Chat                      | Socket.IO project-scoped messaging                                   |
| File Sharing & Storage              | Cloudinary-based uploads                                             |
| Learning Recommendation & Analytics | Tag-based resource matching, progress tracking                       |

---

## Future Scope

DevBridge can be extended in several directions beyond its current scope:

* **Native mobile apps** (Android/iOS) for access without a desktop environment
* **Advanced AI code review** — automated testing and bug detection integrated into the AI assistant
* **Plagiarism detection & code-quality analytics** for faculty evaluation of student submissions
* **Voice-based AI assistance** for hands-free interaction
* **Gamified learning features** — badges, streaks, and leaderboards to encourage participation
* **On-premise deployment options** for institutions with strict data governance requirements
* **CI/CD integration** — deeper GitHub Actions integration to automate build, test, and deployment directly within the platform

---

## License

This project was built for academic purposes as part of a college mini-project submission.
