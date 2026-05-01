#!/bin/zsh

# Servislerin listesi
services=("api-gateway" "course-service" "auth-service" "user-service" "config-server")

echo "Checking microservices via Gateway..."
for service in "${services[@]}"; do
    echo "Checking $service..."
    curl -s http://localhost:8080/$service/actuator/health || echo "$service not available"
    echo -e "\n"
done

# Eureka Server özel kontrol
echo "Checking Eureka Server..."
curl -s http://localhost:8761/eureka/apps || echo "Eureka server not available"
echo -e "\n"

echo "All checks done."
