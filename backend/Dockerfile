# Sử dụng image Maven có sẵn JDK 21 để build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy toàn bộ source code và build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Sử dụng image JRE 21 nhẹ nhàng để chạy ứng dụng
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy file jar đã build từ bước trước
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8081 (khớp với cấu hình trong application.yml)
EXPOSE 8081

# Lệnh khởi chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
