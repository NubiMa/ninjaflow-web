"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User, onAuthStateChanged, signOut,
  GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, getAdditionalUserInfo,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { upsertUserProfile } from "@/lib/db";
import { useRouter } from "next/navigation";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (isSignUp?: boolean) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async (isSignUp = false) => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const additionalInfo = getAdditionalUserInfo(cred);

    if (!isSignUp && additionalInfo?.isNewUser) {
      await cred.user.delete();
      await signOut(auth);
      throw new Error("auth/user-not-found");
    }

    if (isSignUp || additionalInfo?.isNewUser) {
      await upsertUserProfile(cred.user.uid, {
        uid: cred.user.uid,
        displayName: cred.user.displayName ?? "Ninja User",
        email: cred.user.email ?? "",
        photoURL: cred.user.photoURL ?? undefined,
      });
    }
    router.push("/dashboard");
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    router.push("/dashboard");
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await upsertUserProfile(cred.user.uid, {
      uid: cred.user.uid,
      displayName: name,
      email,
      currency: "IDR",
      monthlyBudget: 5000000,
    });
    router.push("/dashboard");
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
