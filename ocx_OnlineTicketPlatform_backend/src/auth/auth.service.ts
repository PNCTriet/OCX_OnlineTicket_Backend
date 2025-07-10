import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import { SupabaseUserDto } from './dto/supabase-user.dto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    if (!email) throw new Error('Email is required');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { success: false, message: error?.message || 'Invalid credentials' };
    }
    const supabaseUser = data.user;
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
          role: 'USER',
          is_verified: !!supabaseUser.email_confirmed_at,
        }
      });
    } else {
      await this.prisma.user.update({
        where: { email },
        data: { is_verified: !!supabaseUser.email_confirmed_at }
      });
    }
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_verified: user.is_verified
        },
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token
        }
      }
    };
  }

  async register(email: string, password: string, name?: string) {
    if (!email) throw new Error('Email is required');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error || !data.user) {
      return { success: false, message: error?.message || 'Registration failed' };
    }
    if (!data.user.email) throw new Error('Email is required');
    const regEmail = data.user.email;
    let user = await this.prisma.user.findUnique({ where: { email: regEmail } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: regEmail,
          name: name,
          role: 'USER',
          is_verified: false,
        }
      });
    }
    return {
      success: true,
      message: 'User registered successfully. Please check your email to confirm your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_verified: user.is_verified
        },
        session: null
      }
    };
  }

  async getUserBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({ where: { supabase_id: supabaseId } });
  }

  async syncUserFromSupabase(supabaseUser: SupabaseUserDto) {
    if (!supabaseUser.email) throw new Error('Email is required');
    const email = supabaseUser.email;
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
          role: 'USER',
          is_verified: !!supabaseUser.email_confirmed_at,
        }
      });
    } else {
      await this.prisma.user.update({
        where: { email },
        data: { is_verified: !!supabaseUser.email_confirmed_at }
      });
    }
    return user;
  }
} 