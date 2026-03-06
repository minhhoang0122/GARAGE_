# Sử dụng image Maven có sẵn JDK 17 để build
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml và tải các dependency trước (để tận dụng cache của Docker layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ source code và build
COPY src ./src
RUN mvn clean package -DskipTests

# Sử dụng image JRE 17 nhẹ nhàng để chạy ứng dụng
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy file jar đã build từ bước trước
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8081 (khớp với cấu hình trong application.yml)
EXPOSE 8081

# Lệnh khởi chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
