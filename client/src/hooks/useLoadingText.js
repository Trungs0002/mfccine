import { useState, useEffect } from 'react';

const viTexts = ['Đang xử lý...', 'Chờ một chút...', 'Sắp xong rồi...'];
const enTexts = ['Processing...', 'Please wait...', 'Almost there...'];

export const useLoadingText = (isLoading, vi) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setIndex((prev) => Math.min(prev + 1, 2));
    }, 800); // Changes text every 800ms
    return () => clearInterval(interval);
  }, [isLoading]);

  const texts = vi ? viTexts : enTexts;
  return texts[index];
};
