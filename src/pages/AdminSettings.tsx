import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  Eye,
  EyeOff,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import ConfirmDialog from '../components/ConfirmDialog';
import SingleImageUpload from '../components/SingleImageUpload';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';

// Payment methods management component
interface PaymentMethodsSettingsProps {
  paymentMethods: any;
  onSave: (methods: any) => Promise<void>;
}

const PaymentMethodsSettings: React.FC<PaymentMethodsSettingsProps> = ({ paymentMethods: initialMethods, onSave }) => {
  const [paymentMethods, setPaymentMethods] = useState<any>({});
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  const [loading, setSaving] = useState(false);

  React.useEffect(() => {
    if (initialMethods) {
      setPaymentMethods(initialMethods);
    }
  }, [initialMethods]);

  const methodsList = Object.entries(paymentMethods).map(([id, method]: [string, any]) => ({
    id,
    ...method
  }));

  const handleToggleActive = (id: string) => {
    setPaymentMethods((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        active: !prev[id].active
      }
    }));
  };

  const handleAccountNumberChange = (id: string, value: string) => {
    setPaymentMethods((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        accountNumber: value
      }
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await onSave(paymentMethods);
      toast.success('Méthodes de paiement mises à jour avec succès');
    } catch (error) {
      console.error('Error saving payment methods:', error);
      toast.error('Erreur lors de la sauvegarde des méthodes de paiement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-elegant-black">Méthodes de paiement</h3>
        <button
          onClick={handleSaveChanges}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sauvegarde...</span>
            </>
          ) : (
            <span>Enregistrer les modifications</span>
          )}
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">
          Configurez les méthodes de paiement disponibles pour vos clients. Vous pouvez activer ou désactiver chaque méthode et définir les numéros de compte associés.
        </p>
      </div>

      <div className="space-y-4">
        {methodsList.map(method => (
          <div key={method.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={method.active}
                    onChange={() => handleToggleActive(method.id)}
                    className="text-gold-500 focus:ring-gold-500"
                  />
                  <span className="ml-2 font-medium">{method.name}</span>
                </label>
              </div>
              <button
                onClick={() => setEditingMethod(editingMethod === method.id ? null : method.id)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {editingMethod === method.id ? 'Fermer' : 'Modifier'}
              </button>
            </div>

            {editingMethod === method.id && method.id !== 'cash' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de compte
                  </label>
                  <input
                    type="text"
                    value={method.accountNumber}
                    onChange={(e) => handleAccountNumberChange(method.id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    placeholder="Entrez le numéro de compte"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminSettings: React.FC = () => {
  const { userProfile } = useAuth();
  const { settings, updateSettings, updatePaymentMethods } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
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

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'payment', label: 'Paiements', icon: CreditCard },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'business', label: 'Boutique', icon: Settings }
  ];

  const handleSave = (section: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Sauvegarder les paramètres',
      message: `Êtes-vous sûr de vouloir sauvegarder les modifications de la section "${section}" ?`,
      type: 'info',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        setTimeout(() => {
          toast.success('Paramètres sauvegardés avec succès');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }, 1000);
      }
    });
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    if (!settings) return;
    
    const updatedSection = {
      ...settings[section as keyof typeof settings],
      [field]: value
    };
    
    updateSettings(section as any, updatedSection);
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="font-elegant text-4xl font-bold text-elegant-black mb-8">
          Paramètres
        </h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-6 py-4 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gold-500 text-elegant-black'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-6">
                    Informations du Profil
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gold-500 flex items-center justify-center">
                        {settings.profile.avatar ? (
                          <img 
                            src={settings.profile.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-elegant-black text-2xl font-bold">
                            {settings.profile.name.charAt(0).toUpperCase() || 'A'}
                          </span>
                        )}
                      </div>
                      <div>
                        <SingleImageUpload
                          image={settings.profile.avatar}
                          onChange={(avatar) => handleInputChange('profile', 'avatar', avatar)}
                          aspectRatio="square"
                          label=""
                          className="w-32"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          JPG, PNG ou GIF. Taille maximale 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={settings.profile.name}
                          onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={settings.profile.phone}
                          onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave('profile')}
                      className="bg-elegant-black hover:bg-gold-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-5 w-5" />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Business Settings */}
              {activeTab === 'business' && (
                <div>
                  <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-6">
                    Informations de la Boutique
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom de la boutique
                        </label>
                        <input
                          type="text"
                          value={settings.business.storeName}
                          onChange={(e) => handleInputChange('business', 'storeName', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro fiscal
                        </label>
                        <input
                          type="text"
                          value={settings.business.taxNumber}
                          onChange={(e) => handleInputChange('business', 'taxNumber', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={settings.business.storeDescription}
                        onChange={(e) => handleInputChange('business', 'storeDescription', e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={settings.business.phone}
                          onChange={(e) => handleInputChange('business', 'phone', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={settings.business.email}
                          onChange={(e) => handleInputChange('business', 'email', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={settings.business.address}
                        onChange={(e) => handleInputChange('business', 'address', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo de la boutique
                      </label>
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-elegant-black rounded-2xl flex items-center justify-center overflow-hidden">
                            {settings.business.logo ? (
                              <img 
                                src={settings.business.logo} 
                                alt="Logo" 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-gold-500 text-2xl font-bold">
                                {settings.business.storeName.charAt(0)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <SingleImageUpload
                            image={settings.business.logo}
                            onChange={(logo) => handleInputChange('business', 'logo', logo)}
                            aspectRatio="square"
                            label=""
                            className="w-full"
                          />
                          <div className="mt-2 text-sm text-gray-500">
                            <p>• Format recommandé: PNG avec fond transparent</p>
                            <p>• Taille recommandée: 200x200px minimum</p>
                            <p>• Le logo apparaîtra dans l'en-tête du site</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hero Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images de bannière (Hero)
                      </label>
                      <ImageUpload
                        images={settings.business.heroImages}
                        onChange={(heroImages) => handleInputChange('business', 'heroImages', heroImages)}
                        maxImages={5}
                        label=""
                        required={false}
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        <p>• Ces images apparaîtront en rotation sur la page d'accueil</p>
                        <p>• Format recommandé: 16:9 (paysage)</p>
                        <p>• Taille recommandée: 1200x675px minimum</p>
                        <p>• Maximum 5 images</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave('business')}
                      className="bg-elegant-black hover:bg-gold-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-5 w-5" />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Methods Settings */}
              {activeTab === 'payment' && (
                <div>
                  <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-6">
                    Méthodes de Paiement
                  </h2>
                  
                  <PaymentMethodsSettings 
                    paymentMethods={settings.paymentMethods}
                    onSave={updatePaymentMethods}
                  />
                </div>
              )}

              {/* Other tabs can be implemented similarly */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-6">
                    Préférences de Notification
                  </h2>
                  <p className="text-gray-600">Configuration des notifications à venir...</p>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-6">
                    Paramètres de Sécurité
                  </h2>
                  <p className="text-gray-600">Configuration de la sécurité à venir...</p>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h2 className="font-elegant text-2xl font-semibold text-elegant-black mb-6">
                    Apparence et Langue
                  </h2>
                  <p className="text-gray-600">Configuration de l'apparence à venir...</p>
                </div>
              )}
            </div>
          </div>
        </div>

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

export default AdminSettings;