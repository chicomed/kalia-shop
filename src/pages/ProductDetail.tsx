import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Play, Pause, Star, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import PriceDisplay from '../components/PriceDisplay';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { language, isRTL } = useLanguage();
  const { addToCart } = useCart();
  const { getProductById, getProductsByCategory, categories, subCategories } = useProducts();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = getProductById(id || '');
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé</h1>
          <Link to="/" className="text-gold-600 hover:text-gold-700">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: language === 'ar' ? product.nameAr : product.name,
      price: product.price,
      image: product.images[0],
      category: language === 'ar' ? product.categoryAr : product.category
    });
  };

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gold-600">
            {language === 'ar' ? 'الرئيسية' : 'Accueil'}
          </Link>
          <span>/</span>
          <Link to="/collections" className="hover:text-gold-600">
            {(() => {
              const category = categories.find(c => c.id === product.categoryId);
              return language === 'ar' ? category?.nameAr : category?.name;
            })()}
          </Link>
          {product.subCategoryId && (() => {
            const subCategory = subCategories.find(s => s.id === product.subCategoryId);
            if (subCategory) {
              return (
                <>
                  <span>/</span>
                  <span className="text-gray-400">
                    {language === 'ar' ? subCategory.nameAr : subCategory.name}
                  </span>
                </>
              );
            }
            return null;
          })()}
          <span>/</span>
          <span className="text-elegant-black">
            {language === 'ar' ? product.nameAr : product.name}
          </span>
        </div>

        {/* Back Button */}
        <Link 
          to="/collections" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-elegant-black mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{language === 'ar' ? 'العودة للمجموعات' : 'Retour aux collections'}</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[selectedImage]}
                alt={language === 'ar' ? product.nameAr : product.name}
                className="w-full h-96 md:h-[500px] object-cover rounded-2xl shadow-lg"
              />
              {product.inStock ? (
                <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {language === 'ar' ? 'متوفر' : 'En stock'}
                </span>
              ) : (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {language === 'ar' ? 'نفد المخزون' : 'Rupture de stock'}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex space-x-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-1 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-gold-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${language === 'ar' ? product.nameAr : product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div>
              <h1 className="font-elegant text-4xl font-bold text-elegant-black mb-2">
                {language === 'ar' ? product.nameAr : product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-gold-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({product.reviews} {language === 'ar' ? 'تقييم' : 'avis'})
                </span>
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <PriceDisplay 
                  amount={product.price} 
                  originalPrice={product.originalPrice}
                  className="text-3xl"
                />
                {product.originalPrice && (
                  <span className="bg-gold-500 text-elegant-black px-3 py-1 rounded-full text-sm font-medium">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Audio Description */}
            {product.audioDescription && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-elegant-black mb-2">
                  {language === 'ar' ? 'الوصف الصوتي' : 'Description Audio'}
                </h3>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center space-x-2 text-gold-600 hover:text-gold-700 transition-colors"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  <span>
                    {isPlaying 
                      ? (language === 'ar' ? 'إيقاف' : 'Pause')
                      : (language === 'ar' ? 'استمع للوصف' : 'Écouter la description')
                    }
                  </span>
                </button>
              </div>
            )}

            <div>
              <h3 className="font-medium text-elegant-black mb-3">
                {language === 'ar' ? 'الوصف' : 'Description'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {language === 'ar' ? product.descriptionAr : product.description}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-elegant-black mb-3">
                {language === 'ar' ? 'المواصفات' : 'Spécifications'}
              </h3>
              <ul className="space-y-2">
                {(language === 'ar' ? product.specificationsAr : product.specifications).map((spec, index) => (
                  <li key={index} className="text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-gold-500 rounded-full mr-3"></span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-4 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>
                  {language === 'ar' ? 'أضف إلى السلة' : 'Ajouter au panier'}
                </span>
              </button>
              <button className="border-2 border-elegant-black text-elegant-black hover:bg-elegant-black hover:text-white p-4 rounded-lg transition-all duration-300">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-elegant text-3xl font-bold text-elegant-black mb-8 text-center">
              {language === 'ar' ? 'منتجات مشابهة' : 'Produits Similaires'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={relatedProduct.images[0]}
                      alt={language === 'ar' ? relatedProduct.nameAr : relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-elegant text-xl font-semibold text-elegant-black mb-2">
                      {language === 'ar' ? relatedProduct.nameAr : relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <PriceDisplay 
                        amount={relatedProduct.price} 
                        className="text-xl"
                      />
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-gold-500 fill-current" />
                        <span className="text-sm text-gray-500 ml-1">{relatedProduct.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;