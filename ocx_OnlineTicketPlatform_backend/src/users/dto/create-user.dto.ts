import { IsEmail, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

export enum UserRole {
  USER = 'USER',
  OWNER_ORGANIZER = 'OWNER_ORGANIZER',
  ADMIN_ORGANIZER = 'ADMIN_ORGANIZER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  supabase_id?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
} 