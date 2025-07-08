import { Controller, Get, Req, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { SupabaseUserDto } from './dto/supabase-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new Error('No token');
    const token = authHeader.replace('Bearer ', '');

    // Decode JWT (không verify signature ở đây, chỉ lấy payload)
    const payload: any = jwt.decode(token);
    const supabaseId = payload.sub;

    // Lấy user từ DB
    const user = await this.authService.getUserBySupabaseId(supabaseId);
    return user;
  }

  @Post('sync')
  async syncUser(@Body() supabaseUser: SupabaseUserDto) {
    return this.authService.syncUserFromSupabase(supabaseUser);
  }
} 