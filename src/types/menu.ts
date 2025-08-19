export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  imageUrl?: string; // Для совместимости с базой данных
  category: string;
  subCategory: string;
  available: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  orderIndex?: number; // Для совместимости с базой данных
  items: MenuItem[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  orderIndex?: number;
  subCategories: SubCategory[];
}

export interface Restaurant {
  name: string;
  description: string;
}

export interface MenuData {
  restaurant: Restaurant;
  categories: Category[];
}

// Типы для аутентификации
export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AccessCode {
  id: string;
  code: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegistrationData {
  accessCode: string;
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
}
