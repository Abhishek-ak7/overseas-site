# AWS Provider Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
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

# Data source to fetch the latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Create a key pair (uses SSH key from your home directory)
resource "aws_key_pair" "bnoverseas_key" {
  key_name   = "${var.app_name}-key"
  public_key = file("${pathexpand("~/.ssh/id_rsa.pub")}")
}

# Security Group
resource "aws_security_group" "bnoverseas_sg" {
  name        = "${var.app_name}-sg"
  description = "Security group for BN Overseas Next.js app"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Next.js app port"
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

# EC2 Instance
resource "aws_instance" "bnoverseas_app" {
  count                = var.instance_count
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  key_name             = aws_key_pair.bnoverseas_key.key_name
  security_groups      = [aws_security_group.bnoverseas_sg.name]
  iam_instance_profile = aws_iam_instance_profile.bnoverseas_profile.name

  # Root volume configuration
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true
    encrypted             = true
  }

  # Enable detailed monitoring
  monitoring = true

  tags = {
    Name        = "${var.app_name}-${count.index + 1}"
    Environment = var.environment
  }

  depends_on = [aws_security_group.bnoverseas_sg]
}

# Elastic IP for static public IP
resource "aws_eip" "bnoverseas_eip" {
  count    = var.instance_count
  instance = aws_instance.bnoverseas_app[count.index].id
  domain   = "vpc"

  tags = {
    Name = "${var.app_name}-eip-${count.index + 1}"
  }

  depends_on = [aws_instance.bnoverseas_app]
}

# IAM Role for EC2 (for S3 access, etc.)
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

# IAM Policy for S3 access (if needed for your app)
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

# IAM Instance Profile
resource "aws_iam_instance_profile" "bnoverseas_profile" {
  name = "${var.app_name}-profile"
  role = aws_iam_role.bnoverseas_role.name
}

# CloudWatch Log Group (optional, for monitoring)
resource "aws_cloudwatch_log_group" "bnoverseas_logs" {
  name              = "/aws/ec2/${var.app_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.app_name}-logs"
  }
}

# Outputs
output "instance_ids" {
  description = "EC2 instance IDs"
  value       = aws_instance.bnoverseas_app[*].id
}

output "public_ips" {
  description = "Public IP addresses of EC2 instances"
  value       = aws_eip.bnoverseas_eip[*].public_ip
}

output "elastic_ips" {
  description = "Elastic IP addresses"
  value       = aws_eip.bnoverseas_eip[*].public_ip
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.bnoverseas_sg.id
}

output "ami_id" {
  description = "AMI ID used"
  value       = data.aws_ami.ubuntu.id
}

output "instance_type" {
  description = "Instance type"
  value       = var.instance_type
}

output "deployment_url" {
  description = "URL to access the application"
  value       = "http://${aws_eip.bnoverseas_eip[0].public_ip}"
}
