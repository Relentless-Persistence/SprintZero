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

const MyCard = styled( Card )`

    .ant-card-head
    {
        min-height:unset;
    }

`;



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
                <MyCard
                    className='border-2 border-[#D9D9D9]'
                    extra={ <ActionButtons
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
                </MyCard>
            </div>
        );

    }

    return (
        <MyCard
            className='border-2 border-[#D9D9D9]'
            extra={ <CardHeaderButton size="small" onClick={ toggleEdit } >Edit</CardHeaderButton> }
            title={ <strong>{ title }</strong> }
            headStyle={ {
                background: "#F5F5F5",
            } }
        >
            <p>{ cardData }</p>
        </MyCard>
    );
};


export { DescriptionCard };
