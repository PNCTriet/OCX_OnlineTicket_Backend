# OCX Online Ticket Platform Backend

A NestJS backend application for the OCX Online Ticket Platform with Supabase integration and Prisma ORM.

## 🆕 Recent Updates (Latest)

### ✅ Authentication & User Management
- **Supabase Integration**: Complete authentication system with email/password and social login (Google, Facebook)
- **User Role System**: Implemented 5-tier role hierarchy:
  - `USER` - Regular users (default)
  - `OWNER_ORGANIZER` - Event organizers
  - `ADMIN_ORGANIZER` - Event administrators
  - `ADMIN` - System administrators
  - `SUPERADMIN` - Super administrators
- **User Sync**: Automatic synchronization between Supabase auth and local database
- **Role-based Access Control**: Dashboard access restricted to non-USER roles

### ✅ Database Schema Updates
- **Complete Schema**: Full database schema with all entities (Users, Organizations, Events, Tickets, Orders, etc.)
- **User Model Enhancement**: Added role, verification status, Supabase ID linking
- **Relationships**: Proper foreign key relationships between all entities
- **Audit Fields**: Created/updated timestamps on all models

### ✅ Frontend Authentication Pages
- **Login Page**: Modern dark mode UI with email/password and social login
- **Signup Page**: User registration with validation and social signup
- **Admin Dashboard**: Role-based dashboard for administrators
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Tabler Icons**: Professional icon set throughout the application

### ✅ Backend Architecture
- **Modular Design**: Following NestJS best practices with feature modules
- **DTO Validation**: Input validation using class-validator
- **Error Handling**: Comprehensive error handling and logging
- **Service Layer**: Business logic separation with proper service architecture

## Features

- 🚀 NestJS framework
- 🗄️ Prisma ORM for database management
- ☁️ Supabase integration for authentication and real-time features
- 👥 Multi-role user system with role-based access control
- 🔐 Social authentication (Google, Facebook)
- 📝 TypeScript support
- 🧪 Testing setup with Jest
- 🔧 ESLint and Prettier configuration
- 🎨 Modern dark mode UI with Tailwind CSS
- 📱 Responsive design for mobile and desktop

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- PostgreSQL database (via Supabase)

## Installation

```bash
npm install
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Environment variables
NODE_ENV=development
PORT=3000

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
DIRECT_URL="postgresql://username:password@host:port/database?schema=public"

# Supabase
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# JWT Secret (for authentication)
JWT_SECRET="your-jwt-secret-key"
```

### Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

### Database URL Format

For Supabase PostgreSQL, your DATABASE_URL should look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## Database Setup

1. Generate Prisma client:
```bash
npx prisma generate
```

2. Run database migrations:
```bash
npx prisma migrate dev
```

3. (Optional) Open Prisma Studio to view/edit data:
```bash
npx prisma studio
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

### Frontend Routes
- `/` - Login page
- `/signup` - Registration page
- `/admin_dashboard` - Admin dashboard (Role-based access)

## Project Structure

```
src/
├── config/           # Configuration files
├── prisma/          # Prisma service and module
├── supabase/        # Supabase service and module
├── users/           # Users module
│   ├── dto/         # Data Transfer Objects
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── auth/            # Authentication module
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts

public/              # Static frontend files
├── index.html       # Login page
├── signup.html      # Registration page
├── admin_dashboard.html # Admin dashboard
└── js/              # Frontend JavaScript
    ├── auth.js
    ├── signup.js
    └── dashboard.js
```

## User Roles & Permissions

### Role Hierarchy
1. **USER** - Basic user access
   - Can register and login
   - Access to public features only

2. **OWNER_ORGANIZER** - Event organization owner
   - Can create and manage events
   - Full access to their organization

3. **ADMIN_ORGANIZER** - Event organization administrator
   - Can manage events and tickets
   - Limited administrative access

4. **ADMIN** - System administrator
   - Can manage all users and organizations
   - Access to system-wide features

5. **SUPERADMIN** - Super administrator
   - Full system access
   - Can manage all aspects of the platform

### Access Control
- Dashboard access is restricted to non-USER roles
- Role-based API endpoints
- Automatic role assignment on registration (default: USER)

## Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests

## Development Guidelines

### Backend Architecture
- Follow modular layered architecture
- Separate business logic in services
- Use DTOs for input validation
- Implement proper error handling
- Follow NestJS best practices

### Frontend Development
- Use Tailwind CSS for styling
- Implement responsive design
- Use Tabler icons for consistency
- Follow dark mode design principles
- Implement proper form validation

### Database Management
- Use Prisma migrations for schema changes
- Follow naming conventions
- Implement proper relationships
- Use transactions for data integrity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
