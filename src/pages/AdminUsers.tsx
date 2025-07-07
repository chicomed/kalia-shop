import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Settings,
  Store,
  Mail,
  Phone
} from 'lucide-react';
import { useUserManagement } from '../contexts/UserManagementContext';
import { useAuth } from '../contexts/AuthContext';
import DataTable, { Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import SingleImageUpload from '../components/SingleImageUpload';
import toast from 'react-hot-toast';

const AdminUsers: React.FC = () => {
  const { 
    users, 
    shops,
    currentShop,
    loading,
    isSuperAdmin,
    canManageUsers,
    addUser, 
    updateUser, 
    deleteUser,
    activateUser,
    deactivateUser,
    createShop,
    switchShop,
    getUsersByShop,
    getShopsByOwner
  } = useUserManagement();
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'shops'>('users');
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

  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    role: 'shop_manager' as 'shop_owner' | 'shop_manager',
    shopId: currentShop?.id || '',
    shopName: currentShop?.name || '',
    avatar: '',
    phone: '',
    permissions: {
      manageProducts: true,
      manageOrders: true,
      manageCash: false,
      manageClients: true,
      viewReports: false,
      manageSettings: false
    }
  });

  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    logo: '',
    heroImages: [''],
    settings: {
      currency: 'MRU',
      language: 'fr' as 'fr' | 'ar',
      timezone: 'Africa/Nouakchott',
      address: '',
      phone: '',
      email: ''
    }
  });

  // Filter users based on permissions
  const displayUsers = isSuperAdmin ? users : getUsersByShop(currentShop?.id || '');
  const displayShops = isSuperAdmin ? shops : getShopsByOwner(user?.uid || '');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shop_owner': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shop_manager': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'shop_owner': return 'Propriétaire';
      case 'shop_manager': return 'Gestionnaire';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  // User columns
  const userColumns: Column<any>[] = [
    {
      key: 'avatar',
      title: '',
      width: '60px',
      render: (value, row) => (
        <div className="flex items-center justify-center">
          {value ? (
            <img src={value} alt={row.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {row.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      title: 'Utilisateur',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Rôle',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(value)}`}>
          {value === 'super_admin' && <Crown className="w-3 h-3 mr-1" />}
          {value === 'shop_owner' && <Store className="w-3 h-3 mr-1" />}
          {value === 'shop_manager' && <Shield className="w-3 h-3 mr-1" />}
          {getRoleText(value)}
        </span>
      )
    },
    {
      key: 'shopName',
      title: 'Boutique',
      render: (value) => (
        <span className="text-sm text-gray-700">{value || 'Aucune'}</span>
      )
    },
    {
      key: 'status',
      title: 'Statut',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      )
    },
    {
      key: 'lastLogin',
      title: 'Dernière connexion',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {value?.toDate ? value.toDate().toLocaleDateString('fr-FR') : 'Jamais'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '200px',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => startEditUser(row)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          {row.status === 'active' ? (
            <button
              onClick={() => handleDeactivateUser(row)}
              className="p-1 text-gray-600 hover:text-orange-600 transition-colors"
              title="Désactiver"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => handleActivateUser(row)}
              className="p-1 text-gray-600 hover:text-green-600 transition-colors"
              title="Activer"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {isSuperAdmin && (
            <button
              onClick={() => handleDeleteUser(row)}
              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Shop columns
  const shopColumns: Column<any>[] = [
    {
      key: 'logo',
      title: '',
      width: '60px',
      render: (value, row) => (
        <div className="flex items-center justify-center">
          {value ? (
            <img src={value} alt={row.name} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 bg-elegant-black rounded-lg flex items-center justify-center">
              <span className="text-gold-500 font-bold text-sm">
                {row.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      title: 'Boutique',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      key: 'ownerEmail',
      title: 'Propriétaire',
      render: (value) => (
        <span className="text-sm text-gray-700">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Statut',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
          {getStatusText(value)}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Créée le',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {value?.toDate ? value.toDate().toLocaleDateString('fr-FR') : 'N/A'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '150px',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => switchShop(row.id)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Sélectionner"
          >
            <Settings className="h-4 w-4" />
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => handleDeleteShop(row)}
              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userData = {
        ...userForm,
        status: 'active' as const,
        shopName: shops.find(s => s.id === userForm.shopId)?.name || userForm.shopName
      };

      if (editingItem) {
        await updateUser(editingItem.id, userData);
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        await addUser(userData);
        toast.success('Utilisateur créé avec succès');
      }

      resetUserForm();
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Erreur lors de la sauvegarde de l\'utilisateur');
    }
  };

  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const shopData = {
        ...shopForm,
        ownerId: user?.uid || '',
        ownerEmail: user?.email || '',
        status: 'active' as const
      };

      await createShop(shopData);
      toast.success('Boutique créée avec succès');
      resetShopForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating shop:', error);
      toast.error('Erreur lors de la création de la boutique');
    }
  };

  const startEditUser = (user: any) => {
    setUserForm({
      email: user.email,
      name: user.name,
      role: user.role,
      shopId: user.shopId || '',
      shopName: user.shopName || '',
      avatar: user.avatar || '',
      phone: user.phone || '',
      permissions: user.permissions
    });
    setEditingItem(user);
    setActiveTab('users');
    setShowAddForm(true);
  };

  const handleActivateUser = (user: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Activer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir activer l'utilisateur "${user.name}" ?`,
      type: 'info',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await activateUser(user.id);
          toast.success(`Utilisateur "${user.name}" activé avec succès`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error activating user:', error);
          toast.error('Erreur lors de l\'activation de l\'utilisateur');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleDeactivateUser = (user: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Désactiver l\'utilisateur',
      message: `Êtes-vous sûr de vouloir désactiver l'utilisateur "${user.name}" ? Il ne pourra plus se connecter.`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await deactivateUser(user.id);
          toast.success(`Utilisateur "${user.name}" désactivé avec succès`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error deactivating user:', error);
          toast.error('Erreur lors de la désactivation de l\'utilisateur');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleDeleteUser = (user: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${user.name}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await deleteUser(user.id);
          toast.success(`Utilisateur "${user.name}" supprimé avec succès`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error('Erreur lors de la suppression de l\'utilisateur');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleDeleteShop = (shop: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer la boutique',
      message: `Êtes-vous sûr de vouloir supprimer définitivement la boutique "${shop.name}" ? Cette action supprimera également tous les utilisateurs, produits et données associés. Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          // await deleteShop(shop.id);
          toast.success(`Boutique "${shop.name}" supprimée avec succès`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error deleting shop:', error);
          toast.error('Erreur lors de la suppression de la boutique');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const resetUserForm = () => {
    setUserForm({
      email: '',
      name: '',
      role: 'shop_manager',
      shopId: currentShop?.id || '',
      shopName: currentShop?.name || '',
      avatar: '',
      phone: '',
      permissions: {
        manageProducts: true,
        manageOrders: true,
        manageCash: false,
        manageClients: true,
        viewReports: false,
        manageSettings: false
      }
    });
  };

  const resetShopForm = () => {
    setShopForm({
      name: '',
      description: '',
      logo: '',
      heroImages: [''],
      settings: {
        currency: 'MRU',
        language: 'fr',
        timezone: 'Africa/Nouakchott',
        address: '',
        phone: '',
        email: ''
      }
    });
  };

  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-elegant text-4xl font-bold text-elegant-black">
              Gestion des Utilisateurs
            </h1>
            {currentShop && (
              <p className="text-gray-600 mt-2">
                Boutique actuelle: <span className="font-medium">{currentShop.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-elegant-black hover:bg-gold-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>{activeTab === 'users' ? 'Nouvel Utilisateur' : 'Nouvelle Boutique'}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Utilisateurs</p>
                <p className="text-3xl font-bold text-elegant-black">{displayUsers.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Utilisateurs Actifs</p>
                <p className="text-3xl font-bold text-elegant-black">
                  {displayUsers.filter(u => u.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Boutiques</p>
                <p className="text-3xl font-bold text-elegant-black">{displayShops.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Super Admins</p>
                <p className="text-3xl font-bold text-elegant-black">
                  {users.filter(u => u.role === 'super_admin').length}
                </p>
              </div>
              <div className="bg-gold-100 p-3 rounded-lg">
                <Crown className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Utilisateurs ({displayUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('shops')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'shops'
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Boutiques ({displayShops.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <DataTable
                data={displayUsers}
                columns={userColumns}
                loading={loading}
                searchable={true}
                exportable={false}
                pageSize={15}
                searchPlaceholder="Rechercher par nom, email..."
                emptyMessage="Aucun utilisateur trouvé"
              />
            )}

            {activeTab === 'shops' && (
              <DataTable
                data={displayShops}
                columns={shopColumns}
                loading={loading}
                searchable={true}
                exportable={false}
                pageSize={15}
                searchPlaceholder="Rechercher par nom de boutique..."
                emptyMessage="Aucune boutique trouvée"
              />
            )}
          </div>
        </div>

        {/* Add/Edit Forms */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-elegant text-2xl font-bold text-elegant-black">
                    {activeTab === 'users' 
                      ? (editingItem ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur')
                      : 'Nouvelle Boutique'
                    }
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                      resetUserForm();
                      resetShopForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {activeTab === 'users' ? (
                <form onSubmit={handleUserSubmit} className="p-6 space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gold-500 flex items-center justify-center">
                      {userForm.avatar ? (
                        <img 
                          src={userForm.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xl font-bold">
                          {userForm.name.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <SingleImageUpload
                        image={userForm.avatar}
                        onChange={(avatar) => setUserForm({...userForm, avatar})}
                        aspectRatio="square"
                        label="Photo de profil"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                        disabled={!!editingItem}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle *
                      </label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({...userForm, role: e.target.value as any})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      >
                        <option value="shop_manager">Gestionnaire</option>
                        <option value="shop_owner">Propriétaire</option>
                        {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Boutique
                    </label>
                    <select
                      value={userForm.shopId}
                      onChange={(e) => {
                        const shop = shops.find(s => s.id === e.target.value);
                        setUserForm({
                          ...userForm, 
                          shopId: e.target.value,
                          shopName: shop?.name || ''
                        });
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    >
                      <option value="">Aucune boutique</option>
                      {displayShops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Permissions
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(userForm.permissions).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setUserForm({
                              ...userForm,
                              permissions: {
                                ...userForm.permissions,
                                [key]: e.target.checked
                              }
                            })}
                            className="text-gold-500 focus:ring-gold-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            {key === 'manageProducts' && 'Gérer les produits'}
                            {key === 'manageOrders' && 'Gérer les commandes'}
                            {key === 'manageCash' && 'Gérer la caisse'}
                            {key === 'manageClients' && 'Gérer les clients'}
                            {key === 'viewReports' && 'Voir les rapports'}
                            {key === 'manageSettings' && 'Gérer les paramètres'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        resetUserForm();
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      {editingItem ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleShopSubmit} className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la boutique *
                      </label>
                      <input
                        type="text"
                        value={shopForm.name}
                        onChange={(e) => setShopForm({...shopForm, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de contact *
                      </label>
                      <input
                        type="email"
                        value={shopForm.settings.email}
                        onChange={(e) => setShopForm({
                          ...shopForm,
                          settings: {...shopForm.settings, email: e.target.value}
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={shopForm.description}
                      onChange={(e) => setShopForm({...shopForm, description: e.target.value})}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={shopForm.settings.phone}
                        onChange={(e) => setShopForm({
                          ...shopForm,
                          settings: {...shopForm.settings, phone: e.target.value}
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langue par défaut
                      </label>
                      <select
                        value={shopForm.settings.language}
                        onChange={(e) => setShopForm({
                          ...shopForm,
                          settings: {...shopForm.settings, language: e.target.value as 'fr' | 'ar'}
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      >
                        <option value="fr">Français</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={shopForm.settings.address}
                      onChange={(e) => setShopForm({
                        ...shopForm,
                        settings: {...shopForm.settings, address: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        resetShopForm();
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-3 px-4 rounded-lg transition-colors"
                    >
                      Créer la boutique
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

export default AdminUsers;