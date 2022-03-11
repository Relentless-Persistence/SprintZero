import React, { useState } from 'react';
import styled from 'styled-components';
import
{
    Card,
} from 'antd';

import CardHeaderButton from "./CardHeaderButton";
import FormCard from "./FormCard";

const Title = styled.h2`
font-family: 'SF Pro Text';
font-style: normal;
font-weight: 600;
font-size: 14px;
line-height: 22px;
color: #262626;
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
                className='mb-[16px]'
                itemToEdit={ item }
                onSubmit={ handleEdit } />
        );
    }

    return (
        <Card
            className='mb-[16px]'
            bordered={ false }
            extra={ <CardHeaderButton onClick={ toggleEdit } >Edit</CardHeaderButton> }
            title={ <Title>{ item.name }</Title> }
            headStyle={ {
                background: "#F5F5F5",
            } }
        >
            <p>
                { item.description }
            </p>
        </Card>
    );
};

export default ItemCard;
