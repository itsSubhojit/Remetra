import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
        } catch (err) {
          console.error("Error retrieving Firebase ID token:", err);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const freshToken = await currentUser.getIdToken();
          setToken(freshToken);
        } catch (err) {
          console.error("Error refreshing Firebase ID token:", err);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, []);

  const getToken = async (forceRefresh = false) => {
    if (!user) return null;
    try {
      if (typeof user.getIdToken === "function") {
        const freshToken = await user.getIdToken(forceRefresh);
        setToken(freshToken);
        return freshToken;
      }
      return token;
    } catch (err) {
      console.error("Failed to get fresh ID token:", err);
      return token;
    }
  };

  const login = async (email, password, keepSessionActive = true) => {
    if (!auth) {
      throw new Error("Firebase Authentication is not initialized. Please verify your Firebase configuration.");
    }
    // Configure session persistence prior to signing in (CWE-613)
    try {
      const persistence = keepSessionActive ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
    } catch (persistErr) {
      console.warn("Failed to set Firebase auth persistence:", persistErr);
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    const freshToken = await result.user.getIdToken();
    setToken(freshToken);
    return result.user;
  };

  const register = async (name, email, password) => {
    if (!auth) {
      throw new Error("Firebase Authentication is not initialized. Please verify your Firebase configuration.");
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
    const freshToken = await result.user.getIdToken();
    setToken(freshToken);
    return result.user;
  };

  const loginWithGoogle = async (keepSessionActive = true) => {
    if (!auth) {
      throw new Error("Firebase Authentication is not initialized. Please verify your Firebase configuration.");
    }
    try {
      const persistence = keepSessionActive ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
    } catch (persistErr) {
      console.warn("Failed to set Firebase auth persistence:", persistErr);
    }

    const result = await signInWithPopup(auth, googleProvider);
    const freshToken = await result.user.getIdToken();
    setToken(freshToken);
    return result.user;
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setToken(null);
  };

  const resetPassword = async (email) => {
    if (!auth) {
      throw new Error("Firebase Authentication is not initialized. Please verify your Firebase configuration.");
    }
    return await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (displayName) => {
    if (!auth || !auth.currentUser) {
      throw new Error("No authenticated user found.");
    }
    await updateProfile(auth.currentUser, { displayName });
    setUser({ ...auth.currentUser, displayName });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserProfile,
        getToken,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
