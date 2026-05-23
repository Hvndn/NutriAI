# AI Nutrition Scanner 🍎

Ứng dụng quét và phân tích dinh dưỡng thực phẩm thông minh đa nền tảng sử dụng công nghệ AI tiên tiến, mang lại trải nghiệm phân tích Calories, Carbs, Protein, Fat và đưa ra đánh giá Healthy Score trực quan chỉ từ hình ảnh hoặc camera thời gian thực.

---

## 🌟 Tính Năng Chính
- **AI Scan Food**: Quét thực phẩm qua Camera Realtime hoặc tải ảnh lên. Nhận diện chính xác tên thực phẩm, hàm lượng calories, macronutrients (Carbs, Protein, Fat), thành phần và đưa ra lời khuyên sức khỏe.
- **Biểu đồ Dinh dưỡng**: Hiển thị biểu đồ dạng vòng tròn hoặc radar trực quan với gam màu Premium Glassmorphism.
- **Nhật ký Calories hàng ngày**: Theo dõi chỉ số calories đã nạp, lượng nước uống và tiến trình mục tiêu sức khỏe cá nhân.
- **Admin Dashboard**: Thống kê số lượng lượt quét, phân tích xu hướng ẩm thực của người dùng, calories trung bình và quản trị tài khoản.
- **Đa Nền Tảng**: Trải nghiệm đồng nhất trên Mobile App (Flutter), Web Responsive (Next.js 15) và hỗ trợ PWA.

---

## 🛠️ Công Nghệ Sử Dụng
- **Frontend Mobile**: Flutter (Clean Architecture, State Management: Riverpod)
- **Frontend Web**: Next.js 15 (TypeScript, Tailwind CSS, Framer Motion, Zustand)
- **Backend Service**: FastAPI (Python 3.10+, SQLAlchemy, PostgreSQL, JWT Auth)
- **AI Core**: Google Gemini Vision API / OpenAI GPT-4o Vision API
- **Deployment**: Docker, Railway Container Deployment

---

## 📂 Cấu Trúc Dự Án
```text
ai-nutrition-scanner/
├── backend/                  # FastAPI Backend API Service
├── frontend-web/             # Next.js 15 Web Application & Admin Dashboard
├── frontend-mobile/          # Flutter Mobile Application
├── docs/                     # Tài liệu thiết kế hệ thống và hướng dẫn
└── docker-compose.yml        # Môi trường chạy Docker cục bộ
```

---

## 🚀 Hướng Dẫn Chạy Nhanh (Local Development)

### 1. Cấu hình biến môi trường
Tạo tệp `.env` tại thư mục `/backend` dựa theo tệp `.env.example`:
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/nutrition_db
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key
```

### 2. Khởi chạy toàn bộ hệ thống bằng Docker Compose
Tại thư mục gốc của dự án, chạy lệnh sau:
```bash
docker-compose up --build
```
Hệ thống sẽ khởi tạo:
- **Backend API**: `http://localhost:8000`
- **Interactive API Docs**: `http://localhost:8000/docs`
- **Frontend Web**: `http://localhost:3000`
- **PostgreSQL Database**: `localhost:5432`

---

## 📄 Bản Quyền & Giấy Phép
Dự án được phát triển phục vụ cho Đồ Án Tốt Nghiệp (DATN).
*Năm phát triển: 2026.*
