import React, {useState, useEffect} from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import Login from "../components/Login";
import { useRouter } from "next/router";
import { db } from "../config/firebase-config";
import { message } from "antd";

const Invite = () => {
  const router = useRouter();
  const {type, token} = router.query;
  const [verifyToken, setVerifyToken] = useState([]);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if(token) {
      var docRef = db.collection("inviteToken").doc(token);

      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            message.success("Invite token verified");
            console.log(doc.data());
            const data = doc.data();
            if(window !== undefined) {
              router.push(
                `${window.location.origin}/login?type=${data.type}&product=${data.product_id}`
              );
            }
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            message.error("Invite token not found");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  
  return (
    <div>
      <Head>
        <title>Invite | Sprint Zero</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
          <div className="mt-4 text-lg italic">
            Verifying....
          </div>
      </Layout>
    </div>
  );
};

export default Invite;
