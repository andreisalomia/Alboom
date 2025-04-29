import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  });

  const login = () => {
    const newToken = localStorage.getItem('token');
    setUser(jwtDecode(newToken));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    if (user?.exp) {
      const timeout = (user.exp * 1000) - Date.now();
      if (timeout > 0) {
        const timer = setTimeout(logout, timeout);
        return () => clearTimeout(timer);
      } else {
        logout();
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('fct asta merge folosita doat in AuthProvider');
  }
  return context;
};