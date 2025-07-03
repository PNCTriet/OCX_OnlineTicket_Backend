import { Controller, Post, Body, Get, UseGuards, Request, Req } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from './auth.service';
import { Request as ExpressRequest } from 'express';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseService: SupabaseService, private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    try {
      const result = await this.supabaseService.signIn(loginDto.email, loginDto.password);
      return {
        success: true,
        data: result.data,
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  @Post('register')
  async register(@Body() registerDto: { email: string; password: string; name?: string }) {
    try {
      const result = await this.supabaseService.signUp(registerDto.email, registerDto.password);
      return {
        success: true,
        data: result.data,
        message: 'Registration successful. Please check your email to confirm your account.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  @Post('logout')
  async logout() {
    try {
      await this.supabaseService.signOut();
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Logout failed'
      };
    }
  }

  @Get('profile')
  async getProfile(@Req() req: ExpressRequest) {
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
} 