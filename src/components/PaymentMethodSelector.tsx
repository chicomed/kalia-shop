import React from 'react';
import { CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

export interface PaymentMethod {
  id: string;
  name: string;
  nameAr?: string;
  icon: React.ReactNode;
  color: string;
  instructions?: string;
  instructionsAr?: string;
  accountNumber?: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onChange: (method: string) => void;
  showInstructions?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onChange,
  showInstructions = true
}) => {
  const { language } = useLanguage();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'sadad',
      name: 'Sadad',
      nameAr: 'سداد',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-blue-500',
      instructions: 'Envoyez le montant au numéro Sadad: 12345678',
      instructionsAr: 'أرسل المبلغ إلى رقم سداد: 12345678',
      accountNumber: '12345678'
    },
    {
      id: 'bankily',
      name: 'Bankily',
      nameAr: 'بنكيلي',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-green-500',
      instructions: 'Envoyez le montant au numéro Bankily: 87654321',
      instructionsAr: 'أرسل المبلغ إلى رقم بنكيلي: 87654321',
      accountNumber: '87654321'
    },
    {
      id: 'masrivi',
      name: 'Masrivi',
      nameAr: 'مصرفي',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-purple-500',
      instructions: 'Envoyez le montant au numéro Masrivi: 11223344',
      instructionsAr: 'أرسل المبلغ إلى رقم مصرفي: 11223344',
      accountNumber: '11223344'
    },
    {
      id: 'bimbanque',
      name: 'Bimbanque',
      nameAr: 'بيم بنك',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-orange-500',
      instructions: 'Envoyez le montant au numéro Bimbanque: 55667788',
      instructionsAr: 'أرسل المبلغ إلى رقم بيم بنك: 55667788',
      accountNumber: '55667788'
    },
    {
      id: 'click',
      name: 'Click',
      nameAr: 'كليك',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-red-500',
      instructions: 'Envoyez le montant au numéro Click: 99887766',
      instructionsAr: 'أرسل المبلغ إلى رقم كليك: 99887766',
      accountNumber: '99887766'
    },
    {
      id: 'cash',
      name: 'Espèces',
      nameAr: 'نقدا',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-gray-500',
      instructions: 'Paiement en espèces à la livraison',
      instructionsAr: 'الدفع نقدا عند التسليم'
    }
  ];

  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod) || paymentMethods[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
              selectedMethod === method.id
                ? `border-${method.color.split('-')[1]}-500 bg-${method.color.split('-')[1]}-50`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`${method.color} text-white p-2 rounded-full`}>
              {method.icon}
            </div>
            <span className="font-medium">
              {language === 'ar' ? method.nameAr : method.name}
            </span>
          </button>
        ))}
      </div>

      {showInstructions && selectedPaymentMethod && selectedPaymentMethod.id !== 'cash' && (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            {language === 'ar' ? 'تعليمات الدفع:' : 'Instructions de paiement:'}
          </h4>
          <p className="text-sm text-blue-800">
            {language === 'ar' ? selectedPaymentMethod.instructionsAr : selectedPaymentMethod.instructions}
          </p>
          {selectedPaymentMethod.accountNumber && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm font-bold text-blue-800">{selectedPaymentMethod.accountNumber}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedPaymentMethod.accountNumber || '');
                  toast.success('Numéro copié!');
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {language === 'ar' ? 'نسخ' : 'Copier'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;