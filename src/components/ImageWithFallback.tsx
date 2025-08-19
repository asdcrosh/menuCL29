import React, { useState, useCallback } from 'react';
import './ImageWithFallback.css';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = React.memo(({ src, alt, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  if (!src || imageError) {
    return (
      <div className={`image-fallback ${className}`}>
        <div className="fallback-content">
          <span className="fallback-icon">📷</span>
          <span className="fallback-text">Фото отсутствует</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${imageLoading ? 'loading' : ''}`}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
});

export default ImageWithFallback;
