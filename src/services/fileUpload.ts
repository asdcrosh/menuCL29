import { supabase } from '../config/supabase';

export interface UploadResult {
  url: string;
  path: string;
}

export class FileUploadService {
  /**
   * Загружает изображение в Supabase Storage
   */
  static async uploadImage(file: File): Promise<UploadResult> {
    if (!supabase) {
      throw new Error('Supabase не настроен');
    }

    // Проверяем, что это изображение
    if (!file.type.startsWith('image/')) {
      throw new Error('Файл должен быть изображением');
    }

    // Проверяем размер файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Размер файла не должен превышать 5MB');
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `menu-items/${fileName}`;

    try {
      // Загружаем файл в Supabase Storage
      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Ошибка загрузки: ${error.message}`);
      }

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      throw error;
    }
  }

  /**
   * Удаляет изображение из Supabase Storage
   */
  static async deleteImage(filePath: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase не настроен');
    }

    try {
      const { error } = await supabase.storage
        .from('menu-images')
        .remove([filePath]);

      if (error) {
        throw new Error(`Ошибка удаления: ${error.message}`);
      }
    } catch (error) {
      console.error('Ошибка при удалении изображения:', error);
      throw error;
    }
  }

  /**
   * Проверяет, является ли URL изображением
   */
  static isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    // Проверяем, что это URL
    try {
      new URL(url);
    } catch {
      return false;
    }

    // Проверяем расширение файла
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }

  /**
   * Получает расширение файла из URL
   */
  static getFileExtension(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastDotIndex = pathname.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        return pathname.substring(lastDotIndex + 1).toLowerCase();
      }
    } catch {
      // Если не удается распарсить URL, возвращаем пустую строку
    }
    return '';
  }
}
