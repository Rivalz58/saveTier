#!/bin/bash

# Function to display messages with color
log_info() {
    echo -e "\e[0;36m[INFO] $1\e[0m"
}

log_success() {
    echo -e "\e[0;32m[SUCCESS] $1\e[0m"
}

log_info "Stopping containers..."
docker stop app-frontend-1

log_info "Removing stopped containers..."
docker container prune -f

log_info "Removing unused images..."
docker image prune -af

# log_info "Removing build..."
# docker builder prune -a -f

log_success "Cleanup completed!"
