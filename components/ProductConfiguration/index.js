import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Button, Typography, Carousel, Card, Col, Row, message } from "antd";
import ProductDetails from "./ProductDetails";
import ProductCadence from "./ProductCadence";
import ProductGate from "./ProductGate";
import ProductCost from "./ProductCost";
import withAuth from "../../hoc/withAuth";
import firebaseConfig from "../../config/firebase-config";
import firebase from "firebase";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import SwiperCore, { Pagination, Navigation } from "swiper";

const { Title, Text } = Typography;
const db = firebaseConfig.firestore();
SwiperCore.use([Pagination, Navigation]);

const ProductConfiguration = () => {
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

  const handleSubmit = () => {
    if ((product !== "" && email1 !== "" && cadence !== "", gate !== "")) {
      db.collection("Product")
        .add({
          product,
          email1,
          email2,
          email3,
          cadence,
          gate,
          currency,
          cost,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() =>
          message.success("Product configuration saved successfully")
        );
    }
  };

  const PrevArrow = ({index}) => {
    const show = index === 0 ? true : false;
    return (
      <div>
        <Button disabled={show} type="primary" ghost>
          Prev
        </Button>
      </div>
    );
  };

  const NextArrow = ({index}) => {
    const show = index === 4 ? true : false;

    const next = () => {
      const activate = () => {
        setError(false);
      };

      if (index === 0) {
        if (product && email1) {
          activate();
        } else {
          setError(true);
        }
      } else if (index === 1) {
        cadence ? activate() : setError(true);
      } else if (index === 2) {
        gate ? activate() : setError(true);
      } else if (index === 3) {
        activate();
      }
    };

    return (
      <div style={{ position: "absolute", bottom: 0, right: 0 }}>
        <Button disabled={show} type="primary" ghost>
          Next
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <div>
          <Title className="mb-3" style={{ margin: 0, fontWeight: "normal" }} level={1}>
            Product Configuration
          </Title>
          <Text className="text-2xl" style={{ color: "#A6AE9D" }}>
            Almost time to start building! We just require a few data points
            before we can begin
          </Text>
        </div>
      </div>

      <Swiper
        onSwiper={setSwiper}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        slidesPerView={2}
        spaceBetween={10}
        centeredSlides={true}
        pagination={{
          clickable: true,
        }}
      >
        <SwiperSlide>
          <div>
            <Card className="card">
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
            <Card className="card mb-12">
              <ProductCadence setCadence={setCadence} error={error} />
            </Card>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <Card className="card mb-12">
              <ProductGate setGate={setGate} error={error} />
            </Card>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div>
            <Card className="card mb-12">
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
            <div className="h-72 flex items-center justify-center">
              <Button type="primary" ghost onClick={handleSubmit}>
                <Text className="font-semibold">Start</Text>
              </Button>
            </div>
          </div>
        </SwiperSlide>

        <div className="flex items-center justify-between">
          {/* <div ref={prevRef}>
            {swiper && (
              <PrevArrow
                index={swiper.activeIndex}
                isBeginning={swiper.isBeginning}
              />
            )}
          </div>
          <div ref={nextRef}>
            {swiper && (
              <NextArrow index={swiper.activeIndex} isEnd={swiper.isEnd} />
            )}
          </div> */}

          <Button ref={prevRef}>Prev</Button>

          <Button ref={nextRef} type="primary" ghost>
            Next
          </Button>
        </div>
      </Swiper>
    </>
  );
};

export default withAuth(ProductConfiguration);
