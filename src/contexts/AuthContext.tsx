'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (userData: RegisterData) => Promise<boolean>;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isEmployee: boolean;
    loading: boolean;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user session
        const storedUser = localStorage.getItem('hrms_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);

        // Simulate API call delay
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (!user || !user.emailVerified) {
            setLoading(false);
            return false;
        }

        const userDocRef = doc(db, 'account', user.uid);
        const userSnapshop = await getDoc(userDocRef);
        const userData = userSnapshop.data();

        if (user) {
            const foundUser: User = {
                id: user.uid,
                email: user.email || '',
                password: password,
                role: 'employee',
                firstName: '',
                lastName: '',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                createdAt: userData ? new Date(userData.createdAt) : new Date(),
                updatedAt: userData ? new Date(userData.dateUpdated) : new Date(),
            }
            setUser(foundUser);
            localStorage.setItem('hrms_user', JSON.stringify(foundUser));
            setLoading(false);
            return true;
        }

        setLoading(false);
        return false;
    };

    const register = async (userData: RegisterData): Promise<boolean> => {
        setLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

        if (!userCredential) {
            setLoading(false);
            return false;
        }

        const user = userCredential.user;

        const userDocRef = doc(db, 'account', user.uid);
        await setDoc(userDocRef, {
            email: userData.email,
            firstName: '',
            lastName: '',
            dateCreated: serverTimestamp(),
            dateUpdated: serverTimestamp(),
        });

        await sendEmailVerification(user);

        const newUser: User = {
            id: user.uid,
            ...userData,
            avatar: userData.role === 'admin'
                ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
                : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setUser(newUser);
        localStorage.setItem('hrms_user', JSON.stringify(newUser));
        setLoading(false);
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hrms_user');
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    const isEmployee = user?.role === 'employee';

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                register,
                isAuthenticated,
                isAdmin,
                isEmployee,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}