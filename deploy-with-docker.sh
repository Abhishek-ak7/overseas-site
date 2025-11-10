#!/bin/bash

###############################################################################
# BN Overseas - Docker-based Deployment Script
# Description: Deploy infrastructure using Terraform + Ansible in Docker
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

###############################################################################
# Pre-flight Checks
###############################################################################

info "Starting BN Overseas Docker Deployment"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
fi

# Check if AWS credentials exist
if [ ! -f "$HOME/.aws/credentials" ]; then
    error "AWS credentials not found. Run 'aws configure' first."
fi

# Check if SSH key exists
if [ ! -f "$HOME/.ssh/id_rsa" ]; then
    warning "SSH key not found. Generating one now..."
    ssh-keygen -t rsa -b 4096 -f "$HOME/.ssh/id_rsa" -N ""
    success "SSH key generated"
fi

success "Pre-flight checks passed!"
echo ""

###############################################################################
# Build Docker Image
###############################################################################

info "Building deployment Docker image..."
docker-compose build

success "Docker image built successfully!"
echo ""

###############################################################################
# Terraform Phase
###############################################################################

info "========================================="
info "  PHASE 1: TERRAFORM (Infrastructure)"
info "========================================="
echo ""

info "Initializing Terraform..."
docker-compose run --rm deployment bash -c "cd terraform && terraform init"

info "Planning infrastructure changes..."
docker-compose run --rm deployment bash -c "cd terraform && terraform plan -out=tfplan"

read -p "Do you want to apply these changes? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    warning "Deployment cancelled by user"
    exit 0
fi

info "Applying Terraform configuration..."
docker-compose run --rm deployment bash -c "cd terraform && terraform apply tfplan"

success "Infrastructure created successfully!"
echo ""

###############################################################################
# Get Instance IP
###############################################################################

info "Retrieving instance IP address..."
INSTANCE_IP=$(docker-compose run --rm deployment bash -c "cd terraform && terraform output -raw instance_public_ip" 2>/dev/null)

if [ -z "$INSTANCE_IP" ]; then
    error "Could not retrieve instance IP. Check Terraform output."
fi

success "Instance IP: $INSTANCE_IP"
echo ""

###############################################################################
# Update Ansible Inventory
###############################################################################

info "Updating Ansible inventory with instance IP..."

cat > ansible/inventory.ini << EOF
[webservers]
bnoverseas ansible_host=${INSTANCE_IP}

[webservers:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/id_rsa
ansible_python_interpreter=/usr/bin/python3
EOF

success "Ansible inventory updated!"
echo ""

###############################################################################
# Wait for Instance
###############################################################################

info "Waiting for instance to be ready (SSH)..."
echo "This may take 2-3 minutes..."

for i in {1..30}; do
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i ~/.ssh/id_rsa ubuntu@${INSTANCE_IP} "echo 'ready'" &>/dev/null; then
        success "Instance is ready!"
        break
    fi
    echo -n "."
    sleep 10
done

echo ""

###############################################################################
# Ansible Phase
###############################################################################

info "========================================="
info "  PHASE 2: ANSIBLE (Configuration)"
info "========================================="
echo ""

info "Testing Ansible connectivity..."
docker-compose run --rm deployment bash -c "cd ansible && ansible all -i inventory.ini -m ping"

info "Running Ansible playbook..."
info "This will take 10-15 minutes..."
echo ""

docker-compose run --rm deployment bash -c "cd ansible && ansible-playbook -i inventory.ini playbook.yml -v"

success "Configuration completed successfully!"
echo ""

###############################################################################
# Completion
###############################################################################

info "========================================="
info "  DEPLOYMENT COMPLETE!"
info "========================================="
echo ""
success "Your application is now deployed!"
echo ""
info "Instance IP: ${INSTANCE_IP}"
info "SSH Command: ssh -i ~/.ssh/id_rsa ubuntu@${INSTANCE_IP}"
echo ""

if [ -n "$(grep 'domain_name:' ansible/playbook.yml | grep -v '#')" ]; then
    DOMAIN=$(grep 'domain_name:' ansible/playbook.yml | grep -v '#' | awk '{print $2}' | tr -d '"')
    info "Your app will be available at: https://${DOMAIN}"
    echo ""
    warning "Remember to point your domain's DNS to: ${INSTANCE_IP}"
else
    info "Your app will be available at: http://${INSTANCE_IP}"
fi

echo ""
info "Useful commands:"
echo "  - View logs: docker-compose run --rm deployment bash -c 'ssh -i ~/.ssh/id_rsa ubuntu@${INSTANCE_IP} pm2 logs'"
echo "  - SSH into server: ssh -i ~/.ssh/id_rsa ubuntu@${INSTANCE_IP}"
echo "  - Destroy infrastructure: docker-compose run --rm deployment bash -c 'cd terraform && terraform destroy'"
echo ""

success "Happy deploying! 🚀"