import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown, ShoppingBag, Menu, X, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const { user, signOut, isAdmin } = useAuth();
  const { t, isRTL } = useLanguage();
  const { getTotalItems } = useCart();
  const { getBusinessSettings } = useSettings();

  const businessSettings = getBusinessSettings();

  const handleSignOut = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  const shopLogo = businessSettings?.logo || '';
  const shopName = businessSettings?.storeName || t('home.title');
  
  return (
    <header className={`bg-elegant-black text-white shadow-lg relative z-50 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            {shopLogo ? (
              <img 
                src={shopLogo} 
                alt={shopName}
                className="h-8 w-8 object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <Crown className="h-8 w-8 text-gold-500 group-hover:text-gold-400 transition-colors" />
            )}
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h1 className="font-elegant text-xl font-semibold">{shopName}</h1>
              <p className="text-xs text-gold-500 -mt-1">{t('home.subtitle')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!isAdminRoute ? (
              <>
                <Link to="/" className="hover:text-gold-500 transition-colors font-modern">
                  {t('nav.home')}
                </Link>
                <Link to="/collections" className="hover:text-gold-500 transition-colors font-modern">
                  {t('nav.collections')}
                </Link>
                <Link to="/about" className="hover:text-gold-500 transition-colors font-modern">
                  {t('nav.about')}
                </Link>
                <Link to="/contact" className="hover:text-gold-500 transition-colors font-modern">
                  {t('nav.contact')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin" className="hover:text-gold-500 transition-colors font-modern">
                  {t('nav.dashboard')}
                </Link>
                <Link to="/admin/orders" className="hover:text-gold-500 transition-colors font-modern">
                  {t('nav.orders')}
                </Link>
                <Link to="/admin/products" className="hover:text-gold-500 transition-colors font-modern">
                  {t('nav.products')}
                </Link>
                <Link to="/admin/cash-register" className="hover:text-gold-500 transition-colors font-modern">
                  {t('nav.cashRegister')}
                </Link>
              </>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {!isAdminRoute && (
              <Link to="/cart" className="relative group">
                <ShoppingBag className="h-6 w-6 hover:text-gold-500 transition-colors" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold-500 text-elegant-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            )}

            {/* Admin Access */}
            {isAdmin && (
              <div className="flex items-center space-x-3">
                {!isAdminRoute && (
                  <Link 
                    to="/admin" 
                    className="hidden md:flex items-center space-x-1 hover:text-gold-500 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-modern text-sm">Admin</span>
                  </Link>
                )}
                
                {isAdminRoute && (
                  <Link 
                    to="/" 
                    className="hidden md:flex items-center space-x-1 hover:text-gold-500 transition-colors"
                  >
                    <Crown className="h-5 w-5" />
                    <span className="font-modern text-sm">Boutique</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'Admin'} 
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gold-500" />
                  )}
                  <span className="text-sm">{user?.displayName || user?.email}</span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 hover:text-gold-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-modern text-sm">Déconnexion</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:text-gold-500 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-elegant-black border-t border-gold-500/20 shadow-lg">
            <nav className="flex flex-col space-y-4 p-4">
              {!isAdminRoute ? (
                <>
                  <Link to="/" className="hover:text-gold-500 transition-colors font-modern">
                    {t('nav.home')}
                  </Link>
                  <Link to="/collections" className="hover:text-gold-500 transition-colors font-modern">
                    {t('nav.collections')}
                  </Link>
                  <Link to="/about" className="hover:text-gold-500 transition-colors font-modern">
                    {t('nav.about')}
                  </Link>
                  <Link to="/contact" className="hover:text-gold-500 transition-colors font-modern">
                    {t('nav.contact')}
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/admin" className="hover:text-gold-500 transition-colors font-modern border-t border-gold-500/20 pt-4">
                        Admin
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="text-left hover:text-gold-500 transition-colors font-modern"
                      >
                        Déconnexion
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/admin" className="hover:text-gold-500 transition-colors font-modern">
                    {t('nav.dashboard')}
                  </Link>
                  <Link to="/admin/orders" className="hover:text-gold-500 transition-colors font-modern">
                    {t('nav.orders')}
                  </Link>
                  <Link to="/admin/products" className="hover:text-gold-500 transition-colors font-modern">
                    {t('nav.products')}
                  </Link>
                  <Link to="/admin/cash-register" className="hover:text-gold-500 transition-colors font-modern">
                    {t('nav.cashRegister')}
                  </Link>
                  <Link to="/" className="hover:text-gold-500 transition-colors font-modern border-t border-gold-500/20 pt-4">
                    Boutique
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-left hover:text-gold-500 transition-colors font-modern"
                  >
                    Déconnexion
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;