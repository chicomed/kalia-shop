export interface Product {
  id: number;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number;
  description: string;
  descriptionAr: string;
  images: string[];
  category: string;
  categoryAr: string;
  specifications: string[];
  specificationsAr: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  audioDescription?: string;
}

export interface Category {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image: string;
  products: number;
}

export const categories: Category[] = [
  {
    id: 1,
    name: 'Voiles Classiques',
    nameAr: 'الحجاب الكلاسيكي',
    description: 'Élégance intemporelle pour toutes occasions',
    descriptionAr: 'أناقة خالدة لجميع المناسبات',
    image: 'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg',
    products: 24
  },
  {
    id: 2,
    name: 'Voiles de Soirée',
    nameAr: 'حجاب السهرة',
    description: 'Sophistication pour les moments exceptionnels',
    descriptionAr: 'رقي للحظات الاستثنائية',
    image: 'https://images.pexels.com/photos/8159838/pexels-photo-8159838.jpeg',
    products: 18
  },
  {
    id: 3,
    name: 'Accessoires',
    nameAr: 'الإكسسوارات',
    description: 'Complétez votre look avec nos accessoires raffinés',
    descriptionAr: 'أكملي إطلالتك مع إكسسواراتنا الراقية',
    image: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg',
    products: 32
  }
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Voile Royale Dorée',
    nameAr: 'حجاب ملكي ذهبي',
    price: 89.99,
    originalPrice: 120.00,
    description: 'Un voile d\'exception confectionné avec des matériaux de première qualité. Ce modèle unique allie tradition et modernité pour créer une pièce d\'une élégance rare.',
    descriptionAr: 'حجاب استثنائي مصنوع من مواد عالية الجودة. هذا النموذج الفريد يجمع بين التقاليد والحداثة لخلق قطعة نادرة الأناقة.',
    images: [
      'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg',
      'https://images.pexels.com/photos/8159838/pexels-photo-8159838.jpeg',
      'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg'
    ],
    category: 'Voiles Classiques',
    categoryAr: 'الحجاب الكلاسيكي',
    specifications: [
      'Matière: Soie premium',
      'Dimensions: 200cm x 100cm',
      'Couleur: Doré avec broderies',
      'Entretien: Nettoyage à sec uniquement',
      'Origine: Artisanat traditionnel'
    ],
    specificationsAr: [
      'المادة: حرير فاخر',
      'الأبعاد: 200 سم × 100 سم',
      'اللون: ذهبي مع تطريز',
      'العناية: تنظيف جاف فقط',
      'المنشأ: حرفة تقليدية'
    ],
    rating: 4.9,
    reviews: 24,
    inStock: true,
    featured: true
  },
  {
    id: 2,
    name: 'Voile Élégance Noire',
    nameAr: 'حجاب أناقة أسود',
    price: 75.50,
    description: 'Sophistication pour les moments exceptionnels. Un voile noir d\'une élégance rare, parfait pour les occasions spéciales.',
    descriptionAr: 'رقي للحظات الاستثنائية. حجاب أسود نادر الأناقة، مثالي للمناسبات الخاصة.',
    images: [
      'https://images.pexels.com/photos/8159838/pexels-photo-8159838.jpeg',
      'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg'
    ],
    category: 'Voiles de Soirée',
    categoryAr: 'حجاب السهرة',
    specifications: [
      'Matière: Satin de qualité',
      'Dimensions: 180cm x 90cm',
      'Couleur: Noir élégant',
      'Entretien: Lavage délicat'
    ],
    specificationsAr: [
      'المادة: ساتان عالي الجودة',
      'الأبعاد: 180 سم × 90 سم',
      'اللون: أسود أنيق',
      'العناية: غسيل رقيق'
    ],
    rating: 4.8,
    reviews: 18,
    inStock: true,
    featured: false
  },
  {
    id: 3,
    name: 'Voile Tradition Blanche',
    nameAr: 'حجاب تقليدي أبيض',
    price: 95.00,
    description: 'Tradition et modernité dans une pièce unique. Un voile blanc traditionnel revisité avec une touche contemporaine.',
    descriptionAr: 'التقاليد والحداثة في قطعة واحدة فريدة. حجاب أبيض تقليدي معاد تفسيره بلمسة عصرية.',
    images: [
      'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg',
      'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg'
    ],
    category: 'Voiles Classiques',
    categoryAr: 'الحجاب الكلاسيكي',
    specifications: [
      'Matière: Coton premium',
      'Dimensions: 210cm x 110cm',
      'Couleur: Blanc traditionnel',
      'Entretien: Lavage machine 30°C'
    ],
    specificationsAr: [
      'المادة: قطن فاخر',
      'الأبعاد: 210 سم × 110 سم',
      'اللون: أبيض تقليدي',
      'العناية: غسيل آلة 30 درجة'
    ],
    rating: 5.0,
    reviews: 31,
    inStock: false,
    featured: true
  },
  {
    id: 4,
    name: 'Voile Moderne Beige',
    nameAr: 'حجاب عصري بيج',
    price: 68.75,
    description: 'Un voile moderne aux tons neutres, parfait pour un look quotidien élégant.',
    descriptionAr: 'حجاب عصري بألوان محايدة، مثالي لإطلالة يومية أنيقة.',
    images: [
      'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg'
    ],
    category: 'Voiles Classiques',
    categoryAr: 'الحجاب الكلاسيكي',
    specifications: [
      'Matière: Viscose',
      'Dimensions: 190cm x 95cm',
      'Couleur: Beige moderne',
      'Entretien: Lavage délicat'
    ],
    specificationsAr: [
      'المادة: فيسكوز',
      'الأبعاد: 190 سم × 95 سم',
      'اللون: بيج عصري',
      'العناية: غسيل رقيق'
    ],
    rating: 4.7,
    reviews: 12,
    inStock: true,
    featured: false
  },
  {
    id: 5,
    name: 'Épingle Dorée Premium',
    nameAr: 'دبوس ذهبي فاخر',
    price: 25.00,
    description: 'Épingle dorée de qualité premium pour fixer votre voile avec élégance.',
    descriptionAr: 'دبوس ذهبي عالي الجودة لتثبيت حجابك بأناقة.',
    images: [
      'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg'
    ],
    category: 'Accessoires',
    categoryAr: 'الإكسسوارات',
    specifications: [
      'Matière: Métal doré',
      'Dimensions: 5cm',
      'Finition: Anti-allergique',
      'Garantie: 1 an'
    ],
    specificationsAr: [
      'المادة: معدن مذهب',
      'الأبعاد: 5 سم',
      'التشطيب: مضاد للحساسية',
      'الضمان: سنة واحدة'
    ],
    rating: 4.6,
    reviews: 8,
    inStock: true,
    featured: false
  }
];

export const getProductById = (id: number): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (categoryName: string): Product[] => {
  return products.filter(product => product.category === categoryName);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};