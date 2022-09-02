/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../components/Dashboard/AppLayout";
import UserStory from "../../components/UserStory";
import { findIndex } from "lodash";
import { splitRoutes } from "../../utils";
import withAuth from "../../hoc/withAuth";
import { Button, message } from "antd";
import { db } from "../../config/firebase-config";
import { activeProductState } from "../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import generateString from "../../utils/generateRandomStrings";

const versions = ["v1", "v2", "v3", "All"];

function Home() {
  const { pathname } = useRouter();
  const activeProduct = useRecoilValue(activeProductState);
  const [epics, setEpics] = useState(null);
  //console.log(pathname);
  // const [versions, setVersions] = useState(null);
  const [version, setVersion] = useState(versions[3]);
  const [savingMode, setSavingMode] = useState(false);
  const [newVersion, setNewVersion] = useState("")

  const fetchVersions = async () => {
    if (activeProduct) {
      const res = await db.collection("versions").where("product_id", "==", activeProduct.id).get();
      const versions = res.docs.map(doc => ({id: doc.id, ...doc.data()}))
      setVersions([...versions, {version: "All"}]);
    }
  }

  const getVersions = async (versions) => {
    let newVersion = []
    await versions.map(item => newVersion.push(item.version))
    console.log(newVersion);
    return newVersion
  }
  

  // Fetch Epics from firebase
  const fetchEpics = async () => {
    // console.log(activeProduct.id);
    if (activeProduct) {
      const res = await db
        .collection("Epics")
        .where("product_id", "==", activeProduct.id)
        .get();
      
      const epics = res.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log(epics)
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
        breadCrumbItems={[`Story Map / ${version}`]}
        hasSideAdd={true}
        onSideAdd={() => addVersion()}
        hasMainAdd={true}
        rightNavItems={versions}
        activeRightItem={version}
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
