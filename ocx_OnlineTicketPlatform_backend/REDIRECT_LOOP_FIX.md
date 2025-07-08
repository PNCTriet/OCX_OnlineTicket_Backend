# 🔄 Redirect Loop Fix

## Vấn đề: Vòng lặp vô hạn khi login với SUPERADMIN

### 🔍 **Nguyên nhân:**
1. **Frontend redirect về `/` thay vì `/index.html`**
2. **Middleware coi `/` là public route**
3. **Frontend lại redirect về admin dashboard**
4. **Tạo vòng lặp: `/` → `/admin_dashboard.html` → `/` → ...**

### ✅ **Giải pháp đã áp dụng:**

#### 1. **Special handling cho root route (`/`)**
```typescript
// Trong AuthMiddleware
if (req.path === '/') {
  // Check if user is authenticated
  const token = this.extractTokenFromHeader(req);
  if (token) {
    // User authenticated → redirect based on role
    switch (user.role) {
      case 'SUPERADMIN':
        return res.redirect('/admin_dashboard.html');
      // ...
    }
  }
  // No token → serve index.html
  return res.sendFile(join(process.cwd(), 'public', 'index.html'));
}
```

#### 2. **Frontend chỉ redirect khi ở login page**
```javascript
// Chỉ redirect nếu đang ở login page
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
  window.location.href = redirectUrl;
}
```

#### 3. **Middleware không redirect root route**
```typescript
// Chỉ redirect HTML pages, không redirect root
if (req.path.endsWith('.html')) {
  return res.redirect('/index.html');
}
```

### 🧪 **Test Flow:**

#### 1. **Test với user chưa login:**
```
GET / → Serve index.html (login page)
```

#### 2. **Test với SUPERADMIN:**
```
GET / → Check token → Redirect to /admin_dashboard.html
```

#### 3. **Test với USER:**
```
GET / → Check token → Redirect to /home.html
```

#### 4. **Test protected route không có token:**
```
GET /admin_dashboard.html → Redirect to /index.html
```

### 🔧 **Debug Commands:**

#### 1. **Clear browser data:**
```javascript
// Trong browser console
localStorage.clear();
sessionStorage.clear();
```

#### 2. **Check current state:**
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
console.log('Role:', localStorage.getItem('role'));
console.log('Path:', window.location.pathname);
```

#### 3. **Test API directly:**
```bash
# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Test profile with token
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 📋 **Expected Behavior:**

| Scenario | Path | Expected Result |
|----------|------|-----------------|
| No token | `/` | Show login page |
| No token | `/admin_dashboard.html` | Redirect to `/index.html` |
| SUPERADMIN token | `/` | Redirect to `/admin_dashboard.html` |
| USER token | `/` | Redirect to `/home.html` |
| Invalid token | `/` | Show login page |

### 🚨 **Nếu vẫn có loop:**

#### 1. **Check browser network tab:**
- Xem có request nào bị loop không
- Kiểm tra redirect chain

#### 2. **Check server logs:**
```
🔒 AuthMiddleware: GET /
🏠 Root route: /
✅ User authenticated: admin@example.com (SUPERADMIN)
🔄 Redirecting authenticated user to: /admin_dashboard.html
```

#### 3. **Force clear and retry:**
```javascript
// Trong browser console
localStorage.clear();
window.location.href = '/';
```

### 🎯 **Success Criteria:**

- ✅ No infinite redirect loop
- ✅ SUPERADMIN → Admin dashboard
- ✅ USER → Home page  
- ✅ No token → Login page
- ✅ Protected routes → Redirect to login 