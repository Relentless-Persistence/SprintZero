import React from "react";
import {auth} from "../config/firebase-config";

const SocialMediaAuth = (provider) => {
  auth
    .signInWithPopup(provider)
    .then((res) => {
      return res.user;
    })
    .catch((err) => {
      return err;
    });
};

export default SocialMediaAuth;
