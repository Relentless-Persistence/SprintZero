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
import {activeProductState} from "../../atoms/productAtom"
import {useRecoilState} from "recoil"
import generateString from "../../utils/generateRandomStrings";
import {motion} from "framer-motion"

const { Title, Text } = Typography;

const ProductConfiguration = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeProduct, setActiveProduct] = useRecoilState(activeProductState)
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

  const [position, setPosition] = useState(0);

  const handleSubmit = () => {
    if ((product !== "" && email1 !== "" && cadence !== "", gate !== "")) {
      db.collection("Products")
        .add({
          name: product.toLowerCase(),
          slug: product.toLowerCase() + "-" + generateString(6),
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
          console.log("id", res.id)
          newVersion(res.id);
          addOwnerToTeam(res.id);
          createAccessibilities(res.id);
          addPrimaryGoals(res.id);
          createKickoff(res.id);
          message.success({
            content: "Product configuration saved successfully",
            className: "custom-message mt-12",
          });
          db.collection("Products").doc(res.id).get()
          .then((doc) => {
            const product = doc.data();
            setActiveProduct(doc.data())
            router.push(`/${product.slug}/dashboard`)
          })
        })
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

  const slides = [
		{
			component: (
				<ProductDetails
					product={product}
					setProduct={setProduct}
					email1={email1}
					setEmail1={setEmail1}
					email2={email2}
					setEmail2={setEmail2}
					email3={email3}
					setEmail3={setEmail3}
					// error={error}
				/>
			),
		},
		{
			component: <ProductCadence setCadence={setCadence} error={error} />,
		},
		{
			component: <ProductGate setGate={setGate} error={error} />,
		},
		{
			component: <ProductCost currency={currency} setCurrency={setCurrency} cost={cost} setCost={setCost} />,
		},
		{
			component: (
				<div className="absolute top-[45%] left-[45%]">
					<Button className="bg-white" onClick={handleSubmit}>
						<Text>Start</Text>
					</Button>
				</div>
			),
		},
	]

  const onRight = () => {
		if (position < slides.length - 1) {
			setPosition(position + 1)
		}
	}

	const onLeft = () => {
		if (position > 0) {
			setPosition(position - 1)
		}
	}

  return (
		<>
			<div
				style={{padding: "0 153px", marginTop: "50px", marginBottom: "30px"}}
				className="flex items-center justify-between"
			>
				<Image src="/images/logo_beta_light.png" alt="Logo" className="h-[42px] w-[178px]" preview={false} />
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

			<div className="flex items-center justify-center">
				<div>
					<Title className="mb-3" style={{margin: 0, fontWeight: "normal"}} level={1}>
						Product Configuration
					</Title>
					<Text className="text-2xl" style={{color: "#A6AE9D"}}>
						Almost time to start building! We just require a few data points before we can begin
					</Text>
				</div>
			</div>

			<div className="product-slide">
				<div className="row">
					{slides.map((slide, index) => (
						<motion.div
							className={`absolute top-[-25vh] flex w-[60vw] items-center ${
								index === position ? "justify-center" : index > position ? "justify-start" : "justify-end"
							} ${index !== position ? "opacity-40" : null}`}
							key={index}
							initial={{scale: 0, rotation: -180}}
							animate={{
								rotate: 0,
								left: `${(index - position) * 60 - 30}vw`,
								scale: index === position ? 1 : 0.8,
							}}
							transition={{
								type: "spring",
								stiffness: 260,
								damping: 20,
							}}
						>
							<Card className="product-card w-full">{slide.component}</Card>
						</motion.div>
					))}
				</div>
			</div>

			<div className="mx-72 flex items-center justify-between">
				<Button className="bg-white" onClick={onLeft} disabled={position === 0}>
					Previous
				</Button>

				<Button className="bg-white" onClick={onRight} disabled={position === 4}>
					Next
				</Button>
			</div>
      <div className="h-4"></div>
		</>
	)
};

export default ProductConfiguration;
