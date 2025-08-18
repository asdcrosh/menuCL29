import { MenuData } from '../types/menu';
import menuData from '../data/menu.json';

// Функция для сохранения данных в localStorage (как fallback)
export const saveToLocalStorage = (data: MenuData): void => {
  localStorage.setItem('menuData', JSON.stringify(data));
};

// Функция для загрузки данных из localStorage
export const loadFromLocalStorage = (): MenuData | null => {
  try {
    const savedData = localStorage.getItem('menuData');
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Ошибка при загрузке из localStorage:', error);
  }
  return null;
};

// Функция для сброса данных
export const resetLocalStorage = (): void => {
  localStorage.removeItem('menuData');
};

// Функция для получения данных (приоритет: localStorage -> исходные данные)
export const getMenuData = (): MenuData => {
  const savedData = loadFromLocalStorage();
  return savedData || menuData;
};

// Функция для обновления данных
export const updateMenuData = (data: MenuData): void => {
  saveToLocalStorage(data);
  console.log('Данные сохранены в localStorage');
};

// Функция для сброса к исходным данным
export const resetMenuData = (): MenuData => {
  resetLocalStorage();
  console.log('Данные сброшены к исходному состоянию');
  return menuData;
};
