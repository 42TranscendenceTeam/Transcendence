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

	// All users register with pass12345
	const passwordHash = await bcrypt.hash("pass12345", 10);

	// Users based on frontend mock data
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

	// Friendships for TestUser
	await prisma.friendship.createMany({
		data: [
			{ user_id_first: testUser.id, user_id_second: felix.id },
			{ user_id_first: testUser.id, user_id_second: luna.id },
			{ user_id_first: testUser.id, user_id_second: alex.id },
		],
	});

	// Friend requests
	await prisma.friendRequest.create({
		data: {
			sender_id: max.id,
			receiver_id: testUser.id,
			status: "pending",
		},
	});

	await prisma.friendRequest.create({
		data: {
			sender_id: testUser.id,
			receiver_id: felix.id,
			status: "accepted",
			accepted_at: new Date(),
		},
	});

	// Teams based on frontend mock data
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
			max_users: 4,
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
			max_users: 3,
			about:
				"Building reusable UI components and a consistent visual language for the app.",
			tags: "frontend,design,tailwind,components",
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

	// Team memberships
	await prisma.teamUser.createMany({
		data: [
			// Project Alpha: TestUser is a member, Felix is owner
			{ user_id: felix.id, team_id: projectAlpha.id },
			{ user_id: testUser.id, team_id: projectAlpha.id },
			{ user_id: luna.id, team_id: projectAlpha.id },

			// Hackathon Team: TestUser is owner
			{ user_id: testUser.id, team_id: hackathonTeam.id },
			{ user_id: alex.id, team_id: hackathonTeam.id },
			{ user_id: max.id, team_id: hackathonTeam.id },

			// Other teams
			{ user_id: luna.id, team_id: designSystemTeam.id },
			{ user_id: max.id, team_id: designSystemTeam.id },

			{ user_id: alex.id, team_id: databaseTeam.id },
			{ user_id: felix.id, team_id: databaseTeam.id },
		],
	});

	// Team invites and join requests
	await prisma.teamInvite.create({
		data: {
			team_id: hackathonTeam.id,
			user_id: luna.id,
			status: "pending",
		},
	});

	await prisma.teamJoinRequest.create({
		data: {
			user_id: max.id,
			team_id: projectAlpha.id,
			status: "pending",
		},
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
				sender_id: luna.id,
				receiver_id: testUser.id,
				content: "Can you check the new profile UI later?",
				status_read: false,
			},
			{
				sender_id: alex.id,
				receiver_id: testUser.id,
				content: "I added some notes about the hackathon idea.",
				status_read: false,
			},
		],
	});

	// Team messages
	await prisma.teamMessage.createMany({
		data: [
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
		],
	});

	// Tasks for Project Alpha
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

	// Tasks for Hackathon Team
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

	// Other tasks
	const componentLibrary = await prisma.task.create({
		data: {
			team_id: designSystemTeam.id,
			creator_id: luna.id,
			title: "Create Component Library",
			description: "Build reusable buttons, cards, inputs, and modal components.",
			status: "open",
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

	// Task assignments
	await prisma.taskUser.createMany({
		data: [
			{ user_id: felix.id, task_id: designApiSchema.id },
			{ user_id: testUser.id, task_id: designApiSchema.id },

			{ user_id: felix.id, task_id: implementAuthentication.id },
			{ user_id: testUser.id, task_id: implementAuthentication.id },

			{ user_id: luna.id, task_id: apiDocumentation.id },

			{ user_id: testUser.id, task_id: brainstormIdeas.id },
			{ user_id: max.id, task_id: createPitchDeck.id },
			{ user_id: alex.id, task_id: buildPrototype.id },

			{ user_id: luna.id, task_id: componentLibrary.id },
			{ user_id: alex.id, task_id: prismaQueries.id },
		],
	});

	// File metadata only
	await prisma.file.createMany({
		data: [
			{
				uploader_id: felix.id,
				team_id: projectAlpha.id,
				task_id: designApiSchema.id,
				file_name: "schema.sql",
				file_url: "/uploads/schema.sql",
				file_type: "application/sql",
				file_size: 2500,
			},
			{
				uploader_id: testUser.id,
				team_id: projectAlpha.id,
				task_id: designApiSchema.id,
				file_name: "prisma-schema-draft.prisma",
				file_url: "/uploads/prisma-schema-draft.prisma",
				file_type: "text/plain",
				file_size: 4200,
			},
			{
				uploader_id: max.id,
				team_id: hackathonTeam.id,
				task_id: createPitchDeck.id,
				file_name: "pitch-deck.pdf",
				file_url: "/uploads/pitch-deck.pdf",
				file_type: "application/pdf",
				file_size: 512000,
			},
		],
	});

	// Notifications
	await prisma.notification.createMany({
		data: [
			{
				user_id_trigger: max.id,
				user_id_receiver: testUser.id,
				type: "friend_request",
				entity_id: max.id,
				entity_type: "friend_request",
				content: "Max sent you a friend request.",
			},
			{
				user_id_trigger: felix.id,
				user_id_receiver: testUser.id,
				type: "new_message",
				entity_id: projectAlpha.id,
				entity_type: "team",
				content: "New message in Project Alpha.",
			},
			{
				user_id_trigger: alex.id,
				user_id_receiver: testUser.id,
				type: "new_message",
				entity_id: hackathonTeam.id,
				entity_type: "team",
				content: "New message in Hackathon Team.",
			},
			{
				user_id_trigger: felix.id,
				user_id_receiver: testUser.id,
				type: "task_assigned",
				entity_id: implementAuthentication.id,
				entity_type: "task",
				content: "You were assigned to Implement Authentication.",
			},
			{
				user_id_trigger: testUser.id,
				user_id_receiver: luna.id,
				type: "team_invite",
				entity_id: hackathonTeam.id,
				entity_type: "team",
				content: "You were invited to join Hackathon Team.",
			},
		],
	});

	console.log("Seed completed successfully.");
}

main()
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});