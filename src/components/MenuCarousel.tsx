import React, { useState, useRef, useEffect } from 'react';
import { MenuItem as MenuItemType } from '../types/menu';
import MenuItem from './MenuItem';
import MenuGrid from './MenuGrid';
import './MenuCarousel.css';

interface MenuCarouselProps {
  items: MenuItemType[];
  title?: string;
}

const MenuCarousel: React.FC<MenuCarouselProps> = ({ items, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Минимальное расстояние для свайпа
  const minSwipeDistance = isMobile ? 30 : 50; // Меньшее расстояние для мобильных

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Обработка начала касания
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Обработка движения касания
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Обработка окончания касания
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  // Автоматическое переключение слайдов (только на десктопе)
  useEffect(() => {
    if (isMobile) return; // Отключаем автослайд на мобильных
    
    const interval = setInterval(() => {
      if (items.length > 1) {
        nextSlide();
      }
    }, 5000); // Переключение каждые 5 секунд

    return () => clearInterval(interval);
  }, [items.length, currentIndex, isMobile]);

  if (items.length === 0) {
    return null;
  }

  // На мобильных устройствах показываем сетку вместо карусели
  if (isMobile) {
    return <MenuGrid items={items} title={title} />;
  }

  return (
    <div className="menu-carousel-section">
      {title && <h3 className="carousel-title">{title}</h3>}
      <div className="carousel-container">
        <div 
          className="carousel-wrapper" 
          ref={carouselRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="carousel-track"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {items.map((item, index) => (
              <div key={item.id} className="carousel-slide">
                <MenuItem item={item} />
              </div>
            ))}
          </div>
        </div>
        
        {items.length > 1 && (
          <>
            <button 
              className="carousel-button carousel-button-prev" 
              onClick={prevSlide}
              aria-label="Предыдущий слайд"
            >
              ‹
            </button>
            <button 
              className="carousel-button carousel-button-next" 
              onClick={nextSlide}
              aria-label="Следующий слайд"
            >
              ›
            </button>
            
            <div className="carousel-dots">
              {items.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Перейти к слайду ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuCarousel;
