import { supabase } from '../config/supabase';
import { MenuData, Category, SubCategory, MenuItem } from '../types/menu';

export class DatabaseService {
  static async getMenuData(): Promise<MenuData> {
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

      return {
        restaurant: {
          name: restaurantData.name,
          description: restaurantData.description
        },
        categories
      };
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
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id));

    if (error) throw error;
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
        available: item.available ?? true,
        image_url: item.image || item.imageUrl || null
      })
      .select('id')
      .single();

    if (error) throw error;
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
        image_url: item.image || item.imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id));

    if (error) throw error;
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
          order_index: 1
        })
        .select('id')
        .single();

      if (categoryError || !category) {
        throw new Error('Ошибка при создании категории: ' + categoryError?.message);
      }

      const { data: subCategory, error: subCategoryError } = await supabase
        .from('sub_categories')
        .insert({
          name: 'Классические напитки',
          category_id: category.id,
          order_index: 1
        })
        .select('id')
        .single();

      if (subCategoryError || !subCategory) {
        throw new Error('Ошибка при создании подкатегории: ' + subCategoryError?.message);
      }

      await supabase.from('items').insert([
        {
          name: 'Американо',
          description: 'Классический эспрессо с горячей водой',
          price: 150,
          sub_category_id: subCategory.id,
          available: true
        },
        {
          name: 'Капучино',
          description: 'Эспрессо с молочной пенкой',
          price: 180,
          sub_category_id: subCategory.id,
          available: true
        }
      ]);

    } catch (error) {
      throw error;
    }
  }
}
