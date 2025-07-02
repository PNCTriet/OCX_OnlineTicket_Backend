import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
          role: createUserDto.role || UserRole.USER,
          supabase_id: createUserDto.supabase_id,
          phone: createUserDto.phone,
          avatar_url: createUserDto.avatar_url,
          is_verified: createUserDto.is_verified || false,
        },
      });

      this.logger.log(`User created: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        include: {
          user_organizations: {
            include: {
              organization: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          user_organizations: {
            include: {
              organization: true,
            },
          },
          orders: true,
          referral_codes: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        include: {
          user_organizations: {
            include: {
              organization: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch user by email ${email}: ${error.message}`);
      throw error;
    }
  }

  async findBySupabaseId(supabaseId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { supabase_id: supabaseId },
        include: {
          user_organizations: {
            include: {
              organization: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch user by Supabase ID ${supabaseId}: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          name: updateUserDto.name,
          role: updateUserDto.role,
          phone: updateUserDto.phone,
          avatar_url: updateUserDto.avatar_url,
          is_verified: updateUserDto.is_verified,
        },
      });

      this.logger.log(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to update user ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });

      this.logger.log(`User deleted: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to delete user ${id}: ${error.message}`);
      throw error;
    }
  }

  async syncWithSupabase(supabaseUser: any) {
    try {
      // Check if user already exists
      let user = await this.findBySupabaseId(supabaseUser.id);

      if (user) {
        // Update existing user
        user = await this.update(user.id, {
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
          email: supabaseUser.email,
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          is_verified: supabaseUser.email_confirmed_at ? true : false,
        });
      } else {
        // Create new user
        user = await this.create({
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
          supabase_id: supabaseUser.id,
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          is_verified: supabaseUser.email_confirmed_at ? true : false,
          role: UserRole.USER, // Default role
        });
      }

      this.logger.log(`User synced with Supabase: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to sync user with Supabase: ${error.message}`);
      throw error;
    }
  }

  async hasAdminAccess(userId: string): Promise<boolean> {
    try {
      const user = await this.findOne(userId);
      return [
        UserRole.OWNER_ORGANIZER,
        UserRole.ADMIN_ORGANIZER,
        UserRole.ADMIN,
        UserRole.SUPERADMIN,
      ].includes(user.role);
    } catch (error) {
      this.logger.error(`Failed to check admin access for user ${userId}: ${error.message}`);
      return false;
    }
  }

  async hasSuperAdminAccess(userId: string): Promise<boolean> {
    try {
      const user = await this.findOne(userId);
      return user.role === UserRole.SUPERADMIN;
    } catch (error) {
      this.logger.error(`Failed to check super admin access for user ${userId}: ${error.message}`);
      return false;
    }
  }
} 