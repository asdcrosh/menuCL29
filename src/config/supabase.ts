import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Проверяем, что URL и ключ валидны
const isValidUrl = supabaseUrl && supabaseUrl !== 'your_supabase_url_here' && supabaseUrl.startsWith('https://');
const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here';

export const supabase = isValidUrl && isValidKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
