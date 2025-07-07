import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Star, ArrowRight, TrendingUp, Sparkles, Search, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import PriceDisplay from '../components/PriceDisplay';

const HomePage: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { 
    categories, 
    getFeaturedProducts, 
    getPromotedProducts, 
    getNewProducts
  } = useProducts();
  const { addToCart } = useCart();
  const { getBusinessSettings } = useSettings();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const featuredProducts = getFeaturedProducts();
  const promotedProducts = getPromotedProducts();
  const newProducts = getNewProducts();

  // Get hero images from settings
  const businessSettings = getBusinessSettings();
  const heroImages = businessSettings?.heroImages?.length ? businessSettings.heroImages : [
    'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg'
  ];

  // Auto-rotate hero images
  React.useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: language === 'ar' ? product.nameAr : product.name,
      price: product.price,
      image: product.images[0],
      category: language === 'ar' ? product.categoryAr : product.category
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/collections?category=${categoryId}`);
  };

  const ProductCard = ({ product, showBadge = false, badgeText = '', badgeColor = 'bg-gold-500' }: any) => (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0]}
          alt={language === 'ar' ? product.nameAr : product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100`}>
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>
        {showBadge && badgeText && (
          <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} ${badgeColor} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1`}>
            {badgeColor.includes('gold') && <Star className="h-3 w-3" />}
            {badgeColor.includes('blue') && <TrendingUp className="h-3 w-3" />}
            {badgeColor.includes('green') && <Sparkles className="h-3 w-3" />}
            <span>{badgeText}</span>
          </div>
        )}
        {product.originalPrice && (
          <div className={`absolute bottom-3 ${isRTL ? 'right-3' : 'left-3'} bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium`}>
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? 'text-gold-500 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 hover:text-gold-600 transition-colors text-sm">
            {language === 'ar' ? product.nameAr : product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <PriceDisplay 
            amount={product.price} 
            originalPrice={product.originalPrice}
            className="text-lg font-bold"
          />
          <button 
            onClick={() => handleAddToCart(product)}
            disabled={!product.inStock}
            className="p-2 bg-elegant-black hover:bg-gold-600 text-white rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}>
      {/* Header with Search */}
      <div className="bg-white px-4 py-6 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white transition-all ${isRTL ? 'text-right' : 'text-left'}`}
              />
            </div>
            <button className="p-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl shadow-lg">
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Hero Banner */}
          <div className="relative rounded-3xl p-8 text-white overflow-hidden h-48">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center rounded-3xl transition-all duration-1000"
              style={{ 
                backgroundImage: `url(${heroImages[currentHeroIndex]})`,
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent rounded-3xl"></div>
            <div className="relative z-10">
              <div className="text-sm font-medium mb-2 opacity-90">
                {language === 'ar' ? 'صيف' : 'Summer'}
              </div>
              <div className="text-3xl font-bold mb-2">
                {language === 'ar' ? 'أزياء' : 'FASHION'}
              </div>
              <div className="text-sm font-medium mb-4 opacity-90">
                {language === 'ar' ? 'تخفيضات' : 'SALE'}
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm">{language === 'ar' ? 'حتى' : 'UP TO'}</span>
                <span className="text-4xl font-bold text-red-300">70%</span>
                <span className="text-sm">{language === 'ar' ? 'خصم' : 'OFF'}</span>
              </div>
            </div>
            
            {/* Image indicators */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHeroIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentHeroIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Navigation arrows for multiple images */}
            {heroImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
            
            {/* Featured product overlay */}
            {featuredProducts.length > 0 && (
              <div className="absolute bottom-4 right-4">
                <Link to={`/product/${featuredProducts[0].id}`}>
                  <img
                    src={featuredProducts[0].images[0]}
                    alt="Featured Product"
                    className="w-16 h-16 object-cover rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-3">
                  <img
                    src={category.image}
                    alt={language === 'ar' ? category.nameAr : category.name}
                    className="w-8 h-8 object-cover rounded-lg"
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {language === 'ar' ? category.nameAr : category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'شائع' : 'Popular'}
              </h2>
              <Link
                to="/collections"
                className="text-gold-600 hover:text-gold-700 font-medium text-sm"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  showBadge={true}
                  badgeText={language === 'ar' ? 'مميز' : 'Featured'}
                  badgeColor="bg-gold-500"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promoted Products */}
      {promotedProducts.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'عروض خاصة' : 'Special Offers'}
              </h2>
              <Link
                to="/collections"
                className="text-gold-600 hover:text-gold-700 font-medium text-sm"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {promotedProducts.slice(0, 4).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  showBadge={true}
                  badgeText={language === 'ar' ? 'عرض' : 'Sale'}
                  badgeColor="bg-red-500"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-8 pb-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'جديد' : 'New Arrivals'}
              </h2>
              <Link
                to="/collections?filter=new"
                className="text-gold-600 hover:text-gold-700 font-medium text-sm"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {newProducts.slice(0, 4).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  showBadge={true}
                  badgeText={language === 'ar' ? 'جديد' : 'New'}
                  badgeColor="bg-green-500"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
          <ShoppingBag className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default HomePage;