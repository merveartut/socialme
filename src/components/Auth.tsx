// src/components/Auth.tsx
import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

export const Auth = ({ onUser }: { onUser: (user: User | null) => void }) => {
  const [user, setUser] = useState<User | null>(null);

  const provider = new GoogleAuthProvider();

  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    onUser(result.user);
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
    onUser(null);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      onUser(u);
    });
    return () => unsub();
  }, []);

  return user ? (
    <button onClick={logout}>Logout</button>
  ) : (
    <button onClick={login}>Login with Google</button>
  );
};
