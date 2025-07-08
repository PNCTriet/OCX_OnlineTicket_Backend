import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from './entities/user.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Register new user with email/password
   */
  async register(createUserDto: CreateUserDto): Promise<{ user: User; session: any }> {
    try {
      // 1. Create user in Supabase Auth
      const supabaseResult = await this.supabaseService.signUp(
        createUserDto.email,
        createUserDto.password,
      );

      if (supabaseResult.error) {
        throw new ConflictException(supabaseResult.error.message);
      }

      const supabaseUser = supabaseResult.data.user;
      if (!supabaseUser) {
        throw new UnauthorizedException('Failed to create user in Supabase');
      }

      // 2. Create user in local database
      const localUser = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
          supabase_id: supabaseUser.id,
          role: UserRole.USER, // Default role
          is_verified: false,
          avatar_url: createUserDto.avatar_url,
        },
      });

      return {
        user: localUser,
        session: supabaseResult.data.session,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new ConflictException('Registration failed');
    }
  }

  /**
   * Login user with email/password
   */
  async login(loginDto: LoginDto): Promise<{ user: User; session: any }> {
    try {
      console.log('🔐 Login attempt for:', loginDto.email);
      
      // 1. Authenticate with Supabase
      const supabaseResult = await this.supabaseService.signIn(
        loginDto.email,
        loginDto.password,
      );

      console.log('📡 Supabase result:', supabaseResult);

      if (supabaseResult.error) {
        console.error('❌ Supabase error:', supabaseResult.error);
        throw new UnauthorizedException('Invalid credentials');
      }

      const supabaseUser = supabaseResult.data.user;
      if (!supabaseUser) {
        console.error('❌ No Supabase user found');
        throw new UnauthorizedException('User not found');
      }

      console.log('✅ Supabase user found:', supabaseUser.id);

      // 2. Get user from local database
      let localUser = await this.prisma.user.findUnique({
        where: { supabase_id: supabaseUser.id },
      });

      if (!localUser) {
        console.error('❌ No local user found for supabase_id:', supabaseUser.id);
        throw new UnauthorizedException('User not found in local database');
      }

      console.log('✅ Local user found:', localUser.email, 'Role:', localUser.role);

      // 3. Check if user is verified in Supabase and sync with local DB
      if (supabaseUser.email_confirmed_at && !localUser.is_verified) {
        console.log('🔄 Syncing email verification status');
        localUser = await this.prisma.user.update({
          where: { id: localUser.id },
          data: { is_verified: true },
        });
      }

      console.log('✅ Login successful for:', localUser.email);
      return {
        user: localUser,
        session: supabaseResult.data.session,
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  /**
   * Handle Google OAuth login/signup
   */
  async handleGoogleAuth(accessToken: string): Promise<{ user: User; session: any }> {
    try {
      // 1. Get user info from Google
      const googleUser = await this.getGoogleUserInfo(accessToken);

      // 2. Check if user exists in local database
      let localUser = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (!localUser) {
        // 3. Create new user if doesn't exist
        localUser = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            role: UserRole.USER, // Default role
            is_verified: true, // Google users are verified
            avatar_url: googleUser.picture,
          },
        });
      }

      // 4. Create or get Supabase session
      const session = await this.createSupabaseSession(googleUser);

      return {
        user: localUser,
        session,
      };
    } catch (error) {
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  /**
   * Get user by Supabase ID
   */
  async getUserBySupabaseId(supabaseId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { supabase_id: supabaseId },
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { is_verified: true },
    });
  }

  /**
   * Check if user email is verified in Supabase and sync
   */
  async syncEmailVerification(supabaseId: string): Promise<User | null> {
    try {
      // Get user from Supabase to check verification status
      const supabaseUser = await this.supabaseService.getUser(supabaseId);
      
      if (!supabaseUser) {
        return null;
      }

      // Get local user
      const localUser = await this.prisma.user.findUnique({
        where: { supabase_id: supabaseId },
      });

      if (!localUser) {
        return null;
      }

      // Sync verification status
      if (supabaseUser.email_confirmed_at && !localUser.is_verified) {
        return this.prisma.user.update({
          where: { id: localUser.id },
          data: { is_verified: true },
        });
      }

      return localUser;
    } catch (error) {
      return null;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.supabaseService.signOut();
  }

  /**
   * Get Google user info from access token
   */
  private async getGoogleUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
    );
    
    if (!response.ok) {
      throw new Error('Failed to get Google user info');
    }

    return response.json();
  }

  /**
   * Create Supabase session for Google user
   */
  private async createSupabaseSession(googleUser: any): Promise<any> {
    // This is a simplified implementation
    // In production, you'd need to handle JWT tokens properly
    return {
      access_token: 'mock_token',
      refresh_token: 'mock_refresh_token',
      user: {
        id: googleUser.id,
        email: googleUser.email,
      },
    };
  }
} 