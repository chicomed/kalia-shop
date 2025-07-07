import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';
import { useOrders } from '../contexts/OrderContext';
import { useCashRegister } from '../contexts/CashRegisterContext';

const AdminReports: React.FC = () => {
  const { getTotalRevenue, getMonthOrders, orders } = useOrders();
  const { currentCash, getMonthlyCash } = useCashRegister();
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('sales');

  const salesData = {
    thisMonth: {
      revenue: getTotalRevenue('month'),
      orders: getMonthOrders().length,
      customers: new Set(orders.map(o => o.customer.phone)).size,
      products: orders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
      growth: {
        revenue: 27.3,
        orders: 16.4,
        customers: 12.8,
        products: -5.2
      }
    },
    lastMonth: {
      revenue: 9780.00,
      orders: 134,
      customers: 79,
      products: 258
    }
  };

  // Calculate top products from actual orders
  const productSales = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.name]) {
        acc[item.name] = { sales: 0, revenue: 0 };
      }
      acc[item.name].sales += item.quantity;
      acc[item.name].revenue += item.price * item.quantity;
    });
    return acc;
  }, {} as Record<string, { sales: number; revenue: number }>);

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const totalCash = Object.values(currentCash.paymentMethods).reduce((sum, amount) => sum + amount, 0);
  const paymentMethods = [
    { name: 'Sadad', amount: currentCash.paymentMethods.sadad, percentage: totalCash > 0 ? (currentCash.paymentMethods.sadad / totalCash) * 100 : 0, color: 'bg-blue-500' },
    { name: 'Bankily', amount: currentCash.paymentMethods.bankily, percentage: totalCash > 0 ? (currentCash.paymentMethods.bankily / totalCash) * 100 : 0, color: 'bg-green-500' },
    { name: 'Masrivi', amount: currentCash.paymentMethods.masrivi, percentage: totalCash > 0 ? (currentCash.paymentMethods.masrivi / totalCash) * 100 : 0, color: 'bg-purple-500' },
    { name: 'Bimbanque', amount: currentCash.paymentMethods.bimbanque, percentage: totalCash > 0 ? (currentCash.paymentMethods.bimbanque / totalCash) * 100 : 0, color: 'bg-orange-500' },
    { name: 'Click', amount: currentCash.paymentMethods.click, percentage: totalCash > 0 ? (currentCash.paymentMethods.click / totalCash) * 100 : 0, color: 'bg-red-500' }
  ];

  // Generate monthly data from actual orders (simplified for demo)
  const monthlyData = getMonthlyCash().slice(0, 6).map((cash, index) => ({
    month: new Date(cash.date).toLocaleDateString('fr-FR', { month: 'short' }),
    revenue: cash.totalSales,
    orders: cash.transactions.filter(t => t.type === 'sale').length
  }));

  const exportReport = (type: string) => {
    console.log(`Exporting ${type} report for ${dateRange}`);
    // Implementation for report export
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-elegant text-4xl font-bold text-elegant-black">
            Rapports & Analyses
          </h1>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
            >
              <option value="today">Aujourd'hui</option>
              <option value="thisWeek">Cette semaine</option>
              <option value="thisMonth">Ce mois</option>
              <option value="lastMonth">Mois dernier</option>
              <option value="thisYear">Cette année</option>
            </select>
            <button
              onClick={() => exportReport('complete')}
              className="bg-elegant-black hover:bg-gold-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Chiffre d'Affaires</p>
                <PriceDisplay 
                  amount={salesData.thisMonth.revenue} 
                  className="text-3xl font-bold text-elegant-black"
                />
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">
                    +{salesData.thisMonth.growth.revenue}%
                  </span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Commandes</p>
                <p className="text-3xl font-bold text-elegant-black">
                  {salesData.thisMonth.orders}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-blue-500 text-sm font-medium">
                    +{salesData.thisMonth.growth.orders}%
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Nouveaux Clients</p>
                <p className="text-3xl font-bold text-elegant-black">
                  {salesData.thisMonth.customers}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-purple-500 text-sm font-medium">
                    +{salesData.thisMonth.growth.customers}%
                  </span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Produits Vendus</p>
                <p className="text-3xl font-bold text-elegant-black">
                  {salesData.thisMonth.products}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-500 text-sm font-medium">
                    {salesData.thisMonth.growth.products}%
                  </span>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-elegant text-2xl font-semibold text-elegant-black">
                Évolution du Chiffre d'Affaires
              </h2>
              <div className="flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-gray-400" />
                <button
                  onClick={() => exportReport('revenue')}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="h-80 flex items-end justify-between space-x-2">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '240px' }}>
                    <div
                      className="bg-gold-500 rounded-t-lg w-full absolute bottom-0 transition-all duration-1000"
                      style={{ 
                        height: `${(data.revenue / Math.max(...monthlyData.map(d => d.revenue))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mt-2">{data.month}</p>
                  <p className="text-xs text-gray-500">
                    <PriceDisplay amount={data.revenue} />
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-elegant text-2xl font-semibold text-elegant-black">
                Méthodes de Paiement
              </h2>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${method.color}`}></div>
                      <span className="font-medium text-elegant-black">{method.name}</span>
                    </div>
                    <span className="font-bold text-elegant-black">
                      <PriceDisplay amount={method.amount} />
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${method.color} transition-all duration-500`}
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-sm text-gray-500">{method.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-elegant text-2xl font-semibold text-elegant-black">
              Produits les Plus Vendus
            </h2>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <button
                onClick={() => exportReport('products')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Ventes</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Chiffre d'Affaires</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="bg-gold-500 text-elegant-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-elegant-black">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-blue-600">{product.sales}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <PriceDisplay amount={product.revenue} className="font-bold text-green-600" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gold-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(product.sales / Math.max(...topProducts.map(p => p.sales))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-6">
            Options d'Export
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => exportReport('sales')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Rapport des Ventes</span>
            </button>
            <button
              onClick={() => exportReport('inventory')}
              className="bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Rapport d'Inventaire</span>
            </button>
            <button
              onClick={() => exportReport('customers')}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Rapport Clients</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;