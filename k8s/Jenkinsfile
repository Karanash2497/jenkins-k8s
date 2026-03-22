pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        ECR_REPO       = '992382473180.dkr.ecr.ap-south-1.amazonaws.com/jenkins-k8s'
        IMAGE_TAG      = "build-${BUILD_NUMBER}"
        KUBECONFIG     = '/var/lib/jenkins/.kube/config'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Pulling latest code...'
                checkout scm
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'node test.js'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                sh '''
                    docker build -t $ECR_REPO:$IMAGE_TAG .
                    docker tag $ECR_REPO:$IMAGE_TAG $ECR_REPO:latest
                    echo "Built: $ECR_REPO:$IMAGE_TAG"
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                echo 'Pushing to ECR...'
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS \
                    --password-stdin $ECR_REPO
                    docker push $ECR_REPO:$IMAGE_TAG
                    docker push $ECR_REPO:latest
                    echo "Pushed successfully"
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Minikube...'
                sh '''
                    # Update image in deployment yaml
                    sed -i "s|IMAGE_PLACEHOLDER|$ECR_REPO:$IMAGE_TAG|g" \
                        k8s/deployment.yaml
                    sed -i "s|BUILD_PLACEHOLDER|$BUILD_NUMBER|g" \
                        k8s/deployment.yaml

                    # Apply kubernetes manifests
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml

                    # Wait for rollout to complete
                    kubectl rollout status deployment/jenkins-k8s-app \
                        --timeout=120s

                    echo "Deployment complete!"
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying pods are running...'
                sh '''
                    echo "=== Pods ==="
                    kubectl get pods -l app=jenkins-k8s-app

                    echo "=== Service ==="
                    kubectl get service jenkins-k8s-service

                    echo "=== Deployment ==="
                    kubectl get deployment jenkins-k8s-app

                    echo "=== App URL ==="
                    echo "http://$(minikube ip):30080"
                '''
            }
        }
    }

    post {
        success {
            sh '''
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "PIPELINE SUCCESS"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                kubectl get pods -l app=jenkins-k8s-app
                echo "App URL: http://$(minikube ip):30080"
            '''
        }
        failure {
            sh '''
                echo "Pipeline FAILED — Pod logs:"
                kubectl logs -l app=jenkins-k8s-app --tail=20 || true
            '''
        }
    }
}
