import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import
{
    Row,
    Col,
    Input,
    Select,
    Divider,
    DatePicker,
    Drawer
} from 'antd';
import { useRouter } from 'next/router';
import { SettingOutlined } from '@ant-design/icons';
import AppLayout from "../../../components/Dashboard/AppLayout";

import { Chart } from "../../../components/Dashboard/Journeys";

import fakeData from "../../../fakeData/journeys.json";
import products from "../../../fakeData/products.json";
import { splitRoutes } from "../../../utils";
import ActionButtons from "../../../components/Personas/ActionButtons";
import { Title } from "../../../components/Dashboard/SectionTitle";
import AddEvent from "../../../components/Dashboard/Journeys/AddEvent";


const { Option } = Select;

const getNames = ( list = [] ) =>
{
    return list.map( j => j.journeyName );
};

const init = {
    "id": "",
    "journeyName": "",
    "durationType": "",
    "duration": 0,
    "events": []
};

export default function Journeys ()
{
    const { pathname } = useRouter();
    const [ type, setType ] = useState( "" );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );
    const [ data, setData ] = useState( fakeData );

    const [ showDrawer, setShowDrawer ] = useState( false );

    const [ newJourney, setNewJourney ] = useState
        ( init );

    const [ activeJourney, setActiveJourney ] = useState( data[ activeProduct ][ 0 ] );


    const setJourney = ( journeyName ) =>
    {
        const journey = data[ activeProduct ].find( j => j.journeyName === journeyName );
        setActiveJourney( journey );
    };


    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        const journey = data[ product ][ 0 ];
        setActiveJourney( journey );

    };


    const setJourneyStart = ( dateTime ) =>
    {
        const start = new Date( dateTime._d ).toISOString();

        setNewJourney( {
            ...newJourney,
            journeyName: newJourney.journeyName || `Default_name ${ data[ activeProduct ].length }`,
            start
        } );
    };

    const onAddJourney = ( name ) =>
    {
        const newJ = {
            ...newJourney,
            journeyName: name || `Default_name ${ data[ activeProduct ].length }`,
            id: new Date().getTime(),
        };

        const newData = { ...data };

        newData[ activeProduct ].push( newJ );
        setData( newData );

        setNewJourney( newJ );
        setActiveJourney( newJ );

    };

    const setDuration = ( e ) =>
    {
        setNewJourney( {
            ...newJourney,
            duration: +e.target.value || 0,
            journeyName: newJourney.journeyName || `Default_name ${ data[ activeProduct ].length }`,

        } );
    };

    const handleTypeSelect = ( type ) =>
    {
        setNewJourney( {
            ...newJourney,
            durationType: type
        } );
    };

    const addEvent = ( event ) =>
    {
        const journey = { ...activeJourney };
        journey.events.push( event );

        const newData = { ...data };

        const jIndex = newData[ activeProduct ].findIndex( j => j.id === journey.id );

        if ( jIndex > -1 )
        {
            newData[ activeProduct ][ jIndex ] = journey;
        }
        else
        {
            newData[ activeProduct ].push( journey );
        }

        setData( newData );



        setActiveJourney( journey );

        setShowDrawer( false );


        if ( !newJourney?.id )
        {
            setNewJourney( init );
        }
    };

    const checkJourney = () =>
    {
        if ( activeJourney )
        {
            return activeJourney.start && activeJourney.duration && activeJourney.durationType;
        }

        return newJourney.start && newJourney.duration && newJourney.durationType;
    };

    const onClickAddEvt = () =>
    {
        setActiveJourney( newJourney );
        setShowDrawer( true );
    };


    return (
        <div className="mb-8">
            <Head>
                <title >Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero journey" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppLayout
                onChangeProduct={ setProduct }
                rightNavItems={ getNames( data[ activeProduct ] ) }
                activeRightItem={ activeJourney?.journeyName }
                hasMainAdd
                hasSideAdd
                onSideAdd={ onAddJourney }
                onMainAdd={ ( checkJourney() ) ? onClickAddEvt : () => alert( "Configure journey details" ) }
                type="text"
                setActiveRightNav={ setJourney }
                defaultText={ activeJourney?.journeyName ? activeJourney.journeyName : "Add" }
                breadCrumbItems={ splitRoutes( pathname ) }
                addNewText={ <p className="flex items-center" >Add Event <Divider
                    className="min-h-[100px]"
                    type="vertical" />  <SettingOutlined className="pl-[5px]" /></p> }

            >

                {
                    ( activeJourney && activeJourney.events.length ) ?
                        <Chart
                            journey={ activeJourney }
                        /> : null
                }

                {
                    ( !( activeJourney?.events?.length ) ) ? (
                        <div style={ { minHeight: "50vh" } } className="flex items-center justify-center">

                            <div>
                                <h1 className="text-[24px] leading-[32px] font-[600]">
                                    Journey Settings
                                </h1>
                                <p className="text-[14px] leading-[22px] font-[400] mt-[10px] mb-[27px]">How long does this take end to end ?</p>
                                <div className="flex items-center justify-between">
                                    <Input
                                        className="max-w-[102px] mr-[28px]"
                                        type="number"
                                        min="0"
                                        onChange={ setDuration }
                                        placeholder="5" />

                                    <Select
                                        className="min-w-[112px] mr-[28px]"
                                        placeholder="Time Picker"
                                        onChange={ handleTypeSelect }
                                    >
                                        <Option value="second">Seconds</Option>
                                        <Option value="minute">Minutes</Option>
                                        <Option value="hour">Hours</Option>
                                        <Option value="day">Days</Option>
                                        <Option value="week">Weeks</Option>
                                        <Option value="month">Months</Option>
                                        <Option value="year">Years</Option>
                                    </Select>

                                    <DatePicker
                                        showTime
                                        onChange={ setJourneyStart } />
                                </div>
                            </div>
                        </div>
                    ) : null
                }

                <AddEvent
                    onAdd={ addEvent }
                    journeyType={ activeJourney?.durationType }
                    onCancel={ () => setShowDrawer( false ) }
                    showDrawer={ showDrawer } />
            </AppLayout>
        </div>
    );
}
