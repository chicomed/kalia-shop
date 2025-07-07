import React, { useState } from 'react';
import { 
  Plus,
  Eye, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  ShoppingBag,
  MessageCircle,
  UserCheck,
  UserX,
  Crown,
  Edit,
  Trash2,
  Star,
  TrendingUp
} from 'lucide-react';
import { useClients } from '../contexts/ClientContext';
import DataTable, { Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import PriceDisplay from '../components/PriceDisplay';
import SingleImageUpload from '../components/SingleImageUpload';
import toast from 'react-hot-toast';

const AdminClients: React.FC = () => {
  const { 
    clients, 
    loading, 
    addClient, 
    updateClient, 
    deleteClient, 
    promoteToVIP, 
    exportClients,
    getVIPClients,
    getActiveClients 
  } = useClients();
  
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
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

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      full: '',
      city: '',
      wilaya: 'Nouakchott'
    },
    status: 'active' as 'active' | 'vip' | 'inactive',
    avatar: '',
    notes: '',
    preferences: {
      language: 'fr' as 'fr' | 'ar',
      notifications: true,
      newsletter: false
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'vip': return 'bg-gold-100 text-gold-800 border-gold-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'vip': return 'VIP';
      case 'inactive': return 'Inactif';
      default: return status;
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addClient({
        ...clientForm,
        registeredDate: new Date(), 
        totalOrders: 0,
        totalSpent: 0
      });
      
      toast.success('Client ajouté avec succès');
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Erreur lors de l\'ajout du client');
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClient) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Modifier le client',
      message: `Êtes-vous sûr de vouloir modifier les informations de ${editingClient.name} ?`,
      type: 'info',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await updateClient(editingClient.id, clientForm);
          setEditingClient(null);
          toast.success('Client modifié avec succès');
          resetForm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error updating client:', error);
          toast.error('Erreur lors de la modification du client');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleDeleteClient = (client: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer le client',
      message: `Êtes-vous sûr de vouloir supprimer définitivement le client "${client.name}" ? Cette action est irréversible et supprimera également tout l'historique associé.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await deleteClient(client.id);
          toast.success('Client supprimé avec succès');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error deleting client:', error);
          toast.error('Erreur lors de la suppression du client');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handlePromoteToVIP = (client: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Promouvoir en VIP',
      message: `Êtes-vous sûr de vouloir promouvoir ${client.name} au statut VIP ? Ce client bénéficiera d'avantages exclusifs.`,
      type: 'info',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          await promoteToVIP(client.id);
          toast.success(`${client.name} a été promu au statut VIP`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
          console.error('Error promoting client:', error);
          toast.error('Erreur lors de la promotion du client');
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const handleSendWhatsApp = (client: any) => {
    const message = `Bonjour ${client.name},\n\nNous espérons que vous allez bien ! Découvrez nos dernières collections de voiles sur notre boutique.\n\nVoile Beauté - Élégance & Tradition`;
    const whatsappUrl = `https://wa.me/${client.phone.replace(/\s+/g, '').replace('+', '')}?text=${encodeURIComponent(message)}`;
    try {
      window.open(whatsappUrl, '_blank');
      toast.success('WhatsApp ouvert avec le message préparé');
    } catch (error) {
      toast.error('Impossible d\'ouvrir WhatsApp');
    }
  };

  const resetForm = () => {
    setClientForm({
      name: '',
      phone: '',
      email: '',
      address: {
        full: '',
        city: '',
        wilaya: 'Nouakchott'
      },
      status: 'active',
      avatar: '',
      notes: '',
      preferences: {
        language: 'fr',
        notifications: true,
        newsletter: false
      }
    });
  };

  const startEdit = (client: any) => {
    setClientForm({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address,
      status: client.status,
      avatar: client.avatar || '',
      notes: client.notes || '',
      preferences: client.preferences || {
        language: 'fr',
        notifications: true,
        newsletter: false
      }
    });
    setEditingClient(client);
    setShowAddForm(true);
  };

  const columns: Column<any>[] = [
    {
      key: 'avatar',
      title: '',
      width: '60px',
      render: (value, row) => (
        <div className="flex items-center justify-center">
          {value ? (
            <img src={value} alt={row.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {row.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      title: 'Client',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.phone}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Statut',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
          {value === 'vip' && <Crown className="w-3 h-3 mr-1" />}
          {getStatusText(value)}
        </span>
      )
    },
    {
      key: 'address',
      title: 'Localisation',
      render: (value) => (
        <div className="text-sm">
          <div className="text-gray-900">{value.city}</div>
          <div className="text-gray-500">{value.wilaya}</div>
        </div>
      )
    },
    {
      key: 'totalOrders',
      title: 'Commandes',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">commandes</div>
        </div>
      )
    },
    {
      key: 'totalSpent',
      title: 'Total dépensé',
      sortable: true,
      align: 'right',
      render: (value) => (
        <PriceDisplay amount={value} className="font-semibold" />
      )
    },
    {
      key: 'registeredDate',
      title: 'Inscription',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-900">
          {value?.toDate ? value.toDate().toLocaleDateString('fr-FR') : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '200px',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedClient(row)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Voir détails"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => startEdit(row)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleSendWhatsApp(row)}
            className="p-1 text-gray-600 hover:text-green-600 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          {row.status !== 'vip' && (
            <button
              onClick={() => handlePromoteToVIP(row)}
              className="p-1 text-gray-600 hover:text-gold-600 transition-colors"
              title="Promouvoir VIP"
            >
              <Crown className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteClient(row)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const vipClients = getVIPClients();
  const activeClients = getActiveClients();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-elegant text-4xl font-bold text-elegant-black">
            Gestion des Clients
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-elegant-black hover:bg-gold-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau Client</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Clients</p>
                <p className="text-3xl font-bold text-elegant-black">{clients.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Clients Actifs</p>
                <p className="text-3xl font-bold text-elegant-black">{activeClients.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Clients VIP</p>
                <p className="text-3xl font-bold text-elegant-black">{vipClients.length}</p>
              </div>
              <div className="bg-gold-100 p-3 rounded-lg">
                <Crown className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Nouveaux ce mois</p>
                <p className="text-3xl font-bold text-elegant-black">
                  {clients.filter(c => {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    const clientDate = c.registeredDate?.toDate ? c.registeredDate.toDate() : new Date(c.registeredDate);
                    return clientDate >= monthAgo;
                  }).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={clients}
          columns={columns}
          loading={loading}
          searchable={true}
          exportable={true}
          onExport={exportClients}
          pageSize={15}
          searchPlaceholder="Rechercher par nom, téléphone, email..."
          emptyMessage="Aucun client trouvé"
        />

        {/* Add/Edit Client Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-elegant text-2xl font-bold text-elegant-black">
                    {editingClient ? 'Modifier le Client' : 'Nouveau Client'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingClient(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <form onSubmit={editingClient ? handleEditClient : handleAddClient} className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gold-500 flex items-center justify-center">
                    {clientForm.avatar ? (
                      <img 
                        src={clientForm.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {clientForm.name.charAt(0).toUpperCase() || 'C'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <SingleImageUpload
                      image={clientForm.avatar}
                      onChange={(avatar) => setClientForm({...clientForm, avatar})}
                      aspectRatio="square"
                      label="Photo de profil"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
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
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={clientForm.address.city}
                      onChange={(e) => setClientForm({
                        ...clientForm, 
                        address: {...clientForm.address, city: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wilaya
                    </label>
                    <select
                      value={clientForm.address.wilaya}
                      onChange={(e) => setClientForm({
                        ...clientForm, 
                        address: {...clientForm.address, wilaya: e.target.value}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète
                  </label>
                  <input
                    type="text"
                    value={clientForm.address.full}
                    onChange={(e) => setClientForm({
                      ...clientForm, 
                      address: {...clientForm.address, full: e.target.value}
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={clientForm.status}
                      onChange={(e) => setClientForm({...clientForm, status: e.target.value as any})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    >
                      <option value="active">Actif</option>
                      <option value="vip">VIP</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Langue préférée
                    </label>
                    <select
                      value={clientForm.preferences.language}
                      onChange={(e) => setClientForm({
                        ...clientForm, 
                        preferences: {...clientForm.preferences, language: e.target.value as 'fr' | 'ar'}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={clientForm.notes}
                    onChange={(e) => setClientForm({...clientForm, notes: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    placeholder="Notes internes sur le client..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={clientForm.preferences.notifications}
                      onChange={(e) => setClientForm({
                        ...clientForm, 
                        preferences: {...clientForm.preferences, notifications: e.target.checked}
                      })}
                      className="text-gold-500 focus:ring-gold-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Recevoir les notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={clientForm.preferences.newsletter}
                      onChange={(e) => setClientForm({
                        ...clientForm, 
                        preferences: {...clientForm.preferences, newsletter: e.target.checked}
                      })}
                      className="text-gold-500 focus:ring-gold-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Abonné à la newsletter</span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingClient(null);
                      resetForm();
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-elegant-black hover:bg-gold-600 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    {editingClient ? 'Modifier' : 'Créer le client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Client Detail Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-elegant text-2xl font-bold text-elegant-black">
                    Profil Client - {selectedClient.name}
                  </h2>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-elegant-black mb-4">Informations Personnelles</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        {selectedClient.avatar ? (
                          <img
                            src={selectedClient.avatar}
                            alt={selectedClient.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl font-bold">
                              {selectedClient.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-lg">{selectedClient.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedClient.status)}`}>
                            {selectedClient.status === 'vip' && <Crown className="w-3 h-3 mr-1 inline" />}
                            {getStatusText(selectedClient.status)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><strong>Téléphone:</strong> {selectedClient.phone}</p>
                        <p><strong>Email:</strong> {selectedClient.email || 'Non renseigné'}</p>
                        <p><strong>Adresse:</strong> {selectedClient.address.full || 'Non renseignée'}</p>
                        <p><strong>Ville:</strong> {selectedClient.address.city}</p>
                        <p><strong>Wilaya:</strong> {selectedClient.address.wilaya}</p>
                        <p><strong>Date d'inscription:</strong> {
                          selectedClient.registeredDate?.toDate ? 
                            selectedClient.registeredDate.toDate().toLocaleDateString('fr-FR') : 
                            'Non renseignée'
                        }</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-elegant-black mb-4">Statistiques d'Achat</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span>Nombre de commandes</span>
                          <span className="font-bold text-blue-600">{selectedClient.totalOrders}</span>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span>Total dépensé</span>
                          <PriceDisplay amount={selectedClient.totalSpent} className="font-bold text-green-600" />
                        </div>
                      </div>
                      <div className="bg-gold-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span>Panier moyen</span>
                          <PriceDisplay 
                            amount={selectedClient.totalOrders > 0 ? selectedClient.totalSpent / selectedClient.totalOrders : 0} 
                            className="font-bold text-gold-600" 
                          />
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span>Dernière commande</span>
                          <span className="font-bold text-purple-600">
                            {selectedClient.lastOrderDate?.toDate ? 
                              selectedClient.lastOrderDate.toDate().toLocaleDateString('fr-FR') : 
                              'Aucune'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="mt-6">
                    <h3 className="font-medium text-elegant-black mb-2">Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedClient.notes}</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex space-x-4">
                  <button 
                    onClick={() => startEdit(selectedClient)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                  <button 
                    onClick={() => handleSendWhatsApp(selectedClient)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </button>
                  {selectedClient.status !== 'vip' && (
                    <button
                      onClick={() => handlePromoteToVIP(selectedClient)}
                      className="flex-1 bg-gold-600 hover:bg-gold-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Crown className="h-4 w-4" />
                      <span>Promouvoir VIP</span>
                    </button>
                  )}
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

export default AdminClients;