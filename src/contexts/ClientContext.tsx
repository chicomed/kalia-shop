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

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: {
    full: string;
    city: string;
    wilaya: string;
    coordinates?: { lat: number; lng: number };
  };
  registeredDate: any;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: any;
  status: 'active' | 'vip' | 'inactive';
  avatar?: string;
  notes?: string;
  preferences?: {
    language: 'fr' | 'ar';
    notifications: boolean;
    newsletter: boolean;
  };
  createdAt: any;
  updatedAt: any;
}

interface ClientContextType {
  clients: Client[];
  loading: boolean;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getClientByPhone: (phone: string) => Client | undefined;
  getClientsByStatus: (status: Client['status']) => Client[];
  getVIPClients: () => Client[];
  getActiveClients: () => Client[];
  searchClients: (searchTerm: string) => Client[];
  updateClientStats: (phone: string, orderTotal: number) => Promise<void>;
  promoteToVIP: (id: string) => Promise<void>;
  exportClients: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listener for clients
    const unsubscribe = onSnapshot(
      query(collection(db, 'clients'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const clientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Client[];
        setClients(clientsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading clients:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...clientData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      await updateDoc(doc(db, 'clients', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  const getClientByPhone = (phone: string): Client | undefined => {
    return clients.find(client => client.phone === phone);
  };

  const getClientsByStatus = (status: Client['status']): Client[] => {
    return clients.filter(client => client.status === status);
  };

  const getVIPClients = (): Client[] => {
    return clients.filter(client => client.status === 'vip');
  };

  const getActiveClients = (): Client[] => {
    return clients.filter(client => client.status === 'active' || client.status === 'vip');
  };

  const searchClients = (searchTerm: string): Client[] => {
    const term = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.phone.includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.address.city.toLowerCase().includes(term)
    );
  };

  const updateClientStats = async (phone: string, orderTotal: number) => {
    try {
      const client = getClientByPhone(phone);
      if (client) {
        const newTotalOrders = client.totalOrders + 1;
        const newTotalSpent = client.totalSpent + orderTotal;
        
        // Auto-promote to VIP if spent > 10000 MRU
        const newStatus = newTotalSpent >= 10000 && client.status !== 'vip' ? 'vip' : client.status;
        
        await updateClient(client.id, {
          totalOrders: newTotalOrders,
          totalSpent: newTotalSpent,
          lastOrderDate: Timestamp.now(),
          status: newStatus
        });
        
        // Show VIP promotion notification if applicable
        if (newStatus === 'vip' && client.status !== 'vip') {
          console.log(`🎉 Client ${client.name} promoted to VIP status!`);
        }
      }
    } catch (error) {
      console.error('Error updating client stats:', error);
      throw error;
    }
  };

  const promoteToVIP = async (id: string) => {
    try {
      await updateClient(id, { status: 'vip' });
    } catch (error) {
      console.error('Error promoting client to VIP:', error);
      throw error;
    }
  };

  const exportClients = () => {
    const csvContent = [
      ['Nom', 'Téléphone', 'Email', 'Ville', 'Statut', 'Commandes', 'Total dépensé', 'Date inscription'].join(','),
      ...clients.map(client => [
        client.name,
        client.phone,
        client.email || '',
        client.address.city,
        client.status,
        client.totalOrders.toString(),
        client.totalSpent.toString(),
        client.registeredDate?.toDate ? client.registeredDate.toDate().toLocaleDateString('fr-FR') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clients-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    getClientByPhone,
    getClientsByStatus,
    getVIPClients,
    getActiveClients,
    searchClients,
    updateClientStats,
    promoteToVIP,
    exportClients
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};