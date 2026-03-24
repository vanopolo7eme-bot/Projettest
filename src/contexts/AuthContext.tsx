import React, { createContext, useContext, useState, useCallback } from 'react';
import { demoUsers } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((email, password) => {
    const found = demoUsers.find(u => u.email === email);
    if (found) {
      setUser(found);
      setIsAuthenticated(true);
      return true;
    }
    // Fallback for demo: accept any credentials and use DG
    setUser(demoUsers[0]);
    setIsAuthenticated(true);
    return true;
  }, []);

  const loginAsDemo = useCallback((userId) => {
    const found = demoUsers.find(u => u.id === userId);
    if (found) {
      setUser(found);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginAsDemo, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
