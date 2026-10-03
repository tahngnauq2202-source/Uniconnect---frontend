# 🎓 UniConnect HUCE - Cấu Trúc Dự Án Full-Stack

Nền tảng chia sẻ tri thức học thuật dành riêng cho Sinh viên & Giảng viên **Trường Đại học Xây dựng Hà Nội (HUCE)**.

---

## 📁 Cấu Trúc Thư Mục Dự Án (Theo Chức Năng)

Dự án đã được phân chia thành các thư mục và tệp tin theo đúng chuẩn kiến trúc chức năng (dễ tìm kiếm, dễ mở rộng và dễ bảo trì):

```text
Uniconect/
├── 🌐 GIAO DIỆN & TRANG TĨNH (FRONTEND ROOT)
│   ├── index.html                  # Landing Page giới thiệu UniConnect HUCE
│   ├── main.html                   # Bảng tin học thuật chính (Feed)
│   ├── style.css                   # Định kiểu giao diện Landing Page
│   └── main.css                    # Định kiểu Bảng tin (Theme Ocean Blue)
│
├── 📦 MODULES JAVASCRIPT FRONTEND (js/)
│   ├── utils/
│   │   ├── toast.js                # Tiện ích hiển thị thông báo Toast nổi
│   │   └── helpers.js              # Tiện ích escapeHtml (chống XSS) & copy Clipboard
│   ├── modules/
│   │   ├── navbar.js               # Hiệu ứng cuộn Navbar & menu di động
│   │   ├── heroMockup.js           # Upvote tương tác thử nghiệm ở Hero
│   │   ├── authModal.js            # Cửa sổ Modal Đăng nhập / Đăng ký
│   │   ├── vote.js                 # Cơ chế Upvote bài viết hữu ích (Toggle upvote)
│   │   ├── postComposer.js         # Trình soạn thảo & đăng bài mới
│   │   ├── sort.js                 # Bộ lọc sắp xếp bài viết (Nổi bật/Mới/Đang lên)
│   │   ├── search.js               # Tìm kiếm tức thì & phím tắt Ctrl+K
│   │   └── notifications.js        # Khay thông báo & động cơ thời gian thực
│   ├── app.js                      # Điểm điều phối JavaScript cho index.html
│   └── main.js                     # Điểm điều phối JavaScript cho main.html
│
├── ⚙️ BACKEND NODE.JS & EXPRESS (src/)
│   ├── config/
│   │   └── index.js                # Đọc cấu hình biến môi trường (.env)
│   ├── controllers/
│   │   ├── authController.js       # Xử lý Request Đăng ký, Đăng nhập
│   │   ├── postController.js       # Xử lý Request Lấy bài, Đăng bài, Vote bài
│   │   └── notificationController.js # Xử lý Request Thông báo, Đánh dấu đã đọc
│   ├── middlewares/
│   │   ├── errorHandler.js         # Bắt và chuẩn hóa lỗi toàn cục
│   │   └── authMiddleware.js       # Xác thực token người dùng HUCE
│   ├── prisma/
│   │   ├── schema.prisma           # Lược đồ CSDL: User, Post, Comment, Vote,...
│   │   └── db.js                   # Kết nối PrismaClient (Singleton)
│   ├── routes/
│   │   ├── index.js                # Router trung tâm gom tất cả endpoints
│   │   ├── authRoutes.js           # Tuyến /api/auth/
│   │   ├── postRoutes.js           # Tuyến /api/posts/
│   │   └── notificationRoutes.js   # Tuyến /api/notifications/
│   ├── services/
│   │   ├── authService.js          # Nghiệp vụ tài khoản HUCE (@huce.edu.vn)
│   │   ├── postService.js          # Nghiệp vụ tính điểm vote, lưu bài viết
│   │   └── notificationService.js  # Nghiệp vụ đẩy thông báo thời gian thực
│   ├── utils/
│   │   └── response.js             # Hàm chuẩn hóa JSON response (Success/Error)
│   ├── app.js                      # Khởi tạo Express, CORS, Static Files, Routes
│   └── server.js                   # Điểm khởi động máy chủ lắng nghe PORT
│
├── .env.example                    # File cấu hình mẫu biến môi trường
├── .gitignore                      # Danh sách bỏ qua git
└── package.json                    # Cấu hình gói và kịch bản npm
```

---

## 🚀 Hướng Dẫn Chạy Dự Án

### Cách 1: Chạy trực tiếp Frontend (Không cần cài đặt)
* Nhấp đúp chuột trực tiếp vào file [`index.html`](file:///c:/Users/qnhat/OneDrive/ドキュメント/Uniconect/index.html) hoặc [`main.html`](file:///c:/Users/qnhat/OneDrive/ドキュメント/Uniconect/main.html) để mở trên trình duyệt (Chrome, Edge, Cốc Cốc,...).
* Tất cả các tính năng tương tác, sắp xếp, tìm kiếm, soạn bài và mô phỏng thông báo thời gian thực đều đã được module hóa và hoạt động 100%.

### Cách 2: Chạy đầy đủ cả Backend Node.js / Express
1. Mở cửa sổ dòng lệnh (Terminal/PowerShell) tại thư mục `Uniconect`.
2. Tạo file `.env` từ `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Cài đặt các gói phụ thuộc (Dependencies):
   ```bash
   npm install
   ```
4. Khởi chạy máy chủ:
   ```bash
   npm run dev
   # hoặc: npm start
   ```
5. Truy cập hệ thống tại:
   * **Trang chủ**: `http://localhost:5000/index.html`
   * **Bảng tin**: `http://localhost:5000/main.html`
   * **Kiểm tra API**: `http://localhost:5000/api/health`
