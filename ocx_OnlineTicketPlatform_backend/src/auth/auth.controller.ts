import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register new user
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.authService.register(createUserDto);
      
      return {
        success: true,
        message: 'User registered successfully. Please check your email to confirm your account.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            is_verified: result.user.is_verified,
          },
          session: result.session,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  }

  /**
   * Login user
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            is_verified: result.user.is_verified,
          },
          session: result.session,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  }

  /**
   * Google OAuth login/signup
   */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() body: { accessToken: string }) {
    if (!body.accessToken) {
      throw new BadRequestException('Access token is required');
    }

    try {
      const result = await this.authService.handleGoogleAuth(body.accessToken);
      
      return {
        success: true,
        message: 'Google authentication successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            is_verified: result.user.is_verified,
          },
          session: result.session,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Google authentication failed',
      };
    }
  }

  /**
   * Get current user profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    try {
      const user = await this.authService.getUserBySupabaseId(req.user.sub);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_verified: user.is_verified,
            avatar_url: user.avatar_url,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get profile',
      };
    }
  }

  /**
   * Logout user
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    try {
      await this.authService.logout();
      
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Logout failed',
      };
    }
  }

  /**
   * Admin only: Update user role
   */
  @Post('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async updateUserRole(
    @Request() req,
    @Body() body: { role: UserRole },
  ) {
    try {
      const user = await this.authService.updateUserRole(req.params.id, body.role);
      
      return {
        success: true,
        message: 'User role updated successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update user role',
      };
    }
  }

  /**
   * Verify user email
   */
  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  async verifyEmail(@Request() req) {
    try {
      const user = await this.authService.verifyEmail(req.user.id);
      
      return {
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_verified: user.is_verified,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to verify email',
      };
    }
  }

  /**
   * Sync email verification status
   */
  @Post('sync-verification')
  @UseGuards(JwtAuthGuard)
  async syncVerification(@Request() req) {
    try {
      const user = await this.authService.syncEmailVerification(req.user.sub);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        message: 'Verification status synced',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_verified: user.is_verified,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to sync verification',
      };
    }
  }
} 