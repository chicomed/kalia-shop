import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  User,
  MessageSquare
} from 'lucide-react';
import { useOrders } from '../contexts/OrderContext';
import { useClients } from '../contexts/ClientContext';
import DataTable, { Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import PriceDisplay from '../components/PriceDisplay';
import toast from 'react-hot-toast';

const AdminOrders: React.FC = () => {
  const { 
    orders, 
    loading, 
    updateOrderStatus, 
    deleteOrder,
    getTodayOrders,
    getWeekOrders,
    getMonthOrders,
    getTotalRevenue
  } = useOrders();
  
  const { getClientByPhone } = useClients();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'sent': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'preparing': return Package;
      case 'sent': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      title: 'Commande',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">#{value}</div>
          <div className="text-sm text-gray-500">
            {row.createdAt?.toDate ? 
              row.createdAt.toDate().toLocaleDateString('fr-FR') : 
              new Date(row.createdAt).toLocaleDateString('fr-FR')
            }
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      title: 'Client',
      sortable: true,
      render: (value, row) => {
        const client = getClientByPhone(value.phone);
        return (
          <div>
            <div className="font-medium text-gray-900">{value.name}</div>
            <div className="text-sm text-gray-500">{value.phone}</div>
            {client?.status === 'vip' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800 mt-1">
                VIP
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'items',
      title: 'Produits',
      render: (value) => (
        <div>
          <div className="text-sm text-gray-900">
            {value.length} produit{value.length > 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            {value.reduce((sum: number, item: any) => sum + item.quantity, 0)} article{value.reduce((sum: number, item: any) => sum + item.quantity, 0) > 1 ? 's' : ''}
          </div>
        </div>
      )
    },
    {
      key: 'total',
      title: 'Total',
      sortable: true,
      align: 'right',
      render: (value) => (
        <PriceDisplay amount={value} className="font-semibold" />
      )
    },
    {
      key: 'status',
      title: 'Statut',
      sortable: true,
      render: (value) => {
        const StatusIcon = getStatusIcon(value);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {getStatusText(value)}
          </span>
        );
      }
    },
    {
      key: 'paymentMethod',
      title: 'Paiement',
      render: (value) => (
        <span className="text-sm text-gray-700 capitalize">
          {value === 'cash' ? 'Espèces' : value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '150px',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedOrder(row)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Voir détails"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStatusChange(row)}
            className="p-1 text-gray-600 hover:text-green-600 transition-colors"
            title="Changer statut"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteOrder(row)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const handleStatusChange = (order: any) => {
    const statusOptions = [
      { value: 'pending', label: 'En attente' },
      { value: 'confirmed', label: 'Confirmée' },
      { value: 'preparing', label: 'En préparation' },
      { value: 'sent', label: 'Expédiée' },
      { value: 'delivered', label: 'Livrée' },
      { value: 'cancelled', label: 'Annulée' }
    ];

    const currentIndex = statusOptions.findIndex(s => s.value === order.status);
    const nextStatus = statusOptions[Math.min(currentIndex + 1, statusOptions.length - 1)];

    if (currentIndex < statusOptions.length - 1) {
      setConfirmDialog({
        isOpen: true,
        title: 'Changer le statut',
        message: `Voulez-vous changer le statut de la commande #${order.id} vers "${nextStatus.label}" ?`,
        type: 'info',
        onConfirm: async () => {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          
          try {
            await updateOrderStatus(order.id, nextStatus.value);
            toast.success(`Statut mis à jour vers "${nextStatus.label}"`);
            setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Erreur lors de la mise à jour du statut');
            setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          }
        }
      });
    }
  };

  const handleDeleteOrder = (order: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer la commande',
      message: `Êtes-vous sûr de vouloir supprimer définitivement la commande #${order.id} ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await deleteOrder(order.id);
          toast.success(`Commande #${order.id} supprimée avec succès`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error deleting order:', error);
          toast.error('Erreur lors de la suppression de la commande');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleSendWhatsApp = (order: any) => {
    const message = `Bonjour ${order.customer.name},\n\nVotre commande #${order.id} d'un montant de ${order.total} UM a été ${getStatusText(order.status).toLowerCase()}.\n\nMerci pour votre confiance !\n\nVoile Beauté`;
    const whatsappUrl = `https://wa.me/${order.customer.phone.replace(/\s+/g, '').replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('WhatsApp ouvert avec le message préparé');
  };

  const todayOrders = getTodayOrders();
  const weekOrders = getWeekOrders();
  const monthOrders = getMonthOrders();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-elegant text-4xl font-bold text-elegant-black">
            Gestion des Commandes
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Aujourd'hui</p>
                <p className="text-3xl font-bold text-elegant-black">{todayOrders.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Cette semaine</p>
                <p className="text-3xl font-bold text-elegant-black">{weekOrders.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ce mois</p>
                <p className="text-3xl font-bold text-elegant-black">{monthOrders.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Chiffre d'affaires</p>
                <PriceDisplay 
                  amount={getTotalRevenue('month')} 
                  className="text-2xl font-bold text-elegant-black"
                />
              </div>
              <div className="bg-gold-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          searchable={true}
          exportable={true}
          onExport={() => {
            const csvContent = [
              ['ID', 'Client', 'Téléphone', 'Total', 'Statut', 'Date'].join(','),
              ...orders.map(order => [
                order.id,
                order.customer.name,
                order.customer.phone,
                order.total.toString(),
                getStatusText(order.status),
                order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('fr-FR') : ''
              ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `commandes-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          pageSize={15}
          searchPlaceholder="Rechercher par ID, client, téléphone..."
          emptyMessage="Aucune commande trouvée"
        />

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-elegant text-2xl font-bold text-elegant-black">
                    Commande #{selectedOrder.id}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Order Info */}
                  <div>
                    <h3 className="font-medium text-elegant-black mb-4">Informations de la commande</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Date de commande</p>
                          <p className="font-medium">
                            {selectedOrder.createdAt?.toDate ? 
                              selectedOrder.createdAt.toDate().toLocaleDateString('fr-FR') : 
                              new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Statut</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusText(selectedOrder.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <PriceDisplay amount={selectedOrder.total} className="font-bold text-lg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="font-medium text-elegant-black mb-4">Informations client</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Nom</p>
                          <p className="font-medium">{selectedOrder.customer.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="font-medium">{selectedOrder.customer.phone}</p>
                        </div>
                      </div>
                      {selectedOrder.customer.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedOrder.customer.email}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Adresse de livraison</p>
                          <p className="font-medium">{selectedOrder.address.full}</p>
                          <p className="text-sm text-gray-500">{selectedOrder.address.city}, {selectedOrder.address.wilaya}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-8">
                  <h3 className="font-medium text-elegant-black mb-4">Articles commandés</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600">Quantité</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Prix unitaire</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <span className="font-medium">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">{item.quantity}</td>
                            <td className="py-4 px-4 text-right">
                              <PriceDisplay amount={item.price} />
                            </td>
                            <td className="py-4 px-4 text-right font-bold">
                              <PriceDisplay amount={item.price * item.quantity} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-elegant-black mb-2">Informations de paiement</h4>
                  <p><strong>Méthode:</strong> {selectedOrder.paymentMethod === 'cash' ? 'Espèces à la livraison' : selectedOrder.paymentMethod}</p>
                  {selectedOrder.paymentScreenshot && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Capture d'écran du paiement:</p>
                      <img
                        src={selectedOrder.paymentScreenshot}
                        alt="Preuve de paiement"
                        className="max-w-xs rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-elegant-black mb-2">Notes du client</h4>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => handleStatusChange(selectedOrder)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Changer le statut</span>
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(selectedOrder)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Contacter client</span>
                  </button>
                </div>
              </div>
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

export default AdminOrders;