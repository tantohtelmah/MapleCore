import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserInfo {
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: UserInfo | null;
  login: (token: string, refreshToken: string, email: string, roles: string[]) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const email = localStorage.getItem('email');
    const roles = localStorage.getItem('roles');

    if (token && email && roles) {
      setUser({
        email,
        roles: JSON.parse(roles)
      });
    }
  }, []);

  const login = (token: string, refreshToken: string, email: string, roles: string[]) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('email', email);
    localStorage.setItem('roles', JSON.stringify(roles));
    setUser({ email, roles });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('email');
    localStorage.removeItem('roles');
    setUser(null);
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};
