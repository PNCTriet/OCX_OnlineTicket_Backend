import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseUserDto } from './dto/supabase-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUserFromSupabase(supabaseUser: SupabaseUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { supabase_id: supabaseUser.id },
    });

    if (user) {
      // Update basic info
      return this.prisma.user.update({
        where: { supabase_id: supabaseUser.id },
        data: {
          email: supabaseUser.email,
          is_verified: !!supabaseUser.email_confirmed_at,
        },
      });
    } else {
      // Create new user with default role
      return this.prisma.user.create({
        data: {
          email: supabaseUser.email,
          supabase_id: supabaseUser.id,
          role: 'USER',
          is_verified: !!supabaseUser.email_confirmed_at,
        },
      });
    }
  }

  async getUserBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabase_id: supabaseId },
      select: { id: true, email: true, role: true, is_verified: true },
    });
  }
} 