// src/components/Auth.tsx
import React, { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

export const Auth = ({ onUser }: any) => {
  const [user, setUser] = useState(null);

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
