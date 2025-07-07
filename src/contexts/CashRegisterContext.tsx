import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  cashRegisterOperations, 
  transactionOperations,
  createListener 
} from '../firebase/collections';
import { doc, setDoc, getDocs, query, collection, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface CashTransaction {
  id: string;
  type: 'sale' | 'refund' | 'expense' | 'opening' | 'closing';
  amount: number;
  paymentMethod: 'sadad' | 'bankily' | 'masrivi' | 'bimbanque' | 'click' | 'cash' | 'other';
  orderId?: string;
  description: string;
  timestamp: Timestamp;
  userId: string;
  date: string;
}

export interface DailyCash {
  date: string;
  openingBalance: number;
  closingBalance: number;
  totalSales: number;
  totalRefunds: number;
  totalExpenses: number;
  transactions: CashTransaction[];
  paymentMethods: {
    sadad: number;
    bankily: number;
    masrivi: number;
    bimbanque: number;
    click: number;
    cash: number;
    other: number;
  };
  isOpen: boolean;
  openedBy?: string;
  closedBy?: string;
  openedAt?: any;
  closedAt?: any;
  updatedAt?: any;
}

interface CashRegisterContextType {
  currentCash: DailyCash;
  cashHistory: DailyCash[];
  loading: boolean;
  addTransaction: (transaction: Omit<CashTransaction, 'id' | 'timestamp' | 'date'>) => Promise<void>;
  openRegister: (openingBalance: number, userId: string) => Promise<void>;
  closeRegister: (userId: string) => Promise<void>;
  resetDailyRegister: () => Promise<void>;
  getCashByDate: (date: string) => DailyCash | undefined;
  getWeeklyCash: () => DailyCash[];
  getMonthlyCash: () => DailyCash[];
  exportCashReport: (startDate: Date, endDate: Date) => DailyCash[];
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

export const useCashRegister = () => {
  const context = useContext(CashRegisterContext);
  if (context === undefined) {
    throw new Error('useCashRegister must be used within a CashRegisterProvider');
  }
  return context;
};

export const CashRegisterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [currentCash, setCurrentCash] = useState<DailyCash>({
    date: today,
    openingBalance: 0,
    closingBalance: 0,
    totalSales: 0,
    totalRefunds: 0,
    totalExpenses: 0,
    transactions: [],
    paymentMethods: {
      sadad: 0,
      bankily: 0,
      masrivi: 0,
      bimbanque: 0,
      click: 0,
      cash: 0,
      other: 0
    },
    isOpen: false
  });

  const [cashHistory, setCashHistory] = useState<DailyCash[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCashData = async () => {
      try {
        // Load today's cash register
        const todayDoc = await cashRegisterOperations.getToday();
        if (todayDoc.exists()) {
          const todayData = { id: todayDoc.id, ...todayDoc.data() } as DailyCash;
          
          // Load today's transactions
          const transactionsSnapshot = await getDocs(
            query(
              collection(db, 'transactions'),
              where('date', '==', today)
            )
          );
          const transactions = transactionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CashTransaction[];
          
          setCurrentCash({
            ...todayData,
            transactions
          });
        } else {
          // Create today's cash register if it doesn't exist
          const initialCash: DailyCash = {
            date: today,
            openingBalance: 0,
            closingBalance: 0,
            totalSales: 0,
            totalRefunds: 0,
            totalExpenses: 0,
            transactions: [],
            paymentMethods: {
              sadad: 0,
              bankily: 0,
              masrivi: 0,
              bimbanque: 0,
              click: 0,
              cash: 0,
              other: 0
            },
            isOpen: false
          };
          
          await setDoc(doc(db, 'cashRegister', today), initialCash);
          setCurrentCash(initialCash);
        }

        // Load cash history
        const historySnapshot = await cashRegisterOperations.getHistory();
        const historyData = historySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(cash => cash.date !== today) as DailyCash[];
        setCashHistory(historyData);
      } catch (error) {
        console.error('Error loading cash data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCashData();
  }, [today]);

  const addTransaction = async (transactionData: Omit<CashTransaction, 'id' | 'timestamp' | 'date'>) => {
    try {
      const transaction = {
        ...transactionData,
        date: today,
        timestamp: Timestamp.now()
      };

      await transactionOperations.add(transaction);

      // Update current cash register
      const newPaymentMethods = { ...currentCash.paymentMethods };
      
      if (transaction.type === 'sale') {
        newPaymentMethods[transaction.paymentMethod] += transaction.amount;
      } else if (transaction.type === 'refund') {
        newPaymentMethods[transaction.paymentMethod] -= transaction.amount;
      }

      const newTransactions = [...currentCash.transactions, { ...transaction, id: `temp-${Date.now()}` } as CashTransaction];
      
      const totalSales = newTransactions
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalRefunds = newTransactions
        .filter(t => t.type === 'refund')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = newTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const updatedCash = {
        ...currentCash,
        transactions: newTransactions,
        paymentMethods: newPaymentMethods,
        totalSales,
        totalRefunds,
        totalExpenses,
        closingBalance: currentCash.openingBalance + totalSales - totalRefunds - totalExpenses
      };

      await cashRegisterOperations.update(today, updatedCash);
      setCurrentCash(updatedCash);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const openRegister = async (openingBalance: number, userId: string) => {
    try {
      const updatedCash = {
        ...currentCash,
        openingBalance,
        closingBalance: openingBalance,
        isOpen: true,
        openedBy: userId,
        openedAt: new Date()
      };

      await cashRegisterOperations.update(today, updatedCash);
      setCurrentCash(updatedCash);
    } catch (error) {
      console.error('Error opening register:', error);
      throw error;
    }
  };

  const closeRegister = async (userId: string) => {
    try {
      const closedCash = {
        ...currentCash,
        isOpen: false,
        closedBy: userId,
        closedAt: new Date()
      };
      
      await cashRegisterOperations.update(today, closedCash);
      setCurrentCash(closedCash);
      
      // Add to history
      setCashHistory(prev => [closedCash, ...prev]);
    } catch (error) {
      console.error('Error closing register:', error);
      throw error;
    }
  };

  const resetDailyRegister = async () => {
    try {
      // Save current to history if not already closed
      if (currentCash.isOpen) {
        const closedCash = { ...currentCash, isOpen: false, closedAt: new Date() };
        setCashHistory(prev => [closedCash, ...prev]);
      }
      
      // Reset for new day
      const resetCash: DailyCash = {
        date: today,
        openingBalance: 0,
        closingBalance: 0,
        totalSales: 0,
        totalRefunds: 0,
        totalExpenses: 0,
        transactions: [],
        paymentMethods: {
          sadad: 0,
          bankily: 0,
          masrivi: 0,
          bimbanque: 0,
          click: 0,
          cash: 0,
          other: 0
        },
        isOpen: false
      };

      await setDoc(doc(db, 'cashRegister', today), resetCash);
      setCurrentCash(resetCash);
    } catch (error) {
      console.error('Error resetting register:', error);
      throw error;
    }
  };

  const getCashByDate = (date: string): DailyCash | undefined => {
    if (currentCash.date === date) return currentCash;
    return cashHistory.find(cash => cash.date === date);
  };

  const getWeeklyCash = (): DailyCash[] => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return cashHistory.filter(cash => new Date(cash.date) >= weekAgo);
  };

  const getMonthlyCash = (): DailyCash[] => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    return cashHistory.filter(cash => new Date(cash.date) >= monthAgo);
  };

  const exportCashReport = (startDate: Date, endDate: Date): DailyCash[] => {
    return cashHistory.filter(cash => {
      const cashDate = new Date(cash.date);
      return cashDate >= startDate && cashDate <= endDate;
    });
  };

  const value = {
    currentCash,
    cashHistory,
    loading,
    addTransaction,
    openRegister,
    closeRegister,
    resetDailyRegister,
    getCashByDate,
    getWeeklyCash,
    getMonthlyCash,
    exportCashReport
  };

  return (
    <CashRegisterContext.Provider value={value}>
      {children}
    </CashRegisterContext.Provider>
  );
};