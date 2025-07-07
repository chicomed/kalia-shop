import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  Package,
  Grid,
  List
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import DataTable, { Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';
import SingleImageUpload from '../components/SingleImageUpload';
import PriceDisplay from '../components/PriceDisplay';

const AdminProducts: React.FC = () => {
  const { 
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
    getSubCategoriesByCategory,
    toggleAvailability, 
    toggleFeatured,
    togglePromoted,
    exportProducts,
    exportCategories
  } = useProducts();
  
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'subcategories'>('products');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
    loading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
    loading: false
  });
  
  const [productForm, setProductForm] = useState({
    name: '',
    nameAr: '',
    price: 0,
    originalPrice: 0,
    description: '',
    descriptionAr: '',
    categoryId: '',
    subCategoryId: '',
    specifications: [''],
    specificationsAr: [''],
    images: [''],
    stockQuantity: 0,
    featured: false,
    promoted: false,
    inStock: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    image: ''
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    categoryId: '',
    image: ''
  });

  // Product columns
  const productColumns: Column<any>[] = [
    {
      key: 'images',
      title: 'Image',
      width: '80px',
      render: (value) => (
        <img 
          src={value?.[0] || 'https://via.placeholder.com/50'} 
          alt="Product" 
          className="w-12 h-12 object-cover rounded-lg"
        />
      )
    },
    {
      key: 'name',
      title: 'Produit',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">Stock: {row.stockQuantity}</div>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Prix',
      sortable: true,
      align: 'right',
      render: (value, row) => (
        <PriceDisplay 
          amount={value} 
          originalPrice={row.originalPrice}
          className="text-sm"
        />
      )
    },
    {
      key: 'categoryId',
      title: 'Catégorie',
      render: (value, row) => {
        const category = categories.find(c => c.id === value);
        const subCategory = subCategories.find(s => s.id === row.subCategoryId);
        return (
          <div className="text-sm">
            <div className="text-gray-900">{category?.name}</div>
            <div className="text-gray-500">{subCategory?.name || 'Aucune sous-catégorie'}</div>
          </div>
        );
      }
    },
    {
      key: 'inStock',
      title: 'Statut',
      sortable: true,
      align: 'center',
      render: (value, row) => (
        <div className="flex flex-col items-center space-y-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? 'En stock' : 'Rupture'}
          </span>
          <div className="flex space-x-1">
            {row.featured && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gold-100 text-gold-800">
                <Star className="w-3 h-3 mr-1" />
                Vedette
              </span>
            )}
            {row.promoted && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                Promu
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '200px',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleAvailability(row.id)}
            className={`p-1 rounded transition-colors ${
              row.inStock 
                ? 'text-green-600 hover:text-green-800' 
                : 'text-red-600 hover:text-red-800'
            }`}
            title={row.inStock ? 'Marquer en rupture' : 'Marquer en stock'}
          >
            {row.inStock ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => toggleFeatured(row.id)}
            className={`p-1 rounded transition-colors ${
              row.featured 
                ? 'text-gold-600 hover:text-gold-800' 
                : 'text-gray-400 hover:text-gold-600'
            }`}
            title="Basculer vedette"
          >
            <Star className="h-4 w-4" />
          </button>
          <button
            onClick={() => togglePromoted(row.id)}
            className={`p-1 rounded transition-colors ${
              row.promoted 
                ? 'text-blue-600 hover:text-blue-800' 
                : 'text-gray-400 hover:text-blue-600'
            }`}
            title="Basculer promotion"
          >
            <TrendingUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => startEditProduct(row)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteProduct(row)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  // Category columns
  const categoryColumns: Column<any>[] = [
    {
      key: 'image',
      title: 'Image',
      width: '80px',
      render: (value) => (
        <img 
          src={value || 'https://via.placeholder.com/50'} 
          alt="Category" 
          className="w-12 h-12 object-cover rounded-lg"
        />
      )
    },
    {
      key: 'name',
      title: 'Catégorie',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      key: 'subCategories',
      title: 'Sous-catégories',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="text-lg font-semibold text-blue-600">{value}</span>
      )
    },
    {
      key: 'products',
      title: 'Produits',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="text-lg font-semibold text-green-600">{value}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '150px',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => startEditCategory(row)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteCategory(row)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  // SubCategory columns
  const subCategoryColumns: Column<any>[] = [
    {
      key: 'image',
      title: 'Image',
      width: '80px',
      render: (value) => (
        <img 
          src={value || 'https://via.placeholder.com/50'} 
          alt="SubCategory" 
          className="w-12 h-12 object-cover rounded-lg"
        />
      )
    },
    {
      key: 'name',
      title: 'Sous-catégorie',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      key: 'categoryId',
      title: 'Catégorie parent',
      render: (value) => {
        const category = categories.find(c => c.id === value);
        return <span className="text-sm text-gray-700">{category?.name}</span>;
      }
    },
    {
      key: 'products',
      title: 'Produits',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className="text-lg font-semibold text-green-600">{value}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '150px',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => startEditSubCategory(row)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteSubCategory(row)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...productForm,
        rating: 0,
        reviews: 0,
        specifications: productForm.specifications.filter(spec => spec.trim() !== ''),
        specificationsAr: productForm.specificationsAr.filter(spec => spec.trim() !== ''),
        images: productForm.images.filter(img => img.trim() !== '')
      };

      if (editingItem) {
        await updateProduct(editingItem.id, productData);
        toast.success('Produit mis à jour avec succès');
      } else {
        await addProduct(productData);
        toast.success('Produit créé avec succès');
      }

      resetProductForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...categoryForm,
        products: 0,
        subCategories: 0
      };

      if (editingItem) {
        await updateCategory(editingItem.id, categoryData);
        toast.success('Catégorie mise à jour avec succès');
      } else {
        await addCategory(categoryData);
        toast.success('Catégorie créée avec succès');
      }

      resetCategoryForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const subCategoryData = {
        ...subCategoryForm,
        products: 0
      };

      if (editingItem) {
        await updateSubCategory(editingItem.id, subCategoryData);
        toast.success('Sous-catégorie mise à jour avec succès');
      } else {
        await addSubCategory(subCategoryData);
        toast.success('Sous-catégorie créée avec succès');
      }

      resetSubCategoryForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error('Erreur lors de la sauvegarde de la sous-catégorie');
    }
  };

  const startEditProduct = (product: any) => {
    setProductForm({
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      description: product.description,
      descriptionAr: product.descriptionAr,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      specifications: product.specifications,
      specificationsAr: product.specificationsAr,
      images: product.images,
      stockQuantity: product.stockQuantity,
      featured: product.featured,
      promoted: product.promoted,
      inStock: product.inStock
    });
    setEditingItem(product);
    setActiveTab('products');
    setShowAddForm(true);
  };

  const startEditCategory = (category: any) => {
    setCategoryForm({
      name: category.name,
      nameAr: category.nameAr,
      description: category.description,
      descriptionAr: category.descriptionAr,
      image: category.image
    });
    setEditingItem(category);
    setActiveTab('categories');
    setShowAddForm(true);
  };

  const startEditSubCategory = (subCategory: any) => {
    setSubCategoryForm({
      name: subCategory.name,
      nameAr: subCategory.nameAr,
      description: subCategory.description,
      descriptionAr: subCategory.descriptionAr,
      categoryId: subCategory.categoryId,
      image: subCategory.image
    });
    setEditingItem(subCategory);
    setActiveTab('subcategories');
    setShowAddForm(true);
  };

  const handleDeleteProduct = (product: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer le produit',
      message: `Êtes-vous sûr de vouloir supprimer définitivement le produit "${product.name}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await deleteProduct(product.id);
          toast.success(`Produit "${product.name}" supprimé avec succès`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error deleting product:', error);
          toast.error('Erreur lors de la suppression du produit');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleDeleteCategory = (category: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer la catégorie',
      message: `Êtes-vous sûr de vouloir supprimer définitivement la catégorie "${category.name}" ? Cela supprimera également toutes les sous-catégories et produits associés. Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await deleteCategory(category.id);
          toast.success(`Catégorie "${category.name}" supprimée avec succès`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error deleting category:', error);
          toast.error('Erreur lors de la suppression de la catégorie');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleDeleteSubCategory = (subCategory: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer la sous-catégorie',
      message: `Êtes-vous sûr de vouloir supprimer définitivement la sous-catégorie "${subCategory.name}" ? Cela supprimera également tous les produits associés. Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await deleteSubCategory(subCategory.id);
          toast.success(`Sous-catégorie "${subCategory.name}" supprimée avec succès`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error deleting subcategory:', error);
          toast.error('Erreur lors de la suppression de la sous-catégorie');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      nameAr: '',
      price: 0,
      originalPrice: 0,
      description: '',
      descriptionAr: '',
      categoryId: '',
      subCategoryId: '',
      specifications: [''],
      specificationsAr: [''],
      images: [''],
      stockQuantity: 0,
      featured: false,
      promoted: false,
      inStock: true
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      image: ''
    });
  };

  const resetSubCategoryForm = () => {
    setSubCategoryForm({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      categoryId: '',
      image: ''
    });
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'products': return 'Nouveau Produit';
      case 'categories': return 'Nouvelle Catégorie';
      case 'subcategories': return 'Nouvelle Sous-catégorie';
      default: return 'Nouveau';
    }
  };

  const getFormTitle = () => {
    if (editingItem) {
      switch (activeTab) {
        case 'products': return 'Modifier le Produit';
        case 'categories': return 'Modifier la Catégorie';
        case 'subcategories': return 'Modifier la Sous-catégorie';
        default: return 'Modifier';
      }
    } else {
      switch (activeTab) {
        case 'products': return 'Nouveau Produit';
        case 'categories': return 'Nouvelle Catégorie';
        case 'subcategories': return 'Nouvelle Sous-catégorie';
        default: return 'Nouveau';
      }
    }
  };

  const availableSubCategories = getSubCategoriesByCategory(productForm.categoryId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-elegant text-4xl font-bold text-elegant-black">
            Gestion des Produits
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-elegant-black hover:bg-gold-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>{getAddButtonText()}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Produits</p>
                <p className="text-3xl font-bold text-elegant-black">{products.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Catégories</p>
                <p className="text-3xl font-bold text-elegant-black">{categories.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Grid className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sous-catégories</p>
                <p className="text-3xl font-bold text-elegant-black">{subCategories.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <List className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Produits Vedettes</p>
                <p className="text-3xl font-bold text-elegant-black">
                  {products.filter(p => p.featured).length}
                </p>
              </div>
              <div className="bg-gold-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'products'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Produits ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'categories'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Catégories ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('subcategories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'subcategories'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sous-catégories ({subCategories.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <DataTable
                data={products}
                columns={productColumns}
                loading={loading}
                searchable={true}
                exportable={true}
                onExport={exportProducts}
                pageSize={15}
                searchPlaceholder="Rechercher par nom, catégorie..."
                emptyMessage="Aucun produit trouvé"
              />
            )}

            {activeTab === 'categories' && (
              <DataTable
                data={categories}
                columns={categoryColumns}
                loading={loading}
                searchable={true}
                exportable={true}
                onExport={exportCategories}
                pageSize={15}
                searchPlaceholder="Rechercher par nom de catégorie..."
                emptyMessage="Aucune catégorie trouvée"
              />
            )}

            {activeTab === 'subcategories' && (
              <DataTable
                data={subCategories}
                columns={subCategoryColumns}
                loading={loading}
                searchable={true}
                exportable={false}
                pageSize={15}
                searchPlaceholder="Rechercher par nom de sous-catégorie..."
                emptyMessage="Aucune sous-catégorie trouvée"
              />
            )}
          </div>
        </div>

        {/* Add/Edit Forms */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-elegant text-2xl font-bold text-elegant-black">
                    {getFormTitle()}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                      resetProductForm();
                      resetCategoryForm();
                      resetSubCategoryForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {activeTab === 'products' && (
                <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du produit (Français) *
                      </label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du produit (العربية) *
                      </label>
                      <input
                        type="text"
                        value={productForm.nameAr}
                        onChange={(e) => setProductForm({...productForm, nameAr: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-right"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix (MRU) *
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix original (MRU)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({...productForm, originalPrice: parseFloat(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        value={productForm.stockQuantity}
                        onChange={(e) => setProductForm({...productForm, stockQuantity: parseInt(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie *
                      </label>
                      <select
                        value={productForm.categoryId}
                        onChange={(e) => setProductForm({...productForm, categoryId: e.target.value, subCategoryId: ''})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sous-catégorie (optionnel)
                      </label>
                      <select
                        value={productForm.subCategoryId}
                        onChange={(e) => setProductForm({...productForm, subCategoryId: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        disabled={!productForm.categoryId}
                      >
                        <option value="">Sélectionner une sous-catégorie</option>
                        {availableSubCategories.map((subCategory) => (
                          <option key={subCategory.id} value={subCategory.id}>
                            {subCategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Français) *
                      </label>
                      <textarea
                        rows={4}
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (العربية) *
                      </label>
                      <textarea
                        rows={4}
                        value={productForm.descriptionAr}
                        onChange={(e) => setProductForm({...productForm, descriptionAr: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-right"
                        required
                      />
                    </div>
                  </div>

                  <ImageUpload
                    images={productForm.images}
                    onChange={(images) => setProductForm({...productForm, images})}
                    maxImages={5}
                    label="Images du produit"
                    required
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={productForm.featured}
                        onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                        className="text-gold-500 focus:ring-gold-500"
                      />
                      <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                        Produit vedette
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="promoted"
                        checked={productForm.promoted}
                        onChange={(e) => setProductForm({...productForm, promoted: e.target.checked})}
                        className="text-gold-500 focus:ring-gold-500"
                      />
                      <label htmlFor="promoted" className="ml-2 text-sm text-gray-700">
                        Produit promu
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={productForm.inStock}
                        onChange={(e) => setProductForm({...productForm, inStock: e.target.checked})}
                        className="text-gold-500 focus:ring-gold-500"
                      />
                      <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                        En stock
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        resetProductForm();
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      {editingItem ? 'Mettre à jour' : 'Créer le produit'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'categories' && (
                <form onSubmit={handleCategorySubmit} className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom (Français) *
                      </label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom (العربية) *
                      </label>
                      <input
                        type="text"
                        value={categoryForm.nameAr}
                        onChange={(e) => setCategoryForm({...categoryForm, nameAr: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-right"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Français) *
                      </label>
                      <textarea
                        rows={3}
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (العربية) *
                      </label>
                      <textarea
                        rows={3}
                        value={categoryForm.descriptionAr}
                        onChange={(e) => setCategoryForm({...categoryForm, descriptionAr: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-right"
                        required
                      />
                    </div>
                  </div>

                  <SingleImageUpload
                    image={categoryForm.image}
                    onChange={(image) => setCategoryForm({...categoryForm, image})}
                    aspectRatio="landscape"
                    label="Image de la catégorie"
                    required
                  />

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        resetCategoryForm();
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      {editingItem ? 'Mettre à jour' : 'Créer la catégorie'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'subcategories' && (
                <form onSubmit={handleSubCategorySubmit} className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom (Français) *
                      </label>
                      <input
                        type="text"
                        value={subCategoryForm.name}
                        onChange={(e) => setSubCategoryForm({...subCategoryForm, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom (العربية) *
                      </label>
                      <input
                        type="text"
                        value={subCategoryForm.nameAr}
                        onChange={(e) => setSubCategoryForm({...subCategoryForm, nameAr: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-right"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie parent *
                    </label>
                    <select
                      value={subCategoryForm.categoryId}
                      onChange={(e) => setSubCategoryForm({...subCategoryForm, categoryId: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Français) *
                      </label>
                      <textarea
                        rows={3}
                        value={subCategoryForm.description}
                        onChange={(e) => setSubCategoryForm({...subCategoryForm, description: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (العربية) *
                      </label>
                      <textarea
                        rows={3}
                        value={subCategoryForm.descriptionAr}
                        onChange={(e) => setSubCategoryForm({...subCategoryForm, descriptionAr: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-right"
                        required
                      />
                    </div>
                  </div>

                  <SingleImageUpload
                    image={subCategoryForm.image}
                    onChange={(image) => setSubCategoryForm({...subCategoryForm, image})}
                    aspectRatio="landscape"
                    label="Image de la sous-catégorie"
                    required
                  />

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        resetSubCategoryForm();
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      {editingItem ? 'Mettre à jour' : 'Créer la sous-catégorie'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          loading={confirmDialog.loading}
        />
      </div>
    </div>
  );
};

export default AdminProducts;