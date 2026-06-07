# ft_transcendence - Team Task Manager

*A collaborative team productivity web application developed for the 42 Common Core final project.*

**Authors:** `<tialbert>`, `<nsimao-f>`, `<diolivei>`, `<vafernan>`

---

## Overview

This project consists of developing a collaborative web application focused on team productivity and task management. The application allows multiple users to create and manage teams (organizations), assign and track tasks, communicate in real time, and share files. Each team acts as a workspace where users can collaborate efficiently.

**Primary Goals:**
- Provide a responsive and accessible multi-user web application.
- Support simultaneous users and real-time interactions.
- Implement secure authentication and user management.
- Provide team-based task and file management.
- Maintain a clear backend architecture and database schema.
- Use Docker-based deployment with a single command.

---

## Features

**User Management:**
- User registration and login.
- Secure password handling.
- User profile pages with avatar, description, friends, teams, and task statistics.
- Profile editing.
- Friend system with friend requests and user search.
- Online/offline friend status.

**Team Organization:**
- Team creation and management.
- Team detail pages with members, task statistics, and task list.
- Team member roles such as leader and member.
- Team invitations and join requests.
- Team status management.

**Task Management:**
- Task creation inside teams.
- Task assignment to team members.
- Task status tracking: open, in progress, and closed.
- Task filtering by status and assignee.
- Task search and organization.
- File uploads attached to specific tasks.

**File System:**
- Upload files directly to tasks.
- View files associated with each task.
- Delete uploaded task files when allowed.

**Communication:**
- Real-time team chat.
- Team-specific chat rooms.
- Real-time updates through Socket.IO.

**Notifications:**
- Notification system for important user and team actions.
- Read/unread notification states.
- Notification counters.
- User-friendly error handling for expected frontend errors.

**Access Control:**
- Role-based permissions (admin/member) controlling user actions inside teams.

**Authentication and Security:**
- Email and password authentication.
- Protected backend routes using authentication middleware.
- HTTPS support for browser-to-backend communication.
- Optional 2FA support through email verification codes.

**Legal Pages:**
- Privacy Policy page.
- Terms of Service page.

---

## Technical Stack

* **Frontend:** React, Vite, TypeScript, Tailwind CSS
* **Backend:** Node.js, Express
* **Database:** PostgreSQL, Prisma ORM
* **Real-time:** Socket.IO
* **DevOps:** Docker, Docker Compose, Make

---

## Architecture

The project is organized around a frontend, backend, database, and real-time communication layer.

**Frontend:**
The frontend handles the user interface, routing, forms, and user interactions. It communicates with the backend through REST API calls and listens to real-time events through Socket.IO.

**Backend:**
The backend provides REST API endpoints for authentication, users, teams, tasks, files, notifications, friends, and chat-related logic. It also handles authentication middleware, validation, business rules, and real-time socket events.

**Database:**
The database stores persistent project data using a relational schema managed by Prisma.

**Real-time Layer:**
Socket.IO is used for real-time features, including chat communication, notifications, and live updates like online/offline friend status.

### Database Schema Overview

The database schema is managed through Prisma and includes relations between users, teams, tasks, files, friends, notifications, and chat messages.

* **Users:** `id`, `username`, `email`, `password_hash`, `avatar_url`, `bio`, `two_factor_enabled`, `created_at`, `edited_at`
* **Teams:** `id`, `name`, `owner_id`, `max_users`, `about`, `tags`, `status_ongoing`, `created_at`, `edited_at`
* **TeamMembers:** `id`, `user_id`, `team_id`, `joined_at`
* **TeamInvites:** `id`, `team_id`, `user_id`, `status`, `created_at`
* **TeamJoinRequests:** `id`, `user_id`, `team_id`, `status`, `created_at`
* **Tasks:** `id`, `team_id`, `creator_id`, `title`, `description`, `status`, `created_at`, `finished_at`
* **TaskUsers:** `id`, `user_id`, `task_id`, `assigned_at`
* **Files:** `id`, `uploader_id`, `team_id`, `task_id`, `file_name`, `file_url`, `file_type`, `file_size`, `created_at`
* **FriendRequests:** `id`, `sender_id`, `receiver_id`, `status`, `sent_at`, `accepted_at`
* **Friendships:** `id`, `user_id_first`, `user_id_second`, `friends_since`
* **DirectMessages:** `id`, `sender_id`, `receiver_id`, `content`, `status_read`, `sent_at`
* **TeamMessages:** `id`, `sender_id`, `team_id`, `content`, `sent_at`
* **Notifications:** `id`, `user_id_trigger`, `user_id_receiver`, `type`, `entity_id`, `entity_type`, `content`, `status_read`, `created_at`

---

## Modules & Evaluation

**Completed:** 17 points | **Minimum:** 14 points


> IV.1 Web

- Use a frontend framework (React, Vue, Angular, Svelte, etc.) `(1)`

- Use a backend framework (Express, Fastify, NestJS, Django, etc.) `(1)`

- Implement real-time features using WebSockets or similar technology. `(2)`
◦ Real-time updates across clients.
◦ Handle connection/disconnection gracefully.
◦ Efficient message broadcasting.

 - Allow users to interact with other users. `(2)`
 The minimum requirements are:
◦ A basic chat system (send/receive messages between users).
◦ A profile system (view user information).
◦ A friends system (add/remove friends, see friends list)

- Use an ORM for the database. `(1)`

- A complete notification system for all creation, update, and deletion actions. `(1)`

- File upload and management system. `(1)`
◦ Support multiple file types (images, documents, etc.).
◦ Client-side and server-side validation (type, size, format).
◦ Secure file storage with proper access control.
◦ File preview functionality where applicable.
◦ Progress indicators for uploads.
◦ Ability to delete uploaded files

> IV.2 Accessibility and Internationalization

- Support for multiple languages (at least 3 languages). `(1)`
◦ Implement i18n (internationalization) system.
◦ At least 3 complete language translations.
◦ Language switcher in the UI.
◦ All user-facing text must be translatable.

- Support for additional browsers. `(1)`
◦ Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge, etc.).
◦ Test and fix all features in each browser.
◦ Document any browser-specific limitations.
◦ Consistent UI/UX across all supported browsers.

> IV.3 User Management

- Standard user management and authentication.  `(2)`
◦ Users can update their profile information.
◦ Users can upload an avatar (with a default avatar if none provided).
◦ Users can add other users as friends and see their online status.
◦ Users have a profile page displaying their information.

 - Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.). `(1)`

- An organization system: `(2)`
◦ Create, edit, and delete organizations.
◦ Add users to organizations.
◦ Remove users from organizations.
◦ View organizations and allow users to perform specific actions within an organization (minimum: create, read, update).

 - Implement a complete 2FA (Two-Factor Authentication) system for the users. `(1)`

### Mandatory Requirements Compliance

This project addresses the required points from the subject:

- Web application with frontend, backend, and database.
- Multi-user support.
- Multiple users can be logged in and active simultaneously.
- Real-time interactions are supported where applicable.
- User registration and login.
- Secure password handling.
- Clear database schema with defined relations.
- Frontend and backend validation for user inputs.
- Docker-based deployment.
- HTTPS for browser-to-backend communication.
- Privacy Policy and Terms of Service pages.
- Clear Git history with contributions from team members.
- README documentation for setup, architecture, roles, and workflow.

---

## Team & Workflow

The team is composed of four members, with some members taking multiple responsibilities as recommended by the subject.

### Roles

**`diolivei` (Product Owner / Developer):** Defined product vision and priorities, managed backlog, contributed to backend and feature implementation.

**`vafernan` (Project Manager / Developer):** Organized tasks and meetings, tracked progress and deadlines, contributed to frontend and integration.

**`nsimao-f` (Technical Lead / Developer):** Defined architecture and technical choices, ensured code quality, lead backend and system design.

**`tialbert` (DevOps / Developer):** Implemented features, managed Docker and deployment, handled file system and infrastructure.

All team members contributed to development, testing, code review, and documentation.

### Project Management

The team followed a lightweight collaborative workflow:

- Tasks were divided into smaller issues or feature branches.
- Work was distributed between team members.
- Code was reviewed through pull requests before merging.
- Communication was handled through Slack.
- Progress and problems were discussed regularly.
- Important technical decisions were always discussed as a team.

* **Task Tracking:** GitHub Issues
* **Version Control:** Git
* **Communication:** Slack

#### General Workflow:

1. Create an issue in Github Issues.
2. Create a feature branch.
3. Implement the feature or fix.
4. Test locally.
5. Open a pull request.
6. Review and test the PR.
7. Merge after approval by others.


---

## Setup Instructions

### Prerequisites
* Docker
* Docker Compose
* Make

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd <project_name>
   ```

2. **Configure environment variables:**

- Create the required `.env` files.

3. **Start the application:**
   ```bash
   make all
   ```

4. **Run database migrations:**
   ```bash
   make migrate
   ```

5. **Access the application:**

   ```txt
   https://localhost
   ```

### Relevant Development Commands


```bash
make all
```
Build and start all services while preserving the database.

```bash
make build
```
Create the local database storage folder and build all Docker containers.

```bash
make up
```
Create and start all containers in detached mode.

```bash
make down
```
Stop and remove containers and networks while keeping persistent data.

```bash
make stop
```
Stop the running containers without removing them.

```bash
make start
```
Start previously stopped containers.

```bash
make clean
```
Stop and remove containers, networks, and Docker volumes.

```bash
make fclean
```
Dangerous full cleanup. Removes project data under ${HOME}/data, all Docker containers, all Docker images, and prunes Docker volumes.

```bash
make re
```
Clean rebuild. Removes containers and volumes, rebuilds the project, and starts it again.

```bash
make frontRebuild
```
Rebuild only the frontend container without cache and restart services.

```bash
make backRebuild
```
Rebuild only the backend container without cache and restart services.

```bash
make dataRebuild
```
Rebuild only the PostgreSQL container without cache and restart services.

```bash
make studio
```
Start Prisma Studio inside the backend container on port 5555.

```bash
make migrate
```
Run Prisma migrations inside the backend container.

```bash
make seed
```
Populate the database with mock data.
