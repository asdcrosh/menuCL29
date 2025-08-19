import { supabase } from '../config/supabase';
import { MenuData, Category, SubCategory, MenuItem } from '../types/menu';

class DatabaseService {
  private static cache: {
    menuData: MenuData | null;
    lastFetch: number | null;
    cacheTimeout: number;
  } = {
    menuData: null,
    lastFetch: null,
    cacheTimeout: 5 * 60 * 1000 // 5 минут
  };

  private static isCacheValid(): boolean {
    if (!this.cache.menuData || !this.cache.lastFetch) {
      return false;
    }
    return Date.now() - this.cache.lastFetch < this.cacheTimeout;
  }

  private static updateCache(data: MenuData): void {
    this.cache.menuData = data;
    this.cache.lastFetch = Date.now();
  }

  private static clearCache(): void {
    this.cache.menuData = null;
    this.cache.lastFetch = null;
  }

  static async getMenuData(): Promise<MenuData> {
    if (this.isCacheValid() && this.cache.menuData) {
      return this.cache.menuData;
    }

    try {
      if (!supabase) {
        throw new Error('Supabase не настроен');
      }

      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant')
        .select('*')
        .single();

      if (restaurantError) throw restaurantError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');

      if (categoriesError) throw categoriesError;

      const { data: subCategoriesData, error: subCategoriesError } = await supabase
        .from('sub_categories')
        .select('*')
        .order('order_index');

      if (subCategoriesError) throw subCategoriesError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .order('created_at');

      if (itemsError) throw itemsError;

      const categories: Category[] = categoriesData.map(cat => ({
        id: cat.id.toString(),
        name: cat.name,
        icon: cat.icon,
        orderIndex: cat.order_index,
        subCategories: subCategoriesData
          .filter(sub => sub.category_id === cat.id)
          .map(sub => ({
            id: sub.id.toString(),
            name: sub.name,
            categoryId: sub.category_id.toString(),
            items: itemsData
              .filter(item => item.sub_category_id === sub.id)
              .map(item => ({
                id: item.id.toString(),
                name: item.name,
                description: item.description,
                price: item.price,
                category: cat.id.toString(),
                subCategory: sub.id.toString(),
                available: item.available,
                imageUrl: item.image_url,
                image: item.image_url
              }))
          }))
      }));

      const result = {
        restaurant: {
          name: restaurantData.name,
          description: restaurantData.description
        },
        categories
      };

      this.updateCache(result);
      return result;
    } catch (error) {
      return import('../data/menu.json').then(module => module.default);
    }
  }

  static async addCategory(category: Omit<Category, 'id' | 'subCategories'>): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        icon: category.icon,
        order_index: 0
      })
      .select('id')
      .single();

    if (error) throw error;
    this.clearCache();
    return data.id;
  }

  static async updateCategory(id: string, category: Partial<Category>): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        icon: category.icon,
        order_index: category.orderIndex,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id));

    if (error) throw error;
    this.clearCache();
  }

  static async updateCategoryOrder(categoryId: string, newOrderIndex: number): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { error } = await supabase
      .from('categories')
      .update({
        order_index: newOrderIndex,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(categoryId));

    if (error) throw error;
    this.clearCache();
  }

  static async deleteCategory(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
    this.clearCache();
  }

  static async addSubCategory(subCategory: Omit<SubCategory, 'id' | 'items'>): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { data, error } = await supabase
      .from('sub_categories')
      .insert({
        name: subCategory.name,
        category_id: parseInt(subCategory.categoryId),
        order_index: 0
      })
      .select('id')
      .single();

    if (error) throw error;
    this.clearCache();
    return data.id;
  }

  static async updateSubCategory(id: string, subCategory: Partial<SubCategory>): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { error } = await supabase
      .from('sub_categories')
      .update({
        name: subCategory.name,
        category_id: subCategory.categoryId ? parseInt(subCategory.categoryId) : undefined,
        order_index: subCategory.orderIndex,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id));

    if (error) throw error;
    this.clearCache();
  }

  static async deleteSubCategory(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { error } = await supabase
      .from('sub_categories')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
    this.clearCache();
  }

  static async addItem(item: Omit<MenuItem, 'id'>): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { data, error } = await supabase
      .from('items')
      .insert({
        name: item.name,
        description: item.description,
        price: item.price,
        sub_category_id: parseInt(item.subCategory),
        available: item.available,
        image_url: item.image
      })
      .select('id')
      .single();

    if (error) throw error;
    this.clearCache();
    return data.id;
  }

  static async updateItem(id: string, item: Partial<MenuItem>): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { error } = await supabase
      .from('items')
      .update({
        name: item.name,
        description: item.description,
        price: item.price,
        sub_category_id: item.subCategory ? parseInt(item.subCategory) : undefined,
        available: item.available,
        image_url: item.image,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id));

    if (error) throw error;
    this.clearCache();
  }

  static async deleteItem(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
    this.clearCache();
  }

  static async resetToInitialData(): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase не настроен - операция недоступна в режиме только чтение');
    }

    try {
      await supabase.from('items').delete().neq('id', 0);
      await supabase.from('sub_categories').delete().neq('id', 0);
      await supabase.from('categories').delete().neq('id', 0);

      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .insert({
          name: 'Напитки',
          icon: '☕',
          order_index: 0
        })
        .select('id')
        .single();

      if (categoryError) throw categoryError;

      const { data: subCategory, error: subCategoryError } = await supabase
        .from('sub_categories')
        .insert({
          name: 'Горячие напитки',
          category_id: category.id,
          order_index: 0
        })
        .select('id')
        .single();

      if (subCategoryError) throw subCategoryError;

      await supabase.from('items').insert({
        name: 'Капучино',
        description: 'Классический итальянский кофе с молочной пенкой',
        price: 150,
        sub_category_id: subCategory.id,
        available: true,
        image_url: null
      });

      this.clearCache();
    } catch (error) {
      throw error;
    }
  }
}

export { DatabaseService };
