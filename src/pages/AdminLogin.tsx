import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithGoogle, user, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in as admin
    if (user && userProfile?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, userProfile, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      navigate('/admin');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-black via-elegant-dark to-elegant-gray flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="bg-gold-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Crown className="h-10 w-10 text-gold-600" />
          </div>
          <h1 className="font-elegant text-3xl font-bold text-elegant-black mb-2">
            Administration
          </h1>
          <p className="text-gray-600">
            Connexion réservée aux administrateurs
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-4 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
          ) : (
            <>
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuer avec Google</span>
            </>
          )}
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Seuls les administrateurs autorisés peuvent accéder à cette section.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors"
          >
            ← Retour au site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;