import { UserRole as PrismaUserRole } from '@prisma/client';

export enum UserRole {
  USER = 'USER',
  OWNER_ORGANIZER = 'OWNER_ORGANIZER',
  ADMIN_ORGANIZER = 'ADMIN_ORGANIZER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export class User {
  id: string;
  email: string;
  name: string | null;
  role: PrismaUserRole;
  is_verified: boolean;
  supabase_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
} 