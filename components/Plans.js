import React from "react";
import { Typography, Card, Row, Col, Button } from "antd";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

const Plans = () => {
  const router = useRouter();
  return (
    <>
      <div>
        <Title level={1} style={{ fontWeight: "normal" }}>Let&apos;s Get Started</Title>
        <Text className="text-xl">
          Thanks for choosing SprintZero to build your next product experience!
          Start by selecting the billing plan below that works best for your
          team.
        </Text>
      </div>

      <div className="plans">
        <Row gutter={[16, 16]}>
          <Col sm={24} lg={8}>
            <Card className="card">
              <Title level={2} style={{ textAlign: "center" }}>
                Basic
              </Title>
              <div style={{ fontSize: "20px" }}>
                <Text>– One Product Only</Text>
                <br />
                <Text>– Three Users</Text>
                <br />
                <Text>– $5.99 per each additional user month</Text>
                <br />
                <Text>– $9.99 each additional product per month</Text>
                <br />
                <br />
              </div>
              <div style={{ textAlign: "center", margin: "25px" }}>
                <Title level={2} style={{ margin: 0 }}>
                  $9.99
                </Title>
                <Text style={{ fontSize: "14px" }}>Per Month</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Button onClick={() => router.push("/payment/basic")}>
                  Select
                </Button>
              </div>
            </Card>
          </Col>
          <Col sm={24} lg={8}>
            <Card className="card">
              <Title level={2} style={{ textAlign: "center" }}>
                Professional
              </Title>
              <div style={{ fontSize: "20px" }}>
                <Text>– Five Product Only</Text>
                <br />
                <Text>– Twelve Users</Text>
                <br />
                <Text>– $2.99 per each additional user month</Text>
                <br />
                <Text>– $3.99 each additional product per month</Text>
                <br />
                <Text>– Third-Party Integrations</Text>
              </div>
              <div style={{ textAlign: "center", margin: "25px" }}>
                <Title level={2} style={{ margin: 0 }}>
                  $99.99
                </Title>
                <Text style={{ fontSize: "14px" }}>Per Month</Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <Button onClick={() => router.push("/payment/professional")}>
                  Select
                </Button>
              </div>
            </Card>
          </Col>
          <Col sm={24} lg={8}>
            <Card className="card">
              <Title level={2} style={{ textAlign: "center" }}>
                Enterprise
              </Title>
              <div style={{ fontSize: "20px" }}>
                <Text>– Unlimited Products</Text>
                <br />
                <Text>– Twenty Four Users</Text>
                <br />
                <Text>– $0.99 per each additional user month</Text>
                <br />
                <Text>– Single Sign-On</Text>
                <br />
                <Text>– Enctypted Data</Text>
                <br />
                <br />
              </div>
              <div style={{ textAlign: "center", margin: "25px" }}>
                <Title level={2}>Custom</Title>
              </div>
              <br />
              <div style={{ textAlign: "center" }}>
                <Button onClick={() => router.push("/")}>Contact Us</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Plans;
