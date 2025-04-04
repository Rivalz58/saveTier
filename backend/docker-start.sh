#!/bin/bash

# Function to display messages with color
log_info() {
    echo -e "\e[0;36m[INFO] $1\e[0m"
}

log_success() {
    echo -e "\e[0;32m[SUCCESS] $1\e[0m"
}

log_warning() {
    echo -e "\e[0;33m[WARNING] $1\e[0m"
}

log_error() {
    echo -e "\e[0;31m[ERROR] $1\e[0m"
}

# Check if the .env file exists
if [ ! -f ".env" ]; then
    log_error "The .env file does not exist. Please create it before proceeding."
    exit 1
fi
export $(grep -v '^#' .env | xargs)

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or running."
    exit 1
fi

# Build and start containers
log_info "Building and starting containers..."
if docker compose --env-file .env up -d --build; then
    log_success "Containers have been successfully built and started."
else
    log_error "Failed to build or start containers."
    exit 1
fi

# Display container status
log_info "Container status:"
docker compose ps

log_success "Deployment completed successfully!"
