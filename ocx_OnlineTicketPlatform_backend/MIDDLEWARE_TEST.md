# 🔒 Middleware Testing Guide

## Đã triển khai:

### 1. **AuthMiddleware** (`src/middleware/auth.middleware.ts`)
- ✅ Bảo vệ tất cả routes (trừ public routes)
- ✅ Kiểm tra JWT token
- ✅ Redirect về login nếu chưa đăng nhập
- ✅ Kiểm tra email verification cho sensitive routes
- ✅ Thêm user info vào request

### 2. **RoleMiddleware** (`src/middleware/role.middleware.ts`)
- ✅ Kiểm tra role permissions cho từng route
- ✅ Redirect nếu không đủ quyền
- ✅ Support role hierarchy

### 3. **Email Verification Sync**
- ✅ Tự động sync verification status từ Supabase
- ✅ Update local DB khi user verify email
- ✅ Endpoint để manual sync

## 🧪 Test Cases:

### Test 1: Public Routes (Không cần auth)
```bash
# Các routes này phải accessible mà không cần login
curl http://localhost:3000/
curl http://localhost:3000/index.html
curl http://localhost:3000/signup.html
curl http://localhost:3000/auth/register
curl http://localhost:3000/auth/login
```

### Test 2: Protected Routes (Cần auth)
```bash
# Các routes này phải redirect về login nếu chưa auth
curl http://localhost:3000/admin_dashboard.html
curl http://localhost:3000/organizer_dashboard.html
curl http://localhost:3000/home.html
```

### Test 3: Role-based Access
```bash
# Login với user role = USER
# Thử truy cập admin dashboard -> phải redirect về login với error

# Login với user role = ADMIN
# Truy cập admin dashboard -> phải thành công
```

### Test 4: Email Verification
```bash
# User chưa verify email
# Truy cập sensitive routes -> phải redirect với error "email_not_verified"

# User đã verify email
# Truy cập sensitive routes -> phải thành công
```

## 🔧 Cách test:

### 1. Start server:
```bash
npm run start:dev
```

### 2. Test với browser:
1. Mở `http://localhost:3000`
2. Thử truy cập `/admin_dashboard.html` -> phải redirect về login
3. Login với user có role khác nhau
4. Kiểm tra redirect behavior

### 3. Test với curl:
```bash
# Test protected route without token
curl -v http://localhost:3000/admin_dashboard.html

# Test with invalid token
curl -v -H "Authorization: Bearer invalid_token" http://localhost:3000/admin_dashboard.html

# Test with valid token
curl -v -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/admin_dashboard.html
```

## 📋 Route Permissions:

| Route | USER | OWNER_ORGANIZER | ADMIN_ORGANIZER | ADMIN | SUPERADMIN |
|-------|------|-----------------|-----------------|-------|------------|
| `/home.html` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/organizer_dashboard.html` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/admin_dashboard.html` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/user` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/organizer` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/api/admin` | ❌ | ❌ | ❌ | ✅ | ✅ |

## 🚨 Error Messages:

- `No token provided` - Chưa đăng nhập
- `Invalid token` - Token không hợp lệ
- `User not found` - User không tồn tại trong DB
- `Email not verified` - Email chưa verify
- `Insufficient permissions` - Không đủ quyền

## 🔄 Email Verification Flow:

1. User register → `is_verified: false`
2. User click verify email link từ Supabase
3. Supabase mark user as verified
4. User login → AuthService check `email_confirmed_at`
5. Auto update local DB: `is_verified: true`
6. User có thể truy cập sensitive routes

## 📝 Notes:

- Middleware chạy trước tất cả routes
- Public routes được define trong `AuthMiddleware`
- Role permissions được define trong `RoleMiddleware`
- Email verification check cho sensitive routes
- Redirect behavior khác nhau cho HTML vs API routes 