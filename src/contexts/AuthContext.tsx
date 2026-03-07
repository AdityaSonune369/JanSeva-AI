import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import {
    onAuthStateChanged,
    type User,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    isGuest: boolean;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = () => {
        setIsGuest(false);
        return signOut(auth);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setIsGuest(false);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const continueAsGuest = () => {
        setIsGuest(true);
    };

    const value = {
        currentUser,
        loading,
        isGuest,
        logout,
        loginWithGoogle,
        continueAsGuest
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
