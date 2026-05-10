# Makefile for Transcendence
# Run 'make' with any target to execute the corresponding action

# Build and start website
all: build up

# Create database storage and build containers
build:
	@mkdir -p ${HOME}/data/database
	@docker compose -f ./project/docker-compose.yml build

# Create and start containers
up:
	@docker compose -f ./project/docker-compose.yml up -d --build

# Stop and remove containers and networks
down:
	@docker compose -f ./project/docker-compose.yml down

# Stop containers
stop:
	@docker compose -f ./project/docker-compose.yml stop

# Start containers
start:
	@docker compose -f ./project/docker-compose.yml start

# Stop and remove containers, networks and volumes
clean:
	@docker compose -f ./project/docker-compose.yml down -v

# Danger: Remove ALL Docker containers and images on system. Delete database
fclean: clean
	@echo "WARNING: This will remove ALL Docker containers and images. Even the ones not related to this project. It will also delete the database! Do you wish to continue? (yes/no)"
	@read confirm && if [ "$$confirm" = "yes" ]; then \
		sudo rm -rf ${HOME}/data; \
		docker rm -f $$(docker ps -aq) && docker rmi -f $$(docker images -aq); \
		docker system prune -a --volumes; \
	else \
		echo "Operation canceled."; \
	fi
		
# Rebuild only the frontend container
frontRebuild:
	@docker compose -f ./project/docker-compose.yml build --no-cache frontend
	@docker compose -f ./project/docker-compose.yml up 
	
# Rebuild only the backend container
backRebuild:
	@docker compose -f ./project/docker-compose.yml build --no-cache backend
	@docker compose -f ./project/docker-compose.yml up 
	
# Rebuild only the database container
dataRebuild:
	@docker compose -f ./project/docker-compose.yml build --no-cache postgresql
	@docker compose -f ./project/docker-compose.yml up 
		
# Clean build - removes containers for fresh start
re: clean build up

.PHONY: all build up down stop start clean fclean frontRebuild backRebuild dataRebuild re
