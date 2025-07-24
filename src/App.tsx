import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { ChatPage } from "./pages/ChatPage";
import { Auth } from "./components/Auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { AuthPage } from "./pages/AuthPage";
import { doc, getDoc, setDoc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
          });
        }
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="text-white p-10">Loading...</div>;

  if (!user) return <AuthPage />;

  return <ChatPage currentUser={user} />;
}

export default App;
