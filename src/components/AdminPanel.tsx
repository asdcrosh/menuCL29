import React, { useState, useRef, useCallback, useMemo } from 'react';
import { MenuData, Category, MenuItem, SubCategory } from '../types/menu';
import { DatabaseService } from '../services/database';
import { FileUploadService } from '../services/fileUpload';
import EmojiPicker from './EmojiPicker';
import './AdminPanel.css';

interface AdminPanelProps {
  data: MenuData;
  onUpdateData: (data: MenuData, action?: string, itemName?: string) => void;
  onLogout: () => void;
  onLogoClick?: () => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = React.memo(({ isOpen, onClose, children, title }) => {
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
});

const CategoryForm: React.FC<{
  category?: Category;
  onSubmit: (data: Omit<Category, 'id' | 'subCategories'>) => void;
  onCancel: () => void;
}> = React.memo(({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || '');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && icon.trim()) {
      onSubmit({ name: name.trim(), icon: icon.trim() });
    }
  }, [name, icon, onSubmit]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleIconSelect = useCallback((emoji: string) => {
    setIcon(emoji);
  }, []);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="categoryName">Название категории</label>
        <input
          id="categoryName"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Например: Напитки"
          required
        />
      </div>
      <div className="form-group">
        <label>Иконка (эмодзи)</label>
        <EmojiPicker
          categoryName={name}
          selectedEmoji={icon}
          onEmojiSelect={handleIconSelect}
        />
      </div>
      <div className="form-actions">
        <button type="button" onClick={handleCancel} className="btn-secondary">
          Отмена
        </button>
        <button type="submit" className="btn-primary">
          {category ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
});

const SubCategoryForm: React.FC<{
  subCategory?: SubCategory;
  categories: Category[];
  onSubmit: (data: Omit<SubCategory, 'id'>) => void;
  onCancel: () => void;
}> = React.memo(({ subCategory, categories, onSubmit, onCancel }) => {
  const [name, setName] = useState(subCategory?.name || '');
  const [categoryId, setCategoryId] = useState(subCategory?.categoryId || categories[0]?.id || '');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && categoryId) {
      onSubmit({ name: name.trim(), categoryId, items: [] });
    }
  }, [name, categoryId, onSubmit]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value);
  }, []);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="subCategoryName">Название подкатегории</label>
        <input
          id="subCategoryName"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Например: Горячие напитки"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="subCategoryCategory">Категория</label>
        <select
          id="subCategoryCategory"
          value={categoryId}
          onChange={handleCategoryChange}
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
        <button type="button" onClick={handleCancel} className="btn-secondary">
          Отмена
        </button>
        <button type="submit" className="btn-primary">
          {subCategory ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
});

const ItemForm: React.FC<{
  item?: MenuItem;
  categories: Category[];
  onSubmit: (data: Omit<MenuItem, 'id'>) => void;
  onCancel: () => void;
}> = React.memo(({ item, categories, onSubmit, onCancel }) => {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [image, setImage] = useState(item?.image || '');
  const [categoryId, setCategoryId] = useState(item?.category || categories[0]?.id || '');
  const [subCategoryId, setSubCategoryId] = useState(item?.subCategory || '');
  const [available, setAvailable] = useState(item?.available ?? true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = useMemo(() => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories, categoryId]);

  const subCategories = useMemo(() => {
    return selectedCategory?.subCategories || [];
  }, [selectedCategory]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && price && categoryId && subCategoryId) {
      onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price.toString()),
        image: image.trim(),
        category: categoryId,
        subCategory: subCategoryId,
        available: available
      });
    }
  }, [name, description, price, image, categoryId, subCategoryId, available, onSubmit]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value);
    setSubCategoryId('');
  }, []);

  const handleSubCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubCategoryId(e.target.value);
  }, []);

  const handleAvailableChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailable(e.target.checked);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress('Загрузка изображения...');
      
      const result = await FileUploadService.uploadImage(file);
      setImage(result.url);
      setUploadProgress('Изображение успешно загружено!');
      
      setTimeout(() => {
        setUploadProgress('');
      }, 2000);
    } catch (error) {
      setUploadProgress(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      setTimeout(() => {
        setUploadProgress('');
      }, 3000);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="itemName">Название блюда</label>
        <input
          id="itemName"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Например: Капучино"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="itemDescription">Описание</label>
        <textarea
          id="itemDescription"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Описание блюда"
          rows={3}
        />
      </div>
      <div className="form-group">
        <label htmlFor="itemPrice">Цена</label>
        <input
          id="itemPrice"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={handlePriceChange}
          placeholder="0.00"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="itemCategory">Категория</label>
        <select
          id="itemCategory"
          value={categoryId}
          onChange={handleCategoryChange}
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
          onChange={handleSubCategoryChange}
          required
        >
          <option value="">Выберите подкатегорию</option>
          {subCategories.map(subCategory => (
            <option key={subCategory.id} value={subCategory.id}>
              {subCategory.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Изображение</label>
        <div className="image-upload-container">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="upload-button"
            disabled={isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Выбрать файл'}
          </button>
          {uploadProgress && (
            <div className="upload-progress">{uploadProgress}</div>
          )}
        </div>
        {image && (
          <div className="current-image">
            <img src={image} alt="Preview" className="preview-image" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="remove-image-btn"
            >
              Удалить
            </button>
          </div>
        )}
        <input
          type="url"
          value={image}
          onChange={handleImageChange}
          placeholder="https://example.com/image.jpg"
          className="image-url-input"
        />
      </div>
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={available}
            onChange={handleAvailableChange}
          />
          <span>Доступен для заказа</span>
        </label>
      </div>
      <div className="form-actions">
        <button type="button" onClick={handleCancel} className="btn-secondary">
          Отмена
        </button>
        <button type="submit" className="btn-primary">
          {item ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
});

const AdminPanel: React.FC<AdminPanelProps> = React.memo(({ data, onUpdateData, onLogout, onLogoClick }) => {
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleAddItem = useCallback(async (itemData: Omit<MenuItem, 'id'>) => {
    try {
      const itemId = await DatabaseService.addItem(itemData);
      
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
      alert('Ошибка при добавлении блюда. Проверьте подключение к базе данных.');
    }
  }, [data, onUpdateData]);

  const handleUpdateItem = useCallback(async (updatedItem: MenuItem) => {
    try {
      await DatabaseService.updateItem(updatedItem.id, updatedItem);
      
      const updatedData = { ...data };
      
      updatedData.categories.forEach(category => {
        category.subCategories.forEach(subCategory => {
          subCategory.items = subCategory.items.filter(item => item.id !== updatedItem.id);
        });
      });

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
      alert('Ошибка при обновлении блюда. Проверьте подключение к базе данных.');
    }
  }, [data, onUpdateData]);

  const handleDeleteItem = useCallback(async (itemId: string, categoryId: string, subCategoryId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
      try {
        await DatabaseService.deleteItem(itemId);
        
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
        alert('Ошибка при удалении блюда. Проверьте подключение к базе данных.');
      }
    }
  }, [data, onUpdateData]);

  const handleAddCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'subCategories'>) => {
    try {
      const categoryId = await DatabaseService.addCategory(categoryData);
      
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
      alert('Ошибка при добавлении категории. Проверьте подключение к базе данных.');
    }
  }, [data, onUpdateData]);

  const handleUpdateCategory = useCallback(async (updatedCategory: Category) => {
    try {
      await DatabaseService.updateCategory(updatedCategory.id, updatedCategory);
      
      const updatedData = { ...data };
      const index = updatedData.categories.findIndex(cat => cat.id === updatedCategory.id);
      if (index !== -1) {
        updatedData.categories[index] = updatedCategory;
        onUpdateData(updatedData);
      }
      setEditingCategory(null);
    } catch (error) {
      alert('Ошибка при обновлении категории. Проверьте подключение к базе данных.');
    }
  }, [data, onUpdateData]);

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию? Все блюда в ней также будут удалены.')) {
      try {
        await DatabaseService.deleteCategory(categoryId);
        
        const updatedData = { ...data };
        updatedData.categories = updatedData.categories.filter(cat => cat.id !== categoryId);
        onUpdateData(updatedData);
      } catch (error) {
        alert('Ошибка при удалении категории. Проверьте подключение к базе данных.');
      }
    }
  }, [data, onUpdateData]);

  const handleMoveCategory = useCallback(async (categoryId: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = data.categories.findIndex(cat => cat.id === categoryId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= data.categories.length) return;

      await DatabaseService.updateCategoryOrder(categoryId, newIndex);
      await DatabaseService.updateCategoryOrder(data.categories[newIndex].id, currentIndex);

      const updatedData = { ...data };
      const [movedCategory] = updatedData.categories.splice(currentIndex, 1);
      updatedData.categories.splice(newIndex, 0, movedCategory);
      updatedData.categories.forEach((cat, index) => {
        cat.orderIndex = index;
      });

      onUpdateData(updatedData);
    } catch (error) {
      alert('Ошибка при перемещении категории. Проверьте подключение к базе данных.');
    }
  }, [data, onUpdateData]);

  const handleAddSubCategory = useCallback(async (subCategoryData: Omit<SubCategory, 'id'>) => {
    try {
      const subCategoryId = await DatabaseService.addSubCategory(subCategoryData);
      
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
      alert('Ошибка при добавлении подкатегории. Проверьте подключение к базе данных.');
    }
  }, [data, selectedCategory, onUpdateData]);

  const handleUpdateSubCategory = useCallback(async (updatedSubCategory: SubCategory) => {
    try {
      await DatabaseService.updateSubCategory(updatedSubCategory.id, updatedSubCategory);
      
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
      alert('Ошибка при обновлении подкатегории. Проверьте подключение к базе данных.');
    }
  }, [data, onUpdateData]);

  const handleDeleteSubCategory = useCallback(async (subCategoryId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту подкатегорию? Все блюда в ней также будут удалены.')) {
      try {
        await DatabaseService.deleteSubCategory(subCategoryId);
        
        const updatedData = { ...data };
        updatedData.categories.forEach(category => {
          category.subCategories = category.subCategories.filter(sub => sub.id !== subCategoryId);
        });
        onUpdateData(updatedData);
      } catch (error) {
        alert('Ошибка при удалении подкатегории. Проверьте подключение к базе данных.');
    }
    }
  }, [data, onUpdateData]);

  const handleTabChange = useCallback((tab: 'categories' | 'items') => {
    setActiveTab(tab);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleShowAddCategory = useCallback(() => {
    setShowAddCategory(true);
  }, []);

  const handleShowAddItem = useCallback(() => {
    setShowAddItem(true);
  }, []);

  const handleShowAddSubCategory = useCallback(() => {
    if (data.categories.length > 0) {
      setSelectedCategory(data.categories[0].id);
      setShowAddSubCategory(true);
    }
  }, [data.categories]);

  const handleShowAddSubCategoryToCategory = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowAddSubCategory(true);
  }, []);

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
  }, []);

  const handleEditSubCategory = useCallback((subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
  }, []);

  const handleEditItem = useCallback((item: MenuItem) => {
    setEditingItem(item);
  }, []);

  const handleCloseModals = useCallback(() => {
    setShowAddCategory(false);
    setShowAddItem(false);
    setShowAddSubCategory(false);
    setEditingCategory(null);
    setEditingSubCategory(null);
    setEditingItem(null);
  }, []);

  const handleMoveCategoryUp = useCallback((categoryId: string) => {
    handleMoveCategory(categoryId, 'up');
  }, [handleMoveCategory]);

  const handleMoveCategoryDown = useCallback((categoryId: string) => {
    handleMoveCategory(categoryId, 'down');
  }, [handleMoveCategory]);

  const handleDeleteCategoryConfirm = useCallback((categoryId: string) => {
    handleDeleteCategory(categoryId);
  }, [handleDeleteCategory]);

  const handleDeleteSubCategoryConfirm = useCallback((subCategoryId: string) => {
    handleDeleteSubCategory(subCategoryId);
  }, [handleDeleteSubCategory]);

  const handleDeleteItemConfirm = useCallback((itemId: string, categoryId: string, subCategoryId: string) => {
    handleDeleteItem(itemId, categoryId, subCategoryId);
  }, [handleDeleteItem]);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <h1>Панель администратора</h1>
            <p>Управление меню ресторана</p>
          </div>
          <div className="admin-actions">
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
              onClick={() => handleTabChange('categories')}
            >
              Категории
            </button>
            <button 
              className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => handleTabChange('items')}
            >
              Блюда
            </button>
          </div>

          {activeTab === 'categories' && (
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Управление категориями</h3>
                <button 
                  onClick={handleShowAddCategory} 
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
                        onClick={() => handleMoveCategoryUp(category.id)}
                        className="action-button move"
                        title="Переместить вверх"
                        disabled={data.categories.indexOf(category) === 0}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleMoveCategoryDown(category.id)}
                        className="action-button move"
                        title="Переместить вниз"
                        disabled={data.categories.indexOf(category) === data.categories.length - 1}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="action-button edit"
                        title="Редактировать"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteCategoryConfirm(category.id)}
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
                  onClick={handleShowAddItem} 
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
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="category-select"
                >
                  <option value="">Все категории</option>
                  {data.categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="section-header">
                <h3>Управление подкатегориями</h3>
                <button 
                  onClick={handleShowAddSubCategory} 
                  className="add-button"
                  disabled={data.categories.length === 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Добавить подкатегорию
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="admin-main">
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
                      onClick={() => handleShowAddSubCategoryToCategory(category.id)} 
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
                            onClick={() => handleEditSubCategory(subCategory)}
                            className="action-button edit"
                            title="Редактировать"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteSubCategoryConfirm(subCategory.id)}
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
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p>{item.description}</p>
                          <div className="item-meta">
                            <span className="item-price">{item.price} ₽</span>
                            <span className={`item-status ${item.available ? 'available' : 'unavailable'}`}>
                              {item.available ? 'Доступен' : 'Недоступен'}
                            </span>
                          </div>
                        </div>
                        <div className="item-actions">
                          <button 
                            onClick={() => handleEditItem(item)}
                            className="action-button edit"
                            title="Редактировать"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteItemConfirm(item.id, category.id, subCategory.id)}
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

      <Modal
        isOpen={showAddCategory}
        onClose={handleCloseModals}
        title="Добавить категорию"
      >
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={handleCloseModals}
        />
      </Modal>

      <Modal
        isOpen={!!editingCategory}
        onClose={handleCloseModals}
        title="Редактировать категорию"
      >
        {editingCategory && (
          <CategoryForm
            category={editingCategory}
            onSubmit={(data) => handleUpdateCategory({ ...editingCategory, ...data })}
            onCancel={handleCloseModals}
          />
        )}
      </Modal>

      <Modal
        isOpen={showAddSubCategory}
        onClose={handleCloseModals}
        title="Добавить подкатегорию"
      >
        <SubCategoryForm
          categories={data.categories}
          onSubmit={handleAddSubCategory}
          onCancel={handleCloseModals}
        />
      </Modal>

      <Modal
        isOpen={!!editingSubCategory}
        onClose={handleCloseModals}
        title="Редактировать подкатегорию"
      >
        {editingSubCategory && (
          <SubCategoryForm
            subCategory={editingSubCategory}
            categories={data.categories}
            onSubmit={(data) => handleUpdateSubCategory({ ...editingSubCategory, ...data })}
            onCancel={handleCloseModals}
          />
        )}
      </Modal>

      <Modal
        isOpen={showAddItem}
        onClose={handleCloseModals}
        title="Добавить блюдо"
      >
        <ItemForm
          categories={data.categories}
          onSubmit={handleAddItem}
          onCancel={handleCloseModals}
        />
      </Modal>

      <Modal
        isOpen={!!editingItem}
        onClose={handleCloseModals}
        title="Редактировать блюдо"
      >
        {editingItem && (
          <ItemForm
            item={editingItem}
            categories={data.categories}
            onSubmit={(data) => handleUpdateItem({ ...editingItem, ...data })}
            onCancel={handleCloseModals}
          />
        )}
      </Modal>
    </div>
  );
});

export default AdminPanel;
