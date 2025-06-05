APP_NAME="ai-benchmark"
APP_DIR="/var/www/ai-benchmark"

echo "Deploying Dockerized Next.js App..."
cd $APP_DIR

echo "Building Docker image..."
docker build -t $APP_NAME .

echo "Stopping existing container (if any)..."
docker stop $APP_NAME || true
docker rm $APP_NAME || true

echo "Running new container..."
docker run -d --name $APP_NAME -p 5500:5500 --restart unless-stopped $APP_NAME

echo "Deployment complete."