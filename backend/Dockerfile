# Sử dụng image Maven có sẵn JDK 21 để build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy file pom.xml trước để tận dụng cache cho dependencies
COPY pom.xml .
# Tải các dependencies và plugins về trước để tận dụng cache Docker
RUN --mount=type=cache,target=/root/.m2 mvn dependency:resolve dependency:resolve-plugins -B

# Sau đó mới copy source code và build
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn package -DskipTests

# Sử dụng image JRE 21 nhẹ nhàng để chạy ứng dụng
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy file jar đã build từ bước trước
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8081 (mặc định)
EXPOSE 8081

# Lệnh khởi chạy ứng dụng với cấu hình tối ưu cho Cloud
# -Djava.security.egd=file:/dev/./urandom giúp JVM khởi động nhanh hơn trên một số hệ thống Linux
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
