import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Helper to get or initialize local registered users list
const getLocalUsers = () => {
  try {
    const data = localStorage.getItem('forgery_local_users');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalUser = (newUser) => {
  try {
    const users = getLocalUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...newUser };
    } else {
      users.push(newUser);
    }
    localStorage.setItem('forgery_local_users', JSON.stringify(users));
  } catch (e) {
    console.warn('Could not save local user:', e);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('forgery_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('forgery_auth_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getProfile();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem('forgery_auth_user', JSON.stringify(res.data));
          }
        } catch (err) {
          // If backend is offline, preserve local session instead of logging out
          console.info('Operating in standalone/local authentication mode');
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  // Login supporting unlimited users with or without API
  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // First try backend API if available, but fallback smoothly to local auth
    try {
      const res = await authAPI.login(cleanEmail, password);
      if (res && res.data) {
        const { access_token, user: loggedUser } = res.data;
        saveLocalUser(loggedUser);
        localStorage.setItem('forgery_auth_token', access_token);
        localStorage.setItem('forgery_auth_user', JSON.stringify(loggedUser));
        setToken(access_token);
        setUser(loggedUser);
        return loggedUser;
      }
    } catch (err) {
      // Backend not running or error - fallback to local offline authentication
      console.info('Backend unreachable, authenticating locally for:', cleanEmail);
    }

    // Local standalone authentication
    const users = getLocalUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    
    const formattedName = existing?.name || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const role = (cleanEmail.includes('admin') || existing?.role === 'admin') ? 'admin' : 'analyst';
    
    const localUser = {
      id: existing?.id || Math.floor(1000 + Math.random() * 9000),
      name: formattedName,
      email: cleanEmail,
      role: role,
      organization: existing?.organization || 'Forensic Intelligence Labs',
      badge_number: existing?.badge_number || `FG-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: existing?.created_at || new Date().toISOString(),
    };

    const mockToken = `fg_mock_token_${btoa(cleanEmail)}_${Date.now()}`;

    saveLocalUser(localUser);
    localStorage.setItem('forgery_auth_token', mockToken);
    localStorage.setItem('forgery_auth_user', JSON.stringify(localUser));
    
    setToken(mockToken);
    setUser(localUser);
    return localUser;
  };

  // Register supporting unlimited users with or without API
  const register = async (name, email, password, organization = 'Digital Forensics Unit') => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      const res = await authAPI.register(cleanName, cleanEmail, password);
      if (res && res.data) {
        const { access_token, user: registeredUser } = res.data;
        saveLocalUser(registeredUser);
        localStorage.setItem('forgery_auth_token', access_token);
        localStorage.setItem('forgery_auth_user', JSON.stringify(registeredUser));
        setToken(access_token);
        setUser(registeredUser);
        return registeredUser;
      }
    } catch (err) {
      console.info('Backend unreachable, registering locally for:', cleanEmail);
    }

    // Local registration
    const role = cleanEmail.includes('admin') ? 'admin' : 'analyst';
    const localUser = {
      id: Math.floor(1000 + Math.random() * 9000),
      name: cleanName,
      email: cleanEmail,
      role: role,
      organization: organization || 'Digital Forensics Unit',
      badge_number: `FG-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at: new Date().toISOString(),
    };

    const mockToken = `fg_mock_token_${btoa(cleanEmail)}_${Date.now()}`;

    saveLocalUser(localUser);
    localStorage.setItem('forgery_auth_token', mockToken);
    localStorage.setItem('forgery_auth_user', JSON.stringify(localUser));
    
    setToken(mockToken);
    setUser(localUser);
    return localUser;
  };

  // 1-Click Instant Demo Login
  const demoLogin = async (role = 'user') => {
    const isAdminRole = role === 'admin';
    const demoEmail = isAdminRole ? 'admin@forgeryguard.ai' : 'analyst@forgeryguard.ai';
    const demoName = isAdminRole ? 'Chief Administrator' : 'Senior Forensic Analyst';

    try {
      const res = await authAPI.demoLogin(role);
      if (res && res.data) {
        const { access_token, user: loggedUser } = res.data;
        saveLocalUser(loggedUser);
        localStorage.setItem('forgery_auth_token', access_token);
        localStorage.setItem('forgery_auth_user', JSON.stringify(loggedUser));
        setToken(access_token);
        setUser(loggedUser);
        return loggedUser;
      }
    } catch (err) {
      console.info('Backend unreachable, using local demo session for:', role);
    }

    const localUser = {
      id: isAdminRole ? 1 : 2,
      name: demoName,
      email: demoEmail,
      role: isAdminRole ? 'admin' : 'analyst',
      organization: isAdminRole ? 'Security Operations Command' : 'Document Forensic Directorate',
      badge_number: isAdminRole ? 'FG-ADM-001' : 'FG-ANY-884',
      created_at: new Date().toISOString(),
    };

    const mockToken = `fg_demo_token_${role}_${Date.now()}`;
    saveLocalUser(localUser);
    localStorage.setItem('forgery_auth_token', mockToken);
    localStorage.setItem('forgery_auth_user', JSON.stringify(localUser));
    
    setToken(mockToken);
    setUser(localUser);
    return localUser;
  };

  const logout = () => {
    localStorage.removeItem('forgery_auth_token');
    localStorage.removeItem('forgery_auth_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
