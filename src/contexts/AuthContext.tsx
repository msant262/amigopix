import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOutUser,
  resetPassword,
  updateUserProfile,
  getUserProfile,
  onAuthStateChanged,
} from '@/lib/firebase/auth';
import { User, UserProfile, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          
          if (profile) {
            setUserProfile(profile);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || profile.nome,
              role: profile.role,
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt,
            });
          }
        } catch (error) {
          console.error('Erro ao carregar perfil do usuário:', error);
          setUser(null);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const userData = await firebaseSignIn(email, password);
      setUser(userData);
      
      const profile = await getUserProfile(userData.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    nome: string,
    role: 'administrador' | 'cliente' = 'cliente'
  ): Promise<void> => {
    try {
      setLoading(true);
      const userData = await firebaseSignUp(email, password, nome, role);
      setUser(userData);
      
      const profile = await getUserProfile(userData.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOutUser();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (email: string): Promise<void> => {
    try {
      await resetPassword(email);
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      await updateUserProfile(user.uid, data);
      
      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data, updatedAt: new Date() });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword: resetUserPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
