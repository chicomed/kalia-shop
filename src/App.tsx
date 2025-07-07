import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { OrderProvider } from './contexts/OrderContext';
import { ClientProvider } from './contexts/ClientContext';
import { CashRegisterProvider } from './contexts/CashRegisterContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './components/Header';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Collections from './pages/Collections';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminCashRegister from './pages/AdminCashRegister';
import AdminClients from './pages/AdminClients';
import AdminMessages from './pages/AdminMessages';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProductProvider>
          <ClientProvider>
            <SettingsProvider>
              <OrderProvider>
                <CashRegisterProvider>
                  <CartProvider>
                    <Router>
                      <div className="min-h-screen bg-elegant-light">
                        <ToastContainer />
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/" element={
                            <>
                              <Header />
                              <HomePage />
                            </>
                          } />
                          <Route path="/collections" element={
                            <>
                              <Header />
                              <Collections />
                            </>
                          } />
                          <Route path="/about" element={
                            <>
                              <Header />
                              <About />
                            </>
                          } />
                          <Route path="/contact" element={
                            <>
                              <Header />
                              <Contact />
                            </>
                          } />
                          <Route path="/product/:id" element={
                            <>
                              <Header />
                              <ProductDetail />
                            </>
                          } />
                          <Route path="/cart" element={
                            <>
                              <Header />
                              <Cart />
                            </>
                          } />
                          
                          {/* Admin Login Route */}
                          <Route path="/admin/login" element={<AdminLogin />} />
                          
                          {/* Admin Routes */}
                          <Route 
                            path="/admin" 
                            element={
                              <ProtectedRoute>
                                <AdminLayout>
                                  <AdminDashboard />
                                </AdminLayout>
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/orders" 
                            element={
                              <ProtectedRoute>
                                <AdminLayout>
                                  <AdminOrders />
                                </AdminLayout>
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/products" 
                            element={
                              <ProtectedRoute>
                                <AdminLayout>
                                  <AdminProducts />
                                </AdminLayout>
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/cash-register" 
                            element={
                              <ProtectedRoute>
                                <AdminLayout>
                                  <AdminCashRegister />
                                </AdminLayout>
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/clients" 
                            element={
                              <ProtectedRoute>
                                <AdminLayout>
                                  <AdminClients />
                                </AdminLayout>
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/messages" 
                            element={
                              <ProtectedRoute>
                                <AdminLayout>
                                  <AdminMessages />
                                </AdminLayout>
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/reports" 
                            element={
                              <ProtectedRoute>
                                <AdminLayout>
                                  <AdminReports />
                                </AdminLayout>
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/settings" 
                            element={
                              <ProtectedRoute>
                                <AdminLayout>
                                  <AdminSettings />
                                </AdminLayout>
                              </ProtectedRoute>
                            } 
                          />
                        </Routes>
                      </div>
                    </Router>
                  </CartProvider>
                </CashRegisterProvider>
              </OrderProvider>
            </SettingsProvider>
          </ClientProvider>
        </ProductProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;