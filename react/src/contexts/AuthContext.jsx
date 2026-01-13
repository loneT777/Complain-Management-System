import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      const storedPermissions = localStorage.getItem('userPermissions');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
          setIsAuthenticated(true);
          
          // Fetch fresh user data
          const response = await axios.get('/me');
          if (response.data) {
            setUser(response.data.user);
            setPermissions(response.data.permissions || []);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions || []));
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, userPermissions, token) => {
    setUser(userData);
    setPermissions(userPermissions || []);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userPermissions', JSON.stringify(userPermissions || []));
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('sessionId');
  };

  const refreshPermissions = async () => {
    try {
      const response = await axios.get('/me');
      if (response.data) {
        setUser(response.data.user);
        setPermissions(response.data.permissions || []);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions || []));
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      return false;
    }
  };

  const hasPermission = (permissionCode) => {
    if (!user) return false;
    // Super admin has all permissions
    if (user.role?.code === 'super_admin') return true;
    return permissions.includes(permissionCode);
  };

  const hasAnyPermission = (permissionCodes) => {
    if (!user) return false;
    if (user.role?.code === 'super_admin') return true;
    return permissionCodes.some(code => permissions.includes(code));
  };

  const hasAllPermissions = (permissionCodes) => {
    if (!user) return false;
    if (user.role?.code === 'super_admin') return true;
    return permissionCodes.every(code => permissions.includes(code));
  };

  const value = {
    user,
    permissions,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
