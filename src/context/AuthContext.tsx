import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getCustomerMe, getAdminMe, customerLogout as apiCustomerLogout, adminLogout as apiAdminLogout } from '../services/api';

interface AuthContextType {
  customer: User | null;
  admin: User | null;
  isAdminAuthenticated: boolean;
  isCustomerAuthenticated: boolean;
  loading: boolean;
  setCustomerUser: (user: User | null, token?: string) => void;
  setAdminUser: (user: User | null, token?: string) => void;
  logoutCustomer: () => Promise<void>;
  logoutAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      // 1. Check Customer
      const custToken = localStorage.getItem('khatwa_token');
      if (custToken) {
        try {
          const { user } = await getCustomerMe();
          setCustomer(user);
          if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
            setAdmin(user);
            localStorage.setItem('khatwa_admin_token', custToken);
          }
        } catch (e) {
          localStorage.removeItem('khatwa_token');
          setCustomer(null);
        }
      }

      // 2. Check Admin
      const adminToken = localStorage.getItem('khatwa_admin_token');
      if (adminToken) {
        try {
          const { user } = await getAdminMe();
          setAdmin(user);
        } catch (e) {
          localStorage.removeItem('khatwa_admin_token');
          setAdmin(null);
        }
      }

      setLoading(false);
    }

    loadSessions();
  }, []);

  const setCustomerUser = (user: User | null, token?: string) => {
    setCustomer(user);
    if (token) {
      localStorage.setItem('khatwa_token', token);
    } else if (!user) {
      localStorage.removeItem('khatwa_token');
    }

    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      setAdmin(user);
      if (token) {
        localStorage.setItem('khatwa_admin_token', token);
      }
    }
  };

  const setAdminUser = (user: User | null, token?: string) => {
    setAdmin(user);
    if (token) {
      localStorage.setItem('khatwa_admin_token', token);
    } else if (!user) {
      localStorage.removeItem('khatwa_admin_token');
    }
  };

  const logoutCustomer = async () => {
    try {
      await apiCustomerLogout();
    } catch (e) {
      // silent
    }
    localStorage.removeItem('khatwa_token');
    setCustomer(null);
  };

  const logoutAdmin = async () => {
    try {
      await apiAdminLogout();
    } catch (e) {
      // silent
    }
    localStorage.removeItem('khatwa_admin_token');
    setAdmin(null);
  };

  const isAdmin = !!admin || (!!customer && (customer.role === 'SUPER_ADMIN' || customer.role === 'ADMIN'));

  return (
    <AuthContext.Provider
      value={{
        customer,
        admin: admin || (customer && (customer.role === 'SUPER_ADMIN' || customer.role === 'ADMIN') ? customer : null),
        isAdminAuthenticated: isAdmin,
        isCustomerAuthenticated: !!customer,
        loading,
        setCustomerUser,
        setAdminUser,
        logoutCustomer,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
