'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/services/auth.service';
import WelcomeModal from '@/components/modals/WelcomeModal';
import { profileService } from '@/lib/services/profile.service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  faculty?: string;
  hasCompletedSorting: boolean;
  hasAcceptedRules: boolean;
  hasSeenWelcomeModal?: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Перевірити чи користувач залогінений при завантаженні
    checkAuth();
  }, []);

  useEffect(() => {
    // Показати welcome modal якщо користувач вперше логінився і має факультет
    if (user && !user.hasSeenWelcomeModal && user.faculty) {
      console.log('Showing welcome modal for user:', user.email, 'faculty:', user.faculty);
      setShowWelcomeModal(true);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    }
  };

  const handleWelcomeModalClose = async () => {
    setShowWelcomeModal(false);
    // Оновити в базі, що користувач побачив модальне вікно
    try {
      await profileService.updateProfile({ hasSeenWelcomeModal: true });
      await refreshUser();
    } catch (error) {
      console.error('Failed to update welcome modal status:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
      {user && user.faculty && (
        <WelcomeModal
          isOpen={showWelcomeModal}
          faculty={user.faculty}
          onClose={handleWelcomeModalClose}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
