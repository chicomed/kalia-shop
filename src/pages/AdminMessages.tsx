import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Image as ImageIcon, 
  Phone, 
  Search,
  Filter,
  Clock,
  CheckCircle2
} from 'lucide-react';

const AdminMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const conversations = [
    {
      id: 1,
      clientName: 'Fatima Benali',
      clientPhone: '+222 12 34 56 78',
      lastMessage: 'Bonjour, j\'aimerais savoir si vous avez des voiles en bleu marine?',
      lastMessageTime: '2024-01-15 14:30',
      unreadCount: 2,
      status: 'unread',
      avatar: 'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg',
      messages: [
        {
          id: 1,
          sender: 'client',
          content: 'Bonjour, j\'aimerais savoir si vous avez des voiles en bleu marine?',
          timestamp: '2024-01-15 14:30',
          type: 'text'
        },
        {
          id: 2,
          sender: 'client',
          content: 'Et quels sont vos prix pour les voiles de soirée?',
          timestamp: '2024-01-15 14:32',
          type: 'text'
        }
      ]
    },
    {
      id: 2,
      clientName: 'Aicha Mokhtari',
      clientPhone: '+222 98 76 54 32',
      lastMessage: 'Merci pour votre réponse rapide!',
      lastMessageTime: '2024-01-15 11:15',
      unreadCount: 0,
      status: 'read',
      avatar: 'https://images.pexels.com/photos/8159838/pexels-photo-8159838.jpeg',
      messages: [
        {
          id: 1,
          sender: 'client',
          content: 'Bonjour, ma commande #VB002 a-t-elle été expédiée?',
          timestamp: '2024-01-15 10:30',
          type: 'text'
        },
        {
          id: 2,
          sender: 'admin',
          content: 'Bonjour Aicha, oui votre commande a été expédiée ce matin. Vous devriez la recevoir demain.',
          timestamp: '2024-01-15 10:45',
          type: 'text'
        },
        {
          id: 3,
          sender: 'client',
          content: 'Merci pour votre réponse rapide!',
          timestamp: '2024-01-15 11:15',
          type: 'text'
        }
      ]
    },
    {
      id: 3,
      clientName: 'Khadija Alami',
      clientPhone: '+222 55 44 33 22',
      lastMessage: 'Pouvez-vous me faire une commande personnalisée?',
      lastMessageTime: '2024-01-14 16:20',
      unreadCount: 1,
      status: 'unread',
      avatar: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg',
      messages: [
        {
          id: 1,
          sender: 'client',
          content: 'Pouvez-vous me faire une commande personnalisée?',
          timestamp: '2024-01-14 16:20',
          type: 'text'
        }
      ]
    }
  ];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.clientPhone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: selectedConversation.messages.length + 1,
      sender: 'admin',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    selectedConversation.messages.push(message);
    setNewMessage('');
  };

  const sendWhatsAppMessage = (phone: string, message: string) => {
    const whatsappUrl = `https://wa.me/${phone.replace(/\s+/g, '').replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Conversations List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="font-elegant text-2xl font-bold text-elegant-black mb-4">
              Messages Clients
            </h1>
            
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="all">Toutes</option>
                  <option value="unread">Non lues</option>
                  <option value="read">Lues</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-gold-50 border-gold-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src={conversation.avatar}
                      alt={conversation.clientName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-elegant-black truncate">
                        {conversation.clientName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastMessageTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {conversation.clientPhone}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedConversation.avatar}
                    alt={selectedConversation.clientName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="font-medium text-elegant-black">
                      {selectedConversation.clientName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.clientPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => sendWhatsAppMessage(selectedConversation.clientPhone, 'Bonjour, comment puis-je vous aider?')}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedConversation.messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'admin'
                          ? 'bg-elegant-black text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p>{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${
                          message.sender === 'admin' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.sender === 'admin' && (
                          <CheckCircle2 className="h-3 w-3 text-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white p-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-elegant-black hover:bg-gold-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-500">
                  Choisissez une conversation pour commencer à discuter avec vos clients
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;