pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/vinaysolaskar/Task_Management'
            }
        }

        stage('Install Trivy') {
            steps {
                sh '''
                sudo apt-get update
                apt-get install -y wget
                sudo wget https://github.com/aquasecurity/trivy/releases/latest/download/trivy_0.48.3_Linux-64bit.deb
                sudo dpkg -i trivy_0.48.3_Linux-64bit.deb
                '''
            }
        }

        stage('Terraform Security Scan') {
            steps {
                sh '''
                trivy config ./terraform
                '''
            }
        }

        stage('Terraform Init') {
            steps {
                sh '''
                cd terraform
                terraform init
                '''
            }
        }

        stage('Terraform Plan') {
            steps {
                sh '''
                cd terraform
                terraform plan
                '''
            }
        }

    }
}