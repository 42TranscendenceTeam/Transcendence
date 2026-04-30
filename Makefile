# Makefile for Transcendence Frontend
# Run 'make' with any target to execute the corresponding action

# Build and start frontend
all:
	docker compose up --build

# Clean build - removes containers for fresh start
all-new:
	docker compose down --remove-orphans
	docker compose up --build

# Rebuild only the frontend container
frontRebuild:
	docker compose build --no-cache frontend
	docker compose up -d

# Stop containers
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

.PHONY: all all-new frontRebuild down remove