import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin_dashboard')
  serveAdminDashboard(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'public', 'admin_dashboard.html'));
  }

  @Get('signup')
  serveSignup(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'public', 'signup.html'));
  }

  @Get('login')
  serveLogin(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }
}
