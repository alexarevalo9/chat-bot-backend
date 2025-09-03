#!/bin/bash

echo "🐳 Testing NestJS Chat API Docker Setup"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if Docker is running
print_info "Checking if Docker daemon is running..."
docker info > /dev/null 2>&1
print_status $? "Docker daemon is running"

# Step 1: Build the image
print_info "Step 1: Building Docker image..."
docker build -t nestjs-chat-api .
print_status $? "Docker image built successfully"

# Step 2: Run the container
print_info "Step 2: Running container on port 3001..."
docker run -d --name chat-api-test -p 3001:3001 nestjs-chat-api
print_status $? "Container started successfully"

# Step 3: Wait for application to start
print_info "Step 3: Waiting for application to start..."
sleep 10

# Step 4: Test health check
print_info "Step 4: Testing application health..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$response" = "200" ]; then
    print_status 0 "Health check passed (HTTP $response)"
else
    print_status 1 "Health check failed (HTTP $response)"
fi

# Step 5: Test chat endpoint
print_info "Step 5: Testing chat endpoint..."
chat_response=$(curl -s -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Docker!"}')

if echo "$chat_response" | grep -q '"reply".*"Bot: HELLO DOCKER!"'; then
    print_status 0 "Chat endpoint test passed"
    echo "Response: $chat_response"
else
    print_status 1 "Chat endpoint test failed"
    echo "Response: $chat_response"
fi

# Step 6: Test validation with empty message
print_info "Step 6: Testing validation with empty message..."
validation_response=$(curl -s -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": ""}')

if echo "$validation_response" | grep -q "Message cannot be empty\|Bad Request\|statusCode.*400"; then
    print_status 0 "Validation test passed - empty message rejected"
    echo "Response: $validation_response"
else
    print_status 1 "Validation test failed"
    echo "Response: $validation_response"
fi

# Step 7: Test malformed JSON
print_info "Step 7: Testing malformed JSON..."
malformed_response=$(curl -s -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":}')

if echo "$malformed_response" | grep -q "400\|Bad Request\|SyntaxError"; then
    print_status 0 "Malformed JSON test passed - request rejected"
    echo "Response: $malformed_response"
else
    print_status 1 "Malformed JSON test failed"
    echo "Response: $malformed_response"
fi

# Step 8: Test rate limiting (at the end so it doesn't interfere)
print_info "Step 8: Testing rate limiting (sending 6 requests quickly)..."
echo "This will test the 5 requests per minute limit:"
for i in {1..6}; do
    response_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/chat \
      -H "Content-Type: application/json" \
      -d "{\"message\": \"Rate test $i\"}")
    echo "Request $i: HTTP $response_code"
    
    # Check if we hit rate limit
    if [ "$response_code" = "429" ]; then
        print_status 0 "Rate limiting working correctly - blocked at request $i"
        break
    fi
done

# Step 9: Check container health
print_info "Step 9: Checking container health status..."
health_status=$(docker inspect --format='{{.State.Health.Status}}' chat-api-test 2>/dev/null)
if [ "$health_status" = "healthy" ] || [ "$health_status" = "" ]; then
    print_status 0 "Container health check passed"
else
    print_status 1 "Container health check failed: $health_status"
fi

# Step 10: View logs
print_info "Step 10: Container logs (last 20 lines):"
docker logs --tail 20 chat-api-test

# Cleanup
print_info "Cleaning up test container..."
docker stop chat-api-test > /dev/null 2>&1
docker rm chat-api-test > /dev/null 2>&1
print_status $? "Test container cleaned up"

echo ""
echo -e "${GREEN}🎉 Docker testing completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Install Docker Compose: brew install docker-compose"
echo "2. Run: docker-compose up -d"
echo "3. Test API at: http://localhost:3001/chat"
