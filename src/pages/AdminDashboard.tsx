import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Calendar,
  ArrowUp,
  Eye
} from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';
import { useOrders } from '../contexts/OrderContext';
import { useCashRegister } from '../contexts/CashRegisterContext';

const AdminDashboard: React.FC = () => {
  const { getTodayOrders, getWeekOrders, getMonthOrders, getTotalRevenue, orders } = useOrders();
  const { currentCash } = useCashRegister();

  const todayOrders = getTodayOrders();
  const weekOrders = getWeekOrders();
  const monthOrders = getMonthOrders();
  
  const stats = {
    orders: {
      today: todayOrders.length,
      thisWeek: weekOrders.length,
      thisMonth: monthOrders.length,
      growth: 16.4 // This could be calculated from historical data
    },
    revenue: {
      thisMonth: getTotalRevenue('month'),
      growth: 27.3 // This could be calculated from historical data
    },
    dailyCash: {
      ...currentCash.paymentMethods,
      total: Object.values(currentCash.paymentMethods).reduce((sum, amount) => sum + amount, 0)
    }
  };

  const recentOrders = orders.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'sent': return 'Envoyé';
      case 'delivered': return 'Livré';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-elegant text-4xl font-bold text-elegant-black">
              Tableau de Bord
            </h1>
            <p className="text-gray-600 mt-2">
              Aperçu de votre boutique aujourd'hui
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Dernière mise à jour</p>
            <p className="font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Orders Today */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Commandes Aujourd'hui</p>
                <p className="text-3xl font-bold text-elegant-black">{stats.orders.today}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Orders This Week */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Cette Semaine</p>
                <p className="text-3xl font-bold text-elegant-black">{stats.orders.thisWeek}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Chiffre d'Affaires</p>
                <PriceDisplay 
                  amount={stats.revenue.thisMonth} 
                  className="text-3xl font-bold text-elegant-black"
                />
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">
                    +{stats.revenue.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-gold-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </div>

          {/* Daily Cash Total */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Caisse du Jour</p>
                <PriceDisplay 
                  amount={stats.dailyCash.total} 
                  className="text-3xl font-bold text-elegant-black"
                />
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Daily Cash Breakdown */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-6">
              Caisse par Méthode
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sadad</span>
                <PriceDisplay amount={stats.dailyCash.sadad} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bankily</span>
                <PriceDisplay amount={stats.dailyCash.bankily} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Masrivi</span>
                <PriceDisplay amount={stats.dailyCash.masrivi} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bimbanque</span>
                <PriceDisplay amount={stats.dailyCash.bimbanque} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Click</span>
                <PriceDisplay amount={stats.dailyCash.click} />
              </div>
              <hr className="my-4" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <PriceDisplay amount={stats.dailyCash.total} className="text-gold-600" />
              </div>
            </div>
            <Link
              to="/admin/cash-register"
              className="w-full mt-6 bg-elegant-black text-white py-3 px-4 rounded-lg hover:bg-gold-600 transition-colors text-center block"
            >
              Gérer la Caisse
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-elegant text-2xl font-semibold text-elegant-black">
                Commandes Récentes
              </h2>
              <Link
                to="/admin/orders"
                className="text-gold-600 hover:text-gold-700 font-medium flex items-center"
              >
                <span>Voir tout</span>
                <Eye className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-elegant-black">{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{order.customer?.name || order.customer}</p>
                      <p className="text-sm text-gray-500">
                        {order.items?.map(item => item.name).join(', ') || 'Produits'}
                      </p>
                    </div>
                    <div className="text-right">
                      <PriceDisplay amount={order.total} />
                      <p className="text-sm text-gray-500">
                        {order.createdAt?.toDate ? 
                          order.createdAt.toDate().toLocaleDateString('fr-FR') : 
                          new Date(order.createdAt).toLocaleDateString('fr-FR')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Link
            to="/admin/orders"
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
          >
            <Package className="h-8 w-8 mx-auto text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-elegant-black">Gestion Commandes</h3>
          </Link>
          <Link
            to="/admin/products"
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
          >
            <ShoppingBag className="h-8 w-8 mx-auto text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-elegant-black">Gestion Produits</h3>
          </Link>
          <Link
            to="/admin/cash-register"
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
          >
            <DollarSign className="h-8 w-8 mx-auto text-gold-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-elegant-black">Caisse Journalière</h3>
          </Link>
          <Link
            to="/admin/messages"
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
          >
            <Users className="h-8 w-8 mx-auto text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-elegant-black">Messages Clients</h3>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;