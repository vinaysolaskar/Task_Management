provider "aws" {
  region = "ap-south-1"
}

# Secure Security Group
resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Security group for DevSecOps web server"

  # SSH access restricted to admin IP
  ingress {
    description = "Allow SSH from admin machine"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["103.167.75.118/32"]
  }

  # Web application access
  ingress {
    description = "Allow web application access"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic
  egress {
    description = "Allow outbound internet access"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "devsecops-web-sg"
  }
}

# Secure EC2 Instance
resource "aws_instance" "web_server" {
  ami           = "ami-0f5ee92e2d63afc18"
  instance_type = "t2.micro"

  vpc_security_group_ids = [aws_security_group.web_sg.id]

  # Enforce IMDSv2
  metadata_options {
    http_tokens = "required"
  }

  # Encrypt root disk
  root_block_device {
    encrypted   = true
    volume_size = 8
  }

  tags = {
    Name = "devsecops-assignment-server"
  }
}