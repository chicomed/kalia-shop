import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmDialog({
      isOpen: true,
      title: language === 'ar' ? 'إرسال الرسالة' : 'Envoyer le message',
      message: language === 'ar' 
        ? 'هل أنت متأكد من إرسال هذه الرسالة؟'
        : 'Êtes-vous sûr de vouloir envoyer ce message ?',
      type: 'info',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        setIsSubmitting(true);
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success(
          language === 'ar' 
            ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
            : 'Votre message a été envoyé avec succès! Nous vous contacterons bientôt.'
        );
        
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        setIsSubmitting(false);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      titleFr: 'Adresse',
      titleAr: 'العنوان',
      valueFr: 'Tevragh Zeina, Nouakchott, Mauritanie',
      valueAr: 'تفرغ زينة، نواكشوط، موريتانيا'
    },
    {
      icon: Phone,
      titleFr: 'Téléphone',
      titleAr: 'الهاتف',
      valueFr: '+222 12 34 56 78',
      valueAr: '+222 12 34 56 78'
    },
    {
      icon: Mail,
      titleFr: 'Email',
      titleAr: 'البريد الإلكتروني',
      valueFr: 'contact@voilebeaute.mr',
      valueAr: 'contact@voilebeaute.mr'
    },
    {
      icon: Clock,
      titleFr: 'Horaires',
      titleAr: 'ساعات العمل',
      valueFr: 'Lun-Sam: 9h-18h',
      valueAr: 'الإثنين-السبت: 9ص-6م'
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : ''}`}>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-elegant-black to-elegant-gray text-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className={`container mx-auto px-4 relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-elegant text-5xl md:text-6xl font-bold mb-6">
              {language === 'ar' ? 'اتصل بنا' : 'Contactez-Nous'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
              {language === 'ar' 
                ? 'نحن هنا لمساعدتك. تواصل معنا لأي استفسار أو طلب خاص'
                : 'Nous sommes là pour vous aider. Contactez-nous pour toute question ou demande spéciale'
              }
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="font-elegant text-2xl font-bold text-elegant-black mb-8">
                {language === 'ar' ? 'معلومات الاتصال' : 'Informations de Contact'}
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-gold-100 p-3 rounded-lg">
                      <info.icon className="h-6 w-6 text-gold-600" />
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="font-medium text-elegant-black mb-1">
                        {language === 'ar' ? info.titleAr : info.titleFr}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'ar' ? info.valueAr : info.valueFr}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp Button */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <a
                  href="https://wa.me/22212345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>
                    {language === 'ar' ? 'تواصل عبر واتساب' : 'Contacter via WhatsApp'}
                  </span>
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 bg-white p-4 rounded-2xl shadow-lg">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>{language === 'ar' ? 'خريطة الموقع' : 'Carte de localisation'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="font-elegant text-2xl font-bold text-elegant-black mb-8">
                {language === 'ar' ? 'أرسل لنا رسالة' : 'Envoyez-nous un Message'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Entrez votre nom complet'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Entrez votre email'}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'رقم الهاتف' : 'Téléphone'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={language === 'ar' ? 'أدخل رقم هاتفك' : 'Entrez votre numéro'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الموضوع' : 'Sujet'}
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      <option value="">
                        {language === 'ar' ? 'اختر الموضوع' : 'Choisissez un sujet'}
                      </option>
                      <option value="general">
                        {language === 'ar' ? 'استفسار عام' : 'Question générale'}
                      </option>
                      <option value="order">
                        {language === 'ar' ? 'حول طلب' : 'À propos d\'une commande'}
                      </option>
                      <option value="custom">
                        {language === 'ar' ? 'طلب مخصص' : 'Commande personnalisée'}
                      </option>
                      <option value="complaint">
                        {language === 'ar' ? 'شكوى' : 'Réclamation'}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Écrivez votre message ici...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-elegant-black hover:bg-gold-600 text-white py-4 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{language === 'ar' ? 'جاري الإرسال...' : 'Envoi en cours...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>{language === 'ar' ? 'إرسال الرسالة' : 'Envoyer le Message'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-elegant text-3xl font-bold text-elegant-black mb-4">
              {language === 'ar' ? 'الأسئلة الشائعة' : 'Questions Fréquentes'}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                questionFr: 'Quels sont vos délais de livraison?',
                questionAr: 'ما هي مدة التوصيل؟',
                answerFr: 'Nous livrons dans toute la Mauritanie en 24-48h pour Nouakchott et 2-5 jours pour les autres régions.',
                answerAr: 'نوصل في جميع أنحاء موريتانيا خلال 24-48 ساعة لنواكشوط و2-5 أيام للمناطق الأخرى.'
              },
              {
                questionFr: 'Acceptez-vous les commandes personnalisées?',
                questionAr: 'هل تقبلون الطلبات المخصصة؟',
                answerFr: 'Oui, nous proposons des services de personnalisation. Contactez-nous pour discuter de vos besoins spécifiques.',
                answerAr: 'نعم، نقدم خدمات التخصيص. تواصل معنا لمناقشة احتياجاتك الخاصة.'
              },
              {
                questionFr: 'Quelle est votre politique de retour?',
                questionAr: 'ما هي سياسة الإرجاع؟',
                answerFr: 'Nous acceptons les retours dans les 7 jours suivant la livraison si le produit n\'a pas été porté.',
                answerAr: 'نقبل الإرجاع خلال 7 أيام من التوصيل إذا لم يتم ارتداء المنتج.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium text-elegant-black mb-2">
                  {language === 'ar' ? faq.questionAr : faq.questionFr}
                </h3>
                <p className="text-gray-600">
                  {language === 'ar' ? faq.answerAr : faq.answerFr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
  );
};

export default Contact;