import React, {createContext, useContext, useState, useEffect} from 'react';
import {
    User,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import {auth} from '../firebase/config';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Single admin email
// const ADMIN_EMAIL = 'chaloueimin@gmail.com';

const ADMIN_EMAILS = [
    'chaloueimin@gmail.com',
    'chicomed9@gmail.com',
    'nourdine2177@gmail.com',
]
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // const isAdmin = user?.email === ADMIN_EMAIL;

    const isAdmin = ADMIN_EMAILS.includes(user?.email || '');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async (): Promise<void> => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        signOut,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};