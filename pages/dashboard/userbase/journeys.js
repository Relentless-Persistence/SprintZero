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
    "start": "",
    "events": []
};

export default function Journeys ()
{
    const { pathname } = useRouter();

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );
    const [ data, setData ] = useState( fakeData );

    const [ showDrawer, setShowDrawer ] = useState( false );

    const initJourney = data[ activeProduct ][ 0 ]?.id ? data[ activeProduct ][ 0 ] : { ...init, events: [] };


    const [ activeJourney, setActiveJourney ] = useState( initJourney );


    const setJourney = ( journeyName ) =>
    {
        const journey = data[ activeProduct ].find( j => j.journeyName === journeyName );
        setActiveJourney( journey );
    };


    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        if ( data[ product ][ 0 ] )
        {
            setActiveJourney( data[ product ][ 0 ] );
        }
        else
        {
            setActiveJourney( { ...init, events: [] } );
        }

    };


    const setJourneyStart = ( dateTime ) =>
    {
        console.log( dateTime );

        if ( dateTime?._d )
        {
            const start = new Date( dateTime._d ).toISOString();
            setActiveJourney(
                {
                    ...activeJourney,
                    journeyName: activeJourney.journeyName || `Default_name ${ data[ activeProduct ].length }`,
                    start
                } );
        }
    };

    const setDuration = ( e ) =>
    {

        setActiveJourney(
            {
                ...activeJourney,
                journeyName: activeJourney.journeyName || `Default_name ${ data[ activeProduct ].length }`,
                duration: +e.target.value || 0,
            } );
    };

    const handleTypeSelect = ( type ) =>
    {
        setActiveJourney(
            {
                ...activeJourney,
                durationType: type
            } );
    };


    const onAddJourney = ( name ) =>
    {
        const newJ = {
            ...init,
            journeyName: name || `Default_name ${ data[ activeProduct ].length + 1 }`,
            id: new Date().getTime(),
            events: []
        };

        const newData = { ...data };

        newData[ activeProduct ].push( newJ );
        setData( newData );

        setActiveJourney( newJ );

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


    };

    const checkJourney = () =>
    {
        return activeJourney?.start && activeJourney?.duration && activeJourney?.durationType;


    };

    const onClickAddEvt = () =>
    {
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
                    ( activeJourney && activeJourney?.start && activeJourney?.events?.length ) ?
                        <Chart
                            journey={ activeJourney }
                        /> : null
                }

                {
                    ( !activeJourney?.start || ( activeJourney?.start && !activeJourney?.events.length ) ) ? (
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
                                        value={ activeJourney?.duration }
                                        onChange={ setDuration }
                                        placeholder="5" />

                                    <Select
                                        className="min-w-[112px] mr-[28px]"
                                        placeholder="Time Picker"
                                        value={ activeJourney?.durationType }

                                        onChange={ handleTypeSelect }
                                    >
                                        <Option value="second">Seconds</Option>
                                        <Option value="minute">Minutes</Option>
                                        <Option value="hour">Hours</Option>
                                        <Option value="day">Days</Option>
                                        {/* <Option value="week">Weeks</Option> */ }
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
                    journeyStart={ activeJourney?.start }
                    journeyDur={ activeJourney?.duration }
                    journeyType={ activeJourney?.durationType }
                    onCancel={ () => setShowDrawer( false ) }
                    showDrawer={ showDrawer } />
            </AppLayout>
        </div>
    );
}
