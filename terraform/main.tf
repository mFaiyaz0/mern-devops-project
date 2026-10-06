terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Get the default VPC
data "aws_vpc" "default" {
  default = true
}

# Get available subnets in the default VPC
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security group
resource "aws_security_group" "mern_sg" {
  name        = "launch-wizard-1"
  description = "launch-wizard-1 created 2026-09-14T16:37:04.585Z"
  vpc_id      = data.aws_vpc.default.id

  # SSH
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend / Nginx
  ingress {
    description = "Frontend HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend
  ingress {
    description = "Backend"
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "mern-devops-sg"
  }
}

# EC2 instance
resource "aws_instance" "mern_server" {
  # Pin the exact AMI currently used by the running EC2
  ami           = "ami-006f82a1d5a27da54"
  instance_type = var.instance_type
  key_name      = var.key_name

  # Keep the existing subnet
  subnet_id = "subnet-09e27553d3d808cb5"

  vpc_security_group_ids = [
    aws_security_group.mern_sg.id
  ]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "mern-devops-server"
  }
}