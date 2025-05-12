// client/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }
    const { id, exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) {
      localStorage.removeItem('token');
      setUser(null);
      setAuthLoading(false);
      return;
    }
    axios
      .get(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const me = res.data;
        me.id = me._id;
        if (me.profileImage) {
          me.profileImage = `/api/users/avatar/${me.profileImage}`;
        }
        setUser(me);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const login = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const { id } = jwtDecode(token);
    axios
      .get(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const me = res.data;
        me.id = me._id;
        if (me.profileImage) {
          me.profileImage = `/api/users/avatar/${me.profileImage}`;
        }
        setUser(me);
      });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
