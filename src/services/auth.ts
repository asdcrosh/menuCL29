import { supabase } from '../config/supabase';
import { AdminUser, AccessCode, LoginCredentials, RegistrationData } from '../types/menu';

class AuthService {
  static async validateAccessCode(code: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase не настроен');
    }

    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code)
        .eq('is_used', false)
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  static async registerUser(registrationData: RegistrationData): Promise<AdminUser> {
    if (!supabase) {
      throw new Error('Supabase не настроен');
    }

    if (registrationData.password !== registrationData.confirmPassword) {
      throw new Error('Пароли не совпадают');
    }

    if (registrationData.password.length < 6) {
      throw new Error('Пароль должен содержать минимум 6 символов');
    }

    // Проверяем код доступа
    const { data: accessCode, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', registrationData.accessCode)
      .eq('is_used', false)
      .single();

    if (codeError || !accessCode) {
      throw new Error('Неверный или уже использованный код доступа');
    }

    // Проверяем, что username не занят
    const { data: existingUser, error: userCheckError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', registrationData.username)
      .single();

    if (existingUser) {
      throw new Error('Пользователь с таким именем уже существует');
    }

    // Создаем пользователя
    const { data: newUser, error: createError } = await supabase
      .from('admin_users')
      .insert({
        username: registrationData.username,
        email: registrationData.email || null,
        password_hash: await this.hashPassword(registrationData.password),
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (createError) {
      throw new Error('Ошибка при создании пользователя');
    }

    // Помечаем код доступа как использованный
    await supabase
      .from('access_codes')
      .update({
        is_used: true,
        used_by: newUser.id,
        used_at: new Date().toISOString()
      })
      .eq('id', accessCode.id);

    return {
      id: newUser.id.toString(),
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.created_at,
      lastLoginAt: newUser.last_login_at
    };
  }

  static async loginUser(credentials: LoginCredentials): Promise<AdminUser> {
    if (!supabase) {
      throw new Error('Supabase не настроен');
    }

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', credentials.username)
      .single();

    if (error || !user) {
      throw new Error('Неверное имя пользователя или пароль');
    }

    // Проверяем пароль
    const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Неверное имя пользователя или пароль');
    }

    // Обновляем время последнего входа
    await supabase
      .from('admin_users')
      .update({
        last_login_at: new Date().toISOString()
      })
      .eq('id', user.id);

    return {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
      lastLoginAt: new Date().toISOString()
    };
  }

  static async getCurrentUser(): Promise<AdminUser | null> {
    const userId = localStorage.getItem('adminUserId');
    if (!userId) {
      return null;
    }

    if (!supabase) {
      return null;
    }

    try {
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      };
    } catch (error) {
      return null;
    }
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('adminUserId');
    localStorage.removeItem('adminLoginTime');
  }

  // Простая хеш-функция (в продакшене используйте bcrypt или подобное)
  private static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  // Метод для создания кодов доступа (только для администратора)
  static async createAccessCode(): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase не настроен');
    }

    const code = this.generateRandomCode();
    
    const { error } = await supabase
      .from('access_codes')
      .insert({
        code,
        is_used: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw new Error('Ошибка при создании кода доступа');
    }

    return code;
  }

  private static generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export { AuthService };
