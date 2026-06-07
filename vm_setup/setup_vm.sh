#!/bin/bash

set -e

echo "=== Inception VM Setup Script ==="
echo ""

if [ -f /etc/debian_version ]; then
    . /etc/os-release
    case "$ID" in
        ubuntu)
            CODENAME="jammy"
            ;;
        debian)
            CODENAME="bookworm"
            ;;
        *)
            echo "Unsupported OS: $ID"
            exit 1
            ;;
    esac
    echo "Detected OS: $ID ($CODENAME)"
else
    echo "This script requires Ubuntu or Debian"
    exit 1
fi

CURRENT_USER=$(whoami)
echo "Detected user: ${CURRENT_USER}"

if command -v docker &> /dev/null; then
    echo "Docker is already installed: $(docker --version)"
    echo "Skipping Docker installation."
else
    echo "Installing Docker..."

    echo "[1/6] Updating system..."
    apt-get update -y
    apt-get upgrade -y

    echo "[2/6] Installing prerequisites..."
    apt-get install -y curl ca-certificates gnupg

    echo "[3/6] Adding Docker GPG key..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/${ID}/gpg -o /tmp/docker.gpg
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg /tmp/docker.gpg
    rm /tmp/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo "[4/6] Adding Docker repository..."
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${CODENAME} stable" > /etc/apt/sources.list.d/docker.list

    echo "[5/6] Installing Docker..."
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    echo "[6/6] Enabling Docker daemon..."
    systemctl enable docker

    echo "Docker installed successfully."
fi

echo ""
echo "Adding all users to docker group..."
for user in $(cut -d: -f1 /etc/passwd); do
    if [ -d "/home/${user}" ] || [ "$user" = "root" ]; then
        if id "$user" &>/dev/null; then
            if groups "$user" | grep -q '\bdocker\b'; then
                echo "User $user is already in docker group."
            else
                sudo usermod -aG docker "$user"
                echo "User $user added to docker group."
            fi
        fi
    fi
done

echo ""
echo "Configuring UFW firewall..."
if ! dpkg -l | grep -q "^ii  openssh-server"; then
    echo "Installing openssh-server..."
    apt-get install -y openssh-server
fi
sudo ufw allow 443/tcp comment 'HTTPS'
echo "y" | ufw enable
sudo ufw status

echo ""
echo "=== VM Setup Complete ==="
echo "Please log out and log back in for docker group to take effect."
echo "Then run 'make build' followed by 'make up' to start the containers."
