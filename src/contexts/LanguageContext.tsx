import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.collections': 'Collections',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.cart': 'Panier',
    'nav.admin': 'Admin',
    'nav.dashboard': 'Tableau de Bord',
    'nav.orders': 'Commandes',
    'nav.products': 'Produits',
    'nav.cashRegister': 'Caisse',
    'nav.boutique': 'Boutique',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',

    // Home Page
    'home.title': 'Voile Beauté',
    'home.subtitle': 'Élégance & Tradition',
    'home.hero.title': 'Voile Beauté',
    'home.hero.description': 'Découvrez l\'élégance authentique avec notre collection exclusive de voiles traditionnels',
    'home.hero.discover': 'Découvrir la Collection',
    'home.hero.new': 'Nos Nouveautés',
    'home.collections.title': 'Nos Collections',
    'home.collections.description': 'Explorez nos différentes collections, chacune conçue avec passion pour répondre à vos besoins uniques',
    'home.featured.title': 'Produits Vedettes',
    'home.featured.description': 'Découvrez nos pièces les plus appréciées, sélectionnées avec soin pour leur qualité exceptionnelle',
    'home.newsletter.title': 'Rejoignez Notre Communauté',
    'home.newsletter.description': 'Restez informée de nos dernières collections et bénéficiez d\'offres exclusives',
    'home.newsletter.placeholder': 'Votre adresse email',
    'home.newsletter.subscribe': 'S\'abonner',

    // Categories
    'category.classic': 'Voiles Classiques',
    'category.classic.desc': 'Élégance intemporelle pour toutes occasions',
    'category.evening': 'Voiles de Soirée',
    'category.evening.desc': 'Sophistication pour les moments exceptionnels',
    'category.accessories': 'Accessoires',
    'category.accessories.desc': 'Complétez votre look avec nos accessoires raffinés',
    'category.viewCollection': 'Voir la collection',
    'category.products': 'produits',

    // Product
    'product.addToCart': 'Ajouter au panier',
    'product.inStock': 'En stock',
    'product.outOfStock': 'Rupture de stock',
    'product.reviews': 'avis',
    'product.description': 'Description',
    'product.specifications': 'Spécifications',
    'product.audioDescription': 'Description Audio',
    'product.listen': 'Écouter la description',
    'product.pause': 'Pause',
    'product.similar': 'Produits Similaires',
    'product.backToShop': 'Retour à la boutique',

    // Cart
    'cart.title': 'Votre Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.continueShopping': 'Continuer les achats',
    'cart.summary': 'Résumé de la commande',
    'cart.subtotal': 'Sous-total',
    'cart.shipping': 'Livraison',
    'cart.total': 'Total',
    'cart.currency': 'UM',
    'cart.deliveryAddress': 'Adresse de livraison',
    'cart.useGeolocation': 'Utiliser ma géolocalisation',
    'cart.manualAddress': 'Saisir manuellement',
    'cart.fullAddress': 'Adresse complète',
    'cart.city': 'Ville',
    'cart.postalCode': 'Code postal',
    'cart.paymentMethod': 'Mode de paiement',
    'cart.uploadPayment': 'Télécharger une capture de paiement',
    'cart.payOnDelivery': 'Paiement à la livraison',
    'cart.paymentScreenshot': 'Capture d\'écran du paiement',
    'cart.uploadFile': 'Cliquez pour télécharger ou glissez-déposez',
    'cart.chooseFile': 'Choisir un fichier',
    'cart.placeOrder': 'Passer la commande',
    'cart.unitPrice': 'Prix unitaire',

    // Auth
    'auth.login': 'Connexion',
    'auth.phoneNumber': 'Numéro de téléphone',
    'auth.enterPhone': 'Entrez votre numéro de téléphone',
    'auth.sendCode': 'Envoyer le code',
    'auth.verificationCode': 'Code de vérification',
    'auth.enterCode': 'Entrez le code reçu par SMS',
    'auth.verify': 'Vérifier',
    'auth.resendCode': 'Renvoyer le code',
    'auth.cancel': 'Annuler',

    // Admin
    'admin.dashboard': 'Tableau de Bord',
    'admin.overview': 'Aperçu de votre boutique aujourd\'hui',
    'admin.lastUpdate': 'Dernière mise à jour',
    'admin.ordersToday': 'Commandes Aujourd\'hui',
    'admin.thisWeek': 'Cette Semaine',
    'admin.revenue': 'Chiffre d\'Affaires',
    'admin.dailyCash': 'Caisse du Jour',
    'admin.manageCash': 'Gérer la Caisse',
    'admin.recentOrders': 'Commandes Récentes',
    'admin.viewAll': 'Voir tout',
    'admin.orderManagement': 'Gestion Commandes',
    'admin.productManagement': 'Gestion Produits',
    'admin.clientMessages': 'Messages Clients',

    // Order Status
    'status.pending': 'En attente',
    'status.sent': 'Envoyé',
    'status.delivered': 'Livré',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.confirm': 'Confirmer',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.view': 'Voir',
    'common.close': 'Fermer'
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.collections': 'المجموعات',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.cart': 'السلة',
    'nav.admin': 'الإدارة',
    'nav.dashboard': 'لوحة التحكم',
    'nav.orders': 'الطلبات',
    'nav.products': 'المنتجات',
    'nav.cashRegister': 'الصندوق',
    'nav.boutique': 'المتجر',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',

    // Home Page
    'home.title': 'حجاب الجمال',
    'home.subtitle': 'الأناقة والتقاليد',
    'home.hero.title': 'حجاب الجمال',
    'home.hero.description': 'اكتشفي الأناقة الأصيلة مع مجموعتنا الحصرية من الحجاب التقليدي',
    'home.hero.discover': 'اكتشفي المجموعة',
    'home.hero.new': 'أحدث المنتجات',
    'home.collections.title': 'مجموعاتنا',
    'home.collections.description': 'استكشفي مجموعاتنا المختلفة، كل منها مصممة بشغف لتلبية احتياجاتك الفريدة',
    'home.featured.title': 'المنتجات المميزة',
    'home.featured.description': 'اكتشفي قطعنا الأكثر تقديراً، المختارة بعناية لجودتها الاستثنائية',
    'home.newsletter.title': 'انضمي إلى مجتمعنا',
    'home.newsletter.description': 'ابقي على اطلاع بأحدث مجموعاتنا واستفيدي من العروض الحصرية',
    'home.newsletter.placeholder': 'عنوان بريدك الإلكتروني',
    'home.newsletter.subscribe': 'اشتراك',

    // Categories
    'category.classic': 'الحجاب الكلاسيكي',
    'category.classic.desc': 'أناقة خالدة لجميع المناسبات',
    'category.evening': 'حجاب السهرة',
    'category.evening.desc': 'رقي للحظات الاستثنائية',
    'category.accessories': 'الإكسسوارات',
    'category.accessories.desc': 'أكملي إطلالتك مع إكسسواراتنا الراقية',
    'category.viewCollection': 'عرض المجموعة',
    'category.products': 'منتجات',

    // Product
    'product.addToCart': 'أضف إلى السلة',
    'product.inStock': 'متوفر',
    'product.outOfStock': 'نفد المخزون',
    'product.reviews': 'تقييم',
    'product.description': 'الوصف',
    'product.specifications': 'المواصفات',
    'product.audioDescription': 'الوصف الصوتي',
    'product.listen': 'استمع للوصف',
    'product.pause': 'إيقاف',
    'product.similar': 'منتجات مشابهة',
    'product.backToShop': 'العودة للمتجر',

    // Cart
    'cart.title': 'سلتك',
    'cart.empty': 'سلتك فارغة',
    'cart.continueShopping': 'متابعة التسوق',
    'cart.summary': 'ملخص الطلب',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.shipping': 'التوصيل',
    'cart.total': 'المجموع',
    'cart.currency': 'أوقية',
    'cart.deliveryAddress': 'عنوان التوصيل',
    'cart.useGeolocation': 'استخدم موقعي الحالي',
    'cart.manualAddress': 'إدخال يدوي',
    'cart.fullAddress': 'العنوان الكامل',
    'cart.city': 'المدينة',
    'cart.postalCode': 'الرمز البريدي',
    'cart.paymentMethod': 'طريقة الدفع',
    'cart.uploadPayment': 'رفع لقطة شاشة للدفع',
    'cart.payOnDelivery': 'الدفع عند التوصيل',
    'cart.paymentScreenshot': 'لقطة شاشة الدفع',
    'cart.uploadFile': 'انقر للرفع أو اسحب وأفلت',
    'cart.chooseFile': 'اختر ملف',
    'cart.placeOrder': 'تأكيد الطلب',
    'cart.unitPrice': 'السعر للوحدة',

    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.phoneNumber': 'رقم الهاتف',
    'auth.enterPhone': 'أدخل رقم هاتفك',
    'auth.sendCode': 'إرسال الرمز',
    'auth.verificationCode': 'رمز التحقق',
    'auth.enterCode': 'أدخل الرمز المرسل عبر الرسائل',
    'auth.verify': 'تحقق',
    'auth.resendCode': 'إعادة إرسال الرمز',
    'auth.cancel': 'إلغاء',

    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.overview': 'نظرة عامة على متجرك اليوم',
    'admin.lastUpdate': 'آخر تحديث',
    'admin.ordersToday': 'طلبات اليوم',
    'admin.thisWeek': 'هذا الأسبوع',
    'admin.revenue': 'الإيرادات',
    'admin.dailyCash': 'صندوق اليوم',
    'admin.manageCash': 'إدارة الصندوق',
    'admin.recentOrders': 'الطلبات الأخيرة',
    'admin.viewAll': 'عرض الكل',
    'admin.orderManagement': 'إدارة الطلبات',
    'admin.productManagement': 'إدارة المنتجات',
    'admin.clientMessages': 'رسائل العملاء',

    // Order Status
    'status.pending': 'في الانتظار',
    'status.sent': 'تم الإرسال',
    'status.delivered': 'تم التوصيل',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.confirm': 'تأكيد',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.close': 'إغلاق'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'ar')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};