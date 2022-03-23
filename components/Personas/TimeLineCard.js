import React, { useState } from "react";
import styled from "styled-components";

import
{
    Card,
    Input,
    Form,
    Button,
    Timeline
} from 'antd';

import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

import CardHeaderButton from "../Dashboard/CardHeaderButton";
import ActionButtons from "./ActionButtons";

const MyInput = styled( Input )`

    .ant-input-group-wrapper
    {
        position:relative;
    }

    .ant-input-group-addon
    {
        background:transparent;
    }

    .ant-input
    {
        border-left:${ ( props ) => props.$hasLeftBorder ? "" : "none" };
        border-right: ${ ( props ) => props.$removeRightBorder ? "none" : "" };
        padding:5px 11px;
    }

  
`;

const Add = styled( Button )`
    background: transparent !important;
    border:none;
    padding:0;
    display: flex;
    align-items: center;
`;

const Remove = styled( Button )`
    background: transparent !important;
    border:none;
    padding:0;
    display: flex;
    align-items: center;
`;


const TimeLineCard = (
    {
        handleEdit,
        title = "Goals",
        name,
        cardData = [ "" ]
    }
) => 
{

    const [ form ] = Form.useForm();

    const [ isEdit, setIsEdit ] = useState( false );

    const toggleEdit = () => setIsEdit( s => !s );

    const onFinish = () =>
    {
        const values = form.getFieldsValue();
        handleEdit( values[ `${ name }${ title }fields` ].filter( ( v ) => v?.trim().length > 0 ) );
        toggleEdit();

    };

    if ( isEdit )
    {

        return (
            <Card
                className="border-2 border-[#D9D9D9]"
                extra={ <ActionButtons
                    onCancel={ toggleEdit }
                    onSubmit={ onFinish }
                /> }
                title={ <strong>{ title }</strong> }
                headStyle={ {
                    background: "#F5F5F5",
                } }>
                <Form form={ form }>
                    <Form.List
                        initialValue={ cardData }
                        name={ `${ name }${ title }fields` }>
                        {
                            ( fields, { add, remove } ) =>
                            {
                                const first = fields[ 0 ];
                                const last = fields[ fields.length - 1 ];
                                const beforeLast = fields[ fields.length - 2 ];

                                const rest = fields.slice( 1, -2 );


                                return (
                                    <div>
                                        <Form.Item
                                            key={ 0 }
                                            name={ [ 0 ] }
                                            rules={ [ { required: true } ] }
                                        >

                                            <MyInput
                                                placeholder={ "Start" }
                                                value={ first }
                                                $hasLeftBorder={ true }
                                                $removeRightBorder={ fields.length === 1 }
                                                addonAfter={ fields.length < 2 ?
                                                    <Add
                                                        onClick={ () => { add(); add(); } }
                                                    >
                                                        <PlusCircleOutlined
                                                            style=
                                                            { {
                                                                color: "#009C7E"
                                                            } } />
                                                    </Add> : null }
                                            />
                                        </Form.Item>

                                        {
                                            fields.length >= 3 ?
                                                <>

                                                    { rest.map( ( field, index ) => (
                                                        <Form.Item
                                                            key={ index + 1 }
                                                            name={ [ index + 1 ] }
                                                            rules={ [ { required: true } ] }
                                                        >

                                                            <MyInput
                                                                addonBefore={ <Remove onClick={ () => remove( index ) }>
                                                                    <MinusCircleOutlined style=
                                                                        { {
                                                                            color: "#C82D73"
                                                                        } } /></Remove> }
                                                                placeholder={ "Next Step" }
                                                                value={ field[ index + 1 ] }
                                                            />
                                                        </Form.Item>
                                                    ) ) }


                                                    <Form.Item
                                                        key={ fields.length - 2 }
                                                        name={ [ fields.length - 2 ] }
                                                        rules={ [ { required: true } ] }
                                                    >

                                                        <MyInput
                                                            placeholder={ "Next step" }
                                                            value={ beforeLast }
                                                            $removeRightBorder={ true }
                                                            addonBefore={ <Remove onClick={ () => remove( fields.length - 2 ) }>
                                                                <MinusCircleOutlined
                                                                    style=
                                                                    { {
                                                                        color: "#C82D73"
                                                                    } } /></Remove> }
                                                            addonAfter={
                                                                <Add
                                                                    onClick={ () => add() }
                                                                >
                                                                    <PlusCircleOutlined
                                                                        style=
                                                                        { {
                                                                            color: "#009C7E"
                                                                        } } />
                                                                </Add> } />
                                                    </Form.Item>
                                                </> : null
                                        }

                                        {
                                            fields.length > 2 ? <Form.Item
                                                key={ fields.length - 1 }
                                                name={ [ fields.length - 1 ] }
                                                rules={ [ { required: true } ] }
                                            >

                                                <Input
                                                    placeholder={ "End" }
                                                    value={ last } />
                                            </Form.Item> : null
                                        }

                                    </div>


                                );



                            }
                        }
                    </Form.List>
                </Form>
            </Card>
        );

    }

    return (
        <Card
            className="border-2 border-[#D9D9D9]"
            extra={ <CardHeaderButton onClick={ toggleEdit } >Edit</CardHeaderButton> }
            title={ <strong>{ title }</strong> }
            headStyle={ {
                background: "#F5F5F5",
            } }
        >
            <Timeline>
                {
                    cardData.map( ( item, i ) => (
                        <Timeline.Item key={ i } color=
                            {
                                i == 0 ? "green" : "blue"
                            }>
                            <p>{ item }</p>
                        </Timeline.Item>
                    ) )
                }
            </Timeline>
        </Card>
    );
};

export { TimeLineCard };
