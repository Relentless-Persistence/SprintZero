import React, { useState, useEffect } from "react";
import styled from "styled-components";

import
{
    Card,
    Input,
    Form,
    Button
} from 'antd';

import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

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

const MyCard = styled( Card )`

    .ant-card-head
    {
        min-height:unset;
        border-bottom: 2px solid #D9D9D9;
    }
`;


const ListCard = (
    {
        handleEdit,
        title = "Goals",
        cardData = []
    }
) => 
{

    const [ list, setList ] = useState( [ ...cardData ] );

    const [ isEdit, setIsEdit ] = useState( false );

    const toggleEdit = () => setIsEdit( s => !s );

    const onFinish = () =>
    {
        const values = list.filter( it => it.trim().length > 0 );
        handleEdit( values );
        setIsEdit( false );
    };


    const onCancel = () =>
    {
        setIsEdit( false );
    };

    const add = () =>
    {
        const newList = [ ...list, "" ];
        setList( newList );
    };

    const remove = ( index ) =>
    {
        const newList = list.filter( ( _, i ) => i !== index );
        setList( newList );
    };

    const onChange = ( e, i ) =>
    {
        const newList = [ ...list ];
        newList[ i ] = e.target.value;

        setList( newList );
    };


    if ( isEdit )
    {

        return (
            <MyCard
                className="border-2 border-[#D9D9D9]"
                extra={ <ActionButtons
                    onCancel={ onCancel }
                    onSubmit={ onFinish }
                /> }
                title={ <strong>{ title }</strong> }
                headStyle={ {
                    background: "#F5F5F5",
                } }>
                {
                    list.map( ( it, i ) => (
                        <MyInput
                            key={ i }
                            value={ it }
                            className="mb-[12px]"
                            onChange={ ( e ) => onChange( e, i ) }
                            addonBefore={ <div className="flex items-center justify-between">
                                <button
                                    onClick={ () => remove( i ) }
                                    className="flex items-center mr-[5px]">
                                    <MinusCircleOutlined
                                        style=
                                        { {
                                            color: "#C82D73"
                                        } } />
                                </button>
                                { `${ i + 1 }.` }
                            </div> }
                            autoFocus
                            $removeRightBorder={ i === list.length - 1 }
                            addonAfter={ i === list.length - 1 ?
                                <Add
                                    onClick={ add }
                                >
                                    <PlusCircleOutlined
                                        style=
                                        { {
                                            color: "#009C7E"
                                        } } />
                                </Add>
                                : null } />
                    ) )
                }
            </MyCard>
        );

    }

    return (
        <MyCard
            className="border-2 border-[#D9D9D9]"

            extra={ <CardHeaderButton size="small" onClick={ toggleEdit } >Edit</CardHeaderButton> }
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
        </MyCard>
    );
};

export { ListCard };
