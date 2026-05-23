# Hướng Dẫn Triển Khai (Deployment Guide) 🚀

Tài liệu này hướng dẫn chi tiết cách chạy thử nghiệm hệ thống **AI Nutrition Scanner** cục bộ (local) bằng Docker Compose và cách deploy tự động lên **Railway Cloud Hosting** thông qua Dockerfile.

---

## 💻 1. Chạy Cục Bộ (Local Development) bằng Docker Compose

Môi trường Docker Compose cho phép bạn khởi chạy toàn bộ dịch vụ (FastAPI, Next.js, PostgreSQL) chỉ bằng một lệnh duy nhất mà không cần cài đặt Python hay Node.js thủ công trên máy tính.

### Bước 1: Chuẩn bị môi trường
Đảm bảo bạn đã cài đặt:
- **Docker Desktop** (Đã kích hoạt WSL 2 nếu trên Windows).
- Git.

### Bước 2: Cấu hình biến môi trường cục bộ
Tại thư mục gốc của dự án (`d:\DATN\ai-nutrition-scanner`), tạo tệp tin `.env` với các nội dung sau:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
JWT_SECRET=supersecretjwtkey2026nutritionscanner
```

### Bước 3: Khởi chạy dịch vụ
Chạy lệnh sau tại Terminal của thư mục gốc:
```bash
docker-compose up --build
```
Hệ thống sẽ tiến hành build Docker image và khởi chạy:
- **Database (PostgreSQL)**: Port `5432`
- **Backend Service (FastAPI)**: `http://localhost:8000` (FastAPI Swagger Docs tại `http://localhost:8000/docs`)
- **Frontend Web (Next.js 15)**: `http://localhost:3000`

---

## ☁️ 2. Triển Khai Lên Railway (Railway Cloud Deployment)

Railway là nền tảng Cloud tiên tiến hỗ trợ deploy trực tiếp từ Dockerfile nằm trong GitHub repository rất nhanh chóng và tự động (CI/CD).

### Bước 1: Đẩy mã nguồn lên GitHub
Khởi tạo Git và đẩy toàn bộ thư mục `ai-nutrition-scanner` lên repository GitHub cá nhân của bạn:
```bash
cd d:\DATN\ai-nutrition-scanner
git init
git add .
git commit -m "Initial commit: AI Nutrition Scanner project"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Bước 2: Tạo dự án mới trên Railway
1. Truy cập [Railway.app](https://railway.app/) và đăng nhập bằng tài khoản GitHub của bạn.
2. Nhấn nút **New Project** -> Chọn **Provision PostgreSQL** để tạo cơ sở dữ liệu PostgreSQL trước.
3. Khi container PostgreSQL đã sẵn sàng, nhấn **New** -> Chọn **GitHub Repo** -> Chọn repository chứa mã nguồn của bạn.

### Bước 3: Cấu hình Backend (FastAPI Service)
1. Trên giao diện Railway, nhấn vào service mã nguồn vừa import.
2. Tại phần **Settings** -> **Source**:
   - Thiết lập **Root Directory** là `backend` (để Railway chỉ đọc thư mục backend).
   - Railway sẽ tự động phát hiện `Dockerfile` bên trong thư mục `backend` và tiến hành build.
3. Tại phần **Variables** (Biến môi trường), thêm các biến sau:
   - `DATABASE_URL`: Liên kết trực tiếp tới PostgreSQL bằng cách điền `${{ Postgres.DATABASE_URL }}` (Railway sẽ tự động nạp chuỗi kết nối).
   - `GEMINI_API_KEY`: Điền API Key Gemini Vision của bạn.
   - `JWT_SECRET`: Điền chuỗi mật mã bảo mật ngẫu nhiên.
   - `PORT`: `8000`
4. Tại phần **Settings** -> **Networking** -> Nhấn **Generate Domain** để nhận link API public (VD: `https://nutrition-backend-production.up.railway.app`).

### Bước 4: Cấu hình Frontend Web (Next.js 15)
1. Quay lại giao diện dự án, nhấn **New** -> Chọn tiếp **GitHub Repo** tương tự (để tạo service thứ hai cho Frontend Web).
2. Tại phần **Settings** -> **Source**:
   - Thiết lập **Root Directory** là `frontend-web`.
   - Railway sẽ tự động phát hiện `Dockerfile` của Next.js và tiến hành build.
3. Tại phần **Variables**, thêm các biến sau:
   - `NEXT_PUBLIC_API_URL`: Điền domain của Backend đã tạo ở Bước 3 (VD: `https://nutrition-backend-production.up.railway.app`).
   - `PORT`: `3000`
4. Tại phần **Settings** -> **Networking** -> Nhấn **Generate Domain** để nhận link truy cập Web App public (VD: `https://nutrition-scanner-production.up.railway.app`).

---

## 🧪 3. Xác Minh Sau Triển Khai (Verification Check)

1. Truy cập URL của Frontend Web, đảm bảo trang Landing Page hiển thị mượt mà phong cách Premium.
2. Nhấn Đăng ký và Đăng nhập tài khoản mới.
3. Chụp ảnh/Upload hình ảnh món ăn lên để quét AI. Đảm bảo hệ thống phân tích thành công và trả về biểu đồ calories, danh sách nguyên liệu và điểm healthy score.
4. Truy cập trang `/admin` (tài khoản đăng ký đầu tiên tự động nhận quyền Admin) để kiểm tra các chỉ số thống kê biểu đồ tăng trưởng và bảng quản trị người dùng.
