import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone,
  Printer,
  MessageCircle,
  Package,
  XCircle,
  Edit,
  Download,
  Trash2,
  Plus
} from 'lucide-react';
import { useOrders } from '../contexts/OrderContext';
import { useCashRegister } from '../contexts/CashRegisterContext';
import ConfirmDialog from '../components/ConfirmDialog';
import PriceDisplay from '../components/PriceDisplay';
import { useProducts } from '../contexts/ProductContext';
import { useClients } from '../contexts/ClientContext';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import SingleImageUpload from '../components/SingleImageUpload';

const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, updateOrder, deleteOrder, addOrder } = useOrders();
  const { addTransaction } = useCashRegister();
  const { products } = useProducts();
  const { clients, getClientByPhone } = useClients();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [newOrder, setNewOrder] = useState({
    customer: {
      name: '',
      phone: '',
      email: ''
    },
    items: [] as {id: string, name: string, quantity: number, price: number, image: string}[],
    status: 'pending' as 'pending' | 'confirmed' | 'preparing' | 'sent' | 'delivered' | 'cancelled',
    address: {
      full: '',
      city: '',
      wilaya: 'Nouakchott'
    },
    paymentMethod: 'sadad',
    paymentScreenshot: '',
    notes: ''
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
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
      case 'sent': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'preparing': return 'En préparation';
      case 'sent': return 'Envoyé';
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'sent': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmer le changement de statut',
      message: `Êtes-vous sûr de vouloir changer le statut de la commande ${orderId} vers "${getStatusText(newStatus)}" ?`,
      type: 'info',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        setTimeout(() => {
          const order = orders.find(o => o.id === orderId);
          if (order) {
            updateOrderStatus(orderId, newStatus as any);

            // Add transaction to cash register if order is delivered and payment method is delivery
            if (newStatus === 'delivered' && order.paymentMethod === 'delivery') {
              addTransaction({
                type: 'sale',
                amount: order.total,
                paymentMethod: 'cash',
                orderId: orderId,
                description: `Paiement à la livraison - Commande ${orderId}`,
                userId: 'admin'
              });
            }
          }
          
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }, 1000);
      }
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer la commande',
      message: `Êtes-vous sûr de vouloir supprimer définitivement la commande ${orderId} ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        setTimeout(() => {
          deleteOrder(orderId);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }, 1000);
      }
    });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newOrder.items.length === 0) {
      alert('Veuillez ajouter au moins un produit à la commande');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Créer une nouvelle commande',
      message: 'Êtes-vous sûr de vouloir créer cette commande ?',
      type: 'info',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          // Calculate total
          const total = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          // Add order
          const orderId = await addOrder({
            ...newOrder,
            total
          });
          
          // Add transaction if payment method is not cash
          if (newOrder.paymentMethod !== 'cash') {
            await addTransaction({
              type: 'sale',
              amount: total,
              paymentMethod: newOrder.paymentMethod,
              orderId,
              description: `Paiement ${newOrder.paymentMethod} - Commande ${orderId}`,
              userId: 'admin'
            });
          }
          
          // Reset form
          setNewOrder({
            customer: {
              name: '',
              phone: '',
              email: ''
            },
            items: [],
            status: 'pending',
            address: {
              full: '',
              city: '',
              wilaya: 'Nouakchott'
            },
            paymentMethod: 'sadad',
            paymentScreenshot: '',
            notes: ''
          });
          
          setShowCreateOrderModal(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          
          alert(`Commande ${orderId} créée avec succès`);
        } catch (error) {
          console.error('Error creating order:', error);
          alert('Erreur lors de la création de la commande');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    // Check if product already exists in order
    const existingItemIndex = newOrder.items.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      const updatedItems = [...newOrder.items];
      updatedItems[existingItemIndex].quantity += productQuantity;
      setNewOrder({...newOrder, items: updatedItems});
    } else {
      // Add new item
      setNewOrder({
        ...newOrder,
        items: [
          ...newOrder.items,
          {
            id: product.id,
            name: product.name,
            quantity: productQuantity,
            price: product.price,
            image: product.images[0]
          }
        ]
      });
    }
    
    // Reset selection
    setSelectedProduct('');
    setProductQuantity(1);
  };

  const handleRemoveProduct = (productId: string) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter(item => item.id !== productId)
    });
  };

  const handleClientSelect = (phone: string) => {
    const client = getClientByPhone(phone);
    if (client) {
      setNewOrder({
        ...newOrder,
        customer: {
          name: client.name,
          phone: client.phone,
          email: client.email || ''
        },
        address: {
          full: client.address.full,
          city: client.address.city,
          wilaya: client.address.wilaya
        }
      });
    }
  };

  const handlePrintOrder = (order: any) => {
    // Generate print content
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #333;">Facture - ${order.id}</h1>
        <hr>
        <div style="margin: 20px 0;">
          <h3>Informations Client:</h3>
          <p><strong>Nom:</strong> ${order.customer.name}</p>
          <p><strong>Téléphone:</strong> ${order.customer.phone}</p>
          <p><strong>Email:</strong> ${order.customer.email}</p>
          <p><strong>Adresse:</strong> ${order.address.full}</p>
        </div>
        <div style="margin: 20px 0;">
          <h3>Produits:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Produit</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Quantité</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Prix</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.price}€</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(item.price * item.quantity).toFixed(2)}€</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin: 20px 0; text-align: right;">
          <h3>Total: ${order.total.toFixed(2)}€</h3>
        </div>
        <div style="margin: 20px 0;">
          <p><strong>Méthode de paiement:</strong> ${order.paymentMethod === 'upload' ? 'Capture d\'écran' : 'Paiement à la livraison'}</p>
          <p><strong>Date de commande:</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
          <p><strong>Statut:</strong> ${getStatusText(order.status)}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendWhatsApp = (order: any) => {
    const message = `Bonjour ${order.customer.name},

Votre commande ${order.id} a été mise à jour.
Statut: ${getStatusText(order.status)}
Total: ${order.total.toFixed(2)}€

${order.status === 'sent' ? 'Votre commande est en route !' : ''}
${order.status === 'delivered' ? 'Votre commande a été livrée. Merci pour votre confiance !' : ''}

Voile Beauté - Élégance & Tradition`;

    const whatsappUrl = `https://wa.me/${order.customer.phone.replace(/\s+/g, '').replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEditOrder = (order: any) => {
    setEditingOrder({ ...order });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingOrder) {
      updateOrder(editingOrder.id, editingOrder);
      setShowEditModal(false);
      setEditingOrder(null);
      alert('Commande mise à jour avec succès');
    }
  };

  const exportOrders = () => {
    const csvContent = [
      ['ID', 'Client', 'Téléphone', 'Total', 'Statut', 'Date', 'Paiement'].join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.customer.name,
        order.customer.phone,
        order.total.toFixed(2),
        getStatusText(order.status),
        new Date(order.createdAt).toLocaleDateString('fr-FR'),
        order.paymentMethod === 'upload' ? 'Capture' : 'Livraison'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-elegant text-4xl font-bold text-elegant-black">
            Gestion des Commandes
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateOrderModal(true)}
              className="bg-elegant-black hover:bg-gold-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvelle Commande</span>
            </button>
            <button
              onClick={exportOrders}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {['pending', 'confirmed', 'preparing', 'sent', 'delivered'].map(status => {
            const count = orders.filter(o => o.status === status).length;
            return (
              <div key={status} className="bg-white p-4 rounded-lg shadow">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600">{getStatusText(status)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, ID ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 w-80"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="preparing">En préparation</option>
                  <option value="sent">Envoyé</option>
                  <option value="delivered">Livré</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredOrders.length} commande(s) trouvée(s)
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-bold text-xl text-elegant-black">{order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)} flex items-center space-x-1`}>
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePrintOrder(order)}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-colors"
                      title="Imprimer"
                    >
                      <Printer className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSendWhatsApp(order)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-elegant-black mb-2">Client</h4>
                    <p className="text-gray-600">{order.customer.name}</p>
                    <p className="text-gray-500 text-sm flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {order.customer.phone}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {order.address.city}
                    </p>
                  </div>

                  {/* Products */}
                  <div>
                    <h4 className="font-medium text-elegant-black mb-2">Produits</h4>
                    {order.items.slice(0, 2).map((product: any, index: number) => (
                      <div key={index} className="text-sm text-gray-600">
                        {product.name} × {product.quantity}
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{order.items.length - 2} autre(s)
                      </div>
                    )}
                  </div>

                  {/* Payment & Total */}
                  <div>
                    <h4 className="font-medium text-elegant-black mb-2">Paiement</h4>
                    <p className="text-gray-600 text-sm">
                      {order.paymentMethod === 'upload' ? 'Capture d\'écran' : 'À la livraison'}
                    </p>
                    <PriceDisplay amount={order.total} className="font-bold text-lg text-elegant-black mt-1" />
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="font-medium text-elegant-black mb-2">Actions</h4>
                    <div className="space-y-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                        >
                          Confirmer
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                        >
                          En préparation
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'sent')}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                        >
                          <Truck className="h-4 w-4" />
                          <span>Expédier</span>
                        </button>
                      )}
                      {order.status === 'sent' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Livré</span>
                        </button>
                      )}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-elegant text-2xl font-bold text-elegant-black">
                    Détails de la commande {selectedOrder.id}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Details */}
                <div>
                  <h3 className="font-medium text-elegant-black mb-3">Informations Client</h3>
                  <div className="bg-gray-50 p-4 rounded-lg grid md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Nom:</strong> {selectedOrder.customer.name}</p>
                      <p><strong>Téléphone:</strong> {selectedOrder.customer.phone}</p>
                      <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                    </div>
                    <div>
                      <p><strong>Adresse:</strong> {selectedOrder.address.full}</p>
                      <p><strong>Ville:</strong> {selectedOrder.address.city}</p>
                      <p><strong>Wilaya:</strong> {selectedOrder.address.wilaya}</p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="font-medium text-elegant-black mb-3">Produits Commandés</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((product: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          <span>{product.name}</span>
                        </div>
                        <span>
                          {product.quantity} × <PriceDisplay amount={product.price} className="inline" /> = 
                          <PriceDisplay amount={product.quantity * product.price} className="inline" />
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <PriceDisplay amount={selectedOrder.total} className="text-gold-600" />
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-elegant-black mb-3">Informations Commande</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</p>
                      <p><strong>Statut:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusText(selectedOrder.status)}
                        </span>
                      </p>
                      <p><strong>Paiement:</strong> {selectedOrder.paymentMethod === 'upload' ? 'Capture d\'écran' : 'À la livraison'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-elegant-black mb-3">Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{selectedOrder.notes || 'Aucune note'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handlePrintOrder(selectedOrder)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Printer className="h-5 w-5" />
                    <span>Imprimer Facture</span>
                  </button>
                  <button 
                    onClick={() => handleSendWhatsApp(selectedOrder)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Envoyer WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {showEditModal && editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-elegant text-2xl font-bold text-elegant-black">
                    Modifier la commande {editingOrder.id}
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du client</label>
                  <input
                    type="text"
                    value={editingOrder.customer.name}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      customer: { ...editingOrder.customer, name: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={editingOrder.customer.phone}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      customer: { ...editingOrder.customer, phone: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={editingOrder.address.full}
                    onChange={(e) => setEditingOrder({
                      ...editingOrder,
                      address: { ...editingOrder.address, full: e.target.value }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="preparing">En préparation</option>
                    <option value="sent">Envoyé</option>
                    <option value="delivered">Livré</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={editingOrder.notes || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Order Modal */}
        {showCreateOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-elegant text-2xl font-bold text-elegant-black">
                    Créer une nouvelle commande
                  </h2>
                  <button
                    onClick={() => setShowCreateOrderModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleCreateOrder} className="p-6 space-y-6">
                {/* Client Information */}
                <div>
                  <h3 className="font-medium text-elegant-black mb-4">Informations Client</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client existant
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      onChange={(e) => handleClientSelect(e.target.value)}
                      value=""
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.phone}>
                          {client.name} ({client.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du client *
                      </label>
                      <input
                        type="text"
                        value={newOrder.customer.name}
                        onChange={(e) => setNewOrder({
                          ...newOrder,
                          customer: { ...newOrder.customer, name: e.target.value }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={newOrder.customer.phone}
                        onChange={(e) => setNewOrder({
                          ...newOrder,
                          customer: { ...newOrder.customer, phone: e.target.value }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newOrder.customer.email}
                        onChange={(e) => setNewOrder({
                          ...newOrder,
                          customer: { ...newOrder.customer, email: e.target.value }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-medium text-elegant-black mb-4">Adresse de livraison</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse complète *
                      </label>
                      <input
                        type="text"
                        value={newOrder.address.full}
                        onChange={(e) => setNewOrder({
                          ...newOrder,
                          address: { ...newOrder.address, full: e.target.value }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={newOrder.address.city}
                        onChange={(e) => setNewOrder({
                          ...newOrder,
                          address: { ...newOrder.address, city: e.target.value }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wilaya
                    </label>
                    <select
                      value={newOrder.address.wilaya}
                      onChange={(e) => setNewOrder({
                        ...newOrder,
                        address: { ...newOrder.address, wilaya: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    >
                      <option value="Nouakchott">Nouakchott</option>
                      <option value="Nouadhibou">Nouadhibou</option>
                      <option value="Rosso">Rosso</option>
                      <option value="Kaédi">Kaédi</option>
                      <option value="Zouerate">Zouerate</option>
                    </select>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="font-medium text-elegant-black mb-4">Produits</h3>
                  
                  <div className="flex space-x-4 mb-4">
                    <div className="flex-1">
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      >
                        <option value="">Sélectionner un produit</option>
                        {products.filter(p => p.inStock).map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - <PriceDisplay amount={product.price} className="inline" />
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      disabled={!selectedProduct}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </div>
                  
                  {newOrder.items.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Quantité</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {newOrder.items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                                  <span className="font-medium">{item.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">{item.quantity}</td>
                              <td className="px-4 py-3 text-right">
                                <PriceDisplay amount={item.price} />
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                <PriceDisplay amount={item.price * item.quantity} />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(item.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right font-bold">Total:</td>
                            <td className="px-4 py-3 text-right font-bold">
                              <PriceDisplay 
                                amount={newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} 
                                className="text-gold-600"
                              />
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">Aucun produit ajouté</p>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-medium text-elegant-black mb-4">Méthode de paiement</h3>
                  
                  <PaymentMethodSelector
                    selectedMethod={newOrder.paymentMethod}
                    onChange={(method) => setNewOrder({...newOrder, paymentMethod: method})}
                    showInstructions={false}
                  />
                  
                  {newOrder.paymentMethod !== 'cash' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capture d'écran du paiement
                      </label>
                      <SingleImageUpload
                        image={newOrder.paymentScreenshot}
                        onChange={(image) => setNewOrder({...newOrder, paymentScreenshot: image})}
                        aspectRatio="landscape"
                        label=""
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    placeholder="Notes supplémentaires sur la commande..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateOrderModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={newOrder.items.length === 0}
                    className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Créer la commande
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

export default AdminOrders;