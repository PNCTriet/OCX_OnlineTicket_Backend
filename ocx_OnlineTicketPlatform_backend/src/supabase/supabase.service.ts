import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { envConfig } from '../config/env.config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null = null;

  constructor() {
    // Only create client if URL and key are configured
    if (envConfig.supabaseUrl && envConfig.supabaseAnonKey && 
        envConfig.supabaseUrl !== 'your-supabase-project-url' && 
        envConfig.supabaseAnonKey !== 'your-supabase-anon-key') {
      this.supabase = createClient(
        envConfig.supabaseUrl,
        envConfig.supabaseAnonKey,
      );
    }
  }

  getClient(): SupabaseClient | null {
    return this.supabase;
  }

  // Auth methods
  async signUp(email: string, password: string) {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }
    return await this.supabase.auth.signUp({
      email,
      password,
    });
  }

  async signIn(email: string, password: string) {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut() {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }
    return await this.supabase.auth.signOut();
  }

  // Database methods
  async getUsers() {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }
    return await this.supabase
      .from('users')
      .select('*');
  }

  async createUser(userData: any) {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }
    return await this.supabase
      .from('users')
      .insert(userData)
      .select();
  }

  async updateUser(id: string, userData: any) {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }
    return await this.supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select();
  }

  async deleteUser(id: string) {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }
    return await this.supabase
      .from('users')
      .delete()
      .eq('id', id);
  }
} 