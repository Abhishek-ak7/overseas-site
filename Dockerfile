# ------------------------------------------------------------
# 🐳 Dockerfile for Terraform + Ansible + AWS CLI Environment
# Author: Abhishek Kumar
# ------------------------------------------------------------
FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV TERRAFORM_VERSION=1.6.6
ENV ANSIBLE_VERSION=2.15.8

# ------------------------------------------------------------
# Install base dependencies
# ------------------------------------------------------------
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    openssh-client \
    python3 \
    python3-pip \
    software-properties-common \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------
# Install Terraform
# ------------------------------------------------------------
RUN wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
    && unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
    && mv terraform /usr/local/bin/ \
    && rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

# ------------------------------------------------------------
# Install AWS CLI v2
# ------------------------------------------------------------
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# ------------------------------------------------------------
# Install Ansible Core + AWS SDK for Python
# ------------------------------------------------------------
RUN pip3 install --no-cache-dir \
    ansible-core==${ANSIBLE_VERSION} \
    boto3 \
    botocore
    
# Install Ansible collections
RUN ansible-galaxy collection install community.general

# ------------------------------------------------------------
# Setup working environment
# ------------------------------------------------------------
WORKDIR /workspace

# Create directories for SSH and AWS credentials
RUN mkdir -p /root/.ssh /root/.aws && chmod 700 /root/.ssh

# Add Terraform and Ansible aliases for convenience
RUN echo 'alias tf="terraform"' >> /root/.bashrc \
    && echo 'alias ap="ansible-playbook"' >> /root/.bashrc

# ------------------------------------------------------------
# Verify installations (optional but helpful during build)
# ------------------------------------------------------------
RUN terraform -v && ansible --version && aws --version

# Default command
CMD ["/bin/bash"]
