import React, { useState } from 'react';
import styled from 'styled-components';
import
{
    Card,
} from 'antd';

import CardHeaderButton from "./CardHeaderButton";
import FormCard from "./FormCard";
import { CardTitle as Title } from './CardTitle';

const MyCard = styled( Card )`

    .ant-card-head
    {
        min-height:unset;
    }

    .ant-card-head-title
    {
        padding:0
    }

    .ant-card-head-wrapper
    {
        margin:16px 0;
    }
    .ant-card-extra
    {
        padding:0
    }
`;


const ItemCard = ( {
    onEdit,
    item
} ) => 
{
    const [ isEdit, setIsEdit ] = useState( false );

    const toggleEdit = () => setIsEdit( s => !s );

    const handleEdit = ( item ) =>
    {
        onEdit( item );
        toggleEdit();
    };

    if ( isEdit )
    {
        return (
            <FormCard
                isEdit
                className='mb-[16px] border-2 border-[#D9D9D9]'
                itemToEdit={ item }
                onSubmit={ handleEdit } />
        );
    }

    return (
        <MyCard
            className='mb-[16px] border-2 border-[#D9D9D9]'
            extra={ <CardHeaderButton
                size="small"
                onClick={ toggleEdit } >Edit</CardHeaderButton> }
            title={ <Title>{ item.name }</Title> }
            headStyle={ {
                background: "#F5F5F5",
            } }
        >
            <p>
                { item.description }
            </p>
        </MyCard>
    );
};

export default ItemCard;
