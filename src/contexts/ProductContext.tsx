import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  productOperations, 
  categoryOperations, 
  createListener 
} from '../firebase/collections';
import { getDocs, collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { convertEurToMru } from '../utils/currency';

export interface SubCategory {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  categoryId: string;
  image: string;
  products: number;
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number;
  description: string;
  descriptionAr: string;
  images: string[];
  categoryId: string;
  subCategoryId: string;
  specifications: string[];
  specificationsAr: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  promoted: boolean;
  stockQuantity: number;
  createdAt: any;
  updatedAt: any;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image: string;
  products: number;
  subCategories: number;
  createdAt: any;
}

interface ProductContextType {
  products: Product[];
  categories: Category[];
  subCategories: SubCategory[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubCategory: (subCategory: Omit<SubCategory, 'id' | 'createdAt'>) => Promise<void>;
  updateSubCategory: (id: string, updates: Partial<SubCategory>) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  getProductsBySubCategory: (subCategoryId: string) => Product[];
  getFeaturedProducts: () => Product[];
  getPromotedProducts: () => Product[];
  getNewProducts: () => Product[];
  getSubCategoriesByCategory: (categoryId: string) => SubCategory[];
  updateStock: (id: string, quantity: number) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  togglePromoted: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  exportProducts: () => void;
  exportCategories: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data and set up real-time listeners
    const loadData = async () => {
      try {
        // Load products
        const productsSnapshot = await productOperations.getAll();
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsData);

        // Load categories
        const categoriesSnapshot = await categoryOperations.getAll();
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);

        // Load subcategories
        const subCategoriesSnapshot = await getDocs(collection(db, 'subCategories'));
        const subCategoriesData = subCategoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SubCategory[];
        setSubCategories(subCategoriesData);

        // If no data exists, create initial data
        if (categoriesData.length === 0) {
          await createInitialData();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up real-time listeners
    const unsubscribeProducts = createListener('products', setProducts);
    const unsubscribeCategories = createListener('categories', setCategories);
    const unsubscribeSubCategories = createListener('subCategories', setSubCategories);

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeSubCategories();
    };
  }, []);

  const createInitialData = async () => {
    try {
      // Create initial categories
      const initialCategories = [
        {
          name: 'Voiles Classiques',
          nameAr: 'الحجاب الكلاسيكي',
          description: 'Élégance intemporelle pour toutes occasions',
          descriptionAr: 'أناقة خالدة لجميع المناسبات',
          image: 'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg',
          products: 0,
          subCategories: 0
        },
        {
          name: 'Voiles de Soirée',
          nameAr: 'حجاب السهرة',
          description: 'Sophistication pour les moments exceptionnels',
          descriptionAr: 'رقي للحظات الاستثنائية',
          image: 'https://images.pexels.com/photos/8159838/pexels-photo-8159838.jpeg',
          products: 0,
          subCategories: 0
        },
        {
          name: 'Accessoires',
          nameAr: 'الإكسسوارات',
          description: 'Complétez votre look avec nos accessoires raffinés',
          descriptionAr: 'أكملي إطلالتك مع إكسسواراتنا الراقية',
          image: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg',
          products: 0,
          subCategories: 0
        }
      ];

      const categoryRefs = [];
      for (const category of initialCategories) {
        const docRef = await categoryOperations.add(category);
        categoryRefs.push({ id: docRef.id, ...category });
      }

      // Create initial subcategories
      const initialSubCategories = [
        {
          name: 'Voiles en Soie',
          nameAr: 'حجاب حريري',
          description: 'Voiles en soie naturelle de haute qualité',
          descriptionAr: 'حجاب من الحرير الطبيعي عالي الجودة',
          categoryId: categoryRefs[0].id,
          image: 'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg',
          products: 0
        },
        {
          name: 'Voiles en Coton',
          nameAr: 'حجاب قطني',
          description: 'Voiles en coton doux et respirant',
          descriptionAr: 'حجاب من القطن الناعم والمسامي',
          categoryId: categoryRefs[0].id,
          image: 'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg',
          products: 0
        },
        {
          name: 'Voiles Brodés',
          nameAr: 'حجاب مطرز',
          description: 'Voiles avec broderies élégantes',
          descriptionAr: 'حجاب مع تطريز أنيق',
          categoryId: categoryRefs[1].id,
          image: 'https://images.pexels.com/photos/8159838/pexels-photo-8159838.jpeg',
          products: 0
        },
        {
          name: 'Épingles',
          nameAr: 'دبابيس',
          description: 'Épingles décoratives pour voiles',
          descriptionAr: 'دبابيس زخرفية للحجاب',
          categoryId: categoryRefs[2].id,
          image: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg',
          products: 0
        }
      ];

      const subCategoryRefs = [];
      for (const subCategory of initialSubCategories) {
        const docRef = await addDoc(collection(db, 'subCategories'), {
          ...subCategory,
          createdAt: Timestamp.now()
        });
        subCategoryRefs.push({ id: docRef.id, ...subCategory });
      }

      // Create initial products with MRU prices
      const initialProducts = [
        {
          name: 'Voile Royale Dorée',
          nameAr: 'حجاب ملكي ذهبي',
          price: convertEurToMru(89.99),
          originalPrice: convertEurToMru(120.00),
          description: 'Un voile d\'exception confectionné avec des matériaux de première qualité.',
          descriptionAr: 'حجاب استثنائي مصنوع من مواد عالية الجودة.',
          images: [
            'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg',
            'https://images.pexels.com/photos/8159838/pexels-photo-8159838.jpeg'
          ],
          categoryId: categoryRefs[0].id,
          subCategoryId: subCategoryRefs[0].id,
          specifications: ['Soie premium', '200cm x 100cm', 'Doré avec broderies'],
          specificationsAr: ['حرير فاخر', '200 سم × 100 سم', 'ذهبي مع تطريز'],
          rating: 4.9,
          reviews: 24,
          inStock: true,
          featured: true,
          promoted: true,
          stockQuantity: 15
        },
        {
          name: 'Voile Élégance Noire',
          nameAr: 'حجاب أناقة أسود',
          price: convertEurToMru(75.50),
          description: 'Sophistication pour les moments exceptionnels.',
          descriptionAr: 'رقي للحظات الاستثنائية.',
          images: ['https://images.pexels.com/photos/8159838/pexels-photo-8159838.jpeg'],
          categoryId: categoryRefs[1].id,
          subCategoryId: subCategoryRefs[2].id,
          specifications: ['Satin de qualité', '180cm x 90cm', 'Noir élégant'],
          specificationsAr: ['ساتان عالي الجودة', '180 سم × 90 سم', 'أسود أنيق'],
          rating: 4.8,
          reviews: 18,
          inStock: true,
          featured: false,
          promoted: false,
          stockQuantity: 8
        }
      ];

      for (const product of initialProducts) {
        await productOperations.add(product);
      }
    } catch (error) {
      console.error('Error creating initial data:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await productOperations.add(productData);
      
      // Update category and subcategory product counts
      const category = categories.find(cat => cat.id === productData.categoryId);
      
      if (category) {
        await categoryOperations.update(category.id, {
          products: category.products + 1
        });
      }
      
      // Only update subcategory count if a subcategory is selected
      if (productData.subCategoryId) {
        const subCategory = subCategories.find(sub => sub.id === productData.subCategoryId);
        if (subCategory) {
        await updateDoc(doc(db, 'subCategories', subCategory.id), {
          products: subCategory.products + 1
        });
        }
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await productOperations.update(id, updates);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await productOperations.delete(id);
        
        // Update category and subcategory product counts
        const category = categories.find(cat => cat.id === product.categoryId);
        
        if (category) {
          await categoryOperations.update(category.id, {
            products: Math.max(0, category.products - 1)
          });
        }
        
        // Only update subcategory count if the product had a subcategory
        if (product.subCategoryId) {
          const subCategory = subCategories.find(sub => sub.id === product.subCategoryId);
          if (subCategory) {
          await updateDoc(doc(db, 'subCategories', subCategory.id), {
            products: Math.max(0, subCategory.products - 1)
          });
          }
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      await categoryOperations.add(categoryData);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await categoryOperations.update(id, updates);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Delete all subcategories and products in this category
      const categorySubCategories = subCategories.filter(sub => sub.categoryId === id);
      const categoryProducts = products.filter(p => p.categoryId === id);
      
      // Delete products first
      for (const product of categoryProducts) {
        await productOperations.delete(product.id);
      }
      
      // Delete subcategories
      for (const subCategory of categorySubCategories) {
        await deleteDoc(doc(db, 'subCategories', subCategory.id));
      }
      
      // Delete category
      await categoryOperations.delete(id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const addSubCategory = async (subCategoryData: Omit<SubCategory, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'subCategories'), {
        ...subCategoryData,
        createdAt: Timestamp.now()
      });
      
      // Update parent category subcategory count
      const category = categories.find(cat => cat.id === subCategoryData.categoryId);
      if (category) {
        await categoryOperations.update(category.id, {
          subCategories: category.subCategories + 1
        });
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
      throw error;
    }
  };

  const updateSubCategory = async (id: string, updates: Partial<SubCategory>) => {
    try {
      await updateDoc(doc(db, 'subCategories', id), updates);
    } catch (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    }
  };

  const deleteSubCategory = async (id: string) => {
    try {
      const subCategory = subCategories.find(sub => sub.id === id);
      if (subCategory) {
        // Delete all products in this subcategory
        const subCategoryProducts = products.filter(p => p.subCategoryId === id);
        for (const product of subCategoryProducts) {
          await productOperations.delete(product.id);
        }
        
        // Delete subcategory
        await deleteDoc(doc(db, 'subCategories', id));
        
        // Update parent category subcategory count
        const category = categories.find(cat => cat.id === subCategory.categoryId);
        if (category) {
          await categoryOperations.update(category.id, {
            subCategories: Math.max(0, category.subCategories - 1)
          });
        }
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  const getProductsByCategory = (categoryId: string): Product[] => {
    return products.filter(product => product.categoryId === categoryId);
  };

  const getProductsBySubCategory = (subCategoryId: string): Product[] => {
    return products.filter(product => product.subCategoryId === subCategoryId);
  };

  const getFeaturedProducts = (): Product[] => {
    return products.filter(product => product.featured);
  };

  const getPromotedProducts = (): Product[] => {
    return products.filter(product => product.promoted);
  };

  const getNewProducts = (): Product[] => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return products.filter(product => {
      const createdDate = product.createdAt?.toDate ? product.createdAt.toDate() : new Date(product.createdAt);
      return createdDate >= weekAgo;
    }).slice(0, 8);
  };

  const getSubCategoriesByCategory = (categoryId: string): SubCategory[] => {
    return subCategories.filter(subCategory => subCategory.categoryId === categoryId);
  };

  const updateStock = async (id: string, quantity: number) => {
    try {
      await updateProduct(id, { 
        stockQuantity: quantity,
        inStock: quantity > 0
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      const product = getProductById(id);
      if (product) {
        await updateProduct(id, { featured: !product.featured });
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      throw error;
    }
  };

  const togglePromoted = async (id: string) => {
    try {
      const product = getProductById(id);
      if (product) {
        await updateProduct(id, { promoted: !product.promoted });
      }
    } catch (error) {
      console.error('Error toggling promoted:', error);
      throw error;
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      const product = getProductById(id);
      if (product) {
        await updateProduct(id, { inStock: !product.inStock });
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      throw error;
    }
  };

  const exportProducts = () => {
    const csvContent = [
      ['Nom', 'Prix', 'Catégorie', 'Sous-catégorie', 'Stock', 'Statut', 'Vedette', 'Promu'].join(','),
      ...products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        const subCategory = subCategories.find(s => s.id === product.subCategoryId);
        return [
          product.name,
          product.price.toString(),
          category?.name || '',
          subCategory?.name || '',
          product.stockQuantity.toString(),
          product.inStock ? 'En stock' : 'Rupture',
          product.featured ? 'Oui' : 'Non',
          product.promoted ? 'Oui' : 'Non'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `produits-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCategories = () => {
    const csvContent = [
      ['Nom', 'Description', 'Sous-catégories', 'Produits'].join(','),
      ...categories.map(category => [
        category.name,
        category.description,
        category.subCategories.toString(),
        category.products.toString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `categories-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    products,
    categories,
    subCategories,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getProductById,
    getProductsByCategory,
    getProductsBySubCategory,
    getFeaturedProducts,
    getPromotedProducts,
    getNewProducts,
    getSubCategoriesByCategory,
    updateStock,
    toggleFeatured,
    togglePromoted,
    toggleAvailability,
    exportProducts,
    exportCategories
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};