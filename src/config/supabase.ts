import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL или ключ не настроены. Приложение будет работать в режиме только чтение.');
}

// Создаем клиент только если переменные настроены
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      restaurant: {
        Row: {
          id: number;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          icon: string;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          icon: string;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          icon?: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sub_categories: {
        Row: {
          id: number;
          name: string;
          category_id: number;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          category_id: number;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          category_id?: number;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: number;
          name: string;
          description: string;
          price: number;
          sub_category_id: number;
          available: boolean;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description: string;
          price: number;
          sub_category_id: number;
          available?: boolean;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
          price?: number;
          sub_category_id?: number;
          available?: boolean;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
