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
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo session was active
    if (localStorage.getItem("remetra_demo_active") === "true") {
      const demoUser = {
        uid: "demo-household-vault-uid",
        email: "subhojit@remetra.app",
        displayName: "Subhojit Roy",
        getIdToken: async () => "demo-firebase-id-token",
      };
      setUser(demoUser);
      setToken("demo-firebase-id-token");
      setLoading(false);
      return;
    }

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
        if (localStorage.getItem("remetra_demo_active") !== "true") {
          setUser(null);
          setToken(null);
        }
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

  const loginDemoUser = (customEmail = null, customName = null) => {
    const demoUser = {
      uid: "demo-household-vault-uid",
      email: customEmail || "subhojit@remetra.app",
      displayName: customName || (customEmail ? customEmail.split("@")[0] : "Subhojit Roy"),
      getIdToken: async () => "demo-firebase-id-token",
    };
    setUser(demoUser);
    setToken("demo-firebase-id-token");
    localStorage.setItem("remetra_demo_active", "true");
    return demoUser;
  };

  const login = async (email, password) => {
    if (!auth) {
      return loginDemoUser(email);
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem("remetra_demo_active");
      const freshToken = await result.user.getIdToken();
      setToken(freshToken);
      return result.user;
    } catch (err) {
      if (
        err.code === "auth/invalid-api-key" ||
        err.code === "auth/api-key-not-valid" ||
        err.code === "auth/network-request-failed" ||
        err.code === "auth/configuration-not-found"
      ) {
        console.warn("Invalid/Placeholder Firebase API key detected. Falling back to Demo Vault.");
        return loginDemoUser(email);
      }
      throw err;
    }
  };

  const register = async (name, email, password) => {
    if (!auth) {
      return loginDemoUser(email, name);
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      localStorage.removeItem("remetra_demo_active");
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      const freshToken = await result.user.getIdToken();
      setToken(freshToken);
      return result.user;
    } catch (err) {
      if (
        err.code === "auth/invalid-api-key" ||
        err.code === "auth/api-key-not-valid" ||
        err.code === "auth/network-request-failed" ||
        err.code === "auth/configuration-not-found"
      ) {
        console.warn("Invalid/Placeholder Firebase API key detected. Falling back to Demo Vault.");
        return loginDemoUser(email, name);
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      return loginDemoUser();
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.removeItem("remetra_demo_active");
      const freshToken = await result.user.getIdToken();
      setToken(freshToken);
      return result.user;
    } catch (err) {
      if (
        err.code === "auth/invalid-api-key" ||
        err.code === "auth/api-key-not-valid" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request" ||
        err.code === "auth/configuration-not-found"
      ) {
        console.warn("Google popup fallback to Demo Vault:", err.code);
        return loginDemoUser();
      }
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem("remetra_demo_active");
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        // ignore
      }
    }
    setUser(null);
    setToken(null);
  };

  const resetPassword = async (email) => {
    if (!auth) throw new Error("Firebase Auth is not initialized. Please configure VITE_FIREBASE_API_KEY.");
    return await sendPasswordResetEmail(auth, email);
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
        loginDemoUser,
        logout,
        resetPassword,
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
