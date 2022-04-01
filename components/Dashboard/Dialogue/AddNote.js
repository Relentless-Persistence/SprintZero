import React from 'react';
import
{
    Row,
    Col,
    Menu,
    Button,
    Input,
    Form,
    Drawer
} from 'antd';
import styled from 'styled-components';

import { CloseOutlined } from '@ant-design/icons';
import ActionButtons from '../../Personas/ActionButtons';


const { TextArea } = Input;



const Title = styled.p`
    font-size: 16px;
    line-height: 24px;
    color: #8C8C8C;
    flex: none;
    margin: 4px 0px;
`;

const AddNote = (
    {
        visible,
        setVisible,
        dialogue,
        setDialogue,
        onSubmit
    }
) => 
{
    const [ form ] = Form.useForm();


    const onClose = () =>
    {
        setDialogue( null );
        setVisible( false );
    };


    const handleFinish = () => 
    {
        const values = form.getFieldsValue();
        const updatedDialogue = {
            ...dialogue,
            notes: values[ `${ dialogue?.id }fields` ]
        };

        //console.log( updatedDialogue );

        onSubmit( updatedDialogue );

        onClose();
    };

    return (
        <Drawer
            visible={ visible }
            closable={ false }
            placement={ "bottom" }
            onClose={ onClose }
            title={
                <Row>
                    <Col span={ 23 }>
                        <span>{ dialogue?.name }</span>

                    </Col>
                    <Col span={ 1 }>
                        <ActionButtons
                            className="justify-end"
                            onCancel={ onClose }
                            onSubmit={ handleFinish }
                        />
                    </Col>
                </Row>
            }
        >

            <Row className="py-6" gutter={ [ 20, 20 ] }>
                <Col span={ 16 }>
                    <p>
                        <strong>
                            Notes
                        </strong>
                    </p>

                    <Form
                        form={ form }
                        onFinish={ handleFinish }>

                        <Form.List
                            initialValue={ dialogue?.notes }
                            name={ `${ dialogue?.id }fields` } >
                            { ( fields, { add, remove } ) =>
                            {
                                return (
                                    <div>
                                        { fields.map( ( field, index ) => (
                                            <div key={ index }>
                                                <Form.Item
                                                    name={ [ index, "title" ] }
                                                    rules={ [ { required: true } ] }
                                                >
                                                    <Input placeholder="Title" />
                                                </Form.Item>

                                                <Form.Item
                                                    name={ [ index, "response" ] }
                                                    rules={ [ { required: true } ] }
                                                >
                                                    <TextArea
                                                        autoSize={ { minRows: 6 } }
                                                        placeholder="Response" />
                                                </Form.Item>
                                            </div>
                                        ) ) }

                                        <Button onClick={ () => add() } >
                                            Add More
                                        </Button>
                                    </div>
                                );
                            } }
                        </Form.List>

                    </Form>


                </Col>
                <Col
                    offset={ 3 }
                    span={ 4 }>
                    <Title className="text-right">Region</Title>
                    <p className="text-right text-lg">{ dialogue?.region }</p>

                    <br />
                    <br />
                    <Title className="text-right">Education</Title>
                    <p className="text-right text-lg">{ dialogue?.education }</p>
                </Col>
            </Row>


        </Drawer>
    );
};

export { AddNote };
