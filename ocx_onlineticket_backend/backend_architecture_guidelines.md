# 📘 OCX Backend Development Guidelines

> Hệ thống backend cho OCX Online Ticketing Platform\
> Framework: [NestJS](https://nestjs.com/)\
> ORM/DB Access: [Prisma](https://www.prisma.io/)\
> Database: PostgreSQL (Supabase-hosted)

---

## ✅ 1. Kiến trúc tổng thể

### Mô hình: `Modular Layered Architecture`

Mỗi **domain** (ví dụ: `users`, `orders`, `events`) là một **module** riêng, bao gồm:

```
src/
└── <feature>/
    ├── <feature>.module.ts
    ├── <feature>.controller.ts
    ├── <feature>.service.ts
    ├── dto/
    ├── entities/
    └── prisma/
```

### Tầng lớp chuẩn:

| Tầng       | Vai trò                                              |
| ---------- | ---------------------------------------------------- |
| Controller | Xử lý HTTP request, gọi `service`, không xử lý logic |
| Service    | Chứa business logic                                  |
| Repository | Truy vấn dữ liệu (qua Prisma)                        |
| DTO        | Validate & chuẩn hóa input                           |
| Entity     | Định nghĩa model/dữ liệu logic                       |
| Module     | Đóng gói feature để dễ mở rộng & test                |

---

## 🔄 2. Luồng xử lý request

```
Client (Web/Flutter)
  ↓
HTTP API (Controller)
  ↓
Service (Xử lý logic, gọi Repository)
  ↓
Repository (Prisma ORM)
  ↓
Supabase (PostgreSQL)
```

---

## 📁 3. Quy ước đặt tên & cấu trúc thư mục

### 📦 Module

- Mỗi domain (`users`, `events`, `orders`, etc.) là một module riêng trong `src/`
- Đặt tên folder **số nhiều**: `users/`, `orders/`, `tickets/`

### 🧐 Controller

- Tên file: `users.controller.ts`
- Định nghĩa route tương ứng: `@Controller('users')`

### ⚖️ Service

- Tên file: `users.service.ts`
- Không xử lý request ở đây — chỉ xử lý **logic, rules, transaction, etc.**

### 📁 DTO (Data Transfer Object)

- Thư mục `dto/`
- Đặt tên dạng: `create-user.dto.ts`, `update-ticket.dto.ts`
- Luôn dùng `class-validator` để validate input

### 🧱 Entity / Model

- Thư mục `entities/`
- Không thao tác DB → chỉ dùng để định nghĩa model logic (nếu cần)

---

## 🔐 4. Bảo mật & chuẩn hóa

- Luôn validate input bằng `DTO + class-validator`
- Dùng **JWT** để auth user (`access_token`, `refresh_token`)
- Các route cần quyền: bảo vệ bằng **Guards**
- Cấu hình `.env` trong `.env.development.local`, KHÔNG đẩy lên Git

---

## 💡 5. Test & Dev

- Viết test E2E với `supertest`
- Tách service để dễ unit test
- Dùng `Postman` hoặc `Thunder Client` để test endpoint
- Local dev dùng: `npm run start:dev`

---

## 📦 6. ORM: Prisma

- Prisma schema: `prisma/schema.prisma`
- Migration: `npx prisma migrate dev --name <description>`
- Sync DB: `npx prisma db push`
- Gen client: `npx prisma generate`
- Luôn commit file `prisma/migrations/` khi thay đổi schema

---

## 🛠 7. DevOps & Deployment

- Prod DB: dùng Supabase
- Dev DB: dùng Supabase project riêng hoặc local PostgreSQL
- API được expose public cho:
  - Web client (Next.js / React)
  - Mobile app (Flutter)
- Mỗi môi trường `.env` riêng biệt

---

## 🧠 8. Conventions & Best Practice

- Không viết logic vào `controller`
- Không truy vấn DB trực tiếp trong `service`
- Chia nhỏ module theo feature/domain, tránh God-module
- Tránh hard-code string role, trạng thái → dùng `enum`

---

## 💥 9. Code Style

- Dùng `Prettier` và `ESLint` đã config sẵn
- Viết `async/await`, không dùng callback
- Tránh viết hàm > 50 dòng
- Comment rõ ràng khi xử lý business logic phức tạp

---

## 📣 10. TODO & Next Steps

-

---

Built with ❤️ by Howls Studio 🐺

