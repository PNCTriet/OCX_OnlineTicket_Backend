# 🔍 Debug Middleware Issue

## Vấn đề: User role vẫn vào được admin_dashboard

### 🔍 **Nguyên nhân có thể:**

1. **Frontend vẫn gọi Supabase trực tiếp** ✅ Đã sửa
2. **Middleware không chạy cho static files** ✅ Đã thêm debug
3. **Token không được gửi đúng cách** ✅ Đã sửa
4. **Role từ Supabase không đúng** ✅ Đã chuyển sang backend

### 🧪 **Cách test:**

#### 1. Start server với debug logs:
```bash
npm run start:dev
```

#### 2. Test flow:
1. Mở browser dev tools (F12)
2. Clear localStorage: `localStorage.clear()`
3. Truy cập `http://localhost:3000/admin_dashboard.html`
4. Xem console logs:
   - Backend: Kiểm tra middleware logs
   - Frontend: Kiểm tra network requests

#### 3. Expected logs:
```
🔒 AuthMiddleware: GET /admin_dashboard.html
❌ No token found for: /admin_dashboard.html
🔄 Redirecting to login: /admin_dashboard.html
```

#### 4. Test login flow:
1. Login với user role = USER
2. Xem logs khi redirect
3. Thử truy cập admin_dashboard.html lại

### 🔧 **Debug Steps:**

#### Step 1: Kiểm tra token
```javascript
// Trong browser console
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
console.log('Role:', localStorage.getItem('role'));
```

#### Step 2: Kiểm tra network requests
- Mở Network tab trong dev tools
- Login và xem request đến `/auth/login`
- Kiểm tra response có đúng role không

#### Step 3: Test API trực tiếp
```bash
# Test login API
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected route với token
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🚨 **Nếu vẫn không work:**

#### 1. Kiểm tra JWT Secret:
```bash
# Trong .env file
JWT_SECRET=your-secret-key
```

#### 2. Kiểm tra Prisma User:
```sql
-- Trong database
SELECT id, email, role, is_verified FROM users WHERE email = 'test@example.com';
```

#### 3. Force middleware:
```typescript
// Trong auth.middleware.ts
console.log('🔍 User from DB:', user);
console.log('🔍 User role:', user.role);
console.log('🔍 Is verified:', user.is_verified);
```

### 📋 **Checklist:**

- [ ] Frontend gọi `/auth/login` thay vì Supabase
- [ ] Backend trả về đúng role từ database
- [ ] Token được lưu trong localStorage
- [ ] Token được gửi trong Authorization header
- [ ] Middleware chạy và log được
- [ ] Role check hoạt động đúng
- [ ] Redirect hoạt động khi không đủ quyền

### 🎯 **Expected Behavior:**

1. **User role = USER** → Truy cập `/admin_dashboard.html` → Redirect về login với error
2. **User role = ADMIN** → Truy cập `/admin_dashboard.html` → Thành công
3. **No token** → Truy cập bất kỳ protected route → Redirect về login 