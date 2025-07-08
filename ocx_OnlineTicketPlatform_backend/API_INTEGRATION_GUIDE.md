# 🔐 OCX Authentication API Integration Guide

> Hướng dẫn tích hợp API Authentication với Frontend NextJS

---

## 📋 Tổng quan

Hệ thống authentication của OCX sử dụng **hybrid approach**:
- **Supabase Auth**: Xử lý authentication (login, signup, OAuth)
- **Local PostgreSQL**: Lưu trữ user data và role management
- **JWT Tokens**: Session management

---

## 🚀 API Endpoints

### Base URL
```
http://localhost:3000
```

### 1. User Registration
```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to confirm your account.",
  "data": {
    "user": {
      "id": "cmco3ow1p0000idj4ppz3kwpv",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "is_verified": false
    },
    "session": null
  }
}
```

**Response Error (400/409):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 2. User Login
```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cmco3ow1p0000idj4ppz3kwpv",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "is_verified": true
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 3. Google OAuth
```http
POST /auth/google
Content-Type: application/json
```

**Request Body:**
```json
{
  "accessToken": "google_access_token_here"
}
```

### 4. Get User Profile
```http
GET /auth/profile
Authorization: Bearer <jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmco3ow1p0000idj4ppz3kwpv",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "is_verified": true,
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

### 5. Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

---

## 🎯 User Roles & Permissions

### Role Hierarchy
```typescript
enum UserRole {
  USER = 'USER',                    // Regular users
  OWNER_ORGANIZER = 'OWNER_ORGANIZER', // Event organizers
  ADMIN_ORGANIZER = 'ADMIN_ORGANIZER', // Event administrators  
  ADMIN = 'ADMIN',                  // System administrators
  SUPERADMIN = 'SUPERADMIN'         // Super administrators
}
```

### Role-based Access
- **USER**: Basic access, view events
- **OWNER_ORGANIZER**: Create/manage events, manage tickets
- **ADMIN_ORGANIZER**: Event management, user management
- **ADMIN**: System-wide management
- **SUPERADMIN**: Full system access

---

## 🔧 NextJS Integration

### 1. Setup Environment Variables

Tạo file `.env.local` trong NextJS project:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Create API Service

Tạo file `services/authService.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'OWNER_ORGANIZER' | 'ADMIN_ORGANIZER' | 'ADMIN' | 'SUPERADMIN';
  is_verified: boolean;
  avatar_url?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    session: any;
  };
}

class AuthService {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    return response.json();
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async googleAuth(accessToken: string): Promise<AuthResponse> {
    return this.makeRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
  }

  async getProfile(token: string): Promise<AuthResponse> {
    return this.makeRequest('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async logout(token: string): Promise<AuthResponse> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const authService = new AuthService();
```

### 3. Create Auth Context

Tạo file `contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Verify token is still valid
      authService.getProfile(savedToken).then((response) => {
        if (!response.success) {
          // Token expired, clear session
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setToken(null);
          setUser(null);
        }
      });
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    
    if (response.success && response.data) {
      const { user, session } = response.data;
      setUser(user);
      setToken(session.access_token);
      
      localStorage.setItem('auth_token', session.access_token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      throw new Error(response.message);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await authService.register(email, password, name);
    
    if (response.success && response.data) {
      const { user, session } = response.data;
      setUser(user);
      setToken(session?.access_token);
      
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    } else {
      throw new Error(response.message);
    }
  };

  const logout = async () => {
    if (token) {
      await authService.logout(token);
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 4. Create Registration Page

Tạo file `pages/register.tsx`:

```typescript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <input
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 5. Create Protected Route Component

Tạo file `components/ProtectedRoute.tsx`:

```typescript
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requiredRoles && !requiredRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, requiredRoles, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
```

### 6. Usage in Pages

```typescript
// pages/admin.tsx
import ProtectedRoute from '../components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'SUPERADMIN']}>
      <div>
        <h1>Admin Dashboard</h1>
        {/* Admin content */}
      </div>
    </ProtectedRoute>
  );
}

// pages/organizer.tsx
import ProtectedRoute from '../components/ProtectedRoute';

export default function OrganizerPage() {
  return (
    <ProtectedRoute requiredRoles={['OWNER_ORGANIZER', 'ADMIN_ORGANIZER']}>
      <div>
        <h1>Organizer Dashboard</h1>
        {/* Organizer content */}
      </div>
    </ProtectedRoute>
  );
}
```

---

## 🔒 Security Best Practices

### 1. Token Management
- Store JWT tokens in `localStorage` (for demo) or `httpOnly` cookies (production)
- Implement token refresh mechanism
- Clear tokens on logout

### 2. Error Handling
- Handle network errors gracefully
- Show user-friendly error messages
- Log errors for debugging

### 3. Input Validation
- Validate on both client and server
- Sanitize user inputs
- Use TypeScript for type safety

### 4. Role-based UI
```typescript
// Show/hide UI elements based on user role
{user?.role === 'ADMIN' && (
  <AdminPanel />
)}

{['OWNER_ORGANIZER', 'ADMIN_ORGANIZER'].includes(user?.role || '') && (
  <EventManagement />
)}
```

---

## 🧪 Testing

### 1. Test Registration
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Route
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Deployment

### 1. Environment Variables
```env
# Production
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. CORS Configuration
Đảm bảo backend cho phép CORS từ frontend domain:

```typescript
// Backend CORS config
app.enableCors({
  origin: ['http://localhost:3001', 'https://your-frontend-domain.com'],
  credentials: true,
});
```

---

## 📝 Notes

1. **Email Verification**: Users cần verify email sau khi register
2. **Password Requirements**: Minimum 6 characters
3. **Session Management**: JWT tokens expire, implement refresh logic
4. **Error Messages**: Backend trả về user-friendly error messages
5. **Role Updates**: Admin có thể update user roles via API

---

## 🔗 Useful Links

- [NextJS Documentation](https://nextjs.org/docs)
- [JWT.io](https://jwt.io/) - JWT token debugger
- [Supabase Auth](https://supabase.com/docs/guides/auth) - Authentication docs
- [Prisma Documentation](https://www.prisma.io/docs) - Database ORM

---

Built with ❤️ by OCX Team 🎫 