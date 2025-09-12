import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserProfile = 'mesa-entrada' | 'oficina';
export type UserRole = 'mesa' | 'oficina';

interface User {
  profile: UserProfile;
  role: UserRole;
  name: string;
  department?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  // Escuchar cambios en el token para limpiar el perfil cuando se hace logout
  useEffect(() => {
    const checkAuthToken = () => {
      const token = localStorage.getItem('auth_token');
      if (!token && user) {
        // Si no hay token pero hay usuario, limpiar el estado
        setUserState(null);
      }
    };

    // Verificar inmediatamente
    checkAuthToken();

    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkAuthToken);
    
    // Polling cada segundo para detectar cambios en la misma pestaña
    const interval = setInterval(checkAuthToken, 1000);

    return () => {
      window.removeEventListener('storage', checkAuthToken);
      clearInterval(interval);
    };
  }, [user]);

  const setUser = (userData: User) => {
    setUserState(userData);
    // NO persistir el perfil - debe seleccionarse en cada sesión
  };

  const logout = () => {
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}