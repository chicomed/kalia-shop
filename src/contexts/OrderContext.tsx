import React, { createContext, useContext, useState, useEffect } from 'react';
import { orderOperations, createListener } from '../firebase/collections';
import { useClients } from './ClientContext';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  clientId?: string; // Reference to client
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'sent' | 'delivered' | 'cancelled';
  address: {
    full: string;
    city: string;
    wilaya: string;
    coordinates?: { lat: number; lng: number };
  };
  paymentMethod: 'upload' | 'delivery' | 'bank_transfer';
  paymentScreenshot?: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
  estimatedDelivery?: any;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
  getOrdersByCustomer: (phone: string) => Order[];
  getTodayOrders: () => Order[];
  getWeekOrders: () => Order[];
  getMonthOrders: () => Order[];
  getTotalRevenue: (period: 'today' | 'week' | 'month') => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const clientsContext = useClients();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersSnapshot = await orderOperations.getAll();
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Set up real-time listener
    const unsubscribe = createListener('orders', setOrders);
    return unsubscribe;
  }, []);

  const generateOrderId = (): string => {
    const prefix = 'VB';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);

      const newOrderData = {
        ...orderData,
        estimatedDelivery
      };

      const docRef = await orderOperations.add(newOrderData);
      
      // Note: Client statistics are now updated in the Cart component after order creation
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      await orderOperations.update(id, { status });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      await orderOperations.update(id, updates);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await orderOperations.delete(id);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  const getOrdersByStatus = (status: Order['status']): Order[] => {
    return orders.filter(order => order.status === status);
  };

  const getOrdersByCustomer = (phone: string): Order[] => {
    return orders.filter(order => order.customer.phone === phone);
  };

  const getTodayOrders = (): Order[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      return orderDate >= today;
    });
  };

  const getWeekOrders = (): Order[] => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orders.filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      return orderDate >= weekAgo;
    });
  };

  const getMonthOrders = (): Order[] => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return orders.filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      return orderDate >= monthAgo;
    });
  };

  const getTotalRevenue = (period: 'today' | 'week' | 'month'): number => {
    let relevantOrders: Order[] = [];
    
    switch (period) {
      case 'today':
        relevantOrders = getTodayOrders();
        break;
      case 'week':
        relevantOrders = getWeekOrders();
        break;
      case 'month':
        relevantOrders = getMonthOrders();
        break;
    }
    
    return relevantOrders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => total + order.total, 0);
  };

  const value = {
    orders,
    loading,
    addOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    getOrderById,
    getOrdersByStatus,
    getOrdersByCustomer,
    getTodayOrders,
    getWeekOrders,
    getMonthOrders,
    getTotalRevenue
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};