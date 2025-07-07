// Currency utilities for MRU (Mauritanian Ouguiya)
export const CURRENCY = {
  code: 'MRU',
  symbol: 'UM',
  name: 'Ouguiya mauritanien',
  nameAr: 'أوقية موريتانية'
};

export const formatPrice = (amount: number, language: 'fr' | 'ar' = 'fr'): string => {
  // Always use English numbers for currency display
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
  
  if (language === 'ar') {
    return `${formatted} ${CURRENCY.nameAr}`;
  }
  
  return `${formatted} ${CURRENCY.symbol}`;
};

export const parsePrice = (priceString: string): number => {
  // Remove currency symbols and parse
  const cleaned = priceString.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

// Convert from EUR to MRU (approximate rate: 1 EUR = 40 MRU)
export const convertEurToMru = (eurAmount: number): number => {
  return Math.round(eurAmount * 40);
};

// Convert from MRU to EUR
export const convertMruToEur = (mruAmount: number): number => {
  return Math.round((mruAmount / 40) * 100) / 100;
};