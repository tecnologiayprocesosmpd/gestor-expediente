import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserProfile = 'mesa-entrada' | 'oficina';
export type UserRole = 'mesa' | 'oficina';

interface User {
  profile: UserProfile;
  role: UserRole;
  name: string;
  department?: string;
  hasSelectedAccess?: boolean;
  selectedArea?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  selectAccess: (areaId: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  const setUser = (userData: User) => {
    setUserState(userData);
  };

  const selectAccess = (areaId: string) => {
    if (user) {
      setUserState({
        ...user,
        hasSelectedAccess: true,
        selectedArea: areaId
      });
    }
  };

  const logout = () => {
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, selectAccess, logout }}>
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