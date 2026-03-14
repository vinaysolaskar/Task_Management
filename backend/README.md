# DevSecOps Secure Deployment Pipeline

## Project Overview

This project demonstrates a DevSecOps pipeline where infrastructure vulnerabilities are detected and fixed before deploying an application to the cloud.

The pipeline integrates security scanning, AI remediation, and automated infrastructure deployment.

Technologies used:
- Docker
- Jenkins
- Terraform
- Trivy
- AWS EC2

---

## Architecture

The following architecture was implemented.

Developer → GitHub → Jenkins Pipeline → Trivy Security Scan → AI Vulnerability Fix → Terraform → AWS EC2 → Docker Container → Backend Application

---

## Pipeline Workflow

1. Code pushed to GitHub repository
2. Jenkins pipeline triggered
3. Trivy scans Terraform code for vulnerabilities
4. AI analyzes the vulnerabilities and suggests fixes
5. Terraform provisions AWS infrastructure
6. Docker container runs the backend application

---

## Security Vulnerabilities Identified

The Trivy scan identified several issues:

1. SSH open to the internet (0.0.0.0/0)
2. Instance metadata service not enforced
3. Disk encryption not enabled
4. Security group rules missing descriptions

---

## Security Fixes Implemented

The following fixes were applied:

- Restricted SSH access to specific IP
- Enforced IMDSv2
- Enabled encrypted root block device
- Added security rule descriptions

---

## Deployment

The application was deployed on an AWS EC2 instance using Docker.

Steps performed:

1. Launch EC2 using Terraform
2. SSH into instance
3. Install Docker
4. Build Docker image
5. Run container
