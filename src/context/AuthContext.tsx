import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
  isSuspended: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  updateUserBio: (displayName: string, bio: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'millerhardcore927@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile from Firestore
  const syncProfile = async (fbUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      const isDefaultAdmin = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // If bootstrapped admin, ensure role is admin
        if (isDefaultAdmin && data.role !== 'admin') {
          const updated: UserProfile = { ...data, role: 'admin' };
          await updateDoc(userDocRef, { role: 'admin' });
          setUserProfile(updated);
        } else {
          setUserProfile(data);
        }
      } else {
        // Create initial profile doc
        const initialRole: UserRole = isDefaultAdmin ? 'admin' : 'member';
        const newProfile: UserProfile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'ผู้ใช้งาน',
          email: fbUser.email || '',
          role: initialRole,
          status: 'active',
          photoURL: fbUser.photoURL || '',
          bio: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);

        // Also add to /admins/{uid} if bootstrapped admin
        if (isDefaultAdmin) {
          try {
            await setDoc(doc(db, 'admins', fbUser.uid), {
              email: fbUser.email,
              createdAt: new Date().toISOString(),
            });
          } catch {
            // ignore if rules already restrict
          }
        }
      }
    } catch (err) {
      console.error('Error syncing user profile:', err);
      // Fallback local representation
      const isDefaultAdmin = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      setUserProfile({
        uid: fbUser.uid,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'ผู้ใช้งาน',
        email: fbUser.email || '',
        role: isDefaultAdmin ? 'admin' : 'member',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await syncProfile(cred.user);
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(cred.user, {
      displayName: name.trim(),
    });
    // Send real email verification
    try {
      await sendEmailVerification(cred.user);
    } catch (err) {
      console.warn('Email verification send issue:', err);
    }
    await syncProfile(cred.user);
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncProfile(cred.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendEmailVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const updateUserBio = async (displayName: string, bio: string) => {
    if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        bio: bio.trim(),
        updatedAt: new Date().toISOString(),
      });
      setUserProfile((prev) =>
        prev ? { ...prev, displayName: displayName.trim(), bio: bio.trim() } : null
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await syncProfile(user);
    }
  };

  const isSuspended = userProfile?.status === 'suspended';
  const isAdmin = userProfile?.role === 'admin' || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isModerator = isAdmin || userProfile?.role === 'moderator';
  const isMember = !!user && !isSuspended;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        isModerator,
        isMember,
        isSuspended,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        resendEmailVerification,
        updateUserBio,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
