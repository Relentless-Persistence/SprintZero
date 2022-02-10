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

const FormItem = styled( Form.Item )`
margin-bottom:24px;
`;


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
        handleSubmit( values );
    };

    const validate = async () =>
    {
        try
        {
            const values = await form.validateFields();
            onFinish( values );
        } catch ( error )
        {
            console.error( error );

        }
    };



    return (
        <Card
            bordered={ false }
            extra={ <CardHeaderButton onClick={ validate } >Done</CardHeaderButton> }
            title="Guiding Statement">
            <Form
                { ...layout }
                labelAlign="left"
                form={ form }

                initialValues={ initialValues }
                onFinish={ onFinish }>

                <FormItem
                    label="Target Customer"
                    name="targetCustomer"
                    tooltip="Identify the target of this product"
                    rules={ [
                        {
                            required: true,
                            message: 'Please input the target customer',
                        },
                    ] }
                >
                    <Input placeholder="Reviewer, Recorder, etc" />
                </FormItem>


                <FormItem
                    label="Need"
                    name="need"
                    tooltip="Identify the need of this product"
                    rules={ [
                        {
                            required: true,
                            message: 'Please input the product need',
                        },
                    ] }
                >
                    <Input placeholder="eg File taxes" />
                </FormItem>


                <FormItem
                    label="Key Benefits"
                    name="keyBenefits"
                    tooltip="Identify the key benefits of this product"
                    rules={ [
                        {
                            required: true,
                            message: 'Please input the key benefits',
                        },
                    ] }
                >
                    <Input placeholder="Fast, Cheap" />
                </FormItem>



                <FormItem
                    label="Competitors"
                    name="competitors"
                    tooltip="Identify the competitors for this product"
                    rules={ [
                        {
                            required: true,
                            message: 'Please input at least one competitor',
                        },
                    ] }                >
                    <Input placeholder="Turbotax" />
                </FormItem>



                <FormItem
                    label="Differentiators"
                    name="differentiators"
                    tooltip="What makes your the product different?"
                    rules={ [
                        {
                            required: true,
                            message: 'Please input the at least one difference',
                        },
                    ] }                >
                    <Input placeholder="Faster, Cheaper" />
                </FormItem>




            </Form>
        </Card>
    );
};

export default StatementForm;
