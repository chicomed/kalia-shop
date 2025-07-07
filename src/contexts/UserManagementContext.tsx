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

export interface User {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
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

interface UserManagementContextType {
  users: User[];
  loading: boolean;
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  
  // User management
  addUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  
  // Utilities
  hasPermission: (permission: keyof User['permissions']) => boolean;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};

// Super admin email - only this email can manage all users
const SUPER_ADMIN_EMAIL = 'chaloueimin@gmail.com';

export const UserManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
  const canManageUsers = isSuperAdmin;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Only super admin can see all users
        if (isSuperAdmin) {
          const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
          const usersSnapshot = await getDocs(usersQuery);
          const usersData = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as User[];
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error loading user management data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isSuperAdmin]);

  const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!canManageUsers) {
      throw new Error('Insufficient permissions to add users');
    }

    try {
      const docRef = await addDoc(collection(db, 'users'), {
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

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (!canManageUsers) {
      throw new Error('Insufficient permissions to update users');
    }

    try {
      await updateDoc(doc(db, 'users', id), {
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
      await deleteDoc(doc(db, 'users', id));
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

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    if (isSuperAdmin) return true;
    
    const currentUser = users.find(u => u.email === user?.email);
    return currentUser?.permissions[permission] || false;
  };

  const value = {
    users,
    loading,
    isSuperAdmin,
    canManageUsers,
    addUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    hasPermission
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};