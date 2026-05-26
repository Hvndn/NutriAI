# Sử dụng trực tiếp JRE 21 siêu nhẹ
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Tạo user bảo mật không quyền root và thư mục uploads có quyền ghi đầy đủ
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /app/uploads \
    && chown -R spring:spring /app

USER spring

# Sao chép trực tiếp tệp JAR đã biên dịch sẵn từ thư mục target
COPY --chown=spring:spring target/*.jar app.jar

# Mở port 8000 (Spring Boot server port)
EXPOSE 8000

# Khởi động ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]

