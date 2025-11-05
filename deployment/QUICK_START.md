# Quick Start Guide - BN Overseas AWS Deployment

## ⚡ 5-Minute Setup

### Prerequisites Checklist
- [ ] AWS Account created
- [ ] AWS Access Keys generated
- [ ] AWS CLI configured (`aws configure`)
- [ ] Terraform installed
- [ ] Ansible installed
- [ ] SSH key generated (`ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""`)
- [ ] GitHub repo URL ready (optional but recommended)

---

## 🚀 Quick Deployment (Copy-Paste)

### Step 1: Configure AWS
```powershell
# Windows PowerShell
aws configure
# Enter:
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region name: ap-south-1
# Default output format: json
```

### Step 2: Deploy Infrastructure
```bash
cd c:\Users\Admin\Desktop\projects\bnoverseas\bnoverseas-app\terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Wait 3-5 minutes...
# Copy the instance IP from output
```

### Step 3: Get Instance IP
```bash
# Get your instance IP
terraform output

# Output will show something like:
# public_ips = ["13.233.xx.xx"]
```

### Step 4: Update Ansible
```bash
# Edit ansible/inventory.ini
# Replace "localhost" with your instance IP (13.233.xx.xx)

# Find and replace:
# FROM: localhost ansible_connection=local
# TO: 13.233.xx.xx ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

### Step 5: Update Ansible Playbook
```bash
# Edit ansible/playbook.yml
# Update these variables:
# - repo_url: "https://github.com/yourusername/bnoverseas-app.git"
# - domain_name: "your-domain.com"  (or leave as "your-domain.com" for IP-based access)
```

### Step 6: Deploy with Ansible
```bash
cd c:\Users\Admin\Desktop\projects\bnoverseas\bnoverseas-app\ansible
ansible-playbook -i inventory.ini playbook.yml -v

# Wait 10-15 minutes for configuration...
```

### Step 7: Access Your App
```
http://13.233.xx.xx
```

✅ **Done!** Your app is live!

---

## 🔍 Verify Everything Works

```bash
# 1. SSH into instance
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# 2. Check app is running
pm2 status

# 3. View logs
pm2 logs --lines 20

# 4. Check Nginx
sudo systemctl status nginx

# 5. Exit
exit
```

---

## 📱 On Your Phone
Open browser and go to: `http://13.233.xx.xx`

---

## 💰 How Much Will It Cost?

| Item | Cost |
|------|------|
| t3.micro EC2 (12 months) | **FREE** (AWS Free Tier) |
| t3.micro EC2 (after 12 months) | ~$9/month |
| Data transfer (first 1GB/month) | FREE |
| Elastic IP | FREE (if instance running) |
| **Total (Year 1)** | **$0** |
| **Total (Year 2+)** | **~$10-15/month** |

---

## 🛑 Stop Charges (Delete Everything)

```bash
cd c:\Users\Admin\Desktop\projects\bnoverseas\bnoverseas-app\terraform
terraform destroy
# Type 'yes' to confirm
```

---

## ⏱️ Timing Breakdown

| Task | Time |
|------|------|
| Terraform init | 1-2 min |
| Terraform apply | 3-5 min |
| Waiting for SSH | 2-3 min |
| Ansible playbook | 10-15 min |
| **Total** | **~20-25 min** |

---

## 📞 Stuck? Common Issues

| Issue | Solution |
|-------|----------|
| "Permission denied" SSH | Check: `chmod 600 ~/.ssh/id_rsa` |
| Instance won't start | Wait 3 minutes and try again |
| Ansible fails to connect | Verify instance IP in inventory.ini |
| App shows blank page | Check: `pm2 logs` on instance |
| Port already in use | Different instance or restart PM2 |

---

## 🔗 Useful Links

- Terraform outputs: `cd terraform && terraform output`
- Instance logs: `ssh -i ~/.ssh/id_rsa ubuntu@[IP] && pm2 logs`
- AWS Console: https://console.aws.amazon.com
- Stop costs: `cd terraform && terraform destroy`

---

## 📚 Full Documentation
See `DEPLOYMENT_GUIDE.md` for complete step-by-step instructions.

---

**Need Help?** Check DEPLOYMENT_GUIDE.md → Troubleshooting section
