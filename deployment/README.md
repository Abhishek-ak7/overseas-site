# 🎯 BN Overseas AWS Deployment Setup

Complete Infrastructure-as-Code setup for deploying Next.js application to AWS using Terraform + Ansible.

## 📁 Directory Structure

```
bnoverseas-app/
├── terraform/                 # Infrastructure as Code
│   ├── main.tf               # Terraform configuration
│   ├── terraform.tfvars      # Variables (customize this)
│   └── .gitignore            # Don't commit state files
│
├── ansible/                  # Configuration Management
│   ├── playbook.yml          # Main playbook (customize repo URL & domain)
│   ├── inventory.ini         # Host inventory (update with instance IP)
│   ├── ansible.cfg           # Ansible configuration
│   └── .gitignore
│
└── deployment/               # Deployment documentation & scripts
    ├── DEPLOYMENT_GUIDE.md   # 📖 MAIN GUIDE - READ THIS FIRST!
    ├── QUICK_START.md        # ⚡ Quick reference
    ├── deploy.sh             # Linux/Mac deployment script
    ├── deploy.bat            # Windows batch script
    ├── check-prerequisites.sh # Verify all tools installed
    └── ENV_TEMPLATE.md       # Environment variables template
```

## 🚀 Quick Start (30 seconds)

```bash
# 1. Install prerequisites (Terraform, Ansible, AWS CLI)
# 2. Configure AWS: aws configure
# 3. Read the guide:
cat deployment/DEPLOYMENT_GUIDE.md

# 4. Deploy in 5 steps:
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
# Copy instance IP

# 5. Configure Ansible with the IP and deploy:
cd ../ansible
# Edit inventory.ini with instance IP
# Edit playbook.yml with your GitHub repo URL
ansible-playbook -i inventory.ini playbook.yml -v
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **DEPLOYMENT_GUIDE.md** | 📖 Complete step-by-step guide with troubleshooting |
| **QUICK_START.md** | ⚡ Fast reference for experienced users |
| **ENV_TEMPLATE.md** | 🔑 Environment variables template |

## ✅ Checklist Before Deployment

- [ ] AWS account created and Access Keys generated
- [ ] AWS CLI installed and configured
- [ ] Terraform installed
- [ ] Ansible installed
- [ ] SSH key pair generated (`ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""`)
- [ ] GitHub repository created (optional but recommended)
- [ ] Read `deployment/DEPLOYMENT_GUIDE.md`

## 🛠️ What Gets Created

### Infrastructure (Terraform)
✅ EC2 Instance (Ubuntu 22.04 LTS)  
✅ Security Group (Firewall)  
✅ Elastic IP (Static IP)  
✅ IAM Role (for S3 access)  
✅ CloudWatch Logs  
✅ Key Pair (SSH access)  

### Configuration (Ansible)
✅ Node.js v20  
✅ Nginx (Reverse Proxy)  
✅ PM2 (Process Manager)  
✅ SSL/HTTPS (Let's Encrypt)  
✅ Firewall (UFW)  
✅ Application deployment  
✅ Automated backups  
✅ Log rotation  

## 💰 Estimated Costs

| Period | Cost |
|--------|------|
| First 12 months | **$0** (AWS Free Tier) |
| After free tier | ~$10-15/month (t3.micro) |

## ⏱️ Time to Deploy

- Terraform: 3-5 minutes
- Ansible: 10-15 minutes
- **Total: ~20-25 minutes**

## 🔑 Customization

### Change AWS Region
Edit `terraform/terraform.tfvars`:
```hcl
aws_region = "us-east-1"  # Change to your preferred region
```

Available regions:
- `ap-south-1` (Mumbai)
- `us-east-1` (N. Virginia)
- `eu-west-1` (Ireland)
- `ap-southeast-1` (Singapore)

### Change Instance Type
Edit `terraform/terraform.tfvars`:
```hcl
instance_type = "t3.small"  # For more performance
```

### Scale to Multiple Instances
Edit `terraform/terraform.tfvars`:
```hcl
instance_count = 3  # Creates 3 instances
```

### Update GitHub Repository
Edit `ansible/playbook.yml`:
```yaml
repo_url: "https://github.com/yourusername/your-repo.git"
```

### Configure Custom Domain
Edit `ansible/playbook.yml`:
```yaml
domain_name: "your-domain.com"
```

## 🚀 Deployment Commands

```bash
# Initialize
cd terraform
terraform init

# Plan (see what will be created)
terraform plan -out=tfplan

# Apply (create infrastructure)
terraform apply tfplan

# Get instance IP
terraform output

# Destroy (delete everything)
terraform destroy
```

## 🎓 For Your Class Presentation

The DEPLOYMENT_GUIDE.md includes a dedicated "Presentation Guide for Class" section with:
- Slide outline suggestions
- Demo steps
- Key talking points
- Q&A preparation

## 📞 Support

### Common Issues
See `DEPLOYMENT_GUIDE.md` → Troubleshooting section

### Useful Commands
```bash
# SSH into instance
ssh -i ~/.ssh/id_rsa ubuntu@[IP]

# Check app status
pm2 status

# View logs
pm2 logs

# Restart app
pm2 restart all

# Update app
cd /var/www/bnoverseas-app
./scripts/update.sh
```

## 🔐 Security Notes

- ✅ Never commit `.env` files with secrets
- ✅ Use AWS IAM roles instead of access keys when possible
- ✅ Enable SSL/HTTPS for production
- ✅ Regularly update packages
- ✅ Keep backups of your database
- ✅ Monitor AWS billing and set cost alerts

## 📖 Next Steps

1. **Read the full guide:**
   ```bash
   cat deployment/DEPLOYMENT_GUIDE.md
   ```

2. **Verify prerequisites:**
   ```bash
   bash deployment/check-prerequisites.sh
   ```

3. **Customize configuration:**
   - Edit `terraform/terraform.tfvars`
   - Edit `ansible/playbook.yml`
   - Edit `ansible/inventory.ini`

4. **Deploy:**
   ```bash
   cd terraform && terraform apply tfplan
   ```

5. **Monitor:**
   - SSH into instance
   - Check `pm2 logs`
   - Verify Nginx config

## 🎯 Architecture

```
Internet
   ↓
Route53 / Domain DNS
   ↓
Nginx (Port 80/443)
   ↓
Node.js + Next.js (Port 3000)
   ↓
Database (SQLite/PostgreSQL/MySQL)
```

## 🤝 Contributing

To improve this setup, please:
1. Test thoroughly
2. Document changes
3. Update version numbers
4. Submit improvements

## 📄 License

This deployment setup is provided as-is for the BN Overseas project.

---

## ✨ Summary

You now have:
- ✅ Production-ready infrastructure code (Terraform)
- ✅ Automated server configuration (Ansible)
- ✅ Comprehensive deployment guide
- ✅ Quick reference documentation
- ✅ Troubleshooting guide
- ✅ Presentation-ready materials

**Everything needed to deploy your Next.js app to AWS professionally!**

---

**Questions?** See `deployment/DEPLOYMENT_GUIDE.md`

**Ready to deploy?** See `deployment/QUICK_START.md`

Happy deploying! 🚀
