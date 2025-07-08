import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config';
import { join } from 'path';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Always allow API routes to pass through
    const isApiRoute = req.path.startsWith('/auth/') || req.path.startsWith('/api/');
    if (isApiRoute) {
      console.log(`🔌 API route: ${req.path}`);
      return next();
    }

    // Skip auth for public routes
    const publicRoutes = [
      '/signup.html',
      '/index.html',
      '/js/',
      '/css/',
      '/images/',
      '/favicon.ico'
    ];

    const isPublicRoute = publicRoutes.some(route => 
      req.path.startsWith(route) || req.path === route
    );

    // Special handling for root route
    if (req.path === '/') {
      console.log(`🏠 Root route: ${req.path}`);
      // Check if user is authenticated
      const token = this.extractTokenFromHeader(req);
      if (token) {
        try {
          const payload = jwt.verify(token, envConfig.jwtSecret) as any;
          const user = await this.prisma.user.findUnique({
            where: { supabase_id: payload.sub }
          });
          
          if (user) {
            // User is authenticated, redirect based on role
            let redirectUrl = '';
            switch (user.role) {
              case 'USER':
                redirectUrl = '/home.html';
                break;
              case 'OWNER_ORGANIZER':
              case 'ADMIN_ORGANIZER':
                redirectUrl = '/organizer_dashboard.html';
                break;
              case 'ADMIN':
              case 'SUPERADMIN':
                redirectUrl = '/admin_dashboard.html';
                break;
              default:
                redirectUrl = '/home.html';
            }
            console.log(`🔄 Redirecting authenticated user to: ${redirectUrl}`);
            return res.redirect(redirectUrl);
          }
        } catch (error) {
          console.log(`❌ Invalid token on root route: ${error.message}`);
        }
      }
      // No token or invalid token, serve index.html
      return res.sendFile(join(process.cwd(), 'public', 'index.html'));
    }

    if (isPublicRoute) {
      console.log(`✅ Public route: ${req.path}`);
      return next();
    }

    // Check for JWT token
    const token = this.extractTokenFromHeader(req);
    
    if (!token) {
      console.log(`❌ No token found for: ${req.path}`);
      // Redirect to login for HTML pages
      if (req.path.endsWith('.html')) {
        console.log(`🔄 Redirecting to login: ${req.path}`);
        return res.redirect('/index.html');
      }
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify JWT token
      const payload = jwt.verify(token, envConfig.jwtSecret) as any;
      
      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { supabase_id: payload.sub }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user is verified (for sensitive routes)
      const sensitiveRoutes = [
        '/admin_dashboard.html',
        '/organizer_dashboard.html',
        '/api/admin',
        '/api/organizer'
      ];

      const isSensitiveRoute = sensitiveRoutes.some(route => 
        req.path.startsWith(route)
      );

      if (isSensitiveRoute && !user.is_verified) {
        if (req.path.endsWith('.html')) {
          return res.redirect('/index.html?error=email_not_verified');
        }
        throw new UnauthorizedException('Email not verified');
      }

      // Add user info to request
      req['user'] = {
        ...payload,
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      };

      console.log(`✅ User authenticated: ${user.email} (${user.role})`);
      next();
    } catch (error) {
      if (req.path.endsWith('.html')) {
        return res.redirect('/index.html?error=invalid_token');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 