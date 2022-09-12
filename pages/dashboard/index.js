/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../components/Dashboard/AppLayout";
import UserStory from "../../components/UserStory";
import { findIndex, sortBy } from "lodash";
import { splitRoutes } from "../../utils";
import withAuth from "../../hoc/withAuth";
import { Button, message } from "antd";
import { db } from "../../config/firebase-config";
import { activeProductState } from "../../atoms/productAtom";
import { versionState } from "../../atoms/versionAtom";
import { useRecoilValue, useRecoilState } from "recoil";
import generateString from "../../utils/generateRandomStrings";

function Home() {
  const { pathname } = useRouter();
  const activeProduct = useRecoilValue(activeProductState);
  const [version, setVersion] = useRecoilState(versionState)
  const [epics, setEpics] = useState(null);
  const [versions, setVersions] = useState(null);
  const [savingMode, setSavingMode] = useState(false);
  const [rightNav, setRightNav] = useState(["1.0"])


  const fetchVersions = async () => {
    if (activeProduct) {
       db.collection("versions").where("product_id", "==", activeProduct.id).onSnapshot((snapshot) => {
        setVersions(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        const versions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).sort();
        console.log(versions)
        setVersion(versions[0])
      })
    }
  }

  const getVersions = async () => {
    let newVersion = []
    if (versions) {
      versions.map((item) => newVersion.push(item.version));
      console.log(newVersion);
      return newVersion;
    }
  }
  

  // Fetch Epics from firebase
  const fetchEpics = async () => {
    console.log("version", version)
    console.log("product", activeProduct);
    if (activeProduct && version) {
      const res = await db
        .collection("Epics")
        .where("product_id", "==", activeProduct.id)
        .where("version", "==", version.id)
        .get();
      
      const epics = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("epics", epics)
      if (epics.length > 0) {
        setEpics(epics);
      } else {
        setEpics([
          {
            id: generateString(20),
            name: "",
            status: "",
            features: [],
          },
        ]);
      }
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [activeProduct])

  useEffect(() => {
    fetchEpics();
  }, [activeProduct]);

  const handleActiveVersion = (version) => {
    const versionIndex = versions.findIndex((v) => v === version);

    if (versionIndex > -1) {
      setVersion(versions[versionIndex]);
    }
  };

  // Persist Epic to DB
  const saveEpic = (data) => {
    const { id, ...info } = data;
    db.collection("Epics")
      .doc(id)
      .set({...info, product_id: activeProduct.id})
      .then((docRef) => {
        message.success("User Stories saved");
        setSavingMode(false);
        fetchEpics();
      })
      .catch((error) => {
        message.error("Problem saving story");
        setSavingMode(false);
      });
  };

  // Update Epic in DB
  const updateEpic = async (data) => {
    const { id, ...info } = data;
    await db
      .collection("Epics")
      .doc(id)
      .update(info)
      .then(() => {
        message.success("User Stories updated successfully");
        setSavingMode(false);
        fetchEpics()
      })
      .catch((error) => {
        message.error("Problem updating the story");
        setSavingMode(false);
      });
  };

  // Choose between saving and updating
  const handleSave = (epics) => {
    setSavingMode(true);
    epics.map(data => {
      const res = db
      .collection("Epics")
      .doc(data.id)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          updateEpic(data);
        } else {
          saveEpic(data);
        }
      });
    })
  
  };

  const addVersion = () => {
    versions.push("v4")
  }

  return (
    <div className="realtive mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        ignoreLast={true}
        // breadCrumbItems={versions && [`Story Map / ${version.version}`]}
        hasSideAdd={true}
        onSideAdd={() => addVersion()}
        hasMainAdd={true}
        rightNavItems={rightNav}
        // activeRightItem={version}
        mainClass="mr-[100px]"
        sideBarClass={"min-w-[82px]"}
        addNewText={"Save"}
        onMainAdd={() => handleSave(epics)}
        setActiveRightNav={handleActiveVersion}
      >
        <>
          {savingMode ? (
            <div className="fixed right-0 bottom-0 w-screen h-screen z-[1000] overflow-hidden bg-gray-900 opacity-60 flex flex-col items-center justify-center">
              <h2 className="text-center text-white text-xl font-semibold">
                Saving...
              </h2>
              <p className="w-1/3 text-center text-white">
                This may take a few seconds, please don&apos;t close this page.
              </p>
            </div>
          ) : null}

          <UserStory
            epics={epics}
            setEpics={setEpics}
            activeProduct={activeProduct}
          />
        </>
      </AppLayout>
    </div>
  );
}

export default withAuth(Home);
