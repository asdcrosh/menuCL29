import { MenuData } from '../types/menu';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export class ApiService {
  static async getMenu(): Promise<MenuData> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка при загрузке меню:', error);
      throw error;
    }
  }

  static async updateMenu(data: MenuData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Данные успешно сохранены:', result.message);
    } catch (error) {
      console.error('Ошибка при сохранении меню:', error);
      throw error;
    }
  }

  static async resetMenu(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/reset`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Меню сброшено:', result.message);
    } catch (error) {
      console.error('Ошибка при сбросе меню:', error);
      throw error;
    }
  }
}
