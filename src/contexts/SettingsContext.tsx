import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface ShopSettings {
  id: string;
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  notifications: {
    emailOrders: boolean;
    emailMessages: boolean;
    smsOrders: boolean;
    pushNotifications: boolean;
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'fr' | 'ar';
    currency: string;
  };
  business: {
    storeName: string;
    storeDescription: string;
    logo: string;
    heroImages: string[];
    address: string;
    phone: string;
    email: string;
    taxNumber: string;
  };
  paymentMethods: {
    [key: string]: {
      name: string;
      accountNumber: string;
      active: boolean;
    };
  };
  createdAt: any;
  updatedAt: any;
}

interface SettingsContextType {
  settings: ShopSettings | null;
  loading: boolean;
  updateSettings: (section: keyof Omit<ShopSettings, 'id' | 'createdAt' | 'updatedAt'>, data: any) => Promise<void>;
  updatePaymentMethods: (methods: ShopSettings['paymentMethods']) => Promise<void>;
  getBusinessSettings: () => ShopSettings['business'] | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsDocId = 'default';

    // Set up real-time listener for settings
    const unsubscribe = onSnapshot(
      doc(db, 'settings', settingsDocId),
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const settingsData = { id: docSnapshot.id, ...docSnapshot.data() } as ShopSettings;
          setSettings(settingsData);
          
          // Update localStorage for backward compatibility
          updateLocalStorage(settingsData);
        } else {
          // Create default settings if none exist
          const defaultSettings = createDefaultSettings(settingsDocId);
          await setDoc(doc(db, 'settings', settingsDocId), defaultSettings);
          setSettings(defaultSettings);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading settings:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const createDefaultSettings = (settingsId: string): ShopSettings => {
    return {
      id: settingsId,
      profile: {
        name: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        avatar: user?.photoURL || ''
      },
      notifications: {
        emailOrders: true,
        emailMessages: true,
        smsOrders: false,
        pushNotifications: true
      },
      security: {
        twoFactor: false,
        sessionTimeout: 30,
        passwordExpiry: 90
      },
      appearance: {
        theme: 'light',
        language: 'fr',
        currency: 'MRU'
      },
      business: {
        storeName: localStorage.getItem('shopName') || 'Voile Beauté',
        storeDescription: localStorage.getItem('shopDescription') || 'Boutique de voiles traditionnels mauritaniens',
        logo: localStorage.getItem('shopLogo') || '',
        heroImages: JSON.parse(localStorage.getItem('shopHeroImages') || '[]'),
        address: localStorage.getItem('shopAddress') || 'Tevragh Zeina, Nouakchott',
        phone: localStorage.getItem('shopPhone') || '+222 12 34 56 78',
        email: localStorage.getItem('shopEmail') || 'contact@voilebeaute.mr',
        taxNumber: 'MR123456789'
      },
      paymentMethods: {
        sadad: {
          name: 'Sadad',
          accountNumber: '12345678',
          active: true
        },
        bankily: {
          name: 'Bankily',
          accountNumber: '87654321',
          active: true
        },
        masrivi: {
          name: 'Masrivi',
          accountNumber: '11223344',
          active: true
        },
        bimbanque: {
          name: 'Bimbanque',
          accountNumber: '55667788',
          active: true
        },
        click: {
          name: 'Click',
          accountNumber: '99887766',
          active: true
        },
        cash: {
          name: 'Espèces',
          accountNumber: '',
          active: true
        }
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  };

  const updateLocalStorage = (settingsData: ShopSettings) => {
    // Update localStorage for backward compatibility
    localStorage.setItem('shopLogo', settingsData.business.logo);
    localStorage.setItem('shopName', settingsData.business.storeName);
    localStorage.setItem('shopDescription', settingsData.business.storeDescription);
    localStorage.setItem('shopAddress', settingsData.business.address);
    localStorage.setItem('shopPhone', settingsData.business.phone);
    localStorage.setItem('shopEmail', settingsData.business.email);
    localStorage.setItem('shopHeroImages', JSON.stringify(settingsData.business.heroImages));
  };

  const updateSettings = async (section: keyof Omit<ShopSettings, 'id' | 'createdAt' | 'updatedAt'>, data: any) => {
    if (!settings) return;

    try {
      const updatedSettings = {
        ...settings,
        [section]: data,
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, 'settings', settings.id), {
        [section]: data,
        updatedAt: Timestamp.now()
      });

      // Update local state
      setSettings(updatedSettings);

      // Update localStorage for business settings
      if (section === 'business') {
        updateLocalStorage(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const updatePaymentMethods = async (methods: ShopSettings['paymentMethods']) => {
    await updateSettings('paymentMethods', methods);
  };

  const getBusinessSettings = (): ShopSettings['business'] | null => {
    return settings?.business || null;
  };

  const value = {
    settings,
    loading,
    updateSettings,
    updatePaymentMethods,
    getBusinessSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};