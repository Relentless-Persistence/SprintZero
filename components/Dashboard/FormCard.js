import React, { useState } from "react";

import
{
    Card,
    Input
} from 'antd';

import CardHeaderButton, { CardHeaderLink } from "./CardHeaderButton";
import ActionButtons from "../Personas/ActionButtons";


const { TextArea } = Input;


export default function FormCard (
    {
        isEdit,
        extra,
        itemToEdit,
        extraItems,
        onSubmit,
        className,
    }
)
{
    const [ item, setItem ] = useState( isEdit ? { ...itemToEdit } :
        {
            name: "",
            description: ""
        }
    );



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
            className={ className }
            bordered={ false }
            extra={ extra ? extra : <CardHeaderLink onClick={ handleSubmit } >Done</CardHeaderLink> }
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

            { extraItems }
        </Card>
    );
}

export const ActionFormCard = (
    {
        title,
        description,
        useAction = true,
        onSubmit,
        onCancel,
        className,
        extraItems
    }
) =>
{
    const [ item, setItem ] = useState(
        {
            title,
            description,
        }
    );


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
        onSubmit( item );
        setItem( { item: "", description: "" } );
    };


    return (
        <Card
            className={ className }
            bordered={ false }
            extra={ useAction ? <ActionButtons
                className="ml-[12px]"
                onCancel={ onCancel }
                onSubmit={ handleSubmit }
            /> : <CardHeaderLink onClick={ handleSubmit } >Done</CardHeaderLink> }
            title={ <Input
                value={ item.title }
                onChange={ e => handleChange( e, "title" ) }
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
            { extraItems }
        </Card>
    );
};
