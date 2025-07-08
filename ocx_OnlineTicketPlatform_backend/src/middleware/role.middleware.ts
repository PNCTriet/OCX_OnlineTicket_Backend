import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

@Injectable()
export class RoleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`🎯 RoleMiddleware: ${req.method} ${req.path}`);
    
    const user = req['user'];
    
    if (!user) {
      console.log(`⚠️ No user found in request`);
      return next();
    }

    // Define route permissions
    const routePermissions = {
      // Admin routes
      '/admin_dashboard.html': [UserRole.ADMIN, UserRole.SUPERADMIN],
      '/api/admin': [UserRole.ADMIN, UserRole.SUPERADMIN],
      
      // Organizer routes
      '/organizer_dashboard.html': [UserRole.OWNER_ORGANIZER, UserRole.ADMIN_ORGANIZER, UserRole.ADMIN, UserRole.SUPERADMIN],
      '/api/organizer': [UserRole.OWNER_ORGANIZER, UserRole.ADMIN_ORGANIZER, UserRole.ADMIN, UserRole.SUPERADMIN],
      
      // User routes
      '/home.html': [UserRole.USER, UserRole.OWNER_ORGANIZER, UserRole.ADMIN_ORGANIZER, UserRole.ADMIN, UserRole.SUPERADMIN],
      '/api/user': [UserRole.USER, UserRole.OWNER_ORGANIZER, UserRole.ADMIN_ORGANIZER, UserRole.ADMIN, UserRole.SUPERADMIN],
    };

    // Check if current route requires specific permissions
    const currentPath = req.path;
    const matchingRoute = Object.keys(routePermissions).find(route => currentPath.startsWith(route));
    const requiredRoles = routePermissions[currentPath] || (matchingRoute ? routePermissions[matchingRoute] : undefined);

    if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
      console.log(`🚫 Access denied: User role ${user.role} cannot access ${currentPath}`);
      if (currentPath.endsWith('.html')) {
        console.log(`🔄 Redirecting due to insufficient permissions: ${currentPath}`);
        return res.redirect('/index.html?error=insufficient_permissions');
      }
      throw new ForbiddenException('Insufficient permissions');
    }

    next();
  }
} 