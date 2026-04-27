# ft_transcendence_TTM - Team Task Manager

*A collaborative web application developed for the 42 curriculum.*

**Authors:** `<tialbert>`, `<nsimao-f>`, `<diolivei>`, `<vafernan>`

---

## Overview

This project consists of developing a collaborative web application focused on team productivity and task management. The application allows multiple users to create and manage teams (organizations), assign and track tasks, communicate in real time, and share files. Each team acts as a workspace where users can collaborate efficiently.

**Primary Goals:**
* Multi-user support
* Real-time communication
* Structured backend architecture
* Proper database design
* Team collaboration

---

## Features

* **User Management:** Authentication (register/login) and profile management with avatars.
* **Team Organization:** Creation and management of teams (organizations).
* **Task Management:** Task creation, assignment, status tracking, filtering, sorting, and search.
* **Communication:** Real-time team chat (each team has its own chat system).
* **File System:** File uploads linked directly to specific tasks.
* **Notifications:** Real-time alerts triggered by tasks and important actions.
* **Access Control:** Role-based permissions (admin/member) controlling user actions inside teams.

---

## Technical Stack

* **Frontend:** React (with Vite), Tailwind CSS
* **Backend:** Node.js with Express
* **Database:** MariaDB, Prisma ORM
* **Real-time:** Socket.IO
* **DevOps:** Docker, Docker Compose

---

## Architecture

* **Frontend:** Handles UI and user interaction. Communicates with the backend via REST API and uses WebSockets for real-time updates.
* **Backend:** Provides a REST API for CRUD operations, handles authentication and business logic, and integrates real-time communication.
* **Database:** Stores all persistent data, cleanly managed via Prisma ORM.
* **Real-time Layer:** WebSocket-based communication used for chat, notifications, and live updates.

### Database Schema

* **Users:** `id`, `email`, `password`, `username`, `avatar`
* **Teams:** `id`, `name`, `owner_id`
* **TeamMembers:** `id`, `user_id`, `team_id`, `role`
* **Tasks:** `id`, `title`, `description`, `status`, `assigned_to`, `team_id`
* **Files:** `id`, `filename`, `path`, `task_id`, `uploaded_by`
* **Messages:** `id`, `content`, `user_id`, `team_id`, `created_at`

---

## Modules & Evaluation

**Target:** 15–16 points | **Minimum:** 14 points

Category -> Module -> Points
**Core: Web** -> Frontend + Backend frameworks          -> 2
Real-time features                                      -> 2
User interaction (chat, profiles)                       -> 2
File upload system                                      -> 1
ORM                                                     -> 1
Notification system                                     -> 1
**Core: Users** -> Authentication system                -> 2
Organization system                                     -> 2
                                                        13P
**Additional** -> Advanced search (filter/sort tasks)   ->+1
Implement 2FA for users                                 ->+1
Permissions system (roles)                              ->+2
                                                        17P

### Mandatory Requirements Compliance
* Web application (frontend + backend + database)
* Multi-user support
* Authentication system
* Input validation (frontend and backend)
* Docker deployment
* HTTPS support (in deployment)

---

## Team & Workflow

### Roles
* **Member 1 (Product Owner / Developer):** Defines product vision and priorities, manages backlog, contributes to backend and feature implementation.
* **Member 2 (Project Manager / Developer):** Organizes tasks and meetings, tracks progress and deadlines, contributes to frontend and integration.
* **Member 3 (Technical Lead / Developer):** Defines architecture and technical choices, ensures code quality, leads backend and system design.
* **Member 4 (Developer / DevOps):** Implements features, manages Docker and deployment, handles file system and infrastructure.

### Project Management
* **Task Tracking:** GitHub Issues / Trello
* **Version Control:** Git
* **Communication:** Slack
* **Workflow:** Features are divided into small tasks -> Assigned to a team member -> Code reviews performed before merging -> Weekly sync meetings to track progress.

---

## Setup Instructions

### Prerequisites
* Docker
* Docker Compose

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd <project_name>
   ```

2. **Start the application:**
   ```bash
   make all
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Development Commands

- `make all` - Build and start all services (preserves database)
- `make all-new` - Full rebuild (removes database)
- `make clean` - Stop services (keeps database)
- `make clean-all` - Remove all containers and data
- `make frontRebuild` - Rebuild only frontend
- `make backRebuild` - Rebuild only backend
- `make down` - Stop all services
