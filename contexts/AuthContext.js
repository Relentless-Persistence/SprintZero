/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect } from "react";
import { firebase } from "../config/firebase-config";
import { activeProductState } from "../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { db } from "../config/firebase-config";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const activeProduct = useRecoilValue(activeProductState);
  const [user, setUser] = useState();
  const [userRole, setUserRole] = useState("member");

  // const getTeam = async () => {
  //   if(activeProduct && user) {
  //     const res = await db
  //       .collection("teams")
  //       .where("user.uid", "==", user.uid)
  //       .where("product_id", "==", activeProduct.id)
  //       .get();
  //     setUserRole(res.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0].type);
  //   }
  // }

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  // useEffect(() => {
  //   getTeam();
  // }, [user, activeProduct]);

  const value = { user, userRole };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
