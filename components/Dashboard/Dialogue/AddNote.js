import React, { useState, useRef } from 'react';
import
{
    Row,
    Col,
    Button,
    Input,
    Form,
    Drawer
} from 'antd';
import styled from 'styled-components';

import ActionButtons from '../../Personas/ActionButtons';


const { TextArea } = Input;

const Title = styled.p`
    font-size: 16px;
    line-height: 24px;
    color: #8C8C8C;
    flex: none;
    margin: 4px 0px;
`;

const init =
{
    "name": "",
    "post": "BobCat Operator",
    "region": "",
    "education": "",
    "notes": [
        {
            "id": "1",
            "title": "",
            "response": ""
        }
    ]
};

const AddNote = (
    {
        visible,
        setVisible,
        onSubmit,
        height = 378
    }
) =>
{
    const ref = useRef();
    const [ item, setItem ] = useState( { ...init } );

    const onClose = () =>
    {
        setVisible( false );
    };

    const handleEducation = ( e ) =>
    {
        setItem( {
            ...item,
            education: e.target.value
        } );
    };

    const handleRegion = ( e ) =>
    {
        setItem( {
            ...item,
            region: e.target.value
        } );
    };

    const handleName = ( e ) =>
    {
        setItem( {
            ...item,
            name: e.target.value
        } );
    };


    const handleNoteChange = ( e, index, key ) =>
    {
        const newItem = { ...item };
        const notes = newItem.notes;

        notes[ index ][ key ] = e.target.value;
        setItem( newItem );


    };

    const handleFinish = () =>
    {
        const filteredNotes = item.notes.filter( it =>
        {
            return it.response.trim() && it.title.trim();
        } );

        const length = filteredNotes.length;

        if ( item.name && length && item.education && item.region )
        {
            onSubmit( {
                ...item,
                notes: filteredNotes
            } );
        }

        onClose();
    };

    const onAddNote = () =>
    {
        const newItem = { ...item };
        const notes = newItem.notes;

        notes.push( {
            "id": new Date().getTime(),
            "title": "",
            "response": ""
        } );


        setItem( newItem );
    };

    return (
        <Drawer
            visible={ visible }
            closable={ false }
            height={ height }
            placement={ "bottom" }
            headerStyle={ {
                background: "#F5F5F5"
            } }
            onClose={ onClose }
            title={
                <div className="flex gap-4 justify-between">
                    <Input
                        value={ item.name }
                        placeholder="John Doe"
                        onChange={ handleName }
                        className="max-w-sm"
                    />
                    <ActionButtons
                        className="justify-end"
                        onCancel={ onClose }
                        onSubmit={ handleFinish }
                    />
                </div>
            }
        >

            <Row gutter={ [ 20, 20 ] }>
                <Col span={ 16 }>
                    <p>
                        <strong>
                            Notes
                        </strong>
                    </p>

                    <Form
                        ref={ ref }
                        onFinish={ handleFinish }>

                        {
                            item.notes.map( ( note, index ) => (
                                <div
                                    key={ index }>
                                    <Input
                                        className='mb-[24px]'
                                        onChange={ ( e ) => handleNoteChange( e, index, "title" ) }
                                        value={ note.title }
                                        placeholder="Title" />

                                    <TextArea
                                        className='mb-[24px]'
                                        onChange={ ( e ) => handleNoteChange( e, index, "response" ) }
                                        value={ note.response }
                                        autoSize={ { minRows: 6 } }
                                        placeholder="Response" />
                                </div>
                            ) )
                        }

                        <Button
                            className='text-[#4A801D] border-[#4A801D]'
                            onClick={ onAddNote } >
                            Add More
                        </Button>

                    </Form>


                </Col>
                <Col
                    offset={ 3 }
                    span={ 4 }>
                    <Title className="text-right">Region</Title>
                    <Input
                        className="text-right text-lg"
                        value={ item.region }
                        placeholder="Africa"
                        onChange={ handleRegion }
                    />
                    {/* <p className="text-right text-lg">{ item.region }</p> */ }

                    <br />
                    <br />

                    <Title className="text-right">Education</Title>
                    <Input
                        className="text-right text-lg"
                        value={ item.education }
                        placeHolder="Bachelors"
                        onChange={ handleEducation }
                    />
                    {/* <p className="text-right text-lg">{ item.education }</p> */ }
                </Col>
            </Row>


        </Drawer>
    );
};

export { AddNote };
