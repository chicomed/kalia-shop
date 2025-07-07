import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Search, Grid, List } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import PriceDisplay from '../components/PriceDisplay';

const Collections: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { addToCart } = useCart();
  const { products, categories, subCategories } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(searchParams.get('subcategory') || 'all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showNewOnly, setShowNewOnly] = useState(searchParams.get('filter') === 'new');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(searchParams.get('filter') === 'featured');
  const [showPromotedOnly, setShowPromotedOnly] = useState(searchParams.get('filter') === 'promoted');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const filter = searchParams.get('filter');
    
    if (category) {
      setSelectedCategory(category);
    }
    if (subcategory) {
      setSelectedSubCategory(subcategory);
    }
    if (filter === 'new') {
      setShowNewOnly(true);
      setShowFeaturedOnly(false);
      setShowPromotedOnly(false);
    } else if (filter === 'featured') {
      setShowFeaturedOnly(true);
      setShowNewOnly(false);
      setShowPromotedOnly(false);
    } else if (filter === 'promoted') {
      setShowPromotedOnly(true);
      setShowNewOnly(false);
      setShowFeaturedOnly(false);
    }
  }, [searchParams]);

  // Get available subcategories for selected category
  const availableSubCategories = selectedCategory === 'all' 
    ? subCategories 
    : subCategories.filter(sub => sub.categoryId === selectedCategory);

  // Calculate max price for range slider
  const maxPrice = Math.max(...products.map(p => p.price), 10000);

  const filteredProducts = products.filter(product => {
    // Category filter
    const categoryMatch = selectedCategory === 'all' || product.categoryId === selectedCategory;
    
    // Subcategory filter
    const subCategoryMatch = selectedSubCategory === 'all' || product.subCategoryId === selectedSubCategory;
    
    // Price filter
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    // Stock filter
    const stockMatch = !showInStockOnly || product.inStock;
    
    // Special filters
    const newMatch = !showNewOnly || (new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000);
    const featuredMatch = !showFeaturedOnly || product.featured;
    const promotedMatch = !showPromotedOnly || product.promoted;
    
    // Search filter
    const searchMatch = !searchTerm || 
      (language === 'ar' ? product.nameAr : product.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (language === 'ar' ? product.descriptionAr : product.description).toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && subCategoryMatch && priceMatch && stockMatch && newMatch && featuredMatch && promotedMatch && searchMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popularity':
        return b.reviews - a.reviews;
      case 'name':
      default:
        return language === 'ar' 
          ? a.nameAr.localeCompare(b.nameAr)
          : a.name.localeCompare(b.name);
    }
  });

  const handleAddToCart = (product: any) => {
    if (!product.inStock) return;
    
    addToCart({
      id: product.id,
      name: language === 'ar' ? product.nameAr : product.name,
      price: product.price,
      image: product.images[0],
      category: (() => {
        const category = categories.find(c => c.id === product.categoryId);
        return language === 'ar' ? category?.nameAr : category?.name;
      })()
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('all'); // Reset subcategory when category changes
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    newParams.delete('subcategory'); // Remove subcategory param when category changes
    setSearchParams(newParams);
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
    const newParams = new URLSearchParams(searchParams);
    if (subCategoryId === 'all') {
      newParams.delete('subcategory');
    } else {
      newParams.set('subcategory', subCategoryId);
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (filter: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Reset all special filters
    setShowNewOnly(false);
    setShowFeaturedOnly(false);
    setShowPromotedOnly(false);
    
    if (filter === 'new') {
      setShowNewOnly(true);
      newParams.set('filter', 'new');
    } else if (filter === 'featured') {
      setShowFeaturedOnly(true);
      newParams.set('filter', 'featured');
    } else if (filter === 'promoted') {
      setShowPromotedOnly(true);
      newParams.set('filter', 'promoted');
    } else {
      newParams.delete('filter');
    }
    
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSubCategory('all');
    setPriceRange([0, maxPrice]);
    setSortBy('name');
    setShowNewOnly(false);
    setShowFeaturedOnly(false);
    setShowPromotedOnly(false);
    setShowInStockOnly(false);
    setSearchTerm('');
    setSearchParams({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedSubCategory !== 'all') count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (showNewOnly || showFeaturedOnly || showPromotedOnly) count++;
    if (showInStockOnly) count++;
    if (searchTerm) count++;
    return count;
  };

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="font-elegant text-4xl font-bold text-elegant-black mb-4">
            {t('nav.collections')}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'استكشفي مجموعتنا الكاملة من الحجاب والإكسسوارات الأنيقة'
              : 'Découvrez notre collection complète de voiles et accessoires élégants'
            }
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'البحث في المنتجات...' : 'Rechercher des produits...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-elegant-black text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'Tout'}
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-elegant-black text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {language === 'ar' ? category.nameAr : category.name}
                <span className="ml-2 text-xs opacity-75">({products.filter(p => p.categoryId === category.id).length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories Filter - Show only if category is selected and has subcategories */}
        {selectedCategory !== 'all' && availableSubCategories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleSubCategoryChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSubCategory === 'all'
                    ? 'bg-gold-500 text-elegant-black shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {language === 'ar' ? 'جميع الفئات الفرعية' : 'Toutes les sous-catégories'}
              </button>
              {availableSubCategories.map(subCategory => (
                <button
                  key={subCategory.id}
                  onClick={() => handleSubCategoryChange(subCategory.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedSubCategory === subCategory.id
                      ? 'bg-gold-500 text-elegant-black shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  {language === 'ar' ? subCategory.nameAr : subCategory.name}
                  <span className="ml-1 text-xs opacity-75">
                    ({products.filter(p => p.subCategoryId === subCategory.id).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Special Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleFilterChange(showNewOnly ? '' : 'new')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showNewOnly
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {language === 'ar' ? 'جديد' : 'Nouveautés'}
            </button>
            <button
              onClick={() => handleFilterChange(showFeaturedOnly ? '' : 'featured')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showFeaturedOnly
                  ? 'bg-gold-500 text-elegant-black shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {language === 'ar' ? 'مميز' : 'Vedettes'}
            </button>
            <button
              onClick={() => handleFilterChange(showPromotedOnly ? '' : 'promoted')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showPromotedOnly
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {language === 'ar' ? 'عروض' : 'Promotions'}
            </button>
            <button
              onClick={() => setShowInStockOnly(!showInStockOnly)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showInStockOnly
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {language === 'ar' ? 'متوفر فقط' : 'En stock seulement'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-elegant text-xl font-semibold text-elegant-black">
                  {language === 'ar' ? 'الفلاتر' : 'Filtres'}
                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-2 bg-gold-500 text-elegant-black text-xs px-2 py-1 rounded-full">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gold-600 hover:text-gold-700 font-medium"
                >
                  {language === 'ar' ? 'مسح' : 'Effacer'}
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'نطاق السعر (أوقية)' : 'Gamme de prix (UM)'}
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-gold-500"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{priceRange[0]} UM</span>
                    <span>{priceRange[1]} UM</span>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'ترتيب حسب' : 'Trier par'}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="name">{language === 'ar' ? 'الاسم' : 'Nom'}</option>
                  <option value="price-low">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Prix: croissant'}</option>
                  <option value="price-high">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Prix: décroissant'}</option>
                  <option value="rating">{language === 'ar' ? 'التقييم' : 'Note'}</option>
                  <option value="popularity">{language === 'ar' ? 'الشعبية' : 'Popularité'}</option>
                  <option value="newest">{language === 'ar' ? 'الأحدث' : 'Plus récent'}</option>
                </select>
              </div>

              {/* View Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {language === 'ar' ? 'طريقة العرض' : 'Mode d\'affichage'}
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-3 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-elegant-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="h-5 w-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-3 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-elegant-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List className="h-5 w-5 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  {sortedProducts.length} {language === 'ar' ? 'منتج' : 'produits'}
                  {selectedCategory !== 'all' && (
                    <span className="ml-2 text-sm text-gray-500">
                      dans {categories.find(c => c.id === selectedCategory)?.[language === 'ar' ? 'nameAr' : 'name']}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {showNewOnly && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {language === 'ar' ? 'جديد' : 'Nouveautés'}
                    </span>
                  )}
                  {showFeaturedOnly && (
                    <span className="px-2 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-medium">
                      {language === 'ar' ? 'مميز' : 'Vedettes'}
                    </span>
                  )}
                  {showPromotedOnly && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {language === 'ar' ? 'عروض' : 'Promotions'}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      "{searchTerm}"
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-48 h-48' : 'h-64'
                  }`}>
                    <img
                      src={product.images[0]}
                      alt={language === 'ar' ? product.nameAr : product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <button className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100`}>
                      <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
                    </button>
                    
                    {/* Badges */}
                    <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} flex flex-col gap-2`}>
                      {product.originalPrice && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}
                      {product.featured && (
                        <div className="bg-gold-500 text-elegant-black px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {language === 'ar' ? 'مميز' : 'Vedette'}
                        </div>
                      )}
                      {product.promoted && (
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {language === 'ar' ? 'عرض' : 'Promo'}
                        </div>
                      )}
                      {new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {language === 'ar' ? 'جديد' : 'Nouveau'}
                        </div>
                      )}
                    </div>
                    
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium">
                          {language === 'ar' ? 'نفد المخزون' : 'Rupture de stock'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-elegant text-xl font-semibold text-elegant-black mb-2 hover:text-gold-600 transition-colors">
                        {language === 'ar' ? product.nameAr : product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      {(() => {
                        const category = categories.find(c => c.id === product.categoryId);
                        const subCategory = subCategories.find(s => s.id === product.subCategoryId);
                        const categoryName = category?.[language === 'ar' ? 'nameAr' : 'name'];
                        const subCategoryName = subCategory?.[language === 'ar' ? 'nameAr' : 'name'];
                        
                        if (subCategoryName) {
                          return `${categoryName} > ${subCategoryName}`;
                        }
                        return categoryName;
                      })()}
                    </p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-gold-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-sm text-gray-500 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                        ({product.reviews})
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <PriceDisplay 
                        amount={product.price} 
                        originalPrice={product.originalPrice}
                        className="text-xl"
                      />
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className="bg-elegant-black hover:bg-gold-600 text-white p-2 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {language === 'ar' ? 'لا توجد منتجات' : 'Aucun produit trouvé'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {language === 'ar' 
                      ? 'لا توجد منتجات تطابق المعايير المحددة'
                      : 'Aucun produit ne correspond aux critères sélectionnés'
                    }
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-elegant-black text-white px-6 py-3 rounded-lg hover:bg-gold-600 transition-colors"
                  >
                    {language === 'ar' ? 'عرض جميع المنتجات' : 'Voir tous les produits'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;