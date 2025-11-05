# 📊 Class Presentation: Deploying Next.js to AWS with Terraform & Ansible

## Presentation Outline (45-60 minutes)

---

## 🎬 Opening Slide (2 minutes)

### Title: "From Laptop to AWS: Automated Infrastructure Deployment"

**Key Points:**
- Problem: Manual server setup is slow, error-prone, unrepeatable
- Solution: Infrastructure-as-Code (IaC) + Configuration Management
- Today's Goal: Deploy a production-ready Next.js app to AWS in 25 minutes

---

## 📚 Slide 1: What Are We Building? (5 minutes)

### Topic: Application Overview

**Show your BN Overseas app:**
```
📱 Next.js Frontend
├── React Components
├── Server-Side Rendering (SSR)
└── API Routes

💾 Backend
├── Prisma ORM
├── Database (SQLite/PostgreSQL)
└── Authentication

🌍 Hosting
├── AWS EC2 (Virtual Server)
├── Nginx (Web Server)
└── PM2 (Process Manager)
```

**Why this matters:**
- Need scalable, reliable infrastructure
- Manual setup = mistakes
- IaC = reproducibility

---

## 🛠️ Slide 2: The Traditional Way vs Our Way (5 minutes)

### Topic: Traditional vs Infrastructure-as-Code

**Traditional (❌ Bad):**
```
1. Click AWS Console
2. Create EC2 instance manually
3. SSH and install packages
4. Deploy application
5. Configure nginx by hand
6. Setup SSL certificate
⏱️  Time: 1-2 hours
❌ Error-prone
❌ Hard to document
❌ Impossible to reproduce
💰 Hidden costs
```

**Our Way (✅ Good):**
```
1. Write terraform/main.tf
2. Write ansible/playbook.yml
3. Run: terraform apply
4. Run: ansible-playbook
⏱️  Time: 25 minutes
✅ Automated
✅ Documented in code
✅ Reproducible
✅ Version controlled
✅ Trackable costs
```

---

## ⚙️ Slide 3: Introduction to Tools (8 minutes)

### Topic: Terraform vs Ansible

#### **Terraform: "What" (Infrastructure)**

```hcl
# Define infrastructure as code
resource "aws_instance" "app" {
  ami           = "ami-0e999cbd..."
  instance_type = "t3.micro"
  
  tags = {
    Name = "bnoverseas-app"
  }
}
```

**What Terraform Does:**
- Creates virtual servers (EC2)
- Sets up networking (VPC, Security Groups)
- Creates databases, storage (RDS, S3)
- Manages everything via API calls
- Idempotent (safe to run multiple times)

#### **Ansible: "How" (Configuration)**

```yaml
- name: Install Node.js
  apt:
    name: nodejs
    state: present

- name: Start application
  shell: npm start
```

**What Ansible Does:**
- Installs software on servers
- Configures services
- Deploys applications
- Ensures desired state
- Runs on top of Terraform infrastructure

#### **Comparison Table**

| Aspect | Terraform | Ansible |
|--------|-----------|---------|
| Type | Infrastructure | Configuration |
| Language | HCL | YAML |
| Idempotent | Yes | Yes |
| Agentless | Yes | Yes |
| What it creates | Servers, networks | Installed packages, configs |
| Learning curve | Medium | Easy |

---

## 🏗️ Slide 4: Architecture Overview (10 minutes)

### Topic: How It All Fits Together

**Draw the architecture:**

```
                    ┌──────────────────────┐
                    │   Your Browser       │
                    │  http://domain.com   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   AWS EC2 Instance   │
                    │  (Ubuntu 22.04)      │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼─────┐         ┌──────▼──────┐       ┌──────▼──────┐
   │  Nginx    │         │   Node.js   │       │   Firewall  │
   │Port 80/443│         │  + Next.js  │       │   (UFW)     │
   │(Reverse   │         │  Port 3000  │       │             │
   │ Proxy)    │         │   (PM2)     │       │  Rules:     │
   └──────────┘         └──────┬──────┘       │  - SSH 22   │
        │                      │              │  - HTTP 80  │
        │            ┌─────────▼────────┐     │  - HTTPS443 │
        └───────────▶│  Application     │     └─────────────┘
                     │  /var/www/app    │
                     │                  │
                     │  ✓ Built files   │
                     │  ✓ API routes    │
                     │  ✓ Database conn │
                     └──────────┬───────┘
                                │
                     ┌──────────▼────────┐
                     │  Database        │
                     │  (SQLite/PgSQL)  │
                     └──────────────────┘
```

**Key Components:**

1. **Nginx** (Web Server)
   - Listens on port 80 (HTTP) and 443 (HTTPS)
   - Acts as reverse proxy
   - Handles SSL certificates
   - Routes traffic to Node.js

2. **Node.js + Next.js** (Application)
   - Runs on port 3000 (internal)
   - Started by PM2 (process manager)
   - Auto-restarts if crashes
   - Handles API routes and page rendering

3. **Database**
   - SQLite (default, file-based)
   - Or PostgreSQL (recommended for production)
   - Stores application data

4. **Firewall (UFW)**
   - Allows only necessary ports
   - Blocks everything else
   - Security best practice

---

## 💻 Slide 5: Before We Start (5 minutes)

### Topic: Prerequisites Checklist

**What you need:**
- ✅ AWS Account (free tier available)
- ✅ AWS Access Keys configured
- ✅ Terraform installed
- ✅ Ansible installed
- ✅ AWS CLI installed
- ✅ SSH key pair (`ssh-keygen`)

**Quick check command:**
```bash
terraform --version
ansible --version
aws --version
ssh -V
```

**AWS Free Tier includes:**
- 1 year free
- 750 hours/month of t3.micro (smallest instance)
- Perfect for testing and learning!

---

## 🚀 Slide 6: Live Demo Part 1 - Terraform (8 minutes)

### Topic: Provisioning Infrastructure

**Step-by-Step Demo:**

#### Step 1: Initialize Terraform
```bash
cd terraform
terraform init

# Expected output:
# Terraform has been successfully configured!
# [1]
```

#### Step 2: Create Plan
```bash
terraform plan -out=tfplan

# Shows what will be created:
# + aws_instance.bnoverseas_app[0]
# + aws_security_group.bnoverseas_sg
# + aws_eip.bnoverseas_eip[0]
# + aws_iam_role.bnoverseas_role
# + aws_cloudwatch_log_group.bnoverseas_logs
#
# Plan: 8 to add, 0 to change, 0 to destroy
```

**Key Points:**
- Shows exactly what will be created
- Safe way to preview changes
- Can review before applying

#### Step 3: Apply Plan
```bash
terraform apply tfplan

# Processing takes 2-5 minutes...
# Creating aws_key_pair.bnoverseas_key... [OK]
# Creating aws_security_group.bnoverseas_sg... [OK]
# Creating aws_instance.bnoverseas_app[0]... [OK]
# Creating aws_eip.bnoverseas_eip[0]... [OK]
# 
# Outputs:
# deployment_url = "http://13.233.xx.xx"
```

**What just happened:**
- AWS created a virtual server
- Security group (firewall) configured
- Static IP (Elastic IP) assigned
- Everything logged and tracked

#### Step 4: Get Outputs
```bash
terraform output

# deployment_url = "http://13.233.xx.xx"
# public_ips = ["13.233.xx.xx"]
# instance_ids = ["i-0xxxxxxxxxxxx"]
```

**Key Insight:**
- Entire infrastructure created with one command
- Reproducible - same result every time
- Can destroy and recreate in minutes

---

## 🎭 Slide 7: Live Demo Part 2 - Ansible (10 minutes)

### Topic: Configuring the Server

**Step 1: Update Inventory**
```bash
# Edit ansible/inventory.ini
# Change: localhost → 13.233.xx.xx

[nextjs]
13.233.xx.xx ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

**Step 2: Update Playbook**
```bash
# Edit ansible/playbook.yml
# Add your GitHub repo URL
repo_url: "https://github.com/yourusername/bnoverseas-app.git"
domain_name: "your-domain.com"  # optional
```

**Step 3: Wait for Server to be Ready**
```bash
# Server needs 2-3 minutes to fully boot
# Test SSH connection
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# Type 'exit' to disconnect
```

**Step 4: Run Ansible**
```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml -v

# Watch the output as Ansible configures server...
```

**What Ansible is doing (show in real-time):**
```
PLAY [Setup Next.js Application on AWS EC2]
TASK [Update package manager cache]
TASK [Upgrade all packages]
TASK [Install basic dependencies]
  → apt-get install curl wget git build-essential...
TASK [Add Node.js repository]
TASK [Install Node.js and npm]
  → nodejs installed successfully
TASK [Install Nginx]
TASK [Configure Firewall]
TASK [Clone Next.js repository]
  → git clone https://github.com/yourusername/app.git
TASK [Install dependencies]
  → npm install (takes 2-3 minutes)
TASK [Build Next.js application]
  → npm run build (creates .next folder)
TASK [Install PM2]
  → global npm package install
TASK [Configure Nginx]
  → created /etc/nginx/sites-available/nextjs
TASK [Enable Nginx site]
  → ln -s /etc/nginx/sites-available/nextjs /etc/nginx/sites-enabled/
TASK [Reload Nginx]
TASK [Setup SSL with Let's Encrypt]
TASK [Configure log rotation]

✅ PLAY RECAP
localhost : ok=25 changed=19 unreachable=0 failed=0
```

**Total time: 10-15 minutes**

---

## ✅ Slide 8: Verification & Access (5 minutes)

### Topic: Confirm Everything Works

**Step 1: SSH and Check Status**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx

# Check PM2 status
pm2 status

# Output:
# ┌──────────────┬─────┬──────┬──────┬─────────┐
# │ id           │ pid │ mode │ stat │ name    │
# ├──────────────┼─────┼──────┼──────┼─────────┤
# │ 0            │ 1234│ fork │ online│ nextjs  │
# └──────────────┴─────┴──────┴──────┴─────────┘
```

**Step 2: View Application Logs**
```bash
pm2 logs --lines 20

# Shows your application output
# Any errors will be visible here
```

**Step 3: Check Nginx**
```bash
sudo systemctl status nginx

# Should show: active (running)
```

**Step 4: Exit and Access via Browser**
```bash
exit

# Open browser: http://13.233.xx.xx
# Your Next.js application should load!
```

**Success Indicators:**
- ✅ Application loads in browser
- ✅ Navigation works
- ✅ API calls respond
- ✅ No 502 Bad Gateway errors

---

## 📊 Slide 9: Cost Analysis (5 minutes)

### Topic: AWS Pricing & ROI

**Pricing Breakdown (Region: ap-south-1):**

| Service | Free Tier | After 12mo | Annual |
|---------|-----------|-----------|--------|
| EC2 t3.micro | 750 hrs | ~$0.012/hr | $84 |
| Data transfer | 1GB/mo free | $0.09/GB | ~$10 |
| Elastic IP | Free (if in use) | Free | $0 |
| **Monthly** | **$0** | **~$8** | **$94** |

**Comparison with Alternatives:**

| Service | Monthly | Annual | Setup Time |
|---------|---------|--------|-----------|
| AWS t3.micro | $0 (1st yr) | $94 (2nd yr) | 25 min |
| DigitalOcean Droplet | $5 | $60 | Manual |
| Heroku Hobby | $7 | $84 | 10 min |
| Shared Hosting | $2-5 | $30-60 | Manual |
| **Our solution** | **$0** | **$94** | **25 min** |

**Key Benefits:**
- ✅ Free first year
- ✅ Scalable (add more servers as traffic grows)
- ✅ Professional-grade infrastructure
- ✅ Industry standard (what companies use)
- ✅ Learning AWS = valuable skill!

---

## 🔄 Slide 10: Scaling & Updates (5 minutes)

### Topic: Beyond Single Instance

**Scenario 1: Your app gets popular!**

Before (1 server):
```
Users → Server (100% capacity)
```

After (scale to 3 servers):
```
Users → Load Balancer
         ├─ Server 1
         ├─ Server 2
         └─ Server 3
```

**Code change to scale:**
```hcl
# In terraform/terraform.tfvars
instance_count = 3  # Was 1, now 3

# Then:
# terraform plan
# terraform apply
```

Done! Added 2 more servers automatically.

**Scenario 2: Deploy new version**

```bash
# On instance:
cd /var/www/bnoverseas-app
git pull origin main          # Get latest code
npm install                    # Install dependencies
npm run build                  # Build new version
pm2 restart all               # Restart application

# Zero downtime!
```

---

## 🔐 Slide 11: Security & Best Practices (5 minutes)

### Topic: Production-Ready Security

**What We Implemented:**
- ✅ **Firewall (UFW)**: Only open necessary ports
  - Port 22 (SSH) - password less auth only
  - Port 80 (HTTP) - redirects to HTTPS
  - Port 443 (HTTPS) - encrypted traffic
  
- ✅ **SSL/HTTPS**: Let's Encrypt certificates
  - Free, auto-renewing
  - Protects user data
  - Required by modern browsers
  
- ✅ **SSH Key-Based Auth**: No passwords
  - Keys stored locally
  - AWS stores public key only
  - Much more secure than passwords

- ✅ **IAM Roles**: EC2 has specific permissions
  - Access to S3 (if needed)
  - No root credentials exposed
  - Least privilege principle

- ✅ **Process Management**: PM2 auto-restarts
  - If app crashes, restarts automatically
  - Logs all errors
  - No downtime

**Security Checklist:**
- ✅ Security group configured
- ✅ SSH key pair secured (chmod 600)
- ✅ `.env` file not in git
- ✅ Database password secured
- ✅ HTTPS enabled
- ✅ Firewall active
- ✅ Regular backups
- ✅ AWS billing alerts set

---

## 🆘 Slide 12: Troubleshooting Common Issues (3 minutes)

### Topic: When Things Don't Work

**Issue 1: SSH Connection Refused**
```bash
# Wait 2-3 minutes for server to boot completely
# Check security group allows SSH
# Verify IP address is correct
```

**Issue 2: Application not responding**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@13.233.xx.xx
pm2 logs          # Check error logs
pm2 restart all   # Restart application
```

**Issue 3: Nginx 502 Bad Gateway**
```bash
# Application port 3000 not responding
# Check: pm2 status
# View logs: pm2 logs
# Restart: pm2 restart all
```

**Issue 4: Out of disk space**
```bash
df -h                         # Check disk
du -sh /var/www/bnoverseas-app  # Check app size
npm cache clean --force       # Clear cache
```

**Golden Rule:** Always check logs first!
```bash
pm2 logs --err    # See all errors
pm2 status        # See process status
```

---

## 📈 Slide 13: Key Takeaways (3 minutes)

### Topic: What You Learned

**Concepts:**
1. ✅ Infrastructure-as-Code (IaC) advantages
2. ✅ How Terraform works (provision resources)
3. ✅ How Ansible works (configure servers)
4. ✅ Architecture of production web app
5. ✅ AWS basics and pricing
6. ✅ Security best practices

**Skills Gained:**
- Deploy applications professionally
- Understand DevOps practices
- Use industry-standard tools
- Troubleshoot infrastructure
- Scale applications

**This Matters Because:**
- Every company uses IaC now
- AWS knowledge = higher salaries
- Can deploy without manual errors
- Reproducible = saves time
- Professional = impressive to employers

---

## 🎓 Slide 14: Q&A Session (10 minutes)

### Common Questions (Be Ready!)

**Q: How do you handle database backups?**
A: 
```bash
# SQLite: Copy the .db file
cp prisma/dev.db ~/backup-$(date +%Y%m%d).db

# PostgreSQL: Use pg_dump
pg_dump dbname > backup.sql
```

**Q: Can you use this for production with 1000s of users?**
A: Yes! Upgrade instance type and add load balancing:
```hcl
instance_type = "t3.large"    # More powerful
instance_count = 3-5           # Multiple instances
# Add load balancer (AWS ALB)
```

**Q: How do you do CI/CD (automatic deployments)?**
A: Use GitHub Actions:
```yaml
# .github/workflows/deploy.yml
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run build
      - run: ansible-playbook playbook.yml
```

**Q: What if you mess up and need to start over?**
A: Just destroy and recreate:
```bash
terraform destroy          # Delete everything
terraform apply           # Create fresh infrastructure
```

Takes 20 minutes to have a brand new system!

**Q: How do you monitor if the app is down?**
A: 
```bash
# Option 1: Check manually
pm2 status

# Option 2: Setup monitoring
# AWS CloudWatch
# Datadog
# New Relic
```

**Q: Cost: What if I forget to destroy and keep paying?**
A: Set AWS billing alert:
1. AWS Console → Billing
2. Create alert → Set threshold ($10/month)
3. Get email if exceeded

**Q: Can I move from AWS to another cloud later?**
A: Yes! Terraform supports:
- Google Cloud Platform (GCP)
- Microsoft Azure
- DigitalOcean
- etc.

Just change provider!

---

## 🎬 Closing Slide (2 minutes)

### Title: "From Laptop to Production"

**Summary:**
- 25 minutes → Deployed Next.js app
- Scalable infrastructure
- Professional grade security
- Industry standard tools
- ~$100/year cost

**Next Steps (For You):**
1. Try it on your own app
2. Learn more about AWS
3. Explore advanced features (load balancing, auto-scaling)
4. Set up CI/CD pipeline
5. Consider for capstone project

**Key Takeaway:**
> "The ability to provision production infrastructure in 25 minutes is what separates modern developers from the old guard."

**Call to Action:**
"By next week, I want everyone to have deployed an app to AWS. You'll have a live URL to show to friends and family!"

---

## 📋 Demo Checklist

Before presenting, have ready:
- [ ] AWS account logged in
- [ ] Terminal open to project directory
- [ ] Terraform files configured
- [ ] Ansible files configured
- [ ] SSH keys generated
- [ ] AWS credentials configured
- [ ] Instance already created (if doing live demo)
- [ ] Have pre-recorded backup video (in case live demo fails)
- [ ] Backup slides for technical difficulties
- [ ] Have the deployed app URL ready

**Pro Tip:** Pre-create an instance, then during demo just show the app working. Real deployment takes too long for class demo!

---

## 🎥 Presentation Tips

1. **Show, Don't Tell**
   - Live demo > slides
   - Show actual output
   - Show actual app running

2. **Manage Time**
   - 5 min slides (overview)
   - 10 min demo
   - 5 min Q&A

3. **Prepare for Questions**
   - Have examples ready
   - Know your numbers (costs, timing)
   - Be ready to say "good question, let's discuss after"

4. **Make It Relatable**
   - Show real money (cost analysis)
   - Show what happens when things break
   - Show how easily you can fix it

5. **End Strong**
   - Clear call to action
   - Make them want to learn more
   - Show the "wow factor"

---

## 🎓 Grading Criteria (If Applicable)

- ✅ Understanding of IaC concepts
- ✅ Knowledge of tools (Terraform, Ansible, AWS)
- ✅ Correct architecture explanation
- ✅ Working demonstration
- ✅ Ability to answer questions
- ✅ Professional presentation
- ✅ Practical value to audience

---

**Good luck with your presentation! 🚀**

You've got this! 💪
