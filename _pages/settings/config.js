/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Head from "next/head";
import AppLayout from "../../components/Settings/Config/AppLayout";
import { splitRoutes } from "../../utils";
import { useRouter } from "next/router";
import Config from "../../components/Settings/Config";
import { findIndex } from "lodash";
import { activeProductState } from "../../atoms/productAtom";
import { useRecoilValue } from "recoil";
import { db } from "../../config/firebase-config";
import { Button, Dropdown, notification, Menu } from "antd";
import { FireOutlined } from "@ant-design/icons";
import deleteData from "../../components/Settings/Config/deleteData";
import { useAuth } from "../../contexts/AuthContext";

const items = [
  {
    label: "1st menu item",
    key: "1",
  },
  {
    label: "2nd menu item",
    key: "2",
  },
];

const config = () => {
  const { user } = useAuth();
  const activeProduct = useRecoilValue(activeProductState);
  const router = useRouter();
  const { pathname } = useRouter();
  const menus = ["Account", "Billing", "Config", "Team"];
  const [activeMenuIndex, setActiveMenuIndex] = useState(2);
  const [edit, setEdit] = useState(false);
  const [cadence, setCadence] = useState("");
  const [gate, setGate] = useState("");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    if (activeProduct) {
      setCadence(activeProduct.cadence);
      setGate(activeProduct.gate);
      setTitle(activeProduct.name);
      setCost(activeProduct.cost);
      setCurrency(activeProduct.currency);
    }
  }, [activeProduct]);

  const setActiveRightNav = (h) => {
    const menuTypeIndex = findIndex(menus, (o) => o === h);
    router.push(`/settings/${menus[menuTypeIndex].toLowerCase()}`);
  };

  const updateCadence = (cadence) => {
    db.collection("Products")
      .doc(product.id)
      .update({
        cadence,
      })
      .then(() => {
        notification.success({message: "Cadence updated successfully"});
        // window.location.reload(false);
      });
  };

  const updateGate = (gate) => {
    db.collection("Products")
      .doc(product.id)
      .update({
        gate,
      })
      .then(() => {
        notification.success({message: "Gate updated successfully"})
        // window.location.reload(false);
      });
  };

  const superDelete = async () => {
    if (user && activeProduct) {
      if (activeProduct.owner === user.uid) {
        deleteData(activeProduct.id);
      } else {
        console.error("You have no authorization here!");
      }
      // db.collection("Products")
      // .where("owner", "==", user.uid)
      // .onSnapshot((snapshot) => {
      //   const products = snapshot.docs.map((doc) => ({
      //     id: doc.id,
      //     ...doc.data(),
      //   }));

      //   products.map(product => {
      //     if(product.owner === user.uid) {
      //       deleteData(product.id)
      //     } else {
      //       console.error("You have no authorization here!")
      //     }
      //   })
      // })
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="0" onClick={() => superDelete()}>
        Confirm
      </Menu.Item>
      <Menu.Item key="1" onClick={() => alert("I work")}>
        Cancel
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Head>
        <title>Config Settings | Sprint Zero</title>
        <meta name="description" content="Sprint Zero strategy accessiblity" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppLayout
        ignoreLast={true}
        hasMainAdd={true}
        hasSideAdd={false}
        breadCrumbItems={splitRoutes(pathname)}
        mainClass="mr-[174px]"
        rightNavItems={menus}
        activeRightItem={menus[activeMenuIndex]}
        setActiveRightNav={setActiveRightNav}
      >
        {activeProduct && user && (
          <>
            <Config
              product={activeProduct}
              cadence={cadence}
              setCadence={setCadence}
              gate={gate}
              setGate={setGate}
              title={title}
              setTitle={setTitle}
              cost={cost}
              setCost={setCost}
              currency={currency}
              setCurrency={setCurrency}
            />
            <div className="mt-[92px]">
              <h6>Erase all data</h6>
              <p className="text-xs text-[#595959]">
                This action will erase all stored data and start over from
                scratch.
              </p>
              {/* <Button>Halt + Catch Fire</Button> */}
              <div className="mt-4 mb-10">
                <Dropdown.Button
                  overlay={menu}
                  placement="bottomLeft"
                  arrow={{ pointAtCenter: true }}
                  icon={<FireOutlined />}
                  className="bg-white"
                >
                  Halt + Catch Fire
                </Dropdown.Button>
              </div>
            </div>
          </>
        )}
      </AppLayout>
    </div>
  );
};

export default config;
