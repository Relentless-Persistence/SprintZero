import React, { useState } from "react";
import styled from "styled-components";

import
{
    Card,
    Input,
    Form,
    Button
} from 'antd';

import { PlusCircleOutlined } from '@ant-design/icons';

import { OL } from "./NumberList";

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
        border-left:none;
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


const ListCard = (
    {
        handleEdit,
        title = "Goals",
        name = "",
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
            <Card extra={ <ActionButtons
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
                        { ( fields, { add } ) => (
                            <div>
                                {
                                    fields.map( ( field, index ) => (
                                        <Form.Item
                                            key={ index }
                                            name={ [ index ] }
                                            rules={ [ { required: true } ] }
                                        >

                                            <MyInput
                                                addonBefore={ `${ index + 1 }.` }
                                                value={ field[ index ] }
                                                autoFocus
                                                $removeRightBorder={ index === fields.length - 1 }
                                                addonAfter={ index === fields.length - 1 ?
                                                    <Add
                                                        onClick={ () => add() }
                                                    >
                                                        <PlusCircleOutlined
                                                            style=
                                                            { {
                                                                color: "#009C7E"
                                                            } } />
                                                    </Add>
                                                    : null } />
                                        </Form.Item>
                                    ) )
                                }


                            </div>
                        ) }
                    </Form.List>
                </Form>
            </Card>
        );

    }

    return (
        <Card
            extra={ <CardHeaderButton onClick={ toggleEdit } >Edit</CardHeaderButton> }
            title={ <strong>{ title }</strong> }
            headStyle={ {
                background: "#F5F5F5",
            } }
        >
            <OL>
                {
                    cardData.map( ( item, i ) => (
                        <li key={ i }>
                            { item }
                        </li>
                    ) )
                }
            </OL>
        </Card>
    );
};

export { ListCard };
