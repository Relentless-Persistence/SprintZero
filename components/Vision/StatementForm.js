import React from 'react';
import styled from 'styled-components';

import
{
    Card,
    Input,
    Form
} from 'antd';

import CardHeaderButton from '../Dashboard/CardHeaderButton';
import { checkEmptyObject } from '../../utils';


const test = () => alert( "lol" );

const layout = {
    labelCol: { span: 4 },
};

const init =
{
    targetCustomer: "",
    need: "",
    keyBenefits: "",
    competitors: "",
    differentiators: ""
};

const StatementForm = (
    {
        handleSubmit = test,
        info
    }
) => 
{
    const [ form ] = Form.useForm();
    const initialValues = checkEmptyObject( info ) ? init : info;


    const onReset = () =>
    {
        form.resetFields();
    };

    const onFinish = ( values ) =>
    {
        console.log( values );
    };



    return (
        <Card
            bordered={ false }
            extra={ <CardHeaderButton onClick={ () => form.submit() } >Done</CardHeaderButton> }
            title="Guiding Statement">
            <Form
                { ...layout }
                labelAlign="left"
                form={ form }

                initialValues={ initialValues }
                onFinish={ onFinish }>

                <Form.Item
                    label="Target Customer"
                    name="targetCustomer"
                    tooltip="Identify the target of this product"
                    required
                >
                    <Input placeholder="Reviewer, Recorder, etc" />
                </Form.Item>


                <Form.Item
                    label="Need"
                    name="need"
                    tooltip="Identify the need of this product"
                    required
                >
                    <Input placeholder="eg File taxes" />
                </Form.Item>


                <Form.Item
                    label="Key Benefits"
                    name="keyBenefits"
                    tooltip="Identify the key benefits of this product"
                    required
                >
                    <Input placeholder="Fast, Cheap" />
                </Form.Item>



                <Form.Item
                    label="Competitors"
                    name="competitors"
                    tooltip="Identify the competitors for this product"
                    required
                >
                    <Input placeholder="Turbotax" />
                </Form.Item>



                <Form.Item
                    label="Differentiators"
                    name="differentiators"
                    tooltip="What makes your the product different?"
                    required
                >
                    <Input placeholder="Faster, Cheaper" />
                </Form.Item>




            </Form>
        </Card>
    );
};

export default StatementForm;
