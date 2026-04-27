# Makefile for Team Task Manager
# Provides convenient commands for building and managing Docker containers
# Run 'make' with any target to execute the corresponding action

# Build and start all services (preserves database)
all:
	docker compose up --build

# Clean build - removes images, containers, and database (fresh start)
all-new:
	docker compose down --rmi all --volumes --remove-orphans
	docker compose up --build

# Stop containers but keep database (data persists)
clean:
	docker compose down --remove-orphans

# Full cleanup - removes images, containers, and database
clean-all:
	docker compose down --rmi all --volumes --remove-orphans

# Rebuild only the frontend container
frontRebuild:
	docker compose build --no-cache frontend
	docker compose up -d

# Rebuild only the backend container
backRebuild:
	docker compose build --no-cache backend
	docker compose up -d

# Stop all services (keeps database)
down:
	docker compose down

# Danger: Remove ALL Docker containers and images on system
remove:
	@echo "WARNING: This will remove ALL Docker containers and images. Even the ones not related to this project. Do you wish to continue? (yes/no)"
	@read confirm && if [ "$$confirm" = "yes" ]; then \
		docker rm -f $$(docker ps -aq) && docker rmi -f $$(docker images -aq); \
	else \
		echo "Operation canceled."; \
	fi

.PHONY: all all-new clean clean-all frontRebuild backRebuild down remove