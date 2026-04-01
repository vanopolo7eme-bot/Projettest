import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { demoUsers } from '../data/mockData';

const rolePermissions = {
  'Direction Générale': {
    modules: ['dashboard', 'erp', 'academique', 'finance', 'ged', 'communication', 'admissions', 'tableaux-de-bord', 'parametres'],
    permissions: ['view_all_establishments', 'manage_establishments', 'view_all_students', 'manage_students', 'view_grades', 'manage_grades', 'view_finances', 'manage_finances', 'view_absences', 'manage_absences', 'view_admissions', 'manage_admissions', 'view_documents', 'manage_documents', 'send_messages', 'view_reports', 'manage_settings', 'export_data'],
  },
  'Directeur d\'Établissement': {
    modules: ['dashboard', 'erp', 'academique', 'finance', 'ged', 'communication', 'admissions', 'tableaux-de-bord', 'parametres'],
    permissions: ['view_own_establishment', 'view_all_students', 'manage_students', 'view_grades', 'manage_grades', 'view_finances', 'manage_finances', 'view_absences', 'manage_absences', 'view_admissions', 'manage_admissions', 'view_documents', 'manage_documents', 'send_messages', 'view_reports', 'export_data'],
  },
  'Enseignant': {
    modules: ['dashboard', 'erp', 'academique', 'communication'],
    permissions: ['view_own_classes', 'view_grades', 'manage_own_grades', 'view_absences', 'manage_own_absences', 'view_documents', 'send_messages'],
  },
  'Administration Scolaire': {
    modules: ['dashboard', 'erp', 'academique', 'finance', 'ged', 'communication', 'admissions'],
    permissions: ['view_all_students', 'manage_students', 'view_grades', 'view_finances', 'manage_finances', 'view_absences', 'view_admissions', 'manage_admissions', 'view_documents', 'manage_documents', 'send_messages', 'export_data'],
  },
  'Parent': {
    modules: ['dashboard', 'academique', 'finance', 'communication', 'ged', 'admissions'],
    permissions: ['view_own_children', 'view_grades', 'view_absences', 'view_finances', 'make_payments', 'send_messages', 'view_documents', 'view_admissions'],
  },
  'Élève': {
    modules: ['dashboard', 'academique', 'communication'],
    permissions: ['view_own_data', 'view_grades', 'view_absences', 'send_messages', 'view_documents'],
  },
};

const SESSION_KEY = 'leguide_session_userId';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem(SESSION_KEY);
    if (storedUserId) {
      const found = demoUsers.find(u => u.id === Number(storedUserId));
      if (found) {
        setUser(found);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const login = useCallback((email, password) => {
    const found = demoUsers.find(u => u.email === email);
    if (found) {
      setUser(found);
      setIsAuthenticated(true);
      localStorage.setItem(SESSION_KEY, String(found.id));
      return true;
    }
    // Fallback for demo: accept any credentials and use DG
    setUser(demoUsers[0]);
    setIsAuthenticated(true);
    localStorage.setItem(SESSION_KEY, String(demoUsers[0].id));
    return true;
  }, []);

  const loginAsDemo = useCallback((userId) => {
    const found = demoUsers.find(u => u.id === userId);
    if (found) {
      setUser(found);
      setIsAuthenticated(true);
      localStorage.setItem(SESSION_KEY, String(found.id));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  }, [user]);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    const roleDef = rolePermissions[user.role];
    if (!roleDef) return false;
    return roleDef.permissions.includes(permission);
  }, [user]);

  const canAccessModule = useCallback((module) => {
    if (!user) return false;
    const roleDef = rolePermissions[user.role];
    if (!roleDef) return false;
    return roleDef.modules.includes(module);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginAsDemo, logout, hasRole, hasPermission, canAccessModule }}>
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
