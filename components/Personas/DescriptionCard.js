import React, { useState } from "react";
import styled from "styled-components";

import
{
    Card,
    Input,
    Form,
    Button
} from 'antd';


import CardHeaderButton from "../Dashboard/CardHeaderButton";
import ActionButtons from "./ActionButtons";

const { TextArea } = Input;



const DescriptionCard = (
    {
        handleEdit,
        title = "Goals",
        name = "",
        cardData = [ "" ]
    }
) => 
{


    const [ isEdit, setIsEdit ] = useState( false );
    const [ state, setState ] = useState( cardData[ 0 ] );

    const toggleEdit = () => setIsEdit( s => !s );

    const handleChange = ( e ) =>
    {
        const { value } = e.target;
        setState( value );
    };

    const onFinish = () =>
    {
        handleEdit( state );
        toggleEdit();
        setState( "" );

    };

    if ( isEdit )
    {
        return (
            <div onMouseLeave={ toggleEdit }>
                <Card extra={ <ActionButtons
                    onCancel={ toggleEdit }
                    onSubmit={ onFinish }
                /> }
                    title={ <strong>{ title }</strong> }
                    headStyle={ {
                        background: "#F5F5F5",
                    } }>
                    <Form name={ `${ name }${ title }fields` } >
                        <TextArea
                            autoSize={ { minRows: 6 } }
                            value={ state }
                            onChange={ handleChange }
                            placeholder="Description..." />
                    </Form>
                </Card>
            </div>
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
            <p>{ cardData }</p>
        </Card>
    );
};


export { DescriptionCard };
