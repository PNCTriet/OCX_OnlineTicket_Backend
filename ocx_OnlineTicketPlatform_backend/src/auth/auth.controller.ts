import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { SupabaseUserDto } from './dto/supabase-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string; name?: string }) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new Error('No token');
    const token = authHeader.replace('Bearer ', '');
    const payload: any = jwt.decode(token);
    const supabaseId = payload.sub;
    const user = await this.authService.getUserBySupabaseId(supabaseId);
    return { success: true, data: { user } };
  }

  @Post('sync')
  async syncUser(@Body() supabaseUser: SupabaseUserDto) {
    return this.authService.syncUserFromSupabase(supabaseUser);
  }
} 