import { supabase } from '../config/supabase';
import { MenuData, Category, SubCategory, MenuItem } from '../types/menu';

export class DatabaseService {
  // Загрузка всех данных меню
  static async getMenuData(): Promise<MenuData> {
    try {
      // Загружаем данные ресторана
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant')
        .select('*')
        .single();

      if (restaurantError) throw restaurantError;

      // Загружаем категории
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');

      if (categoriesError) throw categoriesError;

      // Загружаем подкатегории
      const { data: subCategoriesData, error: subCategoriesError } = await supabase
        .from('sub_categories')
        .select('*')
        .order('order_index');

      if (subCategoriesError) throw subCategoriesError;

      // Загружаем блюда
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .order('created_at');

      if (itemsError) throw itemsError;

      // Формируем структуру данных
      const categories: Category[] = categoriesData.map(cat => ({
        id: cat.id.toString(),
        name: cat.name,
        icon: cat.icon,
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
      console.error('Ошибка при загрузке данных из базы:', error);
      console.log('Используем fallback данные...');
      
      // Возвращаем локальные данные как fallback
      return import('../data/menu.json').then(module => module.default);
    }
  }

  // Добавление категории
  static async addCategory(category: Omit<Category, 'id' | 'subCategories'>): Promise<number> {
    // Проверяем, настроен ли Supabase
    if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
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

  // Обновление категории
  static async updateCategory(id: string, category: Partial<Category>): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        icon: category.icon,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id));

    if (error) throw error;
  }

  // Удаление категории
  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
  }

  // Добавление подкатегории
  static async addSubCategory(subCategory: Omit<SubCategory, 'id' | 'items'>): Promise<number> {
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

  // Обновление подкатегории
  static async updateSubCategory(id: string, subCategory: Partial<SubCategory>): Promise<void> {
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

  // Удаление подкатегории
  static async deleteSubCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('sub_categories')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
  }

  // Добавление блюда
  static async addItem(item: Omit<MenuItem, 'id'>): Promise<number> {
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

  // Обновление блюда
  static async updateItem(id: string, item: Partial<MenuItem>): Promise<void> {
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

  // Удаление блюда
  static async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
  }

  // Сброс к исходным данным
  static async resetToInitialData(): Promise<void> {
    try {
      // Очищаем все таблицы
      await supabase.from('items').delete().neq('id', 0);
      await supabase.from('sub_categories').delete().neq('id', 0);
      await supabase.from('categories').delete().neq('id', 0);

      // Добавляем исходные данные
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
      console.error('Ошибка при сбросе данных:', error);
      throw error;
    }
  }
}
