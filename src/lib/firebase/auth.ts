import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserProfile } from '@/types';

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('Perfil do usuário não encontrado');
    }
    
    const userData = userDoc.data();
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || userData.nome,
      role: userData.role,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

export const signUp = async (
  email: string,
  password: string,
  nome: string,
  role: 'administrador' | 'cliente' = 'cliente'
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update Firebase Auth profile
    await updateProfile(user, { displayName: nome });
    
    // Create user document in Firestore
    const now = new Date();
    const userData: UserProfile = {
      uid: user.uid,
      nome,
      email,
      role,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      uid: user.uid,
      email: user.email!,
      displayName: nome,
      role,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return null;
    }
    
    const data = userDoc.data();
    return {
      uid: data.uid,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      endereco: data.endereco,
      documento: data.documento,
      role: data.role,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(callback);
};
