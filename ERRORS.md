# Nhật Ký Lỗi Hệ Thống & Bài Học Kinh Nghiệm (ERRORS.md)

Tệp tin này ghi lại toàn bộ các lỗi phát sinh trong quá trình phát triển hệ thống và cách khắc phục để ngăn chặn tái diễn.

---

## 2026-05-23 14:30 - Lỗi biên dịch Maven do sai cấu hình Parent POM

- **Type**: Process
- **Severity**: High
- **File**: `backend/pom.xml:7`
- **Agent**: @orchestrator
- **Root Cause**: Sử dụng sai tên parent artifactId là `spring-boot-parent` thay vì `spring-boot-starter-parent`, dẫn đến dự án không được kế thừa cấu hình compiler và tự động fallback về Java 8 (source/target 1.8), gây lỗi khi biên dịch các tính năng của Java 21 như Records và Text Blocks.
- **Error Message**: 
  ```
  [ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.11.0:compile (default-compile) on project api: Compilation failure: Compilation failure: 
  [ERROR] /app/src/main/java/com/nutriai/api/service/AiService.java:[41,25] text blocks are not supported in -source 8
  [ERROR]   (use -source 15 or higher to enable text blocks)
  [ERROR] /app/src/main/java/com/nutriai/api/exception/GlobalExceptionHandler.java:[17,12] records are not supported in -source 8
  [ERROR]   (use -source 16 or higher to enable records)
  ```
- **Fix Applied**: Thay đổi `<artifactId>` trong thẻ `<parent>` thành `spring-boot-starter-parent` và cấu hình tường minh `<maven.compiler.source>21</maven.compiler.source>` và `<maven.compiler.target>21</maven.compiler.target>` trong phần `<properties>` của tệp `pom.xml`.
- **Prevention**: Luôn sử dụng `spring-boot-starter-parent` cho dự án Spring Boot và khai báo tường minh phiên bản compiler trong thẻ properties để tránh phụ thuộc vào cấu hình ngầm định của máy chủ.
- **Status**: Fixed

---

## 2026-05-23 14:33 - Lỗi xác thực Schema do xung đột dữ liệu PostgreSQL cũ (Volume persistence)

- **Type**: Runtime
- **Severity**: Medium
- **File**: `docker-compose.yml:15`
- **Agent**: @orchestrator
- **Root Cause**: Database volume cũ `postgres_data` từ phân hệ FastAPI Python trước đó chứa các bảng với khóa chính kiểu `serial (Types#INTEGER)`. Tuy nhiên, các thực thể JPA trong Spring Boot (`User`, `Scan`, `FoodDetail`) được khai báo khóa chính kiểu `Long` tương ứng `bigint (Types#BIGINT)`. Khi bật chế độ `ddl-auto: validate`, Hibernate phát hiện sự sai lệch kiểu dữ liệu và từ chối khởi động.
- **Error Message**: 
  ```
  Caused by: org.hibernate.tool.schema.spi.SchemaManagementException: Schema-validation: wrong column type encountered in column [id] in table [food_details]; found [serial (Types#INTEGER)], but expecting [bigint (Types#BIGINT)]
  ```
- **Fix Applied**: Hướng dẫn người dùng xóa volume cũ để khởi tạo cơ sở dữ liệu sạch thông qua Flyway với các cột `BIGINT/BIGSERIAL` đồng bộ. Lệnh thực hiện: `docker-compose down -v` tiếp theo là `docker-compose up --build`.
- **Prevention**: Khi chuyển dịch kiến trúc dữ liệu hoặc thay đổi cấu trúc lớn của các trường khoá chính, hãy dọn dẹp hoặc chạy migrations nâng cấp kiểu cột để đảm bảo tính đồng bộ của JPA Entity.
- **Status**: Fixed

---

## 2026-05-23 14:42 - Lỗi API 404 do Google khai tử mô hình Gemini 1.5 Flash

- **Type**: Integration
- **Severity**: High
- **File**: `backend/src/main/java/com/nutriai/api/service/AiService.java:103`
- **Agent**: @orchestrator
- **Root Cause**: Google đã chính thức khai tử mô hình `gemini-1.5-flash` vào tháng 5 năm 2026. Lệnh gọi API thông qua địa chỉ v1beta trả về lỗi `404 Not Found`. `AiService` bắt được lỗi này và tự động kích hoạt Mock data dự phòng nên người dùng liên tục nhận được món "Cơm Tấm" mặc định.
- **Error Message**: 
  ```
  Exception during Gemini API call: org.springframework.web.client.HttpClientErrorException$NotFound: 404 Not Found: "models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent."
  ```
- **Fix Applied**: Thay đổi đường dẫn URL gọi API trong `AiService.java` từ `gemini-1.5-flash` thành `gemini-3.5-flash` (mô hình thông minh cao cấp và tốc độ cao nhất hiện tại của năm 2026).
- **Prevention**: Nên cấu hình tên mô hình trong tệp properties/yaml để có thể thay đổi linh hoạt mà không cần sửa đổi mã nguồn Java khi các mô hình AI cập nhật phiên bản.
- **Status**: Fixed

---

## 2026-05-23 14:53 - Lỗi BCrypt Hash không hợp lệ trong Flyway Migration SQL

- **Type**: Logic
- **Severity**: High
- **File**: `backend/src/main/resources/db/migration/V1__init_schema.sql:52-54`
- **Agent**: @orchestrator
- **Root Cause**: BCrypt hash hardcode thủ công không khớp với format Spring `BCryptPasswordEncoder`. Thêm vào đó, khi dùng PowerShell chạy `docker exec nutrition_db psql -c "UPDATE SET hashed_password='$2a$...'`, ký tự `$` bị PowerShell interpolate/truncate, làm hash trở thành chuỗi sai.
- **Error Message**: 
  ```
  BCryptPasswordEncoder: Encoded password does not look like BCrypt
  HTTP 401 Unauthorized - Email hoặc mật khẩu không chính xác
  ```
- **Fix Applied**: 
  1. Dùng `/api/auth/register` để đăng ký user tạm thời với password biết trước.
  2. Lấy hash thực từ database (`SELECT hashed_password FROM users`).
  3. Tạo file SQL riêng và pipe qua `Get-Content | docker exec -i psql` thay vì inline command.
  4. Cập nhật `V1__init_schema.sql` với hash chuẩn đã xác minh hoạt động.
- **Prevention**: Không hardcode BCrypt hash trong SQL migration. Khi pipe SQL với `$` trong PowerShell, dùng file SQL + `Get-Content | docker exec -i` thay vì `-c` inline.
- **Status**: Fixed

---

## 2026-05-23 15:00 - Ảnh upload lưu đúng nhưng hiển thị sai (Unsplash placeholder)

- **Type**: Logic
- **Severity**: Medium
- **File**: `backend/src/main/java/com/nutriai/api/service/ScanService.java:40-64`
- **Agent**: @orchestrator
- **Root Cause**: `ScanService.analyzeAndSaveFood()` dùng logic phân loại tên file (`filename.contains("pho")`, `filename.contains("salad")`) để chọn ảnh Unsplash placeholder thay vì lưu ảnh thực lên đĩa. Kết quả là UI hiển thị ảnh không liên quan đến món ăn thực tế vừa chụp.
- **Fix Applied**: Refactor `ScanService` để lưu `imageBytes` vào thư mục `/app/uploads` với UUID filename, serve qua `WebMvcConfig` static resource handler, và trả về URL `http://localhost:8000/uploads/{uuid}.{ext}`. Fallback về Unsplash nếu IO thất bại.
- **Prevention**: Không dùng keyword matching từ filename để chọn ảnh — luôn lưu ảnh thực từ request vào server storage và return URL động.
- **Status**: Fixed

---

## 2026-05-26 10:45 - Lỗi thiếu ngoặc nhọn đóng phương thức getMockNutrition trong AiService.java

- **Type**: Syntax
- **Severity**: High
- **File**: `backend/src/main/java/com/nutriai/api/service/AiService.java:241`
- **Agent**: thần
- **Root Cause**: Thiếu dấu đóng ngoặc nhọn `}` kết thúc phương thức `getMockNutrition(String filename)` (và thiếu `return mock;` ở khối switch case mặc định), dẫn đến lỗi biên dịch y-cú-pháp `illegal start of expression` khi bắt đầu khai báo phương thức tiếp theo `generateMealPlan(int calorieGoal)`.
- **Error Message**: 
  ```
  [ERROR] /app/src/main/java/com/nutriai/api/service/AiService.java:[245,5] illegal start of expression
  [ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.13.0:compile (default-compile) on project api: Compilation failure
  ```
- **Fix Applied**: Bổ sung `return mock;` và đóng ngoặc nhọn `}` chuẩn xác cho phương thức `getMockNutrition` trước phương thức `generateMealPlan`.
- **Prevention**: Luôn đảm bảo đóng mở ngoặc nhọn chuẩn xác cho mọi phương thức. Sử dụng bộ đếm đóng ngoặc hoặc format code tự động trước khi commit để tránh lỗi cú pháp cơ bản.
- **Status**: Fixed

---

## 2026-05-26 10:50 - Lỗi ép kiểu generic không tương thích của Map.of trong HealthLogService.java

- **Type**: Syntax
- **Severity**: High
- **File**: `backend/src/main/java/com/nutriai/api/service/HealthLogService.java:103,114`
- **Agent**: thần
- **Root Cause**: Hàm `Map.of(...)` suy luận kiểu dữ liệu động, làm kiểu gán về `Map<String, ? extends Object & Serializable & ...>` không thể chuyển đổi trực tiếp sang kiểu bất biến `Map<String, Object>` trong khai báo danh sách `List<Map<String, Object>> mappedScans`.
- **Error Message**: 
  ```
  [ERROR] /app/src/main/java/com/nutriai/api/service/HealthLogService.java:[110,22] incompatible types: java.util.List<java.util.Map<java.lang.String,java.lang.Object&java.io.Serializable&...>> cannot be converted to java.util.List<java.util.Map<java.lang.String,java.lang.Object>>
  ```
- **Fix Applied**: Sử dụng chỉ định kiểu generic tường minh `Map.<String, Object>of(...)` khi khởi tạo các Map con trong biểu thức Stream, giúp ép kiểu Value về `Object` ngay từ đầu và gán thành công cho danh sách `List<Map<String, Object>>`.
- **Prevention**: Trong các biểu thức Stream của Java, khi map dữ liệu với kiểu hỗn hợp (String, Double, Investment) sử dụng `Map.of(...)`, hãy luôn ưu tiên chỉ định kiểu generic tường minh `Map.<String, Object>of(...)` để tránh lỗi suy luận kiểu (type inference) phức tạp của Java compiler.
- **Status**: Fixed

---

## 2026-05-26 10:58 - Lỗi GitHub Actions Build fail do thiếu package-lock.json khi cấu hình Node cache

- **Type**: Process
- **Severity**: Medium
- **File**: `.github/workflows/deploy.yml:43-44`
- **Agent**: thần
- **Root Cause**: Tập tin cấu hình GitHub Actions cấu hình thuộc tính `cache: 'npm'` và chỉ định đường dẫn lockfile `cache-dependency-path: frontend-web/package-lock.json`. Tuy nhiên, dự án không duy trì tập tin `package-lock.json` trong Git repository, dẫn đến lỗi đỏ ngay lập tức ở bước cài đặt môi trường Node.js.
- **Error Message**: 
  ```
  Build Frontend (Next.js 15): Some specified paths were not resolved, unable to cache dependencies.
  ```
- **Fix Applied**: Loại bỏ thuộc tính cấu hình cache và đường dẫn dependency lockfile trong bước Setup Node.js ở tệp `deploy.yml`. Hệ thống sẽ tự cài dependencies thuần thông qua `package.json` mà không tìm kiếm lockfile.
- **Prevention**: Khi cấu hình cache trong các workflow GitHub Actions, chỉ kích hoạt cache lockfile (`package-lock.json`, `yarn.lock`) nếu lockfile đó thực sự được commit và duy trì trong Git repository.
- **Status**: Fixed




