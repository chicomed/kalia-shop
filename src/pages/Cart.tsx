import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, MapPin, Upload, CreditCard, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrderContext';
import { useClients } from '../contexts/ClientContext';
import { useAuth } from '../contexts/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import PriceDisplay from '../components/PriceDisplay';
import toast from 'react-hot-toast';
import SingleImageUpload from '../components/SingleImageUpload';

const Cart: React.FC = () => {
  const { language, isRTL, t } = useLanguage();
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { getClientByPhone, addClient, updateClient } = useClients();
  const { user } = useAuth();
  
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('sadad');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
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
  
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: user?.phoneNumber || '',
    fullAddress: '',
    city: '',
    wilaya: 'Nouakchott',
    notes: ''
  });

  const shipping = 5.00;
  const total = getTotalPrice() + shipping;

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setOrderData(prev => ({
            ...prev,
            fullAddress: `Coordonnées: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        },
        (error) => {
          alert('Impossible d\'obtenir votre position. Veuillez saisir votre adresse manuellement.');
          setUseGeolocation(false);
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      setUseGeolocation(false);
    }
  };

  const validateForm = (): boolean => {
    if (!orderData.customerName.trim()) {
      toast.error('Veuillez entrer votre nom');
      return false;
    }
    if (!orderData.customerPhone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return false;
    }
    if (!useGeolocation && !orderData.fullAddress.trim()) {
      toast.error('Veuillez entrer votre adresse');
      return false;
    }
    if (paymentMethod === 'upload' && !paymentScreenshot) {
      toast.error('Veuillez télécharger une capture d\'écran du paiement');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0 || !validateForm()) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Confirmer la commande',
      message: `Êtes-vous sûr de vouloir passer cette commande d'un montant de ${total.toLocaleString()} UM ?`,
      type: 'info',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        setIsSubmitting(true);

        try {
          // Get current location if using geolocation
          if (useGeolocation && !orderData.fullAddress.includes('Coordonnées:')) {
            getCurrentLocation();
            // Wait a bit for geolocation
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          // Handle client management
          const existingClient = getClientByPhone(orderData.customerPhone);
          
          let clientId = null;
          
          if (existingClient) {
            // Update existing client with latest information
            await updateClient(existingClient.id, {
              name: orderData.customerName,
              email: orderData.customerEmail || existingClient.email,
              address: {
                full: useGeolocation ? orderData.fullAddress : `${orderData.fullAddress}, ${orderData.city}`,
                city: orderData.city || existingClient.address.city,
                wilaya: orderData.wilaya || existingClient.address.wilaya
              }
            });
            clientId = existingClient.id;
          } else {
            // Create new client
            clientId = await addClient({
              name: orderData.customerName,
              phone: orderData.customerPhone,
              email: orderData.customerEmail,
              address: {
                full: useGeolocation ? orderData.fullAddress : `${orderData.fullAddress}, ${orderData.city}`,
                city: orderData.city || 'Nouakchott',
                wilaya: orderData.wilaya
              },
              registeredDate: new Date(),
              totalOrders: 0,
              totalSpent: 0,
              status: 'active',
              preferences: {
                language: language as 'fr' | 'ar',
                notifications: true,
                newsletter: false
              }
            });
          }

          const newOrderId = await addOrder({
            customer: {
              name: orderData.customerName,
              phone: orderData.customerPhone,
              email: orderData.customerEmail
            } as any,
            clientId: clientId, // Associate order with client
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image
            })),
            total: total,
            status: 'pending',
            address: {
              full: useGeolocation ? orderData.fullAddress : `${orderData.fullAddress}, ${orderData.city}`,
              city: orderData.city || 'Nouakchott',
              wilaya: orderData.wilaya
            },
            paymentMethod: paymentMethod,
            paymentScreenshot: paymentScreenshot,
            notes: orderData.notes
          });

          // Update client statistics after order is created
          if (clientId) {
            try {
              const updatedClient = getClientByPhone(orderData.customerPhone);
              if (updatedClient) {
                await updateClient(updatedClient.id, {
                  totalOrders: updatedClient.totalOrders + 1,
                  totalSpent: updatedClient.totalSpent + total,
                  lastOrderDate: new Date(),
                  status: updatedClient.totalSpent + total >= 10000 ? 'vip' : updatedClient.status
                });
              }
            } catch (error) {
              console.error('Error updating client statistics:', error);
            }
          }

          setOrderId(newOrderId);
          setOrderSuccess(true);
          clearCart();
          
          // Reset form
          setOrderData({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            fullAddress: '',
            city: '',
            wilaya: 'Nouakchott',
            notes: ''
          });
          setPaymentScreenshot('');
          
        } catch (error) {
          console.error('Error placing order:', error);
          toast.error('Une erreur est survenue lors de la commande. Veuillez réessayer.');
        } finally {
          setIsSubmitting(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleRemoveItem = (itemId: number, itemName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Retirer du panier',
      message: `Êtes-vous sûr de vouloir retirer "${itemName}" de votre panier ?`,
      type: 'warning',
      onConfirm: () => {
        removeFromCart(itemId);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleClearCart = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Vider le panier',
      message: 'Êtes-vous sûr de vouloir vider complètement votre panier ? Tous les articles seront supprimés.',
      type: 'danger',
      onConfirm: () => {
        clearCart();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full mx-4">
          <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="font-elegant text-2xl font-bold text-elegant-black mb-4">
            {language === 'ar' ? 'تم تأكيد طلبك!' : 'Commande Confirmée!'}
          </h2>
          <p className="text-gray-600 mb-4">
            {language === 'ar' 
              ? `رقم طلبك: ${orderId}. سنتواصل معك قريباً لتأكيد التفاصيل.`
              : `Votre numéro de commande: ${orderId}. Nous vous contacterons bientôt pour confirmer les détails.`
            }
          </p>
          <div className="space-y-3">
            <Link 
              to="/collections" 
              className="block w-full bg-elegant-black text-white py-3 px-6 rounded-lg hover:bg-gold-600 transition-colors"
            >
              {language === 'ar' ? 'متابعة التسوق' : 'Continuer les achats'}
            </Link>
            <Link 
              to="/" 
              className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {language === 'ar' ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4">
        <h1 className="font-elegant text-4xl font-bold text-elegant-black mb-8">
          {t('cart.title')}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl mb-6">{t('cart.empty')}</p>
            <Link 
              to="/collections" 
              className="bg-elegant-black text-white px-8 py-3 rounded-lg hover:bg-gold-600 transition-colors"
            >
              {t('cart.continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-elegant text-xl font-semibold text-elegant-black">
                        {item.name}
                      </h3>
                      <p className="text-gray-600">
                        {t('cart.unitPrice')}: <PriceDisplay amount={item.price} className="inline" />
                      </p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <PriceDisplay 
                        amount={item.price * item.quantity} 
                        className="text-xl"
                      />
                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="text-red-500 hover:text-red-700 mt-2 transition-colors"
                        title="Retirer du panier"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Checkout */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-4">
                  {t('cart.summary')}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t('cart.subtotal')}:</span>
                    <PriceDisplay amount={getTotalPrice()} />
                  </div>
                  <div className="flex justify-between">
                    <span>{t('cart.shipping')}:</span>
                    <PriceDisplay amount={shipping} />
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('cart.total')}:</span>
                    <PriceDisplay amount={total} className="text-gold-600" />
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-medium text-elegant-black mb-4">
                  {language === 'ar' ? 'معلومات العميل' : 'Informations Client'}
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
                    value={orderData.customerName}
                    onChange={(e) => setOrderData({...orderData, customerName: e.target.value})}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                    required
                  />
                  <input
                    type="email"
                    placeholder={language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (optionnel)'}
                    value={orderData.customerEmail}
                    onChange={(e) => setOrderData({...orderData, customerEmail: e.target.value})}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                  <input
                    type="tel"
                    placeholder={language === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'}
                    value={orderData.customerPhone}
                    onChange={(e) => setOrderData({...orderData, customerPhone: e.target.value})}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                    required
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-medium text-elegant-black mb-4 flex items-center">
                  <MapPin className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('cart.deliveryAddress')}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="geolocation"
                      checked={useGeolocation}
                      onChange={() => setUseGeolocation(true)}
                      className="text-gold-500"
                    />
                    <label htmlFor="geolocation">
                      {t('cart.useGeolocation')}
                    </label>
                    {useGeolocation && (
                      <button
                        onClick={getCurrentLocation}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Obtenir position
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="manual"
                      checked={!useGeolocation}
                      onChange={() => setUseGeolocation(false)}
                      className="text-gold-500"
                    />
                    <label htmlFor="manual">{t('cart.manualAddress')}</label>
                  </div>

                  {!useGeolocation && (
                    <div className="space-y-3 mt-4">
                      <input
                        type="text"
                        placeholder={t('cart.fullAddress')}
                        value={orderData.fullAddress}
                        onChange={(e) => setOrderData({...orderData, fullAddress: e.target.value})}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                        required={!useGeolocation}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder={t('cart.city')}
                          value={orderData.city}
                          onChange={(e) => setOrderData({...orderData, city: e.target.value})}
                          className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                        />
                        <select
                          value={orderData.wilaya}
                          onChange={(e) => setOrderData({...orderData, wilaya: e.target.value})}
                          className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                          <option value="Nouakchott">Nouakchott</option>
                          <option value="Nouadhibou">Nouadhibou</option>
                          <option value="Rosso">Rosso</option>
                          <option value="Kaédi">Kaédi</option>
                          <option value="Zouerate">Zouerate</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {useGeolocation && orderData.fullAddress && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-700">
                        Position obtenue: {orderData.fullAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-medium text-elegant-black mb-4 flex items-center">
                  <CreditCard className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {language === 'ar' ? 'طريقة الدفع' : 'Méthode de paiement'}
                </h3>
                
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onChange={setPaymentMethod}
                />

                {paymentMethod !== 'cash' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('cart.paymentScreenshot')}
                    </label>
                    <SingleImageUpload
                      image={paymentScreenshot}
                      onChange={setPaymentScreenshot}
                      aspectRatio="landscape"
                      label=""
                      required={paymentMethod !== 'cash'}
                    />
                  </div>
                )}
                
                {paymentMethod === 'cash' && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {language === 'ar' 
                        ? 'سيتم الدفع نقدًا عند التسليم.'
                        : 'Le paiement sera effectué en espèces à la livraison.'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'ملاحظات إضافية' : 'Notes supplémentaires'}
                </label>
                <textarea
                  value={orderData.notes}
                  onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
                  rows={3}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={language === 'ar' ? 'أي ملاحظات خاصة...' : 'Toute note spéciale...'}
                />
              </div>

              {/* Checkout Button */}
              <button 
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-elegant-black hover:bg-gold-600 text-white py-4 px-6 rounded-lg font-medium transition-colors duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{language === 'ar' ? 'جاري المعالجة...' : 'Traitement...'}</span>
                  </div>
                ) : (
                  t('cart.placeOrder')
                )}
              </button>
            </div>
          </div>
        )}

        {/* Clear Cart Button */}
        {items.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vider le panier</span>
            </button>
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

export default Cart;