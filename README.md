# SmartLearn Microservices

 microservices platform for online course management. This project implements a distributed architecture using Spring Cloud, Apache Kafka, and Docker.

## 🏗 Architecture Overview

The system follows a microservices pattern with independent databases, centralized configuration, and event-driven communication.

### Core Infrastructure
- **API Gateway**: Entry point for all requests. Handles JWT validation and routing.
- **Service Discovery**: Netflix Eureka for service registration and health monitoring.
- **Config Server**: Centralized configuration management using a native file-system backend.
- **Event Bus**: Apache Kafka for asynchronous communication between services.
- **Observability**: Distributed tracing with Micrometer and Zipkin.

### Business Services
- **Auth Service**: Manages user credentials, registration, and JWT issuance.
- **User Service**: Handles user profile data and synchronizes with Auth Service via Kafka.
- **Course Service**: Manages the course catalog, including sections and lessons.
- **Service Skeletons**: Order, Payment, and Enrollment services are structured and ready for business logic implementation.

## 🛠 Tech Stack
- **Language**: Java 21
- **Framework**: Spring Boot 3.2, Spring Cloud 2023.0
- **Messaging**: Apache Kafka
- **Database**: PostgreSQL (Independent instance per service)
- **Security**: JWT (validated at Gateway)
- **Containerization**: Docker, Docker Compose
- **Tracing**: Micrometer + Brave + Zipkin

## 🚀 Getting Started

### Prerequisites
- JDK 21+
- Maven 3.9+
- Docker & Docker Compose

### 1. Build the Project
Build all modules from the root directory:
```bash
mvn clean install -DskipTests
```

### 2. Launch Services
Start the entire ecosystem using Docker Compose:
```bash
docker-compose up -d
```

### 3. Verification
Access the following dashboards:
- **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)
- **Kafka UI**: [http://localhost:8090](http://localhost:8090)
- **Zipkin (Tracing)**: [http://localhost:9411](http://localhost:9411)
- **Config Server**: [http://localhost:8888/auth-service/dev](http://localhost:8888/auth-service/dev)

## 📡 Service Interaction (Kafka Events)
- `user.created`: Emitted by **Auth Service**, consumed by **User Service** to initialize profiles.
- `auth.login`: Emitted by **Auth Service** for auditing purposes.
- `course.published`: Emitted by **Course Service** upon publishing course content.

## 📁 Project Structure
- `/infrastructure`: Spring Cloud infrastructure components (Gateway, Eureka, Config).
- `/services`: Individual business microservices.
- `/shared`: Common libraries and event definitions.
- `/infra`: Additional infrastructure scripts (e.g., DB initialization).
