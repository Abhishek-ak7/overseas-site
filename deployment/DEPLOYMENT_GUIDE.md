# 🚀 BN Overseas Next.js - Complete AWS Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Troubleshooting](#troubleshooting)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [FAQ](#faq)

---

## 🎯 Overview

This guide will help you deploy the **BN Overseas Next.js application** to AWS using **Terraform** (Infrastructure as Code) and **Ansible** (Configuration Management).

### What You'll Get:
- ✅ Production-ready AWS EC2 instance
- ✅ Automated infrastructure provisioning with Terraform
- ✅ Server configuration with Ansible
- ✅ Nginx reverse proxy setup
- ✅ PM2 application management
- ✅ SSL/HTTPS support (Let's Encrypt)
- ✅ Firewall configuration
- ✅ Automated backups and monitoring

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Security Group (Firewall)                             │  │
│  │ - Allow SSH (22)                                      │  │
│  │ - Allow HTTP (80)                                     │  │
│  │ - Allow HTTPS (443)                                   │  │
│  │ - Allow App Port (3000)                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ EC2 Instance (Ubuntu 22.04 LTS)                       │  │
│  │ ┌──────────────────────────────────────────────────┐ │  │
│  │ │ Nginx (Reverse Proxy - Port 80/443)             │ │  │
│  │ └──────────────────────────────────────────────────┘ │  │
│  │                    ↓                                  │  │
│  │ ┌──────────────────────────────────────────────────┐ │  │
│  │ │ Node.js + PM2 (Running Next.js - Port 3000)     │ │  │
│  │ └──────────────────────────────────────────────────┘ │  │
│  │                    ↓                                  │  │
│  │ ┌──────────────────────────────────────────────────┐ │  │
│  │ │ Prisma + SQLite/PostgreSQL (Database)           │ │  │
│  │ └──────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Elastic IP (Static IP Address)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Your Domain (Optional)
    ↓
Route53 DNS / GoDaddy
    ↓
Static IP → Your Next.js App
```

---

## ✅ Prerequisites

### 1. AWS Account Setup
- Create an AWS account at https://aws.amazon.com
- Generate AWS Access Keys:
  - Go to IAM → Users → Your User → Security Credentials
  - Create Access Key (save **Access Key ID** and **Secret Access Key**)

### 2. Local Machine Requirements

#### On Windows:
```powershell
# Install Terraform
choco install terraform  # or download from https://www.terraform.io/downloads

# Install Ansible
pip install ansible

# Install AWS CLI
choco install awscli  # or download from https://aws.amazon.com/cli/

# Install Git
choco install git
```

#### On macOS:
```bash
# Install Terraform
brew install terraform

# Install Ansible
pip install ansible

# Install AWS CLI
brew install awscli

# Install Git
brew install git
```

#### On Linux (Ubuntu):
```bash
# Install Terraform
wget https://releases.hashicorp.com/terraform/1.x.x/terraform_1.x.x_linux_amd64.zip
unzip terraform_1.x.x_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Install Ansible
sudo apt update
sudo apt install -y ansible

# Install AWS CLI
sudo apt install -y awscli

# Install Git
sudo apt install -y git
```

### 3. Configure AWS Credentials

```bash
aws configure
# Enter:
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region: ap-south-1
# Default output format: json
```

### 4. Generate SSH Key Pair

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

# Verify key generation
ls -la ~/.ssh/id_rsa*
```

---

## 🚀 Step-by-Step Deployment

### **Phase 1: Prepare Your Application**

#### Step 1.1: Ensure Next.js App is Production Ready
```bash
cd c:\Users\Admin\Desktop\projects\bnoverseas\bnoverseas-app

# Install dependencies
npm install

# Build the application
npm run build

# Verify build success
ls -la .next/
```

#### Step 1.2: Update Environment Variables
```bash
# Check your .env file
cat .env

# Make sure you have production-ready env variables:
# - DATABASE_URL=your_database_url
# - NEXTAUTH_SECRET=your_secret_key
# - Any API keys you need
```

#### Step 1.3: Push to GitHub (Optional but Recommended)
```bash
git init
git add .
git commit -m "Initial deployment setup"
git remote add origin https://github.com/yourusername/bnoverseas-app.git
git push -u origin main
```

---

### **Phase 2: Configure Terraform**

#### Step 2.1: Navigate to Terraform Directory
```bash
cd c:\Users\Admin\Desktop\projects\bnoverseas\bnoverseas-app\terraform
```

#### Step 2.2: Review and Customize Configuration

**Edit `terraform.tfvars`:**
```hcl
aws_region     = "us-east-1"      # Change region if needed
environment    = "production"
app_name       = "bnoverseas-app"
instance_type  = "t3.micro"        # Free tier eligible
instance_count = 1                  # Can scale to more instances
```

**Available AWS Regions:**
- `ap-south-1` - Mumbai (India)
- `us-east-1` - N. Virginia (USA)
- `eu-west-1` - Ireland (Europe)
- `ap-southeast-1` - Singapore
- `ap-northeast-1` - Tokyo (Japan)

#### Step 2.3: Initialize Terraform
```bash
terraform init

# Output should show:
# Terraform has been successfully configured!
```

#### Step 2.4: Create Terraform Plan
```bash
terraform plan -out=tfplan

# This will show what resources will be created:
# - 1 AWS Key Pair
# - 1 Security Group
# - 1 EC2 Instance
# - 1 Elastic IP
# - 1 IAM Role
# - CloudWatch Logs
```

#### Step 2.5: Review and Apply Terraform
```bash
# Carefully review the plan above

# Apply the configuration
terraform apply tfplan

# Wait 2-5 minutes for infrastructure to be created...

# Output will show:
# instance_ids = [...]
# public_ips = ["13.233.xx.xx"]
# deployment_url = "http://13.233.xx.xx"
```

#### Step 2.6: Get Your Instance IP
```bash
terraform output

# Copy the public_ips value (e.g., 13.233.xx.xx)
```

---

### **Phase 3: Configure Ansible**

#### Step 3.1: Navigate to Ansible Directory
```bash
cd c:\Users\Admin\Desktop\projects\bnoverseas\bnoverseas-app\ansible
```

#### Step 3.2: Update Inventory File

**Edit `inventory.ini`:**
```ini
[nextjs]
13.233.xx.xx ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa ansible_python_interpreter=/usr/bin/python3

[nextjs:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/id_rsa
ansible_python_interpreter=/usr/bin/python3
```

Replace `13.233.xx.xx` with your actual instance IP from Terraform output.

#### Step 3.3: Update Playbook Configuration

**Edit `playbook.yml` - Update these variables at the top:**

```yaml
vars:
  repo_url: "https://github.com/yourusername/your-nextjs-app.git"  # Your GitHub repo
  domain_name: "your-domain.com"  # Your domain (optional)
  node_version: "20"
  # ... other config
```

#### Step 3.4: Test SSH Connection
```bash
# Test if you can SSH into the instance
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# You should see: ubuntu@ip-xxx-xxx-xxx-xxx:~$

# Exit
exit
```

#### Step 3.5: Run Ansible Playbook
```bash
# Run the playbook with verbose output
ansible-playbook -i inventory.ini playbook.yml -v

# Playbook will:
# ✓ Update system packages
# ✓ Install Node.js v20
# ✓ Install Nginx
# ✓ Configure Firewall (UFW)
# ✓ Clone your repository
# ✓ Install npm dependencies
# ✓ Build Next.js app
# ✓ Setup PM2 for process management
# ✓ Configure Nginx as reverse proxy
# ✓ Setup SSL/HTTPS with Let's Encrypt (if domain provided)
# ✓ Setup log rotation

# This typically takes 5-15 minutes depending on your app size
```

---

### **Phase 4: Access Your Application**

#### Step 4.1: Get Your Application URL

**Using Instance IP (Immediate Access):**
```
http://13.233.xx.xx
```

**Using Custom Domain (Recommended for Production):**

1. **Update DNS Records:**
   - Go to your domain provider (GoDaddy, NameCheap, etc.)
   - Create an A record pointing to your Elastic IP: `13.233.xx.xx`
   - Wait for DNS propagation (5-30 minutes)

2. **Setup SSL Certificate:**
   ```bash
   # SSH into your instance
   ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
   
   # Run certbot
   sudo certbot --nginx -d your-domain.com
   
   # Follow the prompts
   ```

3. **Access via HTTPS:**
   ```
   https://your-domain.com
   ```

#### Step 4.2: Verify Application is Running
```bash
# SSH into instance
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# Check PM2 status
pm2 status

# View application logs
pm2 logs --lines 100

# Exit
exit
```

---

## 🔧 Common Operations

### **Restart Application**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
pm2 restart all
exit
```

### **View Application Logs**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
pm2 logs --lines 100
exit
```

### **Update Application (Deploy New Changes)**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
cd /var/www/bnoverseas-app
./scripts/update.sh
exit
```

### **Check System Resources**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
htop

# Press 'q' to exit
exit
```

### **View Nginx Logs**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
sudo tail -f /var/log/nginx/access.log
exit
```

---

## 🆘 Troubleshooting

### **Issue 1: "Permission denied (publickey)" when SSH**

**Solution:**
```bash
# Check key permissions
ls -la ~/.ssh/id_rsa

# Should show: -rw------- (600)
chmod 600 ~/.ssh/id_rsa

# Verify key is added to instance
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx -v
```

### **Issue 2: "Connection refused" or "Connection timed out"**

**Solution:**
```bash
# Wait 2-3 more minutes for instance to fully boot
sleep 120

# Check security group allows SSH (port 22)
# Go to AWS Console → EC2 → Security Groups

# Check if instance is running
aws ec2 describe-instances --region ap-south-1
```

### **Issue 3: Ansible playbook fails - "Failed to connect"**

**Solution:**
```bash
# Update inventory.ini with correct IP
# Verify SSH access first: ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# Run playbook with more verbose output
ansible-playbook -i inventory.ini playbook.yml -vvv
```

### **Issue 4: Application not starting / Port 3000 not responding**

**Solution:**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs

# Try restarting
pm2 restart all

# Check if Node process is running
ps aux | grep node

# Check port 3000
netstat -tulpn | grep 3000

exit
```

### **Issue 5: npm install fails due to missing dependencies**

**Solution:**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

cd /var/www/bnoverseas-app

# Clear npm cache
npm cache clean --force

# Try install again
npm install

# If still fails, check disk space
df -h

exit
```

### **Issue 6: Domain/SSL certificate issues**

**Solution:**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# Check DNS resolution
nslookup your-domain.com

# Manually setup certificate
sudo certbot --nginx -d your-domain.com --force-renewal

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

exit
```

---

## 📊 Monitoring & Maintenance

### **Daily Checks**

```bash
# SSH into instance
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# 1. Check application status
pm2 status

# 2. Check system resources
free -h  # RAM usage
df -h    # Disk space
top -b -n 1 | head -20

# 3. Check logs for errors
pm2 logs --lines 50 --err
```

### **Weekly Maintenance**

```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# Update system packages
sudo apt update
sudo apt upgrade -y

# Check certificate expiry
sudo certbot certificates

# Clean up PM2
pm2 save

exit
```

### **Monthly Tasks**

1. **Backup Database:**
   ```bash
   ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
   cd /var/www/bnoverseas-app
   # Backup Prisma database (if using SQLite)
   sudo cp prisma/dev.db ~/backups/dev.db.backup
   exit
   ```

2. **Review Logs:**
   ```bash
   ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
   sudo tail -100 /var/log/nginx/access.log
   sudo tail -100 /var/log/nginx/error.log
   exit
   ```

3. **Update Dependencies:**
   ```bash
   ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
   cd /var/www/bnoverseas-app
   npm update
   npm run build
   pm2 restart all
   exit
   ```

---

## ❓ FAQ

### **Q1: Can I use this for production?**
**A:** Yes! This setup is production-ready with:
- Security groups (firewall)
- SSL/HTTPS support
- PM2 process management
- Nginx reverse proxy
- Automated monitoring

### **Q2: How much will this cost?**
**A:** 
- **t3.micro**: Free for 12 months (AWS Free Tier)
- **After free tier**: ~$9-15/month for t3.micro
- **Data transfer**: First 1GB/month is free
- **Elastic IP**: Free if instance is running
- **Total estimate**: $0 (first 12 months) → ~$10/month after

### **Q3: Can I scale to multiple instances?**
**A:** Yes! Edit `terraform.tfvars`:
```hcl
instance_count = 3  # Creates 3 instances
```

Then run:
```bash
cd terraform
terraform apply
```

### **Q4: How do I redeploy after making changes?**
**A:** 
```bash
# Option 1: Using update script on instance
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
cd /var/www/bnoverseas-app
./scripts/update.sh

# Option 2: Manually
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
cd /var/www/bnoverseas-app
git pull origin main
npm install
npm run build
pm2 restart all
```

### **Q5: How do I delete everything and stop charges?**
**A:**
```bash
cd terraform
terraform destroy

# Type 'yes' to confirm
```

### **Q6: Can I use a different database?**
**A:** Yes! Update your connection string in `.env`:
- **PostgreSQL**: `DATABASE_URL="postgresql://..."`
- **MySQL**: `DATABASE_URL="mysql://..."`
- **MongoDB**: `DATABASE_URL="mongodb+srv://..."`

Then update on instance:
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
cd /var/www/bnoverseas-app
npm run db:push
pm2 restart all
exit
```

### **Q7: How do I handle environment variables in production?**
**A:** 
1. Create `.env.production` locally
2. Copy to instance:
   ```bash
   scp -i ~/.ssh/id_rsa .env.production ubuntu@13.233.xx.xx:/var/www/bnoverseas-app/
   ```
3. Or update Ansible playbook to manage env vars

### **Q8: Can I use GitHub Actions for CI/CD?**
**A:** Yes! You can create a `.github/workflows/deploy.yml` file that:
1. Builds your Next.js app
2. Tests the build
3. Pushes to your repository
4. Triggers deployment script

Example workflow coming soon!

---

## 📞 Support & Resources

### **Official Documentation:**
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### **Community Help:**
- [Stack Overflow](https://stackoverflow.com/questions/tagged/terraform)
- [AWS Forums](https://forums.aws.amazon.com/)
- [Ansible Community](https://www.ansible.com/community)

### **Useful Commands Reference:**

```bash
# Terraform Commands
terraform init              # Initialize Terraform
terraform plan             # Show planned changes
terraform apply            # Apply changes
terraform destroy          # Destroy infrastructure
terraform output           # Show outputs
terraform state list       # List resources
terraform state show [resource]  # Show resource details
terraform import [resource] [id]  # Import existing resource
terraform fmt              # Format code

# AWS CLI Commands
aws ec2 describe-instances                    # List instances
aws ec2 describe-security-groups              # List security groups
aws ec2 authorize-security-group-ingress      # Add firewall rule
aws ec2 terminate-instances --instance-ids    # Terminate instance

# Ansible Commands
ansible-playbook playbook.yml                 # Run playbook
ansible-playbook playbook.yml -v              # Verbose output
ansible-playbook playbook.yml --check         # Dry run
ansible-inventory -i inventory.ini --list     # List inventory
ansible all -i inventory.ini -m ping          # Test connectivity

# PM2 Commands (on instance)
pm2 status                  # Show all processes
pm2 logs                    # View logs
pm2 logs --err              # View error logs
pm2 restart all             # Restart all processes
pm2 stop all                # Stop all processes
pm2 delete all              # Delete all processes
pm2 save                    # Save PM2 state
pm2 startup                 # Auto-start on reboot

# SSH Commands
ssh -i ~/.ssh/id_rsa ubuntu@[IP]              # Connect to instance
scp -i ~/.ssh/id_rsa file ubuntu@[IP]:/path  # Copy file to instance
ssh -i ~/.ssh/id_rsa ubuntu@[IP] 'command'   # Run remote command
```

---

## 🎓 Presentation Guide for Class

### **Slide 1: Introduction**
- Topic: "Deploying Next.js Apps to AWS using Terraform & Ansible"
- Problem: Manual server setup is time-consuming and error-prone
- Solution: Infrastructure as Code + Configuration Management

### **Slide 2: Architecture Overview**
- Show the architecture diagram
- Explain each component
- Discuss separation of concerns

### **Slide 3: Tools Explanation**
- **Terraform**: "Write, Plan, Create infrastructure"
- **Ansible**: "Automate configuration management"
- **AWS**: "Where it all runs"

### **Slide 4: Live Demo (10-15 minutes)**
```bash
# Step 1: Show Terraform plan
cd terraform
terraform plan

# Step 2: Show Ansible playbook
cat ansible/playbook.yml

# Step 3: Run deployment (pre-recorded if live demo fails)
# terraform apply
# Wait... [or use pre-created instance]

# Step 4: Show running application
# Open browser: http://instance-ip

# Step 5: SSH into instance and show logs
# ssh -i ~/.ssh/id_rsa ubuntu@[IP]
# pm2 status
# pm2 logs
```

### **Slide 5: Benefits**
- ✅ Reproducibility: Same setup, every time
- ✅ Scalability: Add more instances with one command
- ✅ Version control: Infrastructure as code
- ✅ Disaster recovery: Recreate from scratch in minutes
- ✅ Cost tracking: Know what you're spending

### **Slide 6: Cost Analysis**
- Show AWS pricing breakdown
- Free tier benefits
- ROI calculation

### **Slide 7: Troubleshooting & Best Practices**
- Common issues and solutions
- Security best practices
- Performance optimization

### **Slide 8: Q&A**
- Be ready for questions about:
  - Scaling strategies
  - Database options
  - CI/CD integration
  - Cost optimization
  - Security considerations

---

## 📝 Notes for Success

1. **Test Everything Locally First**
   - Run terraform plan before apply
   - Test SSH connection before running Ansible
   - Verify application builds locally

2. **Keep Backups**
   - Export Terraform state regularly
   - Backup your database
   - Version control everything

3. **Monitor Costs**
   - Set up AWS billing alerts
   - Review AWS console regularly
   - Clean up unused resources

4. **Security Matters**
   - Never commit `.env` files
   - Use AWS IAM roles properly
   - Enable AWS CloudTrail for auditing
   - Use SSL/HTTPS always

5. **Plan for Growth**
   - Use auto-scaling groups
   - Setup load balancers
   - Use CDN for static assets
   - Optimize database queries

---

## 🎉 Congratulations!

You now have a production-ready Next.js application running on AWS! 

Next steps:
- Monitor your application performance
- Setup automated backups
- Plan for scaling as traffic grows
- Optimize performance based on metrics

Good luck with your presentation! 🚀

---

**Document Version:** 1.0  
**Last Updated:** November 5, 2025  
**Created For:** BN Overseas Next.js Application  
**Author:** DevOps Team
