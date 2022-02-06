import React, { useState } from "react";

import
{
    Card,
    Input
} from 'antd';

import CardHeaderButton from "./CardHeaderButton";

const { TextArea } = Input;


export default function FormCard (
    {
        isEdit,
        itemToEdit,
        onSubmit
    }
)
{
    const [ item, setItem ] = useState( isEdit ? { ...itemToEdit } :
        {
            name: "",
            description: ""
        }
    );

    console.log( 'item' );


    const handleChange = ( e, key ) =>
    {
        const { value } = e.target;

        setItem( {
            ...item,
            [ key ]: value
        } );
    };

    const handleSubmit = () =>
    {
        if ( isEdit )
        {
            onSubmit(
                {
                    name: item.name || itemToEdit.name,
                    description: item.description || itemToEdit.description,

                }
            );

        }
        else
        {
            onSubmit( item );

        }
    };

    return (
        <Card
            bordered={ false }
            extra={ <CardHeaderButton onClick={ handleSubmit } >Done</CardHeaderButton> }
            title={ <Input
                value={ item.name }
                onChange={ e => handleChange( e, "name" ) }
                placeholder="Result name..." /> }
            headStyle={ {
                background: "#F5F5F5",
            } }
        >
            <TextArea
                autoSize={ { minRows: 6 } }
                value={ item.description }
                onChange={ e => handleChange( e, "description" ) }
                placeholder="Result description..." />
        </Card>
    );
}
