# Ergonia Server — Backend API Service

API Service RESTful cho Hệ thống Thương mại điện tử & Tư vấn Công thái học Tương tác **Ergonia** (Ghế công thái học, bàn nâng hạ, phụ kiện làm việc, trợ lý Mascot & Ergonomic Quiz).

---

## 🛠 Tech Stack

| Công nghệ | Mô tả / Phiên bản |
| :--- | :--- |
| **Runtime & Language** | Node.js (v20+), TypeScript (v6.0) |
| **Framework** | Express.js (v5) |
| **Database** | PostgreSQL (v16) |
| **ORM** | Prisma ORM (v7) |
| **Caching & Queue** | Redis (v7) + BullMQ |
| **Media & Storage** | Cloudinary + Multer + Sharp |
| **Auth & Security** | JWT (Access & Refresh Token), bcrypt, Helmet, CORS |
| **Payment Gateways** | VNPay, MoMo, COD |
| **Shipping Service** | Giao Hàng Nhanh (GHN) API |
| **Email Service** | Nodemailer (SMTP) |
| **Containerization** | Docker & Docker Compose |

---

## 🏗 Kiến Trúc Luồng Xử Lý API

Dự án áp dụng mô hình **Modular Architecture** (kiến trúc theo từng module nghiệp vụ):

```txt
Client (FE) -> Express Router -> Middlewares (Auth / Role / Validation) -> Controller -> Service -> Prisma ORM -> PostgreSQL / Redis
```

---

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: `>= 20.x`
- **npm**: `>= 10.x`
- **Docker Desktop**: Chạy PostgreSQL & Redis local

---

## ⚙️ Cấu Hình Môi Trường (.env)

Tạo file `.env` từ file mẫu `.env.example`:

```bash
cp .env.example .env
```

Nội dung cấu hình chi tiết:

```env
# APP CONFIG
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:8000

# DATABASE (PostgreSQL)
POSTGRES_USER=ergonia
POSTGRES_PASSWORD=ergonia_secret
POSTGRES_DB=ergonia_db
DATABASE_URL="postgresql://ergonia:ergonia_secret@localhost:5432/ergonia_db?schema=public"

# REDIS & BULLMQ
REDIS_PASSWORD=redis_secret
REDIS_URL=redis://:redis_secret@localhost:6379

# AUTH (JWT)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d

# CLOUDINARY (Lưu trữ ảnh sản phẩm, avatar)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# EMAIL (Nodemailer - Khôi phục mật khẩu, thông báo đơn hàng)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Ergonia <no-reply@ergonia.vn>"

# CỔNG THANH TOÁN
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key

# GIAO HÀNG (GHN)
GHN_TOKEN=your_ghn_token
GHN_SHOP_ID=your_shop_id
```

---

## 🐳 Khởi Động Services Bằng Docker

Backend hỗ trợ sẵn Docker Compose cho PostgreSQL, Redis và Adminer GUI:

```bash
# Khởi động PostgreSQL & Redis background
docker compose -f docker/docker-compose.yml up -d

# (Tùy chọn) Bật thêm Adminer GUI (Port 8080) để quản lý DB:
docker compose -f docker/docker-compose.yml --profile tools up -d
```

Kiểm tra danh sách container đang chạy:

```bash
docker compose -f docker/docker-compose.yml ps
```

Dừng dịch vụ Docker:

```bash
docker compose -f docker/docker-compose.yml down
```

---

## 🗄 Khởi Tạo & Thao Tác Cơ Sở Dữ Liệu (Prisma)

1. **Đẩy Schema Prisma lên PostgreSQL:**
   ```bash
   npm run db:push
   ```

2. **Khởi tạo dữ liệu mẫu (Seed Data):**
   *(Tạo tài khoản Admin, Danh mục, Sản phẩm, Câu hỏi Quiz, Mascot dialogues...)*
   ```bash
   npm run db:seed
   ```

3. **Mở giao diện trực quan Prisma Studio:**
   ```bash
   npm run db:studio
   ```

4. **Reset toàn bộ database (Xóa dữ liệu & Seed lại):**
   ```bash
   npm run db:reset
   ```

---

## 🚀 Hướng Dẫn Chạy Server

Chạy ở môi trường Development (với HMR tự động reload):

```bash
npm run dev
```

Biên dịch và chạy bản Production:

```bash
npm run build
npm start
```

- **Base URL:** `http://localhost:3000`
- **API Prefix:** `http://localhost:3000/api`

---

## 📁 Cấu Trúc Thư Mục Backend

```txt
Ergonia-Server/
├── docker/
│   └── docker-compose.yml       # Docker compose cấu hình PostgreSQL & Redis
├── prisma/
│   ├── schema.prisma            # Định nghĩa toàn bộ Data Model (14+ modules)
│   └── seed.ts                  # Script tạo dữ liệu mẫu ban đầu
├── src/
│   ├── config/                  # Cấu hình Database, Redis, Mailer, Cloudinary
│   ├── middlewares/             # Auth middleware, Role check, Validate request, Error handling
│   ├── modules/                 # Kiến trúc Modular nghiệp vụ
│   │   ├── addresses/           # Quản lý địa chỉ giao hàng
│   │   ├── admin/               # Admin Dashboard stats & quản lý hệ thống
│   │   ├── auth/                # Đăng ký, đăng nhập, JWT Refresh Token, khôi phục mật khẩu
│   │   ├── cart/                # Giỏ hàng & vật phẩm giỏ hàng
│   │   ├── categories/          # Danh mục sản phẩm (ghế, bàn, phụ kiện...)
│   │   ├── mascot/              # Linh vật Mascot tư vấn & hội thoại tự động
│   │   ├── orders/              # Quản lý đơn hàng, chi tiết đơn hàng & trạng thái
│   │   ├── painpoint/           # Hướng dẫn giải pháp đau mỏi (Back, Neck, Wrist...)
│   │   ├── payments/            # Tích hợp cổng thanh toán (VNPay, MoMo, COD)
│   │   ├── products/            # Quản lý sản phẩm, biến thể, hình ảnh, thuộc tính
│   │   ├── qr/                  # Quét mã QR / NFC sản phẩm
│   │   ├── quiz/                # Bài test chẩn đoán công thái học & đề xuất sản phẩm
│   │   ├── reviews/             # Đánh giá & phản hồi sản phẩm
│   │   └── vouchers/            # Mã giảm giá & áp dụng khuyến mãi
│   ├── utils/                   # Hàm tiện ích: Async Handler, Cloudinary upload, Error format
│   └── index.ts                 # Entry point khởi tạo Express App
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 📡 Danh Sách API Endpoints Chính

### 🔐 1. Authentication (`/api/auth`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản người dùng mới | Public |
| `POST` | `/api/auth/login` | Đăng nhập hệ thống (trả về Access & Refresh Token) | Public |
| `POST` | `/api/auth/refresh-token` | Lấy Access Token mới từ Refresh Token | Public |
| `GET` | `/api/auth/me` | Lấy thông tin tài khoản đang đăng nhập | User |
| `POST` | `/api/auth/forgot-password` | Gửi email khôi phục mật khẩu | Public |
| `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu với token khôi phục | Public |

### 🛍 2. Sản Phẩm & Danh Mục (`/api/products`, `/api/categories`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Lấy danh sách danh mục sản phẩm | Public |
| `GET` | `/api/products` | Lấy danh sách sản phẩm (Lọc, tìm kiếm, phân trang) | Public |
| `GET` | `/api/products/:slug` | Lấy thông tin chi tiết sản phẩm theo slug | Public |
| `POST` | `/api/products` | Tạo sản phẩm mới (tải lên hình ảnh, biến thể) | Admin/Staff |
| `PUT/PATCH` | `/api/products/:id` | Cập nhật thông tin sản phẩm | Admin/Staff |
| `DELETE` | `/api/products/:id` | Xóa sản phẩm | Admin |

### 🧠 3. Mascot & Ergonomic Quiz (`/api/mascot`, `/api/quiz`, `/api/painpoint`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/mascot/dialogue` | Lấy câu thoại Mascot theo ngữ cảnh tương tác | Public |
| `GET` | `/api/quiz/questions` | Lấy bộ câu hỏi tư vấn công thái học | Public |
| `POST` | `/api/quiz/submit` | Nộp bài test & nhận kết quả phân tích công thái học | Public / User |
| `GET` | `/api/painpoint` | Danh sách hướng dẫn khắc phục đau mỏi theo vùng cơ thể | Public |

### 🛒 4. Giỏ Hàng & Đơn Hàng (`/api/cart`, `/api/orders`, `/api/vouchers`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Xem chi tiết giỏ hàng hiện tại | User |
| `POST` | `/api/cart/items` | Thêm sản phẩm vào giỏ hàng | User |
| `DELETE` | `/api/cart/items/:itemId` | Xóa sản phẩm khỏi giỏ hàng | User |
| `POST` | `/api/orders` | Đặt hàng mới | User |
| `GET` | `/api/orders/my-orders` | Xem danh sách đơn hàng cá nhân | User |
| `POST` | `/api/vouchers/apply` | Kiểm tra & áp dụng mã giảm giá | User |

### 💳 5. Thanh Toán (`/api/payments`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-vnpay-url` | Tạo liên kết thanh toán VNPay | User |
| `GET` | `/api/payments/vnpay-return` | Callback xử lý kết quả thanh toán VNPay | Public |
| `POST` | `/api/payments/create-momo-url` | Tạo liên kết thanh toán MoMo | User |

### 👑 6. Quản Trị Hệ Thống (`/api/admin`)
| Phương thức | Đường dẫn | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Thống kê doanh thu, đơn hàng, người dùng | Admin |
| `GET` | `/api/admin/orders` | Quản lý & cập nhật trạng thái đơn hàng toàn hệ thống | Admin/Staff |
| `GET` | `/api/admin/users` | Danh sách & quản lý người dùng | Admin |

---

## 📜 Quy Ước Request & Response Format

### Response Thành Công:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ghế Công Thái Học Ergonia Pro",
    "basePrice": "4500000"
  },
  "message": "Thao tác thành công"
}
```

### Response Lỗi:
```json
{
  "success": false,
  "error": "Mật khẩu không chính xác",
  "statusCode": 400
}
```

---

## 🛠 Danh Sách Lệnh (npm scripts)

| Command | Description |
| :--- | :--- |
| `npm run dev` | Chạy server chế độ dev với `ts-node-dev` |
| `npm run build` | Biên dịch TypeScript sang JavaScript (`dist/`) |
| `npm start` | Chạy bản build sản xuất |
| `npm run db:push` | Đẩy schema Prisma trực tiếp lên cơ sở dữ liệu |
| `npm run db:migrate` | Chạy migration cơ sở dữ liệu |
| `npm run db:studio` | Mở giao diện Prisma Studio |
| `npm run db:seed` | Khởi tạo dữ liệu mẫu ban đầu |
| `npm run db:reset` | Reset DB và tự động seed dữ liệu |
