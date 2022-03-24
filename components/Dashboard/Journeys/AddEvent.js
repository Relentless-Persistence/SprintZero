import React, { useState } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import
{
    Row,
    Col,
    Input,
    Switch,
    Slider,
    Radio,
    DatePicker,
    TimePicker,
    Drawer
} from 'antd';
import { Title } from '../SectionTitle';
import ActionButtons from '../../Personas/ActionButtons';

import { add, isWithinInterval } from '../../../utils';

const { TextArea } = Input;

const marks = {
    0: '0',
    25: '25',
    50: '50',
    75: '75',
    100: "100"
};

const MyRadioBtns = styled( Radio.Group )`
    .ant-radio-button-wrapper-checked
    {
        background-color:#4A801D !important ;
    }
`;


const init = {

    "title": "",
    "description": "",
    "start": "",
    "end": "",
    "isDelighted": "1",
    "level": 50,
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
};

const AddEvent = (
    {
        onAdd,
        onCancel,
        journeyType,
        journeyStart,
        journeyDur,
        showDrawer
    }
) =>
{
    const [ evt, setEvt ] = useState( { ...init } );

    const validateEvtDur = ( start, end ) =>
    {
        if ( start && end )
        {

            console.log( journeyStart );
            const jStart = new Date( journeyStart );
            const jEnd = add( jStart,
                {
                    [ `${ [ journeyType ] }s` ]: journeyDur
                } );


            const validStart = isWithinInterval( new Date( start ),
                {
                    start: jStart,
                    end: jEnd
                } );

            const validEnd = isWithinInterval( new Date( end ),
                {
                    start: jStart,
                    end: jEnd
                } );


            return validStart && validEnd;
        }

        return false;
    };

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
        let time = "";
        if ( dateTime )
        {
            time = new Date( dateTime._d ).toISOString();
        }

        setEvt( { ...evt, [ field ]: time } );
    };

    const handleLevelChange = ( level ) =>
    {
        setEvt( { ...evt, level } );
    };

    const handleEmotionChange = ( e ) =>
    {

        setEvt( { ...evt, isDelighted: e.target.value } );
    };

    const addNewEvent = () =>
    {
        const newEvt =
        {
            ...evt,
            isDelighted: !!( +evt.isDelighted ),
            "id": new Date().getTime()
        };


        const validTimes = validateEvtDur( newEvt.start, newEvt.end );

        if ( !validTimes )
        {
            alert( "The event duration does not fall within the journey duration" );

            return;
        }

        let isValid = true;


        for ( const field in newEvt ) 
        {
            isValid = isValid && newEvt[ field ] !== "";
        }

        if ( isValid )
        {
            onAdd( newEvt );
            setEvt( { ...init } );
        }
        else
        {
            alert( "Please fill all fields" );
        }


    };

    const renderPicker = ( field ) =>
    {

        switch ( journeyType )
        {
            case "year":
                return <DatePicker
                    picker="year" onChange={ ( dateTime ) => handleTimeChange( field, dateTime ) } />;

            case "year":
                return <DatePicker
                    picker="month" onChange={ ( dateTime ) => handleTimeChange( field, dateTime ) } />;

            case "hour":
            case "minute":
            case "second":
                return <TimePicker
                    onChange={ ( dateTime ) => handleTimeChange( field, dateTime ) } />;

            default:
                return <DatePicker
                    onChange={ ( dateTime ) => handleTimeChange( field, dateTime ) } />;
        }
    };

    return (
        <Drawer
            destroyOnClose={ true }
            title={
                <Row>
                    <Col span={ 22 }>
                        <h1 className="font-[600] font[#262626] font-[20px] leading-[28px]">Touchpoint</h1>
                    </Col>
                    <Col span={ 2 }>
                        <ActionButtons
                            onCancel={ onCancel }
                            onSubmit={ addNewEvent }
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
                        value={ evt.title }
                        placeholder="Event Name" />

                    <Title className="mb-[8px] mt-[24px]" >
                        Description
                    </Title>

                    <TextArea
                        onChange={ handleDescChange }
                        rows={ 4 }
                        value={ evt.description }
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

                    <MyRadioBtns
                        onChange={ handleEmotionChange }
                        defaultValue="1"
                        value={ evt.isDelighted }
                        buttonStyle="solid">
                        <Radio.Button
                            size="small"
                            value="0">Frustrated</Radio.Button>
                        <Radio.Button
                            size="small"
                            value="1">Delighted</Radio.Button>
                    </MyRadioBtns>

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
                        onChange={ handleLevelChange }
                        value={ evt.level }
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
