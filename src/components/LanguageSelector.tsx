import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 hover:text-gold-500 transition-colors">
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
      </button>
      
      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <button
          onClick={() => setLanguage('fr')}
          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
            language === 'fr' ? 'text-gold-600 font-medium' : 'text-gray-700'
          }`}
        >
          Français
        </button>
        <button
          onClick={() => setLanguage('ar')}
          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
            language === 'ar' ? 'text-gold-600 font-medium' : 'text-gray-700'
          }`}
        >
          العربية
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;