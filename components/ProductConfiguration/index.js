import React from "react";
import { Button, Typography, Carousel, Card, Col, Row } from "antd";
import ProductDetails from "./ProductDetails";
import ProductCadence from "./ProductCadence";
import ProductGate from "./ProductGate";
import ProductCost from "./ProductCost";

const { Title, Text } = Typography;

const PrevArrow = ({ className, currentSlide, style, onClick }) => {
  const show = currentSlide === 0 ? true : false;
  return (
    <div
      // className={className}
      style={{ position: "absolute", bottom: 0, left: 0, zIndex: 10 }}
    >
      <Button disabled={show} onClick={onClick} type="primary" ghost>
        Prev
      </Button>
    </div>
  );
};

const NextArrow = ({ className, currentSlide, style, onClick }) => {
  const show = currentSlide === 4 ? true : false;
  return (
    <div style={{ position: "absolute", bottom: 0, right: 0 }}>
      <Button disabled={show} onClick={onClick} type="primary" ghost>
        Next
      </Button>
    </div>
  );
};

const cardSpacing = {
  display: "flex",
  justifyContent: "justify-center",
}

const index = () => {
  return (
    <>
      <div className="flex items-center justify-center mb-4">
        <div>
          <Title style={{ margin: 0 }} level={2}>
            Product Configuration
          </Title>
          <Text>
            Almost time to start building! We just require a few data points
            before we can begin
          </Text>
        </div>
      </div>

      <Carousel
        arrows={true}
        prevArrow={<PrevArrow />}
        nextArrow={<NextArrow />}
      >
        <Row>
          <Col sm={24} lg={{ span: 12, offset: 6 }}>
            <Card className="card mb-12">
              <ProductDetails />
            </Card>
          </Col>
        </Row>

        <Row>
          <Col sm={24} lg={{ span: 12, offset: 6 }}>
            <Card className="card mb-12">
              <ProductCadence />
            </Card>
          </Col>
        </Row>

        <Row>
          <Col sm={24} lg={{ span: 12, offset: 6 }}>
            <Card className="card mb-12">
              <ProductGate />
            </Card>
          </Col>
        </Row>
        <Row>
          <Col sm={24} lg={{ span: 12, offset: 6 }}>
            <Card className="card mb-12">
              <ProductCost />
            </Card>
          </Col>
        </Row>

        <Row>
          <Col sm={24} lg={{ span: 12, offset: 6 }}>
            <div className="h-72 flex items-center justify-center">
              <Button type="primary" ghost>
                <Text className="font-semibold">Start</Text>
              </Button>
            </div>
          </Col>
        </Row>
      </Carousel>
    </>
  );
};

export default index;
