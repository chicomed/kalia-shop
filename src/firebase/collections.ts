// Firebase collection references and helper functions
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
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Collection names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subCategories',
  ORDERS: 'orders',
  USERS: 'users',
  CASH_REGISTER: 'cashRegister',
  TRANSACTIONS: 'transactions',
  MESSAGES: 'messages',
  SETTINGS: 'settings'
};

// Product operations
export const productOperations = {
  getAll: () => getDocs(collection(db, COLLECTIONS.PRODUCTS)),
  getById: (id: string) => getDoc(doc(db, COLLECTIONS.PRODUCTS, id)),
  add: (data: any) => addDoc(collection(db, COLLECTIONS.PRODUCTS), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  update: (id: string, data: any) => updateDoc(doc(db, COLLECTIONS.PRODUCTS, id), {
    ...data,
    updatedAt: Timestamp.now()
  }),
  delete: (id: string) => deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id)),
  getByCategory: (category: string) => getDocs(
    query(collection(db, COLLECTIONS.PRODUCTS), where('category', '==', category))
  ),
  getFeatured: () => getDocs(
    query(collection(db, COLLECTIONS.PRODUCTS), where('featured', '==', true))
  )
};

// Category operations
export const categoryOperations = {
  getAll: () => getDocs(collection(db, COLLECTIONS.CATEGORIES)),
  add: (data: any) => addDoc(collection(db, COLLECTIONS.CATEGORIES), {
    ...data,
    createdAt: Timestamp.now()
  }),
  update: (id: string, data: any) => updateDoc(doc(db, COLLECTIONS.CATEGORIES, id), data),
  delete: (id: string) => deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id))
};

// SubCategory operations
export const subCategoryOperations = {
  getAll: () => getDocs(collection(db, COLLECTIONS.SUBCATEGORIES)),
  getById: (id: string) => getDoc(doc(db, COLLECTIONS.SUBCATEGORIES, id)),
  add: (data: any) => addDoc(collection(db, COLLECTIONS.SUBCATEGORIES), {
    ...data,
    createdAt: Timestamp.now()
  }),
  update: (id: string, data: any) => updateDoc(doc(db, COLLECTIONS.SUBCATEGORIES, id), data),
  delete: (id: string) => deleteDoc(doc(db, COLLECTIONS.SUBCATEGORIES, id)),
  getByCategory: (categoryId: string) => getDocs(
    query(collection(db, COLLECTIONS.SUBCATEGORIES), where('categoryId', '==', categoryId))
  )
};

// Order operations
export const orderOperations = {
  getAll: () => getDocs(
    query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'))
  ),
  getById: (id: string) => getDoc(doc(db, COLLECTIONS.ORDERS, id)),
  add: (data: any) => addDoc(collection(db, COLLECTIONS.ORDERS), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  update: (id: string, data: any) => updateDoc(doc(db, COLLECTIONS.ORDERS, id), {
    ...data,
    updatedAt: Timestamp.now()
  }),
  delete: (id: string) => deleteDoc(doc(db, COLLECTIONS.ORDERS, id)),
  getByStatus: (status: string) => getDocs(
    query(collection(db, COLLECTIONS.ORDERS), where('status', '==', status))
  ),
  getByCustomer: (phone: string) => getDocs(
    query(collection(db, COLLECTIONS.ORDERS), where('customer.phone', '==', phone))
  ),
  getToday: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return getDocs(
      query(
        collection(db, COLLECTIONS.ORDERS), 
        where('createdAt', '>=', Timestamp.fromDate(today))
      )
    );
  }
};

// Cash register operations
export const cashRegisterOperations = {
  getToday: () => {
    const today = new Date().toISOString().split('T')[0];
    return getDoc(doc(db, COLLECTIONS.CASH_REGISTER, today));
  },
  create: (date: string, data: any) => doc(db, COLLECTIONS.CASH_REGISTER, date),
  update: (date: string, data: any) => updateDoc(doc(db, COLLECTIONS.CASH_REGISTER, date), {
    ...data,
    updatedAt: Timestamp.now()
  }),
  getHistory: () => getDocs(
    query(collection(db, COLLECTIONS.CASH_REGISTER), orderBy('date', 'desc'), limit(30))
  )
};

// Transaction operations
export const transactionOperations = {
  add: (data: any) => addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
    ...data,
    timestamp: Timestamp.now()
  }),
  getByDate: (date: string) => getDocs(
    query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('date', '==', date)
    )
  )
};

// Message operations
export const messageOperations = {
  getAll: () => getDocs(
    query(collection(db, COLLECTIONS.MESSAGES), orderBy('createdAt', 'desc'))
  ),
  add: (data: any) => addDoc(collection(db, COLLECTIONS.MESSAGES), {
    ...data,
    createdAt: Timestamp.now()
  }),
  markAsRead: (id: string) => updateDoc(doc(db, COLLECTIONS.MESSAGES, id), {
    read: true,
    readAt: Timestamp.now()
  })
};

// Real-time listeners
export const createListener = (collectionName: string, callback: (data: any[]) => void) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

// Batch operations
export const batchOperations = {
  create: () => writeBatch(db),
  commit: (batch: any) => batch.commit()
};