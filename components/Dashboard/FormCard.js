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
        onCreate
    }
)
{
    const [ item, setItem ] = useState(
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

    const handleCreate = () =>
    {
        onCreate( item );
    };

    return (
        <Card
            bordered={ false }
            extra={ <CardHeaderButton onClick={ handleCreate } >Done</CardHeaderButton> }
            title={ <Input
                onChange={ e => handleChange( e, "name" ) }
                placeholder="Result name..." /> }
            headStyle={ {
                background: "#F5F5F5",
            } }
        >
            <TextArea
                autoSize={ { minRows: 6 } }
                onChange={ e => handleChange( e, "description" ) }
                placeholder="Result description..." />
        </Card>
    );
}
