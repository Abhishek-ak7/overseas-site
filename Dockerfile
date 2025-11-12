# Dockerfile for Terraform + Ansible deployment environment
FROM ubuntu:22.04

# Prevent interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive
ENV TERRAFORM_VERSION=1.6.6
ENV ANSIBLE_VERSION=2.15.8

# Install base dependencies
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
    && rm -rf /var/lib/apt/lists/*

# Install Terraform
RUN wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
    && unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
    && mv terraform /usr/local/bin/ \
    && rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# Install Ansible Core + AWS SDKs + Community Collection
RUN pip3 install --no-cache-dir \
    ansible-core==${ANSIBLE_VERSION} \
    boto3==1.34.0 \
    botocore==1.34.0 \
 && ansible-galaxy collection install community.general

# Create working directory
WORKDIR /workspace

# Create directories for SSH keys and AWS credentials
RUN mkdir -p /root/.ssh /root/.aws

# Set proper permissions
RUN chmod 700 /root/.ssh

# Add helpful aliases
RUN echo 'alias tf="terraform"' >> /root/.bashrc \
    && echo 'alias ap="ansible-playbook"' >> /root/.bashrc

# Default command
CMD ["/bin/bash"]
