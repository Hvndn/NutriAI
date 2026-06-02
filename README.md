# AI Nutrition Scanner 🍎 
Ứng dụng quét và phân tích dinh dưỡng thực phẩm thông minh đa nền tảng sử dụng công nghệ AI tiên tiến, mang lại trải nghiệm phân tích Calories, Carbs, Protein, Fat, điểm sức khỏe Healthy Score và quét bao bì OCR trực quan chỉ từ hình ảnh hoặc camera thời gian thực.

Dự án đã được tái cấu trúc toàn diện sang **Spring Boot 3** (LTS Java 21) cho phần Backend, mang lại hiệu năng đỉnh cao, tính bảo mật tối đa và khả năng mở rộng quy mô chuẩn doanh nghiệp.

---

## 🌟 Tính Năng Chính
*   **🥗 Food AI Scanner**: Chụp đĩa thức ăn hoặc tải ảnh từ thư viện. Gemini Vision AI tự động nhận diện tên món ăn, tính toán calories, lượng carbohydrate, đạm, chất béo, bóc tách nguyên liệu và đưa ra điểm sức khỏe (Healthy Score) kèm lời khuyên dinh dưỡng hữu ích bằng Tiếng Việt.
*   **📦 Packaging OCR Scanner**: Chế độ quét bao bì sản phẩm thông minh. Sử dụng AI để đọc nhãn dinh dưỡng (Nutrition Facts table), bóc tách thành phần thô, phát hiện cảnh báo chất gây dị ứng (Allergens) và chấm điểm mức độ an toàn của thực phẩm đóng gói.
*   **📊 Premium Analytics Dashboard**: Dashboard thống kê calories tiêu thụ tích lũy trong ngày, đo lường hạn mức so với mục tiêu người dùng. Trang Admin hiển thị trực quan các biểu đồ tăng trưởng số lượt quét và top thực phẩm phổ biến.
*   **🔐 Secure Authentication**: Luồng đăng nhập, đăng ký và bảo mật thông tin tài khoản được quản lý nghiêm ngặt qua Spring Security và mã hóa JWT (JSON Web Token) Stateless.
*   **📱 Mobile-First Responsive**: Giao diện premium phong cách Glassmorphism mượt mà tối giản, tối ưu hóa 100% trên cả Desktop, Tablet và Mobile.

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend (Next.js 15 Web & PWA)
- **Framework**: Next.js 15 (App Router, React 19)
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS
- **Thư viện UI**: Shadcn/ui & Lucide Icons
- **Animation**: Framer Motion (Smooth Micro-interactions)
- **State Management**: Zustand Store

### Backend (Spring Boot 3 & Java 21)
- **Framework**: Spring Boot 3.3.0
- **Ngôn ngữ**: Java 21 (LTS)
- **Security**: Spring Security + JWT authentication
- **Database Access**: Spring Data JPA / Hibernate ORM
- **Migration**: Flyway DB Migration
- **API Documentation**: Springdoc OpenAPI v3 (Swagger UI)
- **Build tool**: Maven & Docker Multi-stage builds

### Database & Infrastructure
- **CSDL**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Deploy Cloud**: Railway Cloud
- **CI/CD**: GitHub Actions (Tự động build, run tests và deploy khi push code lên `main`)

---

## 📂 Cấu Trúc Dự Án
```text
ai-nutrition-scanner/
├── backend/                  # Java Spring Boot 3 Backend Service
│   ├── src/main/java/        # Mã nguồn Java (Controller, Service, Repository, DTO, Model)
│   ├── src/main/resources/   # Cấu hình application.yml và Flyway Migrations
│   ├── pom.xml               # Quản lý thư viện Maven
│   └── Dockerfile            # Dockerfile đa tầng tối ưu hóa JRE 21 gọn nhẹ
├── frontend-web/             # Next.js 15 Web Application & Admin Dashboard
│   ├── src/app/              # Next.js pages (scan, dashboard, history, login...)
│   └── src/services/store.ts # Zustand Store liên kết APIs
├── frontend-mobile/          # Flutter Mobile Application
├── docker-compose.yml        # Môi trường chạy Docker cục bộ liên thông (App - Web - DB)
├── railway.json              # Cấu hình tự động deploy Railway Cloud
└── README.md                 # Tài liệu hướng dẫn sử dụng
```

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Cục Bộ - Local)

### Yêu cầu hệ thống:
- Đã cài đặt [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/).
- Có khóa API Google Gemini hoặc OpenAI (không bắt buộc, hệ thống tự động fallback sang bộ mock data thông minh phục vụ demo cực kỳ hoàn hảo).

### Bước 1: Thiết lập biến môi trường
Tạo tệp `.env` tại thư mục gốc của dự án hoặc khai báo các biến môi trường sau:
```env
GEMINI_API_KEY=khoa_api_gemini_cua_ban_neu_co
JWT_SECRET=supersecretjwtkey2026nutritionscanner
```

### Bước 2: Chạy toàn bộ ứng dụng bằng Docker Compose
Mở terminal tại thư mục gốc và chạy lệnh duy nhất:
```bash
docker-compose up --build
```
Hệ thống sẽ tự động tải các base image, biên dịch mã nguồn Java Spring Boot, tải thư viện Next.js, tạo cấu trúc cơ sở dữ liệu PostgreSQL qua Flyway và liên kết mạng.

### Địa chỉ truy cập dịch vụ:
- **Next.js Web App**: [http://localhost:3000](http://localhost:3000)
- **Spring Boot API Backend**: [http://localhost:8000](http://localhost:8000)
- **Tài liệu API Swagger UI**: [http://localhost:8000/swagger-ui/index.html](http://localhost:8000/swagger-ui/index.html)
- **PostgreSQL Database**: `localhost:5432`

---

## 🛡️ Tài Khoản Thử Nghiệm Có Sẵn (Demo Accounts)
Database tự động chèn sẵn 2 tài khoản để bạn có thể trải nghiệm lập tức mà không cần đăng ký:

1.  **Tài khoản Người Dùng (Premium User)**:
    *   **Email**: `user@nutriai.com`
    *   **Mật khẩu**: `user123`
2.  **Tài khoản Quản Trị Viên (System Admin)**:
    *   **Email**: `admin@nutriai.com`
    *   **Mật khẩu**: `admin123` *(Giúp bạn truy cập Admin Dashboard xem phân tích biểu đồ).*

---

## 📈 Triển Khai Lên Cloud Railway & Luồng CI/CD

### 1. Triển khai Railway
- Liên kết kho mã nguồn (Repository GitHub) của bạn với dự án mới trên Railway.
- Railway sẽ tự động quét tệp `railway.json`, đọc `Dockerfile` ở mỗi thư mục và kích hoạt build.
- Cấu hình các biến môi trường `SPRING_DATASOURCE_URL`, `GEMINI_API_KEY` và `JWT_SECRET` trong bảng điều khiển Variables của Railway.

### 2. Tự động hóa CI/CD qua GitHub Actions
Khi bạn đẩy mã nguồn lên nhánh `main` (hoặc merge PR):
- GitHub Actions sẽ tự động chạy quy trình:
  1. Kiểm thử mã nguồn Java Spring Boot (`mvn clean package`).
  2. Kiểm thử và build đóng gói Next.js Web App.
  3. Gọi Railway CLI để tự động redeploy các container trên Cloud.

---

