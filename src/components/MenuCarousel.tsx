import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MenuItem as MenuItemType } from '../types/menu';
import MenuItem from './MenuItem';
import MenuGrid from './MenuGrid';
import './MenuCarousel.css';

interface MenuCarouselProps {
  items: MenuItemType[];
  title?: string;
}

const MenuCarousel: React.FC<MenuCarouselProps> = React.memo(({ items, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const minSwipeDistance = useMemo(() => isMobile ? 30 : 50, [isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
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
  }, [touchStart, touchEnd, minSwipeDistance, nextSlide, prevSlide]);

  useEffect(() => {
    if (isMobile) return;
    
    const interval = setInterval(() => {
      if (items.length > 1) {
        nextSlide();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length, isMobile, nextSlide]);

  if (items.length === 0) {
    return null;
  }

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
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`
              }}
            >
              <MenuItem item={item} />
            </div>
          ))}
        </div>
        
        {items.length > 1 && (
          <>
            <button 
              className="carousel-button prev" 
              onClick={prevSlide}
              aria-label="Предыдущий"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            
            <button 
              className="carousel-button next" 
              onClick={nextSlide}
              aria-label="Следующий"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
            
            <div className="carousel-dots">
              {items.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentIndex ? 'active' : ''}`}
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
});

export default MenuCarousel;
