import { Navigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser, isGuest } = useAuth();

    if (!currentUser && !isGuest) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};
