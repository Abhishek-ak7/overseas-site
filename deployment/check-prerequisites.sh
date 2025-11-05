#!/bin/bash

# BN Overseas - Quick Deployment Checker
# Run this to verify all prerequisites are installed

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   BN Overseas - Prerequisites Checker      ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Counter
PASSED=0
FAILED=0

# Check function
check_tool() {
    local tool=$1
    local command=$2
    local install_url=$3
    
    if command -v $command &> /dev/null; then
        version=$($command --version 2>&1 | head -n 1)
        echo -e "${GREEN}✅ $tool${NC}"
        echo "   Version: $version"
        ((PASSED++))
    else
        echo -e "${RED}❌ $tool NOT FOUND${NC}"
        echo "   Install: $install_url"
        ((FAILED++))
    fi
    echo ""
}

# Check tools
check_tool "Terraform" "terraform" "https://www.terraform.io/downloads"
check_tool "Ansible" "ansible-playbook" "pip install ansible"
check_tool "AWS CLI" "aws" "https://aws.amazon.com/cli/"
check_tool "Git" "git" "https://git-scm.com/downloads"
check_tool "SSH" "ssh" "https://www.openssh.com/"

# Check SSH keys
echo -e "${BLUE}Checking SSH Keys...${NC}"
if [ -f ~/.ssh/id_rsa ] && [ -f ~/.ssh/id_rsa.pub ]; then
    echo -e "${GREEN}✅ SSH Keys Found${NC}"
    echo "   Location: ~/.ssh/id_rsa"
    ((PASSED++))
else
    echo -e "${RED}❌ SSH Keys NOT FOUND${NC}"
    echo "   Generate: ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N \"\""
    ((FAILED++))
fi
echo ""

# Check AWS credentials
echo -e "${BLUE}Checking AWS Credentials...${NC}"
if aws sts get-caller-identity &> /dev/null; then
    account_id=$(aws sts get-caller-identity --query 'Account' --output text)
    echo -e "${GREEN}✅ AWS Configured${NC}"
    echo "   Account ID: $account_id"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  AWS NOT Configured${NC}"
    echo "   Setup: aws configure"
    echo "   Then enter your Access Key ID and Secret Access Key"
    ((FAILED++))
fi
echo ""

# Summary
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All prerequisites are installed!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Review terraform/terraform.tfvars"
    echo "  2. Run: cd terraform && terraform plan"
    echo "  3. Review: terraform apply"
    echo "  4. Update ansible/inventory.ini with instance IP"
    echo "  5. Run: cd ansible && ansible-playbook -i inventory.ini playbook.yml"
    echo ""
    echo "  For detailed steps, see: deployment/DEPLOYMENT_GUIDE.md"
else
    echo -e "${RED}❌ Some prerequisites are missing!${NC}"
    echo ""
    echo -e "${YELLOW}Please install the missing tools above.${NC}"
fi

echo ""
