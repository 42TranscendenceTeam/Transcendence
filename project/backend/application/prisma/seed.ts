import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	console.log("Starting seed process...");

	// Clean existing data in dependency order
	await prisma.notification.deleteMany();
	await prisma.file.deleteMany();
	await prisma.taskUser.deleteMany();
	await prisma.task.deleteMany();
	await prisma.teamMessage.deleteMany();
	await prisma.directMessage.deleteMany();
	await prisma.friendship.deleteMany();
	await prisma.friendRequest.deleteMany();
	await prisma.teamJoinRequest.deleteMany();
	await prisma.teamInvite.deleteMany();
	await prisma.teamUser.deleteMany();
	await prisma.team.deleteMany();
	await prisma.user.deleteMany();

	const passwordHash = await bcrypt.hash("pass12345", 10);

	// Demo users
	const testUser = await prisma.user.create({
		data: {
			username: "TestUser",
			email: "testuser@student.42i",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=12",
			bio: "Hello! I am a test user exploring teams, friends, and tasks.",
			two_factor_enabled: false,
		},
	});

	const felix = await prisma.user.create({
		data: {
			username: "Felix",
			email: "felix@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=8",
			bio: "Backend developer focused on APIs, authentication, and databases.",
		},
	});

	const luna = await prisma.user.create({
		data: {
			username: "Luna",
			email: "luna@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=5",
			bio: "Frontend developer interested in UI, React, and design systems.",
		},
	});

	const alex = await prisma.user.create({
		data: {
			username: "Alex",
			email: "alex@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=15",
			bio: "Full-stack developer who enjoys product-focused projects.",
		},
	});

	const max = await prisma.user.create({
		data: {
			username: "Max",
			email: "max@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=20",
			bio: "Designer and organizer for collaborative student projects.",
		},
	});

	const sophia = await prisma.user.create({
		data: {
			username: "Sophia",
			email: "sophia@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=32",
			bio: "UI designer focused on accessibility, polish, and product flows.",
		},
	});

	const ryan = await prisma.user.create({
		data: {
			username: "Ryan",
			email: "ryan@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=11",
			bio: "DevOps-minded developer who enjoys Docker, deployment, and reliability.",
		},
	});

	const maya = await prisma.user.create({
		data: {
			username: "Maya",
			email: "maya@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=47",
			bio: "Product designer interested in dashboards and collaboration tools.",
		},
	});

	const noah = await prisma.user.create({
		data: {
			username: "Noah",
			email: "noah@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=68",
			bio: "Frontend engineer working on responsive layouts and component structure.",
		},
	});

	const olivia = await prisma.user.create({
		data: {
			username: "Olivia",
			email: "olivia@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=44",
			bio: "Project lead who likes planning, documentation, and clean workflows.",
		},
	});

	const liam = await prisma.user.create({
		data: {
			username: "Liam",
			email: "liam@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=33",
			bio: "Backend developer interested in WebSockets and real-time features.",
		},
	});

	const emma = await prisma.user.create({
		data: {
			username: "Emma",
			email: "emma@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=21",
			bio: "Frontend developer exploring collaborative project workflows.",
		},
	});

	const daniel = await prisma.user.create({
		data: {
			username: "Daniel",
			email: "daniel@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=22",
			bio: "Backend developer interested in scalable APIs.",
		},
	});

	const chloe = await prisma.user.create({
		data: {
			username: "Chloe",
			email: "chloe@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=23",
			bio: "Designer focused on clean interfaces and accessibility.",
		},
	});

	const nathan = await prisma.user.create({
		data: {
			username: "Nathan",
			email: "nathan@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=24",
			bio: "DevOps student learning Docker and deployment workflows.",
		},
	});

	const isabella = await prisma.user.create({
		data: {
			username: "Isabella",
			email: "isabella@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=25",
			bio: "Product-minded developer interested in team tools.",
		},
	});

	const ethan = await prisma.user.create({
		data: {
			username: "Ethan",
			email: "ethan@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=26",
			bio: "Full-stack developer working on student collaboration apps.",
		},
	});

	const nora = await prisma.user.create({
		data: {
			username: "Nora",
			email: "nora@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=27",
			bio: "UI developer experimenting with dashboards and dark themes.",
		},
	});

	const lucas = await prisma.user.create({
		data: {
			username: "Lucas",
			email: "lucas@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=28",
			bio: "Backend engineer focused on database structure and validation.",
		},
	});

	const ava = await prisma.user.create({
		data: {
			username: "Ava",
			email: "ava@example.com",
			password_hash: passwordHash,
			avatar_url: "https://i.pravatar.cc/150?img=29",
			bio: "Designer and frontend developer interested in polished user flows.",
		},
	});

	// Friendships for TestUser and between demo users
	await prisma.friendship.createMany({
		data: [
			{ user_id_first: testUser.id, user_id_second: felix.id },
			{ user_id_first: testUser.id, user_id_second: luna.id },
			{ user_id_first: testUser.id, user_id_second: alex.id },
			{ user_id_first: testUser.id, user_id_second: sophia.id },

			{ user_id_first: felix.id, user_id_second: luna.id },
			{ user_id_first: felix.id, user_id_second: liam.id },
			{ user_id_first: luna.id, user_id_second: noah.id },
			{ user_id_first: alex.id, user_id_second: ryan.id },
			{ user_id_first: max.id, user_id_second: maya.id },
			{ user_id_first: sophia.id, user_id_second: olivia.id },
		],
	});

	// Friend requests
	await prisma.friendRequest.createMany({
		data: [
			{
				sender_id: max.id,
				receiver_id: testUser.id,
				status: "pending",
			},
			{
				sender_id: ryan.id,
				receiver_id: testUser.id,
				status: "pending",
			},
			{
				sender_id: maya.id,
				receiver_id: testUser.id,
				status: "pending",
			},
			{
				sender_id: testUser.id,
				receiver_id: noah.id,
				status: "pending",
			},
			{
				sender_id: testUser.id,
				receiver_id: olivia.id,
				status: "pending",
			},
			{
				sender_id: testUser.id,
				receiver_id: felix.id,
				status: "accepted",
				accepted_at: new Date(),
			},
		],
	});

	// Teams
	const projectAlpha = await prisma.team.create({
		data: {
			name: "Project Alpha",
			owner_id: felix.id,
			max_users: 5,
			about:
				"Creating a REST API for task management with authentication and user management features.",
			tags: "backend,node,api,authentication",
			status_ongoing: true,
		},
	});

	const hackathonTeam = await prisma.team.create({
		data: {
			name: "Hackathon Team",
			owner_id: testUser.id,
			max_users: 5,
			about:
				"A fast-paced team preparing a prototype for an upcoming hackathon.",
			tags: "react,node,prisma,demo",
			status_ongoing: true,
		},
	});

	const designSystemTeam = await prisma.team.create({
		data: {
			name: "Design System Components",
			owner_id: luna.id,
			max_users: 5,
			about:
				"Building reusable UI components and a consistent visual language for the app.",
			tags: "frontend,design,css,components",
			status_ongoing: true,
		},
	});

	const databaseTeam = await prisma.team.create({
		data: {
			name: "Database Schema Refactoring",
			owner_id: alex.id,
			max_users: 4,
			about:
				"Improving database relations, Prisma schema structure, and query organization.",
			tags: "database,prisma,postgresql,backend",
			status_ongoing: true,
		},
	});

	const realtimeTeam = await prisma.team.create({
		data: {
			name: "Real-Time Chat Upgrade",
			owner_id: liam.id,
			max_users: 5,
			about:
				"Improving direct messages, team chat, live updates, and online status.",
			tags: "websocket,chat,realtime,frontend",
			status_ongoing: true,
		},
	});

	const deploymentTeam = await prisma.team.create({
		data: {
			name: "Docker Deployment Squad",
			owner_id: ryan.id,
			max_users: 4,
			about:
				"Preparing Docker Compose, environment files, HTTPS, and evaluation-ready deployment.",
			tags: "docker,devops,https,deployment",
			status_ongoing: true,
		},
	});

	const portfolioTeam = await prisma.team.create({
		data: {
			name: "Portfolio Dashboard",
			owner_id: olivia.id,
			max_users: 5,
			about:
				"Designing a dashboard to show project progress, task summaries, and team activity.",
			tags: "dashboard,product,ui,analytics",
			status_ongoing: false,
		},
	});

	const aiStudyPlanner = await prisma.team.create({
		data: {
			name: "AI Study Planner",
			owner_id: emma.id,
			max_users: 4,
			about: "A solo project for organizing study sessions with AI-assisted planning.",
			tags: "ai,planner,productivity",
			status_ongoing: true,
		},
	});

	const campusEventsBoard = await prisma.team.create({
		data: {
			name: "Campus Events Board",
			owner_id: daniel.id,
			max_users: 5,
			about: "A platform for sharing and discovering student events on campus.",
			tags: "events,campus,web",
			status_ongoing: true,
		},
	});

	const accessibilityAuditTool = await prisma.team.create({
		data: {
			name: "Accessibility Audit Tool",
			owner_id: chloe.id,
			max_users: 3,
			about: "A tool for reviewing accessibility issues in student web projects.",
			tags: "accessibility,frontend,testing",
			status_ongoing: true,
		},
	});

	const containerHealthMonitor = await prisma.team.create({
		data: {
			name: "Container Health Monitor",
			owner_id: nathan.id,
			max_users: 4,
			about: "A dashboard for checking container status and deployment health.",
			tags: "docker,monitoring,devops",
			status_ongoing: true,
		},
	});

	const teamMoodTracker = await prisma.team.create({
		data: {
			name: "Team Mood Tracker",
			owner_id: isabella.id,
			max_users: 4,
			about: "A lightweight app for tracking team morale during long projects.",
			tags: "teams,wellbeing,dashboard",
			status_ongoing: true,
		},
	});

	const codeReviewQueue = await prisma.team.create({
		data: {
			name: "Code Review Queue",
			owner_id: ethan.id,
			max_users: 5,
			about: "A project for organizing peer code reviews and feedback requests.",
			tags: "code-review,workflow,students",
			status_ongoing: true,
		},
	});

	const darkModePortfolio = await prisma.team.create({
		data: {
			name: "Dark Mode Portfolio",
			owner_id: nora.id,
			max_users: 3,
			about: "A sleek portfolio template with a futuristic dark interface.",
			tags: "portfolio,frontend,design",
			status_ongoing: false,
		},
	});

	const apiRateLimitTester = await prisma.team.create({
		data: {
			name: "API Rate Limit Tester",
			owner_id: lucas.id,
			max_users: 4,
			about: "A tool to test API limits, retries, and backend response behavior.",
			tags: "api,backend,testing",
			status_ongoing: true,
		},
	});

	const uxFeedbackWall = await prisma.team.create({
		data: {
			name: "UX Feedback Wall",
			owner_id: ava.id,
			max_users: 5,
			about: "A feedback board for collecting UI and UX suggestions from users.",
			tags: "ux,feedback,design",
			status_ongoing: true,
		},
	});

	// Team memberships
	await prisma.teamUser.createMany({
		data: [
			// Project Alpha
			{ user_id: felix.id, team_id: projectAlpha.id },
			{ user_id: testUser.id, team_id: projectAlpha.id },
			{ user_id: luna.id, team_id: projectAlpha.id },
			{ user_id: liam.id, team_id: projectAlpha.id },

			// Hackathon Team
			{ user_id: testUser.id, team_id: hackathonTeam.id },
			{ user_id: alex.id, team_id: hackathonTeam.id },
			{ user_id: max.id, team_id: hackathonTeam.id },
			{ user_id: sophia.id, team_id: hackathonTeam.id },

			// Design System Components
			{ user_id: luna.id, team_id: designSystemTeam.id },
			{ user_id: sophia.id, team_id: designSystemTeam.id },
			{ user_id: noah.id, team_id: designSystemTeam.id },
			{ user_id: maya.id, team_id: designSystemTeam.id },

			// Database Schema Refactoring
			{ user_id: alex.id, team_id: databaseTeam.id },
			{ user_id: felix.id, team_id: databaseTeam.id },
			{ user_id: ryan.id, team_id: databaseTeam.id },

			// Real-Time Chat Upgrade
			{ user_id: liam.id, team_id: realtimeTeam.id },
			{ user_id: testUser.id, team_id: realtimeTeam.id },
			{ user_id: noah.id, team_id: realtimeTeam.id },
			{ user_id: felix.id, team_id: realtimeTeam.id },

			// Docker Deployment Squad
			{ user_id: ryan.id, team_id: deploymentTeam.id },
			{ user_id: testUser.id, team_id: deploymentTeam.id },
			{ user_id: alex.id, team_id: deploymentTeam.id },

			// Portfolio Dashboard
			{ user_id: olivia.id, team_id: portfolioTeam.id },
			{ user_id: maya.id, team_id: portfolioTeam.id },
			{ user_id: sophia.id, team_id: portfolioTeam.id },

			// Extra Teams
			{ user_id: emma.id, team_id: aiStudyPlanner.id },
			{ user_id: daniel.id, team_id: campusEventsBoard.id },
			{ user_id: chloe.id, team_id: accessibilityAuditTool.id },
			{ user_id: nathan.id, team_id: containerHealthMonitor.id },
			{ user_id: isabella.id, team_id: teamMoodTracker.id },
			{ user_id: ethan.id, team_id: codeReviewQueue.id },
			{ user_id: nora.id, team_id: darkModePortfolio.id },
			{ user_id: lucas.id, team_id: apiRateLimitTester.id },
			{ user_id: ava.id, team_id: uxFeedbackWall.id },
		],
	});

	// Team invites and join requests
	await prisma.teamInvite.createMany({
		data: [
			{
				team_id: hackathonTeam.id,
				user_id: luna.id,
				status: "pending",
			},
			{
				team_id: deploymentTeam.id,
				user_id: liam.id,
				status: "pending",
			},
			{
				team_id: portfolioTeam.id,
				user_id: noah.id,
				status: "pending",
			},
		],
	});

	await prisma.teamJoinRequest.createMany({
		data: [
			{
				user_id: max.id,
				team_id: projectAlpha.id,
				status: "pending",
			},
			{
				user_id: maya.id,
				team_id: realtimeTeam.id,
				status: "pending",
			},
			{
				user_id: olivia.id,
				team_id: designSystemTeam.id,
				status: "pending",
			},
		],
	});

	// Direct messages
	await prisma.directMessage.createMany({
		data: [
			{
				sender_id: felix.id,
				receiver_id: testUser.id,
				content: "Hey, do you want to help with Project Alpha?",
				status_read: true,
			},
			{
				sender_id: testUser.id,
				receiver_id: felix.id,
				content: "Sure, I can help with the schema and Prisma setup.",
				status_read: true,
			},
			{
				sender_id: felix.id,
				receiver_id: testUser.id,
				content: "Great. I pushed the first task list to the team page.",
				status_read: false,
			},

			{
				sender_id: luna.id,
				receiver_id: testUser.id,
				content: "Can you check the new profile UI later?",
				status_read: false,
			},
			{
				sender_id: testUser.id,
				receiver_id: luna.id,
				content: "Yes, I will test it after the chat flow.",
				status_read: true,
			},

			{
				sender_id: alex.id,
				receiver_id: testUser.id,
				content: "I added some notes about the hackathon idea.",
				status_read: false,
			},
			{
				sender_id: max.id,
				receiver_id: testUser.id,
				content: "Can you accept my friend request before the demo?",
				status_read: false,
			},
			{
				sender_id: sophia.id,
				receiver_id: testUser.id,
				content: "The dashboard colors are looking much better now.",
				status_read: true,
			},
			{
				sender_id: ryan.id,
				receiver_id: testUser.id,
				content: "Docker is almost ready. I just need to test the env example.",
				status_read: false,
			},
			{
				sender_id: noah.id,
				receiver_id: testUser.id,
				content: "I found a small responsive issue on the friends page.",
				status_read: false,
			},
			{
				sender_id: olivia.id,
				receiver_id: testUser.id,
				content: "Let's prepare a clean demo flow for evaluation.",
				status_read: true,
			},
			{
				sender_id: maya.id,
				receiver_id: testUser.id,
				content: "I can help polish the team dashboard cards.",
				status_read: false,
			},
		],
	});

	// Team messages
	await prisma.teamMessage.createMany({
		data: [
			// Project Alpha
			{
				sender_id: felix.id,
				team_id: projectAlpha.id,
				content: "Welcome to Project Alpha. Let's start with the API structure.",
			},
			{
				sender_id: testUser.id,
				team_id: projectAlpha.id,
				content: "I can work on the Prisma schema and migrations.",
			},
			{
				sender_id: luna.id,
				team_id: projectAlpha.id,
				content: "I can help review how the data appears in the frontend.",
			},
			{
				sender_id: liam.id,
				team_id: projectAlpha.id,
				content: "I will check the real-time parts that depend on this data.",
			},

			// Hackathon Team
			{
				sender_id: testUser.id,
				team_id: hackathonTeam.id,
				content: "Let's define the MVP features for the hackathon.",
			},
			{
				sender_id: alex.id,
				team_id: hackathonTeam.id,
				content: "I can prepare the first backend endpoints.",
			},
			{
				sender_id: max.id,
				team_id: hackathonTeam.id,
				content: "I will focus on the presentation and UX flow.",
			},
			{
				sender_id: sophia.id,
				team_id: hackathonTeam.id,
				content: "I can create a quick visual prototype for the demo.",
			},

			// Design System
			{
				sender_id: luna.id,
				team_id: designSystemTeam.id,
				content: "Let's keep the custom CSS and focus on consistent components.",
			},
			{
				sender_id: sophia.id,
				team_id: designSystemTeam.id,
				content: "The button and card styles should be reused across pages.",
			},
			{
				sender_id: noah.id,
				team_id: designSystemTeam.id,
				content: "I will check the responsive fixes on mobile widths.",
			},
			{
				sender_id: maya.id,
				team_id: designSystemTeam.id,
				content: "The glassmorphism cards are working well with the dark theme.",
			},

			// Database Team
			{
				sender_id: alex.id,
				team_id: databaseTeam.id,
				content: "The current schema covers users, teams, tasks, friendships, and messages.",
			},
			{
				sender_id: felix.id,
				team_id: databaseTeam.id,
				content: "We should keep files and notifications out of the seed for now.",
			},
			{
				sender_id: ryan.id,
				team_id: databaseTeam.id,
				content: "I will reseed the database after the migration is applied.",
			},

			// Real-Time Team
			{
				sender_id: liam.id,
				team_id: realtimeTeam.id,
				content: "Online status should be visible in friends and chat pages.",
			},
			{
				sender_id: testUser.id,
				team_id: realtimeTeam.id,
				content: "Direct messages are already useful for the demo flow.",
			},
			{
				sender_id: noah.id,
				team_id: realtimeTeam.id,
				content: "The chat layout could use better spacing, but functionality works.",
			},

			// Deployment Team
			{
				sender_id: ryan.id,
				team_id: deploymentTeam.id,
				content: "The project should run with one Docker command for evaluation.",
			},
			{
				sender_id: testUser.id,
				team_id: deploymentTeam.id,
				content: "Let's make sure the .env.example is complete.",
			},
			{
				sender_id: alex.id,
				team_id: deploymentTeam.id,
				content: "I will verify the database connection inside the containers.",
			},

			// Portfolio Dashboard
			{
				sender_id: olivia.id,
				team_id: portfolioTeam.id,
				content: "This dashboard can show how teams, tasks, and members connect.",
			},
			{
				sender_id: maya.id,
				team_id: portfolioTeam.id,
				content: "The side panel should highlight recent team activity.",
			},
			{
				sender_id: sophia.id,
				team_id: portfolioTeam.id,
				content: "We can keep the page simple but polished.",
			},
		],
	});

	// Tasks
	const designApiSchema = await prisma.task.create({
		data: {
			team_id: projectAlpha.id,
			creator_id: felix.id,
			title: "Design API Schema",
			description: "Create the database schema for users, teams, tasks, and messages.",
			status: "finished",
			finished_at: new Date(),
		},
	});

	const implementAuthentication = await prisma.task.create({
		data: {
			team_id: projectAlpha.id,
			creator_id: felix.id,
			title: "Implement Authentication",
			description: "Create register/login endpoints with password hashing and JWT.",
			status: "in-progress",
		},
	});

	const apiDocumentation = await prisma.task.create({
		data: {
			team_id: projectAlpha.id,
			creator_id: luna.id,
			title: "API Documentation",
			description: "Document the main API routes for frontend integration.",
			status: "open",
		},
	});

	const validateUserInputs = await prisma.task.create({
		data: {
			team_id: projectAlpha.id,
			creator_id: testUser.id,
			title: "Validate User Inputs",
			description: "Add validation for forms in both frontend and backend.",
			status: "open",
		},
	});

	const brainstormIdeas = await prisma.task.create({
		data: {
			team_id: hackathonTeam.id,
			creator_id: testUser.id,
			title: "Brainstorm Ideas",
			description: "Collect and choose the best idea for the hackathon prototype.",
			status: "finished",
			finished_at: new Date(),
		},
	});

	const createPitchDeck = await prisma.task.create({
		data: {
			team_id: hackathonTeam.id,
			creator_id: max.id,
			title: "Create Pitch Deck",
			description: "Prepare a short presentation explaining the project idea.",
			status: "in-progress",
		},
	});

	const buildPrototype = await prisma.task.create({
		data: {
			team_id: hackathonTeam.id,
			creator_id: alex.id,
			title: "Build Prototype",
			description: "Implement the first working version of the app prototype.",
			status: "open",
		},
	});

	const componentLibrary = await prisma.task.create({
		data: {
			team_id: designSystemTeam.id,
			creator_id: luna.id,
			title: "Create Component Library",
			description: "Build reusable buttons, cards, inputs, and modal components.",
			status: "open",
		},
	});

	const mobileResponsivePass = await prisma.task.create({
		data: {
			team_id: designSystemTeam.id,
			creator_id: noah.id,
			title: "Mobile Responsive Pass",
			description: "Check layout spacing on profile, friends, chat, and team pages.",
			status: "in-progress",
		},
	});

	const prismaQueries = await prisma.task.create({
		data: {
			team_id: databaseTeam.id,
			creator_id: alex.id,
			title: "Prepare Prisma Queries",
			description: "Create reusable Prisma queries for teams, users, and tasks.",
			status: "open",
		},
	});

	const preventInvalidUserIds = await prisma.task.create({
		data: {
			team_id: databaseTeam.id,
			creator_id: felix.id,
			title: "Handle Invalid User Routes",
			description: "Prevent invalid profile route parameters from reaching Prisma.",
			status: "finished",
			finished_at: new Date(),
		},
	});

	const websocketStatus = await prisma.task.create({
		data: {
			team_id: realtimeTeam.id,
			creator_id: liam.id,
			title: "Improve Online Status",
			description: "Show accurate online status across friends, profile, and chat pages.",
			status: "in-progress",
		},
	});

	const chatPolish = await prisma.task.create({
		data: {
			team_id: realtimeTeam.id,
			creator_id: noah.id,
			title: "Polish Chat Layout",
			description: "Improve spacing, message bubbles, and conversation header design.",
			status: "open",
		},
	});

	const dockerCompose = await prisma.task.create({
		data: {
			team_id: deploymentTeam.id,
			creator_id: ryan.id,
			title: "Finalize Docker Compose",
			description: "Ensure the frontend, backend, and database start with one command.",
			status: "in-progress",
		},
	});

	const envExample = await prisma.task.create({
		data: {
			team_id: deploymentTeam.id,
			creator_id: testUser.id,
			title: "Update .env.example",
			description: "Document required environment variables without committing secrets.",
			status: "open",
		},
	});

	const dashboardSummary = await prisma.task.create({
		data: {
			team_id: portfolioTeam.id,
			creator_id: olivia.id,
			title: "Design Dashboard Summary",
			description: "Create a summary area for teams, members, and tasks.",
			status: "finished",
			finished_at: new Date(),
		},
	});

	const activityPanel = await prisma.task.create({
		data: {
			team_id: portfolioTeam.id,
			creator_id: maya.id,
			title: "Plan Activity Panel",
			description: "Design a simple sidebar showing recent team activity.",
			status: "open",
		},
	});

	// Task assignments
	await prisma.taskUser.createMany({
		data: [
			{ user_id: felix.id, task_id: designApiSchema.id },
			{ user_id: testUser.id, task_id: designApiSchema.id },

			{ user_id: felix.id, task_id: implementAuthentication.id },
			{ user_id: testUser.id, task_id: implementAuthentication.id },
			{ user_id: liam.id, task_id: implementAuthentication.id },

			{ user_id: luna.id, task_id: apiDocumentation.id },
			{ user_id: testUser.id, task_id: apiDocumentation.id },

			{ user_id: testUser.id, task_id: validateUserInputs.id },
			{ user_id: alex.id, task_id: validateUserInputs.id },

			{ user_id: testUser.id, task_id: brainstormIdeas.id },
			{ user_id: sophia.id, task_id: brainstormIdeas.id },

			{ user_id: max.id, task_id: createPitchDeck.id },
			{ user_id: sophia.id, task_id: createPitchDeck.id },

			{ user_id: alex.id, task_id: buildPrototype.id },
			{ user_id: testUser.id, task_id: buildPrototype.id },

			{ user_id: luna.id, task_id: componentLibrary.id },
			{ user_id: sophia.id, task_id: componentLibrary.id },
			{ user_id: maya.id, task_id: componentLibrary.id },

			{ user_id: noah.id, task_id: mobileResponsivePass.id },
			{ user_id: luna.id, task_id: mobileResponsivePass.id },

			{ user_id: alex.id, task_id: prismaQueries.id },
			{ user_id: ryan.id, task_id: prismaQueries.id },

			{ user_id: felix.id, task_id: preventInvalidUserIds.id },
			{ user_id: alex.id, task_id: preventInvalidUserIds.id },

			{ user_id: liam.id, task_id: websocketStatus.id },
			{ user_id: testUser.id, task_id: websocketStatus.id },

			{ user_id: noah.id, task_id: chatPolish.id },
			{ user_id: maya.id, task_id: chatPolish.id },

			{ user_id: ryan.id, task_id: dockerCompose.id },
			{ user_id: alex.id, task_id: dockerCompose.id },

			{ user_id: testUser.id, task_id: envExample.id },
			{ user_id: ryan.id, task_id: envExample.id },

			{ user_id: olivia.id, task_id: dashboardSummary.id },
			{ user_id: maya.id, task_id: dashboardSummary.id },

			{ user_id: maya.id, task_id: activityPanel.id },
			{ user_id: sophia.id, task_id: activityPanel.id },
		],
	});

	console.log("Seed completed successfully.");
	console.log("Demo login:");
	console.log("Email: testuser@student.42i");
	console.log("Password: pass12345");
}

main()
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
