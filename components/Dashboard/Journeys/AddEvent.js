import React, { useState } from 'react';
import
{
    Row,
    Col,
    Input,
    Switch,
    Slider,
    Divider,
    DatePicker,
    TimePicker,
    Drawer
} from 'antd';
import { Title } from '../SectionTitle';
import ActionButtons from '../../Personas/ActionButtons';
const { TextArea } = Input;

const marks = {
    0: '0',
    25: '25',
    50: '50',
    75: '75',
    100: "100"
};




const AddEvent = (
    {
        onAdd,
        onCancel,
        journeyType,
        showDrawer
    }
) =>
{
    const [ evt, setEvt ] = useState(
        {

            "title": "",
            "description": "",
            "start": "",
            "end": "",
            "isDelighted": "",
            "level": "",
            "participants":
                [
                    {
                        label: "Marketing",
                        checked: false
                    },
                    {
                        label: "Administrative Assistant",
                        checked: true
                    },
                    {
                        label: "Account Executive",
                        checked: false
                    },
                    {
                        label: "Vice President of Marketing",
                        checked: true
                    },
                    {
                        label: "Media Relations Coordinator",
                        checked: true
                    }
                ]
        },
    );

    const handleNameChange = ( e ) =>
    {
        setEvt( { ...evt, title: e.target.value } );
    };

    const handleDescChange = ( e ) =>
    {
        setEvt( { ...evt, description: e.target.value } );
    };

    const handleTimeChange = ( field, dateTime ) =>
    {
        const time = new Date( dateTime._d ).toISOString();
        setEvt( { ...evt, [ field ]: time } );
    };

    const handleLevelChange = ( e ) =>
    {
        setEvt( { ...evt, level: e.target.value } );
    };

    const addNewEvent = () =>
    {
        const newEvt =
        {
            ...evt,
            "id": new Date().getTime()
        };

        let isValid = true;

        for ( const field in newEvt ) 
        {
            isValid = isValid && newEvt[ field ];
        }

        if ( isValid )
        {
            onAdd( newEvt );
        }


    };

    const renderPicker = ( field ) =>
    {

        switch ( journeyType )
        {
            case "year":
                return <DatePicker picker="year" onChange={ ( dateTime ) => handleTimeChange( field, dateTime ) } />;

            case "year":
                return <DatePicker picker="month" onChange={ ( dateTime ) => handleTimeChange( field, dateTime ) } />;

            case "hour":
            case "minute":
            case "second":
                return <TimePicker onChange={ ( dateTime ) => handleTimeChange( field, dateTime ) } />;

            default:
                return <DatePicker onChange={ ( dateTime ) => handleTimeChange( field, dateTime ) } />;
        }
    };

    return (
        <Drawer
            title={
                <Row>
                    <Col span={ 22 }>
                        <h1 className="font-[600] font[#262626] font-[20px] leading-[28px]">Touchpoint</h1>
                    </Col>
                    <Col span={ 2 }>
                        <ActionButtons
                            onCancel={ onCancel }
                            onClose={ addNewEvent }
                        />
                    </Col>
                </Row>
            }
            placement={ "bottom" }
            closable={ false }
            visible={ showDrawer }>

            <Row gutter={ [ 10, 10 ] } >
                <Col span={ 10 }>
                    <Title className="mb-[8px]" >
                        Subject
                    </Title>


                    <Input
                        onChange={ handleNameChange }
                        placeholder="Event Name" />

                    <Title className="mb-[8px] mt-[24px]" >
                        Description
                    </Title>

                    <TextArea
                        onChange={ handleDescChange }
                        rows={ 4 }
                        placeholder="Event Description"
                    />

                </Col>

                <Col span={ 8 }>

                    <div className="flex items-center">
                        <div className="mr-[8px]">

                            <Title className="mb-[8px]" >
                                Start
                            </Title>

                            { renderPicker( "start" ) }

                        </div>

                        <div>

                            <Title className="mb-[8px]" >
                                End
                            </Title>

                            { renderPicker( "end" ) }

                        </div>
                    </div>

                    <Title className="mb-[8px] mt-[24px]" >
                        Emotion
                    </Title>

                    <Title className="mb-[8px] mt-[24px]" >
                        Level
                    </Title>

                    <Slider
                        trackStyle={ {
                            backgroundColor: "#F0F0F0"
                        } }
                        handleStyle={ {
                            borderColor: "#5A9D24"
                        } }
                        marks={ marks }

                        defaultValue={ 50 } />

                </Col>

                <Col span={ 6 }>

                    <Title className="mb-[8px]" >
                        Participants
                    </Title>

                    {
                        evt.participants.map( e => ( <div
                            key={ e.label }
                            className='flex items-center'>
                            <Switch
                                size="small"
                                className={ `${ e.checked ? "bg-[#4A801D]" : "bg-[#BFBFBF]" } mr-[8px]` } />
                            <p>{ e.label }</p>
                        </div> ) )
                    }




                </Col>



            </Row>

        </Drawer>

    );
};

export default AddEvent;
