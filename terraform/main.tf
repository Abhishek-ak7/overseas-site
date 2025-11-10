###############################################
# 🌍 Terraform AWS Configuration - BN Overseas
###############################################

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

###############################################
# 🔧 Provider Configuration
###############################################

provider "aws" {
  region                   = "ap-south-1"
  shared_credentials_files  = ["/root/.aws/credentials"]
}

###############################################
# 🔢 Variables
###############################################

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "bnoverseas-app"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "instance_count" {
  description = "Number of EC2 instances"
  type        = number
  default     = 1
}

variable "key_name" {
  description = "Existing AWS key pair name"
  type        = string
  default     = "aws-key"
}

###############################################
# 📦 Fetch Latest Ubuntu 22.04 AMI
###############################################

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Ubuntu)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

###############################################
# 🧱 Security Group
###############################################

resource "aws_security_group" "bnoverseas_sg" {
  name        = "${var.app_name}-sg"
  description = "Security group for BN Overseas app"

  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS access"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Next.js app port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-sg"
  }
}

###############################################
# 🔐 IAM Role / Policy / Instance Profile
###############################################

resource "aws_iam_role" "bnoverseas_role" {
  name = "${var.app_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "bnoverseas_s3_policy" {
  name = "${var.app_name}-s3-policy"
  role = aws_iam_role.bnoverseas_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "bnoverseas_profile" {
  name = "${var.app_name}-profile"
  role = aws_iam_role.bnoverseas_role.name
}

###############################################
# 💻 EC2 Instance
###############################################

resource "aws_instance" "bnoverseas_app" {
  count                  = var.instance_count
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.bnoverseas_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.bnoverseas_profile.name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true
    encrypted             = true
  }

  monitoring = true

  tags = {
    Name        = "${var.app_name}-${count.index + 1}"
    Environment = var.environment
  }

  depends_on = [aws_security_group.bnoverseas_sg]
}

###############################################
# 🌐 Elastic IP (Static IP)
###############################################

resource "aws_eip" "bnoverseas_eip" {
  count    = var.instance_count
  instance = aws_instance.bnoverseas_app[count.index].id
  domain   = "vpc"

  tags = {
    Name = "${var.app_name}-eip-${count.index + 1}"
  }
}

###############################################
# 📊 CloudWatch Logs
###############################################

resource "aws_cloudwatch_log_group" "bnoverseas_logs" {
  name              = "/aws/ec2/${var.app_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.app_name}-logs"
  }
}

###############################################
# 📤 Outputs
###############################################

output "instance_ids" {
  value = aws_instance.bnoverseas_app[*].id
}

output "public_ips" {
  value = aws_eip.bnoverseas_eip[*].public_ip
}

output "deployment_url" {
  value = "http://${aws_eip.bnoverseas_eip[0].public_ip}"
}
