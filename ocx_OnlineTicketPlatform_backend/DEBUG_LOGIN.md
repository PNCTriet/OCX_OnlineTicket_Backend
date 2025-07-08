# 🔍 Debug Login Error: "Unexpected token '<'"

## Vấn đề: Frontend nhận HTML thay vì JSON response

### 🔍 **Nguyên nhân có thể:**

1. **Backend trả về HTML error page**
2. **API endpoint không đúng**
3. **Server error (500, 404)**
4. **Supabase configuration issue**
5. **Middleware redirect**

### 🧪 **Debug Steps:**

#### 1. **Kiểm tra browser console:**
```javascript
// Mở browser dev tools (F12)
// Xem Console tab cho error messages
// Xem Network tab cho request/response
```

#### 2. **Test API trực tiếp:**
```bash
# Test login endpoint
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v
```

#### 3. **Kiểm tra server logs:**
```bash
# Xem backend console logs
npm run start:dev
```

### 🔧 **Expected Logs:**

#### Backend logs khi login:
```
🔐 Login attempt for: test@example.com
🔐 Attempting Supabase sign in for: test@example.com
📡 Supabase sign in result: { success: true, hasUser: true, hasSession: true }
✅ Supabase user found: user-id
✅ Local user found: test@example.com Role: USER
✅ Login successful for: test@example.com
```

#### Frontend logs:
```
🔄 Calling login API...
📡 Response status: 200
📡 Response headers: content-type: application/json
📡 Response data: { success: true, message: "Login successful", data: {...} }
```

### 🚨 **Nếu vẫn có lỗi:**

#### 1. **Kiểm tra .env file:**
```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
```

#### 2. **Kiểm tra Supabase client:**
```javascript
// Trong browser console
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Key:', process.env.SUPABASE_ANON_KEY);
```

#### 3. **Test Supabase connection:**
```bash
# Test Supabase client creation
curl -X GET https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"
```

### 📋 **Debug Checklist:**

- [ ] Backend server running (`npm run start:dev`)
- [ ] Supabase client configured correctly
- [ ] Database connection working
- [ ] API endpoint `/auth/login` accessible
- [ ] Request body format correct
- [ ] Response is JSON, not HTML
- [ ] No middleware redirecting request

### 🎯 **Quick Fixes:**

#### 1. **Clear browser cache:**
```javascript
localStorage.clear();
sessionStorage.clear();
```

#### 2. **Check network tab:**
- Xem request URL có đúng không
- Xem response status code
- Xem response content-type

#### 3. **Test with curl:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### 🔄 **Fallback Solution:**

Nếu vẫn không work, có thể tạm thời sử dụng Supabase trực tiếp:

```javascript
// Trong auth.js, comment out backend call
// const response = await fetch('/auth/login', {...});

// Use Supabase directly
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
});
```

### 📝 **Common Issues:**

1. **CORS error** → Check middleware configuration
2. **404 error** → Check API route definition
3. **500 error** → Check backend logs
4. **Supabase error** → Check environment variables
5. **Database error** → Check Prisma connection 