import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseService: SupabaseService) {}

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
  async getProfile(@Request() req) {
    // This would typically use a JWT guard
    // For now, we'll return a mock response
    return {
      success: true,
      data: {
        user: {
          id: 'mock-user-id',
          email: 'user@example.com',
          name: 'Mock User'
        }
      }
    };
  }
} 