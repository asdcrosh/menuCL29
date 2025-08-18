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
  items: MenuItem[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
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
