export class SupabaseUserDto {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
} 