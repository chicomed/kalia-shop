import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice } from '../utils/currency';

interface PriceDisplayProps {
  amount: number;
  className?: string;
  showCurrency?: boolean;
  originalPrice?: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  amount, 
  className = '', 
  showCurrency = true,
  originalPrice 
}) => {
  const { language } = useLanguage();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="font-bold">
        {showCurrency ? formatPrice(amount, language) : amount.toLocaleString()}
      </span>
      {originalPrice && originalPrice > amount && (
        <span className="text-gray-500 line-through text-sm">
          {showCurrency ? formatPrice(originalPrice, language) : originalPrice.toLocaleString()}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;