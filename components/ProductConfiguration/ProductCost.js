import React, {useState, useEffect} from "react";
import { Typography, Col, Row, Form, Input, InputNumber, Select } from "antd";
import currencyList from "../../currency-list.json";
import Dropdown from "../../components/Dropdown";

const { Title, Text } = Typography;
const { Item } = Form;
const { Option } = Select;

const ProductCost = ({ currency, setCurrency, cost, setCost }) => {
  const currencies = currencyList.data;
  const [formattedCost, setformattedCost] = useState(null);

  useEffect(() => {
    if (cost) {
      let newCost = parseFloat(cost);
      setformattedCost(`${currency}${newCost.toFixed(2)} `);
    }
  }, [cost, currency]);

  const formatCost = () => {
    let formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(cost);
    return formatted;
  }
  return (
    <>
      <div className="text-center mb-4">
        <Title style={{ margin: 0 }} level={3}>
          Effort Cost
        </Title>
        <Text>How much is 1 story point?</Text>
      </div>

      <div className="h-72 flex items-center justify-center">
        <Row gutter={8}>
          <Col span={6}>
            {currencies && (
              // <select
              //   className="custom-select"
              //   defaultValue={currency}
              //   onChange={(e) => setCurrency(e)}
              // >
              //   {currencies.map((currency, i) => (
              //     <option key={i} value={currency.code}>
              //       {currency.code}
              //     </option>
              //   ))}
              // </select>
              <Dropdown
                currency={currency}
                setCurrency={setCurrency}
                currencies={currencies}
              />
            )}
          </Col>
          <Col span={18}>
            <Item>
              {/* <Input
                placeholder="$0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              /> */}
              <InputNumber
                className="w-full"
                placeholder="$0.00"
                value={cost}
                step="0.00"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                onChange={(value) => setCost(value)}
              />

              <Text className="text-xs">Optional</Text>
            </Item>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ProductCost;
