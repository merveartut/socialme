import { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const provider = new GoogleAuthProvider();

export const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-800 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-700 p-8 rounded space-y-4 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold">
          {isRegister ? "Sign Up" : "Login"}
        </h1>

        {error && <div className="text-red-400">{error}</div>}

        <input
          className="w-full p-2 rounded bg-zinc-600 text-white"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 rounded bg-zinc-600 text-white"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 py-2 rounded" type="submit">
          {isRegister ? "Create Account" : "Login"}
        </button>

        <div className="text-sm text-gray-300 text-center">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Sign Up"}
          </button>
        </div>

        <div className="flex items-center justify-center pt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 py-2 rounded text-white"
          >
            Continue with Google
          </button>
        </div>
      </form>
    </div>
  );
};
