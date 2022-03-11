import React, { useState, useContext, useEffect } from "react";
import { firebase } from "../config/firebase-config";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState();

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const value = { user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
