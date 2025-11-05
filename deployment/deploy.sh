#!/bin/bash

# BN Overseas Next.js Deployment Automation Script
# This script automates Terraform + Ansible deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"
ANSIBLE_DIR="$PROJECT_ROOT/ansible"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 BN Overseas Deployment Tool${NC}"
echo -e "${BLUE}========================================${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    local missing_tools=()
    
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    if ! command -v ansible-playbook &> /dev/null; then
        missing_tools+=("ansible")
    fi
    
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws-cli")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing tools: ${missing_tools[*]}${NC}"
        echo -e "${YELLOW}📦 Installation instructions:${NC}"
        echo "  - Terraform: https://www.terraform.io/downloads"
        echo "  - Ansible: pip install ansible"
        echo "  - AWS CLI: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites installed${NC}"
}

# Setup SSH key
setup_ssh_key() {
    echo -e "${YELLOW}🔑 Checking SSH key...${NC}"
    
    SSH_KEY_PATH="$HOME/.ssh/id_rsa"
    SSH_PUB_KEY_PATH="$HOME/.ssh/id_rsa.pub"
    
    if [ ! -f "$SSH_KEY_PATH" ] || [ ! -f "$SSH_PUB_KEY_PATH" ]; then
        echo -e "${YELLOW}🔨 Generating SSH key pair...${NC}"
        mkdir -p "$HOME/.ssh"
        ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N ""
        chmod 600 "$SSH_KEY_PATH"
        chmod 644 "$SSH_PUB_KEY_PATH"
        echo -e "${GREEN}✅ SSH key generated${NC}"
    else
        echo -e "${GREEN}✅ SSH key found${NC}"
    fi
}

# Initialize Terraform
init_terraform() {
    echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
    cd "$TERRAFORM_DIR"
    terraform init
    echo -e "${GREEN}✅ Terraform initialized${NC}"
}

# Plan deployment
plan_deployment() {
    echo -e "${YELLOW}📊 Planning Terraform changes...${NC}"
    cd "$TERRAFORM_DIR"
    terraform plan -out=tfplan
    echo -e "${GREEN}✅ Plan complete${NC}"
}

# Apply Terraform
apply_terraform() {
    echo -e "${YELLOW}⚙️  Applying Terraform configuration...${NC}"
    cd "$TERRAFORM_DIR"
    terraform apply tfplan
    echo -e "${GREEN}✅ Infrastructure deployed${NC}"
}

# Get instance IP
get_instance_ip() {
    echo -e "${YELLOW}📍 Retrieving instance IP...${NC}"
    cd "$TERRAFORM_DIR"
    INSTANCE_IP=$(terraform output -raw public_ips | head -n 1 | tr -d '\n')
    echo -e "${GREEN}✅ Instance IP: $INSTANCE_IP${NC}"
}

# Wait for instance to be ready
wait_for_instance() {
    echo -e "${YELLOW}⏳ Waiting for instance to be ready...${NC}"
    
    SSH_KEY_PATH="$HOME/.ssh/id_rsa"
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 -i "$SSH_KEY_PATH" ubuntu@"$INSTANCE_IP" "echo 'Instance is ready'" 2>/dev/null; then
            echo -e "${GREEN}✅ Instance is ready${NC}"
            return 0
        fi
        echo "  Attempt $attempt/$max_attempts..."
        sleep 10
        ((attempt++))
    done
    
    echo -e "${RED}❌ Instance failed to become ready${NC}"
    return 1
}

# Update Ansible inventory
update_inventory() {
    echo -e "${YELLOW}📝 Updating Ansible inventory...${NC}"
    
    cat > "$ANSIBLE_DIR/inventory.ini" << EOF
[nextjs]
$INSTANCE_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa ansible_python_interpreter=/usr/bin/python3

[nextjs:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/id_rsa
ansible_python_interpreter=/usr/bin/python3
EOF
    
    echo -e "${GREEN}✅ Inventory updated with $INSTANCE_IP${NC}"
}

# Run Ansible
run_ansible() {
    echo -e "${YELLOW}🎭 Running Ansible playbook...${NC}"
    
    # Before running, update the repo URL in playbook
    read -p "Enter your GitHub repository URL (or press Enter to skip): " REPO_URL
    if [ ! -z "$REPO_URL" ]; then
        # Update playbook with actual repo URL
        sed -i.bak "s|repo_url:.*|repo_url: \"$REPO_URL\"|g" "$ANSIBLE_DIR/playbook.yml"
    fi
    
    read -p "Enter your domain name (or press Enter for IP-based access): " DOMAIN_NAME
    if [ ! -z "$DOMAIN_NAME" ]; then
        sed -i.bak "s|domain_name:.*|domain_name: \"$DOMAIN_NAME\"|g" "$ANSIBLE_DIR/playbook.yml"
    fi
    
    cd "$ANSIBLE_DIR"
    ansible-playbook -i inventory.ini playbook.yml -v
    
    echo -e "${GREEN}✅ Ansible playbook executed${NC}"
}

# Display deployment info
display_summary() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}✅ Deployment Complete!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${YELLOW}📋 Deployment Information:${NC}"
    echo "  Instance IP: $INSTANCE_IP"
    echo "  Application URL: http://$INSTANCE_IP"
    echo "  SSH Access: ssh -i ~/.ssh/id_rsa ubuntu@$INSTANCE_IP"
    echo ""
    echo -e "${YELLOW}📚 Next Steps:${NC}"
    echo "  1. Point your domain to: $INSTANCE_IP"
    echo "  2. Update Ansible playbook with your GitHub repo URL"
    echo "  3. Monitor logs: pm2 logs"
    echo "  4. Update app: ./scripts/update.sh"
    echo ""
    echo -e "${YELLOW}📞 Support:${NC}"
    echo "  Terraform Docs: https://www.terraform.io/docs"
    echo "  Ansible Docs: https://docs.ansible.com"
    echo "  AWS Docs: https://docs.aws.amazon.com"
    echo -e "${BLUE}========================================${NC}"
}

# Main flow
main() {
    check_prerequisites
    setup_ssh_key
    
    echo ""
    echo -e "${YELLOW}Choose deployment mode:${NC}"
    echo "1) Full deployment (Terraform + Ansible)"
    echo "2) Terraform only (infrastructure)"
    echo "3) Ansible only (configuration)"
    echo "4) Destroy infrastructure"
    read -p "Enter choice (1-4): " choice
    
    case $choice in
        1)
            init_terraform
            plan_deployment
            read -p "Do you want to proceed with deployment? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                apply_terraform
                get_instance_ip
                wait_for_instance
                update_inventory
                run_ansible
                display_summary
            else
                echo -e "${YELLOW}Deployment cancelled${NC}"
            fi
            ;;
        2)
            init_terraform
            plan_deployment
            read -p "Do you want to proceed? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                apply_terraform
                get_instance_ip
                echo -e "${GREEN}✅ Infrastructure deployed at: $INSTANCE_IP${NC}"
            fi
            ;;
        3)
            read -p "Enter instance IP: " INSTANCE_IP
            update_inventory
            run_ansible
            ;;
        4)
            cd "$TERRAFORM_DIR"
            read -p "Are you sure you want to destroy all infrastructure? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                terraform destroy
                echo -e "${GREEN}✅ Infrastructure destroyed${NC}"
            fi
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
}

# Run main
main "$@"
