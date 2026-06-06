import { create } from "zustand";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const useAuthStore = create((set) => ({
  user: null,
  userData: null,
  loading: true,

  initializeAuth: () => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        let userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          role: 'user',
          xp: 0,
          level: 1,
          rank: 'Beginner Explorer',
          completedQuests: 0,
          achievements: []
        };
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            userData = { id: firebaseUser.uid, ...userDocSnap.data() };
          } else {
            // Create initial user document
            await setDoc(userDocRef, userData);
          }
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
        
        set({ user: firebaseUser, userData, loading: false });
      } else {
        set({ user: null, userData: null, loading: false });
      }
    });
  },

  login: (firebaseUser, dbUserData) => {
    set({ user: firebaseUser, userData: dbUserData });
  },

  logout: async () => {
    await firebaseSignOut(auth);
    set({ user: null, userData: null });
  },
}));
