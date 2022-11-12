/* eslint-disable react-hooks/exhaustive-deps */
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserStoryLayout from "../../components/Dashboard/UserStoryLayout";
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
import Script from "next/script";

function Home() {
  const { pathname } = useRouter();
  const activeProduct = useRecoilValue(activeProductState);
  const [version, setVersion] = useRecoilState(versionState);
  const [epics, setEpics] = useState(null);
  const [versions, setVersions] = useState(null);
  const [savingMode, setSavingMode] = useState(false);
  const [rightNav, setRightNav] = useState(["1.0"]);
  const [newVersion, setNewVersion] = useState("");

  const fetchVersions = async () => {
    if (activeProduct) {
      db.collection("Versions")
        .where("product_id", "==", activeProduct.id)
        .onSnapshot((snapshot) => {
          setVersions(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          const versions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setVersion(versions[0]);
        });
    }
  };

  const getVersions = async () => {
    let newVersion = [];
    if (versions) {
      setRightNav(versions.map(({ version }) => version));
    }
  };

  useEffect(() => {
    getVersions();
  }, [versions]);

  // Fetch Epics from firebase
  const fetchEpics = async () => {
    if (activeProduct && version) {
      db.collection("Epics")
        .where("product_id", "==", activeProduct.id)
        .where("version", "==", version.id)
        .onSnapshot((snapshot) => {
          setEpics(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [activeProduct]);

  useEffect(() => {
    fetchEpics();
  }, [activeProduct, version]);

  const handleActiveVersion = (version) => {
    const versionIndex = findIndex(versions, (v) => v.version === version);

    if (versionIndex > -1) {
      setVersion(versions[versionIndex]);
    }
  };

  // Persist Epic to DB
  const saveEpic = (data) => {
    const { id, ...info } = data;
    db.collection("Epics")
      .doc(id)
      .set({ ...info, product_id: activeProduct.id })
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
        fetchEpics();
      })
      .catch((error) => {
        message.error("Problem updating the story");
        setSavingMode(false);
      });
  };

  // Choose between saving and updating
  const handleSave = (epics) => {
    setSavingMode(true);
    epics.map((data) => {
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
    });
  };

  const addVersion = () => {
    db.collection("Versions")
      .add({
        version: newVersion,
        product_id: activeProduct.id,
      })
      .then((docRef) => {
        message.success("New version added successfully");
      })
      .catch((error) => {
        message.error("Error adding version");
      });
  };

  return (
    <div className="realtive mb-8">
      <Head>
        <title>Dashboard | Sprint Zero</title>
        <meta name="description" content="Sprint Zero dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Script
        async
        type="text/javascript"
        src="https://cdn.weglot.com/weglot.min.js"
        onLoad={() => {
          Weglot.initialize({
            api_key: "wg_22f9b5a096e59c4526f1da3019b8e63a9",
          });
        }}
      />
      <UserStoryLayout
        ignoreLast={true}
        breadCrumbItems={version && version.version}
        hasSideAdd={true}
        onSideAdd={() => addVersion()}
        hasMainAdd={true}
        rightNavItems={rightNav}
        activeRightItem={version && version.version}
        mainClass="mr-[100px]"
        sideBarClass={"min-w-[82px]"}
        addNewText={"Save"}
        onMainAdd={() => handleSave(epics)}
        setActiveRightNav={handleActiveVersion}
        sideAddValue={newVersion}
        setSideAddValue={setNewVersion}
        activeVersionId={version && version.id}
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
            version={version}
          />
        </>
      </UserStoryLayout>
    </div>
  );
}

export default withAuth(Home);
