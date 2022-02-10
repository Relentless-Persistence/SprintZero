import React, { useState } from 'react';
import
{
    Card,
} from 'antd';

import CardHeaderButton from "./CardHeaderButton";
import FormCard from "./FormCard";


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
                itemToEdit={ item }
                onSubmit={ handleEdit } />
        );
    }

    return (
        <Card

            bordered={ false }
            extra={ <CardHeaderButton onClick={ toggleEdit } >Edit</CardHeaderButton> }
            title={ item.name }
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
