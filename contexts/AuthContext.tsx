"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  getAdditionalUserInfo,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { addUserToDatabase } from "@/lib/users";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    phoneNumber?: string,
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      await signOut(auth);
      throw new Error("email-not-verified");
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    phoneNumber?: string,
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    // Create the Users/{uid} doc matching the mobile app structure
    await addUserToDatabase(result.user.uid, email, name, phoneNumber || "");
    await sendEmailVerification(result.user);
    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const additionalInfo = getAdditionalUserInfo(result);
    
    // Only add to database if it's a new user
    if (additionalInfo?.isNewUser) {
      const user = result.user;
      await addUserToDatabase(
        user.uid,
        user.email || "",
        user.displayName || "User",
        user.phoneNumber || ""
      );
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
