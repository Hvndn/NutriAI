# Stage 1: Build mã nguồn Java với Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Sao chép pom.xml và tải dependencies (tận dụng Docker cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Sao chép mã nguồn và biên dịch đóng gói JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime chạy ứng dụng gọn nhẹ với JRE 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Tạo user bảo mật không quyền root và tạo thư mục uploads có quyền ghi đầy đủ
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /app/uploads \
    && chown -R spring:spring /app

USER spring

# Sao chép tệp JAR từ stage 1
COPY --chown=spring:spring --from=build /app/target/*.jar app.jar

# Mở port 8000 (Spring Boot server port)
EXPOSE 8000

# Khởi động ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
