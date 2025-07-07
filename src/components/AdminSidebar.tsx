import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  MessageSquare,
  Settings,
  Crown,
  BarChart3,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserManagement } from '../contexts/UserManagementContext';
import { useSettings } from '../contexts/SettingsContext';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { signOut, userProfile } = useAuth();
  const { t, isRTL } = useLanguage();
  const { isSuperAdmin, canManageUsers, hasPermission } = useUserManagement();
  const { getBusinessSettings } = useSettings();

  const businessSettings = getBusinessSettings();

  const shopLogo = businessSettings?.logo || '';
  const shopName = businessSettings?.storeName || 'Voile Beauté';
  
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
      path: '/admin',
      exact: true
    },
    {
      icon: ShoppingCart,
      label: t('nav.orders'),
      path: '/admin/orders'
    },
    {
      icon: Package,
      label: t('nav.products'),
      path: '/admin/products'
    },
    {
      icon: DollarSign,
      label: t('nav.cashRegister'),
      path: '/admin/cash-register'
    },
    {
      icon: Users,
      label: hasPermission('manageClients') ? 'Clients' : null,
      path: '/admin/clients'
    },
    ...(canManageUsers ? [{
      icon: Shield,
      label: 'Utilisateurs',
      path: '/admin/users'
    }] : []),
    {
      icon: MessageSquare,
      label: 'Messages',
      path: '/admin/messages'
    },
    {
      icon: BarChart3,
      label: hasPermission('viewReports') ? 'Rapports' : null,
      path: '/admin/reports'
    },
    {
      icon: Settings,
      label: hasPermission('manageSettings') ? 'Paramètres' : null,
      path: '/admin/settings'
    }
  ].filter(item => item.label !== null);

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`bg-elegant-black text-white w-64 min-h-screen flex flex-col ${isRTL ? 'font-arabic' : ''}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link to="/admin" className="flex items-center space-x-3">
          {shopLogo ? (
            <img 
              src={shopLogo} 
              alt={shopName}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <Crown className="h-8 w-8 text-gold-500" />
          )}
          <div>
            <h1 className="font-elegant text-xl font-semibold">Admin Panel</h1>
            <p className="text-xs text-gold-500">{shopName}</p>
          </div>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
            <span className="text-elegant-black font-bold">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'A'}
            </span>
          </div>
          <div>
            <p className="font-medium">{userProfile?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">
              {isSuperAdmin ? 'Super Admin' : 'Administrator'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              {item.label && (
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path, item.exact)
                    ? 'bg-gold-500 text-elegant-black'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
        >
          <Crown className="h-5 w-5" />
          <span>{t('nav.boutique')}</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;