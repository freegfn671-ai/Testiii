import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const loginFn = useAuthStore(state => state.login);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferredBy(ref);
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let dbUserData = { role: 'user' };
        if (userDocSnap.exists()) {
          dbUserData = userDocSnap.data();
        }
        
        loginFn(userCredential.user, dbUserData);
        
        if (dbUserData.role === 'admin') navigate("/admin");
        else if (dbUserData.role === 'manager') navigate("/manager");
        else navigate("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Setup initial user document
        const role = email.toLowerCase() === "admin@admin.com" || email.toLowerCase() === "alexmargania31@gmail.com" ? "admin" : "user";
        const referralCode = "QG" + Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const dbUserData = {
          id: userCredential.user.uid,
          email,
          name,
          role,
          referralCode,
          referredBy: referredBy || null,
          xp: 0,
          level: 1,
          rank: 'Beginner Explorer',
          completedQuests: 0,
          achievements: [],
          createdAt: Date.now()
        };
        
        await setDoc(doc(db, "users", userCredential.user.uid), dbUserData);
        loginFn(userCredential.user, dbUserData);
        
        if (role === 'admin') navigate("/admin");
        else if (role === 'manager') navigate("/manager");
        else navigate("/");
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password Sign-in is not enabled. Please enable it in the Firebase Console under Authentication -> Sign-in method.");
      } else {
        setError(err.message || "Failed to authenticate");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        
        <h2 className="text-3xl font-black text-white text-center mb-6 tracking-tight">
          {isLogin ? "Welcome Back" : "Join Quest Georgia"}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value.toUpperCase())}
                placeholder="e.g. QGXXXXXX"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-purple-400 focus:outline-none focus:border-purple-500 transition-colors uppercase"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400 relative z-10">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
