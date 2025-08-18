import React, { useState } from 'react';
import { MenuData, Category, MenuItem, SubCategory } from '../types/menu';
import { DatabaseService } from '../services/database';
import './AdminPanel.css';

interface AdminPanelProps {
  data: MenuData;
  onUpdateData: (data: MenuData, action?: string, itemName?: string) => void;
  onLogout: () => void;
  onLogoClick?: () => void;
  onResetData?: () => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  console.log('Modal render:', { isOpen, title }); // Отладка
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Форма для категории
const CategoryForm: React.FC<{
  category?: Category;
  onSubmit: (data: Omit<Category, 'id' | 'subCategories'>) => void;
  onCancel: () => void;
}> = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('CategoryForm submit:', { name, icon }); // Отладка
    if (name.trim() && icon.trim()) {
      onSubmit({ name: name.trim(), icon: icon.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="categoryName">Название категории</label>
        <input
          id="categoryName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Напитки"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="categoryIcon">Иконка (эмодзи)</label>
        <input
          id="categoryIcon"
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="☕"
          required
        />
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Отмена
        </button>
        <button type="submit" className="btn-primary">
          {category ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
};

// Форма для подкатегории
const SubCategoryForm: React.FC<{
  subCategory?: SubCategory;
  categories: Category[];
  onSubmit: (data: Omit<SubCategory, 'id'>) => void;
  onCancel: () => void;
}> = ({ subCategory, categories, onSubmit, onCancel }) => {
  const [name, setName] = useState(subCategory?.name || '');
  const [categoryId, setCategoryId] = useState(subCategory?.categoryId || categories[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SubCategoryForm submit:', { name, categoryId }); // Отладка
    if (name.trim() && categoryId) {
      onSubmit({ name: name.trim(), categoryId, items: [] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="subCategoryName">Название подкатегории</label>
        <input
          id="subCategoryName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Горячие напитки"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="subCategoryCategory">Категория</label>
        <select
          id="subCategoryCategory"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Отмена
        </button>
        <button type="submit" className="btn-primary">
          {subCategory ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
};

// Форма для блюда
const ItemForm: React.FC<{
  item?: MenuItem;
  categories: Category[];
  onSubmit: (data: Omit<MenuItem, 'id'>) => void;
  onCancel: () => void;
}> = ({ item, categories, onSubmit, onCancel }) => {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price || '');
  const [image, setImage] = useState(item?.image || '');
  const [categoryId, setCategoryId] = useState(item?.category || categories[0]?.id || '');
  const [subCategoryId, setSubCategoryId] = useState(item?.subCategory || '');

  const selectedCategory = categories.find(cat => cat.id === categoryId);
  const subCategories = selectedCategory?.subCategories || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ItemForm submit:', { name, description, price, categoryId, subCategoryId }); // Отладка
    if (name.trim() && price && categoryId && subCategoryId) {
      onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price.toString()),
        image: image.trim(),
        category: categoryId,
        subCategory: subCategoryId,
        available: true
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="itemName">Название блюда</label>
        <input
          id="itemName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Капучино"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="itemDescription">Описание</label>
        <textarea
          id="itemDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание блюда..."
          rows={3}
        />
      </div>
      <div className="form-group">
        <label htmlFor="itemPrice">Цена (₽)</label>
        <input
          id="itemPrice"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="150"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="itemImage">URL изображения</label>
        <input
          id="itemImage"
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div className="form-group">
        <label htmlFor="itemCategory">Категория</label>
        <select
          id="itemCategory"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSubCategoryId('');
          }}
          required
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="itemSubCategory">Подкатегория</label>
        <select
          id="itemSubCategory"
          value={subCategoryId}
          onChange={(e) => setSubCategoryId(e.target.value)}
          required
          disabled={!categoryId}
        >
          <option value="">Выберите подкатегорию</option>
          {subCategories.map(subCategory => (
            <option key={subCategory.id} value={subCategory.id}>
              {subCategory.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Отмена
        </button>
        <button type="submit" className="btn-primary">
          {item ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ data, onUpdateData, onLogout, onLogoClick, onResetData }) => {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');

  console.log('AdminPanel state:', { 
    showAddItem, 
    showAddCategory, 
    showAddSubCategory, 
    editingItem: !!editingItem,
    editingCategory: !!editingCategory,
    editingSubCategory: !!editingSubCategory
  }); // Отладка

  const handleAddItem = async (itemData: Omit<MenuItem, 'id'>) => {
    console.log('handleAddItem called:', itemData); // Отладка
    try {
      // Добавляем в базу данных
      const itemId = await DatabaseService.addItem(itemData);
      
      // Обновляем локальное состояние
      const newItem: MenuItem = {
        ...itemData,
        id: itemId.toString(),
        available: true
      };

      const updatedData = { ...data };
      const category = updatedData.categories.find(cat => cat.id === newItem.category);
      if (category) {
        const subCategory = category.subCategories.find(sub => sub.id === newItem.subCategory);
        if (subCategory) {
          subCategory.items.push(newItem);
          onUpdateData(updatedData);
          setShowAddItem(false);
        }
      }
    } catch (error) {
      console.error('Ошибка при добавлении блюда:', error);
      alert('Ошибка при добавлении блюда. Проверьте подключение к базе данных.');
    }
  };

  const handleUpdateItem = async (updatedItem: MenuItem) => {
    console.log('handleUpdateItem called:', updatedItem); // Отладка
    try {
      // Обновляем в базе данных
      await DatabaseService.updateItem(updatedItem.id, updatedItem);
      
      // Обновляем локальное состояние
      const updatedData = { ...data };
      
      // Удаляем из старой подкатегории
      updatedData.categories.forEach(category => {
        category.subCategories.forEach(subCategory => {
          subCategory.items = subCategory.items.filter(item => item.id !== updatedItem.id);
        });
      });

      // Добавляем в новую подкатегорию
      const category = updatedData.categories.find(cat => cat.id === updatedItem.category);
      if (category) {
        const subCategory = category.subCategories.find(sub => sub.id === updatedItem.subCategory);
        if (subCategory) {
          subCategory.items.push(updatedItem);
        }
      }

      onUpdateData(updatedData);
      setEditingItem(null);
    } catch (error) {
      console.error('Ошибка при обновлении блюда:', error);
      alert('Ошибка при обновлении блюда. Проверьте подключение к базе данных.');
    }
  };

  const handleDeleteItem = async (itemId: string, categoryId: string, subCategoryId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
      try {
        // Удаляем из базы данных
        await DatabaseService.deleteItem(itemId);
        
        // Обновляем локальное состояние
        const updatedData = { ...data };
        const category = updatedData.categories.find(cat => cat.id === categoryId);
        if (category) {
          const subCategory = category.subCategories.find(sub => sub.id === subCategoryId);
          if (subCategory) {
            subCategory.items = subCategory.items.filter(item => item.id !== itemId);
            onUpdateData(updatedData);
          }
        }
      } catch (error) {
        console.error('Ошибка при удалении блюда:', error);
        alert('Ошибка при удалении блюда. Проверьте подключение к базе данных.');
      }
    }
  };

  const handleAddCategory = async (categoryData: Omit<Category, 'id' | 'subCategories'>) => {
    console.log('handleAddCategory called:', categoryData); // Отладка
    try {
      // Добавляем в базу данных
      const categoryId = await DatabaseService.addCategory(categoryData);
      
      // Обновляем локальное состояние
      const newCategory: Category = {
        ...categoryData,
        id: categoryId.toString(),
        subCategories: []
      };

      const updatedData = { ...data };
      updatedData.categories.push(newCategory);
      onUpdateData(updatedData, 'add', categoryData.name);
      setShowAddCategory(false);
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
      alert('Ошибка при добавлении категории. Проверьте подключение к базе данных.');
    }
  };

  const handleUpdateCategory = async (updatedCategory: Category) => {
    console.log('handleUpdateCategory called:', updatedCategory); // Отладка
    try {
      // Обновляем в базе данных
      await DatabaseService.updateCategory(updatedCategory.id, updatedCategory);
      
      // Обновляем локальное состояние
      const updatedData = { ...data };
      const index = updatedData.categories.findIndex(cat => cat.id === updatedCategory.id);
      if (index !== -1) {
        updatedData.categories[index] = updatedCategory;
        onUpdateData(updatedData);
      }
      setEditingCategory(null);
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
      alert('Ошибка при обновлении категории. Проверьте подключение к базе данных.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию? Все блюда в ней также будут удалены.')) {
      try {
        // Удаляем из базы данных
        await DatabaseService.deleteCategory(categoryId);
        
        // Обновляем локальное состояние
        const updatedData = { ...data };
        updatedData.categories = updatedData.categories.filter(cat => cat.id !== categoryId);
        onUpdateData(updatedData);
      } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        alert('Ошибка при удалении категории. Проверьте подключение к базе данных.');
      }
    }
  };

  const handleAddSubCategory = async (subCategoryData: Omit<SubCategory, 'id'>) => {
    console.log('handleAddSubCategory called:', subCategoryData); // Отладка
    try {
      // Добавляем в базу данных
      const subCategoryId = await DatabaseService.addSubCategory(subCategoryData);
      
      // Обновляем локальное состояние
      const newSubCategory: SubCategory = {
        ...subCategoryData,
        id: subCategoryId.toString(),
        items: []
      };

      const updatedData = { ...data };
      const category = updatedData.categories.find(cat => cat.id === selectedCategory);
      if (category) {
        category.subCategories.push(newSubCategory);
        onUpdateData(updatedData);
        setShowAddSubCategory(false);
      }
            } catch (error) {
          console.error('Ошибка при добавлении подкатегории:', error);
          
          let errorMessage = 'Ошибка при добавлении подкатегории. ';
          
          if (error instanceof Error) {
            if (error.message.includes('Supabase не настроен')) {
              errorMessage += 'GitHub Secrets не настроены. Следуйте инструкции в QUICK_SETUP.md';
            } else if (error.message.includes('RLS')) {
              errorMessage += 'Ошибка RLS. Отключите Row Level Security в Supabase.';
            } else if (error.message.includes('fetch')) {
              errorMessage += 'Ошибка сети. Проверьте подключение к интернету.';
            } else {
              errorMessage += 'Проверьте подключение к базе данных.';
            }
          }
          
          alert(errorMessage);
        }
  };

  const handleUpdateSubCategory = async (updatedSubCategory: SubCategory) => {
    console.log('handleUpdateSubCategory called:', updatedSubCategory); // Отладка
    try {
      // Обновляем в базе данных
      await DatabaseService.updateSubCategory(updatedSubCategory.id, updatedSubCategory);
      
      // Обновляем локальное состояние
      const updatedData = { ...data };
      updatedData.categories.forEach(category => {
        const index = category.subCategories.findIndex(sub => sub.id === updatedSubCategory.id);
        if (index !== -1) {
          category.subCategories[index] = updatedSubCategory;
        }
      });
      onUpdateData(updatedData);
      setEditingSubCategory(null);
    } catch (error) {
      console.error('Ошибка при обновлении подкатегории:', error);
      alert('Ошибка при обновлении подкатегории. Проверьте подключение к базе данных.');
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту подкатегорию? Все блюда в ней также будут удалены.')) {
      try {
        // Удаляем из базы данных
        await DatabaseService.deleteSubCategory(subCategoryId);
        
        // Обновляем локальное состояние
        const updatedData = { ...data };
        updatedData.categories.forEach(category => {
          category.subCategories = category.subCategories.filter(sub => sub.id !== subCategoryId);
        });
        onUpdateData(updatedData);
      } catch (error) {
        console.error('Ошибка при удалении подкатегории:', error);
        alert('Ошибка при удалении подкатегории. Проверьте подключение к базе данных.');
      }
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <h1>Панель администратора</h1>
            <p>Управление меню ресторана</p>
          </div>
          <div className="admin-actions">
            {onResetData && (
              <button 
                onClick={() => {
                  if (window.confirm('Вы уверены, что хотите сбросить все данные к исходному состоянию? Это действие нельзя отменить.')) {
                    onResetData();
                  }
                }} 
                className="reset-button"
                title="Сбросить данные"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
                Сбросить
              </button>
            )}
            <button onClick={onLogout} className="logout-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-sidebar">
          <div className="sidebar-tabs">
            <button 
              className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              Категории
            </button>
            <button 
              className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              Блюда
            </button>
          </div>

          {activeTab === 'categories' && (
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Управление категориями</h3>
                <button 
                  onClick={() => {
                    console.log('Add category button clicked'); // Отладка
                    setShowAddCategory(true);
                  }} 
                  className="add-button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Добавить
                </button>
              </div>
              
              <div className="category-list">
                {data.categories.map(category => (
                  <div key={category.id} className="category-item">
                    <div className="category-info">
                      <span className="category-icon">{category.icon}</span>
                      <div className="category-details">
                        <span className="category-name">{category.name}</span>
                        <span className="item-count">
                          {category.subCategories.reduce((total, sub) => total + sub.items.length, 0)} блюд
                        </span>
                      </div>
                    </div>
                    <div className="category-actions">
                      <button 
                        onClick={() => {
                          console.log('Edit category button clicked:', category.id); // Отладка
                          setEditingCategory(category);
                        }}
                        className="action-button edit"
                        title="Редактировать"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="action-button delete"
                        title="Удалить"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Управление блюдами</h3>
                <button 
                  onClick={() => {
                    console.log('Add item button clicked'); // Отладка
                    setShowAddItem(true);
                  }} 
                  className="add-button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Добавить
                </button>
              </div>
              
              <div className="category-selector">
                <label>Выберите категорию:</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="">Все категории</option>
                  {data.categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="admin-main">
          <div className="main-header">
            <h2>
              {activeTab === 'categories' ? 'Категории и подкатегории' : 'Список блюд'}
            </h2>
            {activeTab === 'categories' && (
              <button 
                onClick={() => {
                  console.log('Add subcategory button clicked'); // Отладка
                  if (data.categories.length > 0) {
                    setSelectedCategory(data.categories[0].id);
                    setShowAddSubCategory(true);
                  }
                }} 
                className="add-button"
                disabled={data.categories.length === 0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Добавить подкатегорию
              </button>
            )}
          </div>

          <div className="content-area">
            {activeTab === 'categories' && (
              <div className="categories-grid">
                {data.categories.map(category => (
                  <div key={category.id} className="category-card">
                    <div className="category-card-header">
                      <div className="category-card-title">
                        <span className="category-icon">{category.icon}</span>
                        <h3>{category.name}</h3>
                      </div>
                      <button 
                        onClick={() => {
                          console.log('Add subcategory to category button clicked:', category.id); // Отладка
                          setSelectedCategory(category.id);
                          setShowAddSubCategory(true);
                        }} 
                        className="add-subcategory-button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="subcategories-list">
                      {category.subCategories.map(subCategory => (
                        <div key={subCategory.id} className="subcategory-item">
                          <div className="subcategory-info">
                            <h4>{subCategory.name}</h4>
                            <span className="item-count">{subCategory.items.length} блюд</span>
                          </div>
                          <div className="subcategory-actions">
                            <button 
                              onClick={() => {
                                console.log('Edit subcategory button clicked:', subCategory.id); // Отладка
                                setEditingSubCategory(subCategory);
                              }}
                              className="action-button edit"
                              title="Редактировать"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteSubCategory(subCategory.id)}
                              className="action-button delete"
                              title="Удалить"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      {category.subCategories.length === 0 && (
                        <div className="empty-state">
                          <p>Нет подкатегорий</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'items' && (
              <div className="items-grid">
                {data.categories
                  .filter(category => !selectedCategory || category.id === selectedCategory)
                  .map(category => 
                    category.subCategories.map(subCategory =>
                      subCategory.items.map(item => (
                        <div key={item.id} className="item-card">
                          <div className="item-image">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <div className="item-image-placeholder">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="item-content">
                            <div className="item-header">
                              <h4>{item.name}</h4>
                              <span className="item-price">{item.price} ₽</span>
                            </div>
                            <p className="item-description">{item.description}</p>
                            <div className="item-categories">
                              <span className="category-badge">{category.name}</span>
                              <span className="subcategory-badge">{subCategory.name}</span>
                            </div>
                          </div>
                          <div className="item-actions">
                            <button 
                              onClick={() => {
                                console.log('Edit item button clicked:', item.id); // Отладка
                                setEditingItem(item);
                              }}
                              className="action-button edit"
                              title="Редактировать"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id, category.id, subCategory.id)}
                              className="action-button delete"
                              title="Удалить"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      <Modal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="Добавить категорию"
      >
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setShowAddCategory(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Редактировать категорию"
      >
        {editingCategory && (
          <CategoryForm
            category={editingCategory}
            onSubmit={(data) => handleUpdateCategory({ ...editingCategory, ...data })}
            onCancel={() => setEditingCategory(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={showAddSubCategory}
        onClose={() => setShowAddSubCategory(false)}
        title="Добавить подкатегорию"
      >
        <SubCategoryForm
          categories={data.categories}
          onSubmit={handleAddSubCategory}
          onCancel={() => setShowAddSubCategory(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingSubCategory}
        onClose={() => setEditingSubCategory(null)}
        title="Редактировать подкатегорию"
      >
        {editingSubCategory && (
          <SubCategoryForm
            subCategory={editingSubCategory}
            categories={data.categories}
            onSubmit={(data) => handleUpdateSubCategory({ ...editingSubCategory, ...data })}
            onCancel={() => setEditingSubCategory(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        title="Добавить блюдо"
      >
        <ItemForm
          categories={data.categories}
          onSubmit={handleAddItem}
          onCancel={() => setShowAddItem(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Редактировать блюдо"
      >
        {editingItem && (
          <ItemForm
            item={editingItem}
            categories={data.categories}
            onSubmit={(data) => handleUpdateItem({ ...editingItem, ...data })}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminPanel;
