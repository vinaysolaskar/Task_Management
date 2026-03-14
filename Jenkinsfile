pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
        AWS_DEFAULT_REGION    = "us-east-1"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/vinaysolaskar/Task_Management'
            }
        }

        // stage('Install Trivy') {
        //     steps {
        //         sh '''
        //         apt-get update
        //         apt-get install -y wget
        //         wget https://github.com/aquasecurity/trivy/releases/latest/download/trivy_0.48.3_Linux-64bit.deb
        //         dpkg -i trivy_0.48.3_Linux-64bit.deb
        //         '''
        //     }
        // }

        stage('Terraform Security Scan') {
            steps {
                dir('terraform') {
                    sh 'trivy config .'
                }
            }
        }

        stage('Terraform Init') {
            steps {
                dir('terraform') {
                    sh 'terraform init'
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('terraform') {
                    sh 'terraform plan'
                }
            }
        }
    }
}