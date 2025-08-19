import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getEmojiForCategory, getPopularEmojis, getEmojisByCategory } from '../utils/emojiMapper';
import './EmojiPicker.css';

interface EmojiPickerProps {
  categoryName: string;
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = React.memo(({ categoryName, selectedEmoji, onEmojiSelect }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [suggestedEmoji, setSuggestedEmoji] = useState('');
  const [activeTab, setActiveTab] = useState('suggested');

  useEffect(() => {
    if (categoryName) {
      const suggested = getEmojiForCategory(categoryName);
      setSuggestedEmoji(suggested);
    }
  }, [categoryName]);

  const popularEmojis = useMemo(() => getPopularEmojis(), []);
  const emojisByCategory = useMemo(() => getEmojisByCategory(), []);

  const handleEmojiClick = useCallback((emoji: string) => {
    onEmojiSelect(emoji);
    setShowPicker(false);
  }, [onEmojiSelect]);

  const handleSuggestedClick = useCallback(() => {
    if (suggestedEmoji) {
      onEmojiSelect(suggestedEmoji);
    }
  }, [suggestedEmoji, onEmojiSelect]);

  const handleTogglePicker = useCallback(() => {
    setShowPicker(!showPicker);
  }, [showPicker]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="emoji-picker-container">
      <div className="emoji-display">
        <button
          type="button"
          className="emoji-button"
          onClick={handleTogglePicker}
          title="Выбрать эмодзи"
        >
          {selectedEmoji || '🍽️'}
        </button>
        {categoryName && suggestedEmoji && suggestedEmoji !== selectedEmoji && (
          <button
            type="button"
            className="suggested-emoji-button"
            onClick={handleSuggestedClick}
            title={`Предлагаемый эмодзи: ${suggestedEmoji}`}
          >
            {suggestedEmoji}
          </button>
        )}
      </div>

      {showPicker && (
        <div className="emoji-picker">
          <div className="emoji-picker-header">
            <button
              type="button"
              className={`tab-button ${activeTab === 'suggested' ? 'active' : ''}`}
              onClick={() => handleTabChange('suggested')}
            >
              Предложенные
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => handleTabChange('popular')}
            >
              Популярные
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => handleTabChange('categories')}
            >
              По категориям
            </button>
          </div>

          <div className="emoji-picker-content">
            {activeTab === 'suggested' && (
              <div className="emoji-grid">
                {categoryName && suggestedEmoji && (
                  <button
                    type="button"
                    className="emoji-item suggested"
                    onClick={() => handleEmojiClick(suggestedEmoji)}
                    title={`Рекомендуется для "${categoryName}"`}
                  >
                    {suggestedEmoji}
                  </button>
                )}
                {popularEmojis.slice(0, 20).map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    className="emoji-item"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'popular' && (
              <div className="emoji-grid">
                {popularEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    className="emoji-item"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="emoji-categories">
                {Object.entries(emojisByCategory).map(([category, emojis]) => (
                  <div key={category} className="emoji-category">
                    <h4 className="category-title">{category}</h4>
                    <div className="emoji-grid">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          className="emoji-item"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="emoji-picker-footer">
            <button
              type="button"
              className="close-button"
              onClick={handleTogglePicker}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default EmojiPicker;
