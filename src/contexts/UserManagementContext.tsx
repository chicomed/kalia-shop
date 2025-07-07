import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface ShopUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'shop_owner' | 'shop_manager';
  status: 'active' | 'inactive' | 'pending';
  shopId?: string;
  shopName?: string;
  permissions: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageCash: boolean;
    manageClients: boolean;
    viewReports: boolean;
    manageSettings: boolean;
  };
  createdAt: any;
  updatedAt: any;
  lastLogin?: any;
  createdBy: string;
  avatar?: string;
  phone?: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  logo?: string;
  heroImages: string[];
  ownerId: string;
  ownerEmail: string;
  settings: {
    currency: string;
    language: 'fr' | 'ar';
    timezone: string;
    address: string;
    phone: string;
    email: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: any;
  updatedAt: any;
}

interface UserManagementContextType {
  users: ShopUser[];
  shops: Shop[];
  currentShop: Shop | null;
  loading: boolean;
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  
  // User management
  addUser: (userData: Omit<ShopUser, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateUser: (id: string, updates: Partial<ShopUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  
  // Shop management
  createShop: (shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateShop: (id: string, updates: Partial<Shop>) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;
  switchShop: (shopId: string) => Promise<void>;
  
  // Utilities
  getUsersByShop: (shopId: string) => ShopUser[];
  getShopsByOwner: (ownerId: string) => Shop[];
  hasPermission: (permission: keyof ShopUser['permissions']) => boolean;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};

// Super admin email - only this email can manage all users and shops
const SUPER_ADMIN_EMAIL = 'chaloueimin@gmail.com';

export const UserManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState<ShopUser[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
  const canManageUsers = isSuperAdmin || userProfile?.role === 'admin';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load users
        let usersQuery;
        if (isSuperAdmin) {
          // Super admin can see all users
          usersQuery = query(collection(db, 'shopUsers'), orderBy('createdAt', 'desc'));
        } else {
          // Regular users can only see users in their shop
          const userShopId = localStorage.getItem('currentShopId');
          if (userShopId) {
            usersQuery = query(
              collection(db, 'shopUsers'), 
              where('shopId', '==', userShopId),
              orderBy('createdAt', 'desc')
            );
          }
        }

        if (usersQuery) {
          const usersSnapshot = await getDocs(usersQuery);
          const usersData = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ShopUser[];
          setUsers(usersData);
        }

        // Load shops
        let shopsQuery;
        if (isSuperAdmin) {
          // Super admin can see all shops
          shopsQuery = query(collection(db, 'shops'), orderBy('createdAt', 'desc'));
        } else {
          // Regular users can only see their own shops
          shopsQuery = query(
            collection(db, 'shops'), 
            where('ownerId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
        }

        const shopsSnapshot = await getDocs(shopsQuery);
        const shopsData = shopsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Shop[];
        setShops(shopsData);

        // Set current shop
        const currentShopId = localStorage.getItem('currentShopId');
        if (currentShopId) {
          const shop = shopsData.find(s => s.id === currentShopId);
          if (shop) {
            setCurrentShop(shop);
          }
        } else if (shopsData.length > 0) {
          // Set first shop as current if none selected
          setCurrentShop(shopsData[0]);
          localStorage.setItem('currentShopId', shopsData[0].id);
        }

      } catch (error) {
        console.error('Error loading user management data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isSuperAdmin]);

  const addUser = async (userData: Omit<ShopUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!canManageUsers) {
      throw new Error('Insufficient permissions to add users');
    }

    try {
      const docRef = await addDoc(collection(db, 'shopUsers'), {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user?.uid || ''
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<ShopUser>) => {
    if (!canManageUsers) {
      throw new Error('Insufficient permissions to update users');
    }

    try {
      await updateDoc(doc(db, 'shopUsers', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    if (!isSuperAdmin) {
      throw new Error('Only super admin can delete users');
    }

    try {
      await deleteDoc(doc(db, 'shopUsers', id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const activateUser = async (id: string) => {
    await updateUser(id, { status: 'active' });
  };

  const deactivateUser = async (id: string) => {
    await updateUser(id, { status: 'inactive' });
  };

  const createShop = async (shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'shops'), {
        ...shopData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating shop:', error);
      throw error;
    }
  };

  const updateShop = async (id: string, updates: Partial<Shop>) => {
    try {
      await updateDoc(doc(db, 'shops', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating shop:', error);
      throw error;
    }
  };

  const deleteShop = async (id: string) => {
    if (!isSuperAdmin) {
      throw new Error('Only super admin can delete shops');
    }

    try {
      await deleteDoc(doc(db, 'shops', id));
    } catch (error) {
      console.error('Error deleting shop:', error);
      throw error;
    }
  };

  const switchShop = async (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      setCurrentShop(shop);
      localStorage.setItem('currentShopId', shopId);
    }
  };

  const getUsersByShop = (shopId: string): ShopUser[] => {
    return users.filter(user => user.shopId === shopId);
  };

  const getShopsByOwner = (ownerId: string): Shop[] => {
    return shops.filter(shop => shop.ownerId === ownerId);
  };

  const hasPermission = (permission: keyof ShopUser['permissions']): boolean => {
    if (isSuperAdmin) return true;
    
    const currentUser = users.find(u => u.email === user?.email);
    return currentUser?.permissions[permission] || false;
  };

  const value = {
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
    updateShop,
    deleteShop,
    switchShop,
    getUsersByShop,
    getShopsByOwner,
    hasPermission
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};