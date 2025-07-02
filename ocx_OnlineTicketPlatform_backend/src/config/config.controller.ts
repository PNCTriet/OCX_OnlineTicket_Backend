import { Controller, Get } from '@nestjs/common';
import { envConfig } from './env.config';

@Controller('api')
export class ConfigController {
  @Get('config')
  getConfig() {
    return {
      supabaseUrl: envConfig.supabaseUrl,
      supabaseAnonKey: envConfig.supabaseAnonKey,
    };
  }
} 