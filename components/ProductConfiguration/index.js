import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Button,
  Typography,
  Carousel,
  Card,
  Col,
  Row,
  message,
  Avatar,
  Image,
  List,
} from "antd";
import ProductDetails from "./ProductDetails";
import ProductCadence from "./ProductCadence";
import ProductGate from "./ProductGate";
import ProductCost from "./ProductCost";
// import withAuth from "../../hoc/withAuth";
import { db } from "../../config/firebase-config";
import firebase from "firebase";
import { useRouter } from "next/router";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import SwiperCore, { Pagination, Navigation } from "swiper";

const { Title, Text } = Typography;
// const db = firebaseConfig.firestore();
SwiperCore.use([Pagination, Navigation]);

const ProductConfiguration = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState("");
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");
  const [email3, setEmail3] = useState("");
  const [swiper, setSwiper] = useState(null);

  const [cadence, setCadence] = useState("");
  const [gate, setGate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [cost, setCost] = useState("");
  const [error, setError] = useState(false);

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  const handleSubmit = () => {
    if ((product !== "" && email1 !== "" && cadence !== "", gate !== "")) {
      db.collection("Products")
        .add({
          name: product.toLowerCase(),
          email1,
          email2,
          email3,
          cadence,
          gate,
          currency,
          cost: cost.length ?? null,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          owner: user.uid,
        })
        .then((res) => {
          newVersion(res.id);
          addOwnerToTeam(res.id);
          createAccessibilities(res.id);
          addPrimaryGoals(res.id);
          createKickoff(res.id);
          message.success({
            content: "Product configuration saved successfully",
            className: "custom-message mt-12",
          });
        })
        .then(() => router.push("/dashboard"));
    } else {
      message.warning({
        content: "Some field can't be empty",
        className: "custom-message mt-12",
      });
    }
  };

  const newVersion = (product) => {
    db.collection("Versions")
      .add({
        product_id: product,
        version: "1.0",
      })
      .then(() =>
        message.success({
          content: "Product version added",
          className: "custom-message mt-12",
        })
      );
  };

  const addOwnerToTeam = async (product) => {
    await db.collection("teams").add({
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
      },
      expiry: "unlimited",
      type: "member",
      product_id: product,
    });
  };

  const addPrimaryGoals = (product) => {
    const goals = ["001", "002", "003"];

    goals.map((goal) => {
      db.collection("Goals").add({
        product_id: product,
        description: "",
        name: goal,
      });
    });
  };

  const createAccessibilities = (id) => {
    const challenges = [
      {
        name: "Perceivable",
        title:
          "Users can identify content and interface elements by means of the senses. For many users, this means perceiving a system primarily visually, while for others, perceivability may be a matter of sound or touch.",
      },
      {
        name: "Operable",
        title:
          "Users can successfully use controls, buttons, navigation, and other interactive elements. For many users this means using assistive technology like voice recognition, keyboards, screen readers etc.",
      },
      {
        name: "Understandable",
        title:
          "Users should be able to comprehend the content, and learn and remember how to use your OER site. Your OER should be consistent in its presentation and format, predictable in its design and usage patterns, and appropriate to the audience in its voice and tone.",
      },
      {
        name: "Robust",
        title:
          "Content must be robust enough that it can be interpreted reliably by a wide variety of users, allowing them to choose the technology they use to interact with websites, online documents, multimedia, and other information formats. Users should be allowed to choose their own technologies to access OER content.",
      },
    ];

    challenges.map((challenge) => {
      db.collection("Accessibility").add({
        product_id: id,
        type: challenge.name,
        title: challenge.title,
      });
    });
  };

  const createKickoff = async (id) => {
    await db.collection("kickoff").add({
      product_id: id,
      problem_statement: "",
      success_metrics: [""],
      priorities: [""],
    });
  };

  const PrevArrow = ({ index }) => {
    const show = index === 0 ? true : false;
    return (
      <div>
        <Button disabled={show} type="primary" ghost>
          Prev
        </Button>
      </div>
    );
  };

  const NextArrow = () => {
    // const show = index === 4 ? true : false;

    // const next = () => {
    //   const activate = () => {
    //     setError(false);
    //   };

    //   if (index === 0) {
    //     if (product && email1) {
    //       activate();
    //     } else {
    //       setError(true);
    //     }
    //   } else if (index === 1) {
    //     cadence ? activate() : setError(true);
    //   } else if (index === 2) {
    //     gate ? activate() : setError(true);
    //   } else if (index === 3) {
    //     activate();
    //   }
    // };
    // console.log(swiperRef.current);

    return (
      <div style={{ position: "absolute", bottom: 0, right: 0 }}>
        <Button disabled={false} type="primary" ghost ref={nextRef}>
          Next
        </Button>
      </div>
    );
  };

  return (
    <>
      <div
        style={{ padding: "0 153px", marginTop: "50px", marginBottom: "30px" }}
        className="flex items-center justify-between"
      >
        <Image
          src="/images/logo_beta_light.png"
          alt="Logo"
          className="w-[178px] h-[42px]"
          preview={false}
        />
        {user ? (
          <div className="">
            {/* <Text className="mr-2 capitalize" style={{ fontSize: "16px" }}>
              {user.displayName}
            </Text>
            <Avatar src={user.photoURL} /> */}
            <List className="w-[200px]">
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar size="large" src={user.photoURL} />}
                  title={user.displayName}
                  description={user.email}
                />
              </List.Item>
            </List>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-center mb-6">
        <div>
          <Title
            className="mb-3"
            style={{ margin: 0, fontWeight: "normal" }}
            level={1}
          >
            Product Configuration
          </Title>
          <Text className="text-2xl" style={{ color: "#A6AE9D" }}>
            Almost time to start building! We just require a few data points
            before we can begin
          </Text>
        </div>
      </div>

      <Swiper
        ref={swiperRef}
        onSwiper={setSwiper}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
          realIndexChange: (swiper) => console.log(swiper.realIndex);
        }}
        slidesPerView={3}
        spaceBetween={80}
        centeredSlides={true}
        pagination={{
          clickable: true,
        }}
      >
        <SwiperSlide>
          <div>
            <Card className="product-card">
              <ProductDetails
                product={product}
                setProduct={setProduct}
                email1={email1}
                setEmail1={setEmail1}
                email2={email2}
                setEmail2={setEmail2}
                email3={email3}
                setEmail3={setEmail3}
                error={error}
              />
            </Card>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <Card className="product-card mb-12">
              <ProductCadence setCadence={setCadence} error={error} />
            </Card>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <Card className="product-card mb-12">
              <ProductGate setGate={setGate} error={error} />
            </Card>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <Card className="product-card mb-12">
              <ProductCost
                currency={currency}
                setCurrency={setCurrency}
                cost={cost}
                setCost={setCost}
              />
            </Card>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <div
              className="product-card h-72 flex items-center justify-center"
              style={{ border: "none" }}
            >
              <Button className="bg-white" onClick={handleSubmit}>
                <Text>Start</Text>
              </Button>
            </div>
          </div>
        </SwiperSlide>

        <div className="flex items-center justify-between lg:mx-72 mx-4">
          <Button className="bg-white" ref={prevRef}>
            Previous
          </Button>

          <Button className="bg-white" ref={nextRef}>
            Next
          </Button>
        </div>
      </Swiper>
    </>
  );
};

export default ProductConfiguration;
