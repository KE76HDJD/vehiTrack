'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, User } from '@/types';

interface RoleContextType {
  currentUser: User;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const DEFAULT_USER: User = {
  id: '',
  name: 'Utilisateur',
  role: 'gardien',
  email: '',
  avatar: '👤',
};

const ROLE_AVATARS: Record<UserRole, string> = {
  gardien: '👮',
  manager: '📊',
  employé: '👤',
  administrateur: '⚙️',
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('gardien');
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);

  useEffect(() => {
    const storedRole = localStorage.getItem('role') as UserRole;
    const storedEmail = localStorage.getItem('email') || '';
    const token = localStorage.getItem('access_token');

    if (token && storedRole) {
      const name = storedEmail.split('@')[0] || 'Utilisateur';
      setRoleState(storedRole);
      setCurrentUser({
        id: '',
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: storedRole,
        email: storedEmail,
        avatar: ROLE_AVATARS[storedRole] || '👤',
      });
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    const email = localStorage.getItem('email') || '';
    const name = email.split('@')[0] || 'Utilisateur';
    setCurrentUser({
      id: '',
      name: name.charAt(0).toUpperCase() + name.slice(1),
      role: newRole,
      email,
      avatar: ROLE_AVATARS[newRole] || '👤',
    });
  };

  return (
    <RoleContext.Provider value={{ currentUser, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
}
