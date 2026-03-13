provider "aws" {
  region = "ap-south-1"
}

resource "aws_security_group" "web_sg" {
  name = "web-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]   # INTENTIONAL VULNERABILITY
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "web_server" {
  ami           = "ami-0f5ee92e2d63afc18"
  instance_type = "t2.micro"

  security_groups = [aws_security_group.web_sg.name]

  tags = {
    Name = "devsecops-assignment-server"
  }
}