import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { envConfig } from '../config/env.config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null = null;

  constructor() {
    console.log('SupabaseService: Initializing...');
    console.log('SupabaseService: URL:', envConfig.supabaseUrl);
    console.log('SupabaseService: Anon Key:', envConfig.supabaseAnonKey ? 'EXISTS' : 'MISSING');
    
    // Only create client if URL and key are configured
    if (envConfig.supabaseUrl && envConfig.supabaseAnonKey && 
        envConfig.supabaseUrl !== 'your-supabase-project-url' && 
        envConfig.supabaseAnonKey !== 'your-supabase-anon-key') {
      console.log('SupabaseService: Creating Supabase client...');
      this.supabase = createClient(
        envConfig.supabaseUrl,
        envConfig.supabaseAnonKey,
      );
      console.log('SupabaseService: Supabase client created successfully');
    } else {
      console.log('SupabaseService: Supabase client NOT created - missing configuration');
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
      console.error('❌ Supabase client not configured');
      throw new Error('Supabase client not configured');
    }
    
    try {
      console.log('🔐 Attempting Supabase sign in for:', email);
      const result = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('📡 Supabase sign in result:', {
        success: !result.error,
        hasUser: !!result.data?.user,
        hasSession: !!result.data?.session
      });
      
      return result;
    } catch (error) {
      console.error('❌ Supabase sign in error:', error);
      throw error;
    }
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

  async getUser(userId: string) {
    if (!this.supabase) {
      throw new Error('Supabase client not configured');
    }
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);
    
    if (error) {
      throw error;
    }
    
    return data.user;
  }
} 