import React, { useState } from 'react';
import { 
  Calendar, 
  RefreshCw, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Download,
  Plus,
  Minus,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useCashRegister } from '../contexts/CashRegisterContext';
import ConfirmDialog from '../components/ConfirmDialog';
import PriceDisplay from '../components/PriceDisplay';
import toast from 'react-hot-toast';

const AdminCashRegister: React.FC = () => {
  const { 
    currentCash, 
    addTransaction, 
    openRegister, 
    closeRegister, 
    resetDailyRegister,
    getWeeklyCash 
  } = useCashRegister();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
    loading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
    loading: false
  });
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'sale' as 'sale' | 'refund' | 'expense',
    amount: 0,
    paymentMethod: 'sadad' as any,
    orderId: '',
    description: ''
  });
  
  const [openingBalance, setOpeningBalance] = useState(0);

  const paymentMethods = [
    { id: 'sadad', name: 'Sadad', color: 'bg-blue-500' },
    { id: 'bankily', name: 'Bankily', color: 'bg-green-500' },
    { id: 'masrivi', name: 'Masrivi', color: 'bg-purple-500' },
    { id: 'bimbanque', name: 'Bimbanque', color: 'bg-orange-500' },
    { id: 'click', name: 'Click', color: 'bg-red-500' },
    { id: 'cash', name: 'Espèces', color: 'bg-gray-500' }
  ];

  const totalDaily = Object.values(currentCash.paymentMethods).reduce((sum, amount) => sum + amount, 0);
  const weeklyData = getWeeklyCash();

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData: any = {
      type: transactionForm.type,
      amount: transactionForm.amount,
      paymentMethod: transactionForm.paymentMethod,
      description: transactionForm.description,
      userId: 'admin'
    };
    
    // Only include orderId if it has a value
    if (transactionForm.orderId && transactionForm.orderId.trim() !== '') {
      transactionData.orderId = transactionForm.orderId;
    }
    
    try {
      await addTransaction(transactionData);
      toast.success('Transaction ajoutée avec succès');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Erreur lors de l\'ajout de la transaction');
    }

    setTransactionForm({
      type: 'sale',
      amount: 0,
      paymentMethod: 'sadad',
      orderId: '',
      description: ''
    });
    
    setShowTransactionForm(false);
  };

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    openRegister(openingBalance, 'admin');
    setShowOpenForm(false);
    setOpeningBalance(0);
  };

  const handleCloseRegister = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Fermer la caisse',
      message: 'Êtes-vous sûr de vouloir fermer la caisse ? Vous ne pourrez plus ajouter de transactions pour aujourd\'hui.',
      type: 'warning',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        setTimeout(() => {
          closeRegister('admin');
          toast.success('Caisse fermée avec succès');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }, 1000);
      }
    });
  };

  const resetDailyCash = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remettre à zéro la caisse',
      message: 'Êtes-vous sûr de vouloir remettre à zéro tous les montants de la caisse journalière ? Les données seront sauvegardées dans l\'historique mais ne pourront pas être récupérées pour la journée en cours. Cette action est irréversible.',
      type: 'danger',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        setTimeout(() => {
          resetDailyRegister();
          toast.success('Caisse réinitialisée avec succès');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }, 1000);
      }
    });
  };

  const exportCashData = () => {
    const data = {
      date: currentCash.date,
      summary: currentCash,
      transactions: currentCash.transactions
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caisse-${currentCash.date || new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Rapport exporté avec succès');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-elegant text-4xl font-bold text-elegant-black">
            Caisse Journalière
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>
            
            {!currentCash.isOpen ? (
              <button
                onClick={() => setShowOpenForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Ouvrir Caisse</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTransactionForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Transaction</span>
                </button>
                <button
                  onClick={handleCloseRegister}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Minus className="h-5 w-5" />
                  <span>Fermer Caisse</span>
                </button>
              </div>
            )}
            
            <button
              onClick={exportCashData}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Exporter</span>
            </button>
            
            <button
              onClick={resetDailyCash}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Cash Status */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                currentCash.isOpen 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentCash.isOpen ? 'Caisse Ouverte' : 'Caisse Fermée'}
              </span>
              {currentCash.openedAt && currentCash.openedAt.toDate && (
                <span className="text-sm text-gray-500">
                  Ouverte à {currentCash.openedAt.toDate().toLocaleTimeString('fr-FR')}
                </span>
              )}
            </div>
            
            <h2 className="font-elegant text-3xl font-bold text-elegant-black mb-2">
              Total du Jour
            </h2>
            <PriceDisplay 
              amount={totalDaily} 
              className="text-5xl font-bold text-gold-600 mb-4"
            />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Solde d'ouverture</p>
                <PriceDisplay amount={currentCash.openingBalance} className="text-xl font-bold text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ventes</p>
                <PriceDisplay amount={currentCash.totalSales} className="text-xl font-bold text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Solde de fermeture</p>
                <PriceDisplay amount={currentCash.closingBalance} className="text-xl font-bold text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods Breakdown */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-elegant text-2xl font-semibold text-elegant-black">
                Répartition par Méthode
              </h2>
              <button 
                onClick={exportCashData}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Exporter</span>
              </button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => {
                const amount = currentCash.paymentMethods[method.id as keyof typeof currentCash.paymentMethods] || 0;
                const percentage = totalDaily > 0 ? (amount / totalDaily) * 100 : 0;
                const transactions = currentCash.transactions.filter(t => t.paymentMethod === method.id).length;
                
                return (
                  <div key={method.id} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${method.color}`}></div>
                        <span className="font-medium text-elegant-black">{method.name}</span>
                        <span className="text-sm text-gray-500">({transactions} transactions)</span>
                      </div>
                      <span className="font-bold text-elegant-black">
                        <PriceDisplay amount={amount} />
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${method.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Transactions Totales</p>
                  <p className="text-3xl font-bold text-elegant-black">
                    {currentCash.transactions.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Ticket Moyen</p>
                  <p className="text-3xl font-bold text-elegant-black">
                    {currentCash.transactions.length > 0 
                      ? (currentCash.totalSales / currentCash.transactions.filter(t => t.type === 'sale').length).toFixed(2)
                      : '0.00'
                    }€
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Méthode Dominante</p>
                  <p className="text-xl font-bold text-elegant-black">
                    {paymentMethods.find(m => 
                      m.id === Object.entries(currentCash.paymentMethods)
                        .reduce((a, b) => a[1] > b[1] ? a : b)[0]
                    )?.name || 'Aucune'}
                  </p>
                </div>
                <div className="bg-gold-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-gold-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-6">
            Transactions Récentes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Heure</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Montant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Méthode</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody>
                {currentCash.transactions.slice(-10).reverse().map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      {transaction.timestamp.toDate().toLocaleTimeString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'sale' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'refund' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {transaction.type === 'sale' ? 'Vente' :
                         transaction.type === 'refund' ? 'Remboursement' : 'Dépense'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {transaction.type === 'refund' || transaction.type === 'expense' ? '-' : '+'}
                      <PriceDisplay amount={transaction.amount} />
                    </td>
                    <td className="py-3 px-4">
                      {paymentMethods.find(m => m.id === transaction.paymentMethod)?.name || transaction.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Register Modal */}
        {showOpenForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="font-elegant text-2xl font-bold text-elegant-black mb-6">
                Ouvrir la Caisse
              </h2>
              <form onSubmit={handleOpenRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solde d'ouverture (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowOpenForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    Ouvrir
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="font-elegant text-2xl font-bold text-elegant-black mb-6">
                Nouvelle Transaction
              </h2>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de transaction
                  </label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value as any})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  >
                    <option value="sale">Vente</option>
                    <option value="refund">Remboursement</option>
                    <option value="expense">Dépense</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: parseFloat(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Méthode de paiement
                  </label>
                  <select
                    value={transactionForm.paymentMethod}
                    onChange={(e) => setTransactionForm({...transactionForm, paymentMethod: e.target.value as any})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>{method.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Commande (optionnel)
                  </label>
                  <input
                    type="text"
                    value={transactionForm.orderId}
                    onChange={(e) => setTransactionForm({...transactionForm, orderId: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowTransactionForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          loading={confirmDialog.loading}
        />
      </div>
    </div>
  );
};

export default AdminCashRegister;