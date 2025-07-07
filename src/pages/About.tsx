import React from 'react';
import { Crown, Heart, Award, Users, Truck, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const About: React.FC = () => {
  const { t, isRTL, language } = useLanguage();

  const values = [
    {
      icon: Crown,
      titleFr: 'Excellence',
      titleAr: 'التميز',
      descFr: 'Nous nous engageons à offrir uniquement des produits de la plus haute qualité.',
      descAr: 'نلتزم بتقديم منتجات عالية الجودة فقط.'
    },
    {
      icon: Heart,
      titleFr: 'Passion',
      titleAr: 'الشغف',
      descFr: 'Chaque voile est créé avec amour et dévouement pour l\'art traditionnel.',
      descAr: 'كل حجاب مصنوع بحب وتفان للفن التقليدي.'
    },
    {
      icon: Award,
      titleFr: 'Tradition',
      titleAr: 'التقاليد',
      descFr: 'Nous préservons et célébrons l\'héritage culturel à travers nos créations.',
      descAr: 'نحافظ على التراث الثقافي ونحتفل به من خلال إبداعاتنا.'
    },
    {
      icon: Users,
      titleFr: 'Communauté',
      titleAr: 'المجتمع',
      descFr: 'Nous soutenons les artisans locaux et leur savoir-faire unique.',
      descAr: 'ندعم الحرفيين المحليين ومهاراتهم الفريدة.'
    }
  ];

  const features = [
    {
      icon: Truck,
      titleFr: 'Livraison Rapide',
      titleAr: 'توصيل سريع',
      descFr: 'Livraison dans toute la Mauritanie en 24-48h',
      descAr: 'التوصيل في جميع أنحاء موريتانيا خلال 24-48 ساعة'
    },
    {
      icon: Shield,
      titleFr: 'Qualité Garantie',
      titleAr: 'جودة مضمونة',
      descFr: 'Garantie de satisfaction ou remboursement',
      descAr: 'ضمان الرضا أو استرداد الأموال'
    },
    {
      icon: Heart,
      titleFr: 'Service Client',
      titleAr: 'خدمة العملاء',
      descFr: 'Support client disponible 7j/7',
      descAr: 'دعم العملاء متاح 7 أيام في الأسبوع'
    }
  ];

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'font-arabic' : ''}`}>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-elegant-black to-elegant-gray text-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className={`container mx-auto px-4 relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-elegant text-5xl md:text-6xl font-bold mb-6">
              {language === 'ar' ? 'من نحن' : 'À Propos de Nous'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
              {language === 'ar' 
                ? 'نحن متخصصون في صناعة وبيع الحجاب التقليدي الموريتاني بأعلى معايير الجودة والأناقة'
                : 'Nous sommes spécialisés dans la création et la vente de voiles traditionnels mauritaniens avec les plus hauts standards de qualité et d\'élégance'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="font-elegant text-4xl font-bold text-elegant-black mb-6">
                {language === 'ar' ? 'قصتنا' : 'Notre Histoire'}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {language === 'ar' 
                    ? 'تأسست "حجاب الجمال" من رؤية بسيطة: الحفاظ على التقاليد الجميلة للحجاب الموريتاني مع إضافة لمسة عصرية تناسب المرأة المعاصرة.'
                    : 'Voile Beauté est née d\'une vision simple : préserver les belles traditions du voile mauritanien tout en y apportant une touche moderne qui convient à la femme contemporaine.'
                  }
                </p>
                <p>
                  {language === 'ar' 
                    ? 'منذ تأسيسنا، نعمل مع أمهر الحرفيين المحليين لضمان أن كل قطعة تحكي قصة من التراث والأناقة.'
                    : 'Depuis notre création, nous travaillons avec les artisans locaux les plus talentueux pour nous assurer que chaque pièce raconte une histoire de patrimoine et d\'élégance.'
                  }
                </p>
                <p>
                  {language === 'ar' 
                    ? 'نؤمن أن الحجاب ليس مجرد قطعة قماش، بل هو تعبير عن الهوية والجمال والكرامة.'
                    : 'Nous croyons que le voile n\'est pas seulement un morceau de tissu, mais une expression d\'identité, de beauté et de dignité.'
                  }
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg"
                alt="Notre atelier"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-gold-500 text-elegant-black p-6 rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-sm">
                    {language === 'ar' ? 'سنوات من الخبرة' : 'Années d\'expérience'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-elegant text-4xl font-bold text-elegant-black mb-4">
              {language === 'ar' ? 'قيمنا' : 'Nos Valeurs'}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'القيم التي توجه عملنا وتلهم كل ما نقوم به'
                : 'Les valeurs qui guident notre travail et inspirent tout ce que nous faisons'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  <div className="bg-gold-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:bg-gold-500 transition-colors">
                    <value.icon className="h-10 w-10 text-gold-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-elegant text-xl font-semibold text-elegant-black mb-3">
                    {language === 'ar' ? value.titleAr : value.titleFr}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'ar' ? value.descAr : value.descFr}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-elegant text-4xl font-bold text-elegant-black mb-4">
              {language === 'ar' ? 'لماذا تختارينا؟' : 'Pourquoi Nous Choisir?'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 text-center">
                <div className="bg-elegant-black p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-gold-500" />
                </div>
                <h3 className="font-elegant text-xl font-semibold text-elegant-black mb-3">
                  {language === 'ar' ? feature.titleAr : feature.titleFr}
                </h3>
                <p className="text-gray-600">
                  {language === 'ar' ? feature.descAr : feature.descFr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-elegant-black text-white">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-elegant text-4xl font-bold mb-4">
              {language === 'ar' ? 'فريقنا' : 'Notre Équipe'}
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'فريق من المتخصصين المتفانين في خدمتك'
                : 'Une équipe de professionnels dévoués à votre service'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Fatima Al-Zahra',
                nameAr: 'فاطمة الزهراء',
                role: 'Fondatrice & Directrice Créative',
                roleAr: 'المؤسسة والمديرة الإبداعية',
                image: 'https://images.pexels.com/photos/6463348/pexels-photo-6463348.jpeg'
              },
              {
                name: 'Aicha Mint Ahmed',
                nameAr: 'عائشة بنت أحمد',
                role: 'Responsable Production',
                roleAr: 'مسؤولة الإنتاج',
                image: 'https://images.pexels.com/photos/8159838/pexels-photo-8159838.jpeg'
              },
              {
                name: 'Khadija Ould Sidi',
                nameAr: 'خديجة ولد سيدي',
                role: 'Service Client',
                roleAr: 'خدمة العملاء',
                image: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg'
              }
            ].map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={language === 'ar' ? member.nameAr : member.name}
                    className="w-48 h-48 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gold-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h3 className="font-elegant text-xl font-semibold mb-2">
                  {language === 'ar' ? member.nameAr : member.name}
                </h3>
                <p className="text-gold-500">
                  {language === 'ar' ? member.roleAr : member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;