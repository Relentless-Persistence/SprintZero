import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { Input, Select, Divider, DatePicker } from 'antd';
import { useRouter } from 'next/router';
import { SettingOutlined } from '@ant-design/icons';
import AppLayout from "../../../components/Dashboard/AppLayout";

import { Chart } from "../../../components/Dashboard/Journeys";

import fakeData from "../../../fakeData/journeys.json";
import products from "../../../fakeData/products.json";
import { splitRoutes } from "../../../utils";



const { Option } = Select;

const getNames = ( list = [] ) =>
{
    return list.map( j => j.journeyName );
};

export default function Journeys ()
{
    const { pathname } = useRouter();
    const [ type, setType ] = useState( "" );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );
    const [ data, setData ] = useState( fakeData );
    const [ showAdd, setShowAdd ] = useState( false );

    const [ showDrawer, setShowDrawer ] = useState( false );

    const [ newJourney, setNewJourney ] = useState(
        {

            "id": "",
            "journeyName": "",
            "durationType": "",
            "duration": 0,
            "events": []
        }
    );

    const [ activeJourney, setActiveJourney ] = useState( data[ activeProduct ][ 0 ] );

    const handleTypeSelect = ( type ) =>
    {
        alert( type );

        console.log( newJourney );
    };

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
        setShowAdd( false );

    };


    const setJourneyStart = ( dateTime ) =>
    {
        const start = new Date( dateTime._d ).toISOString();

        setNewJourney( {
            ...newJourney,
            start
        } );
    };

    const onAddJourney = ( name ) =>
    {
        const newJ = {
            ...newJourney,
            id: new Date().getTime(),
            journeyName: name,
        };

        const newData = { ...data };

        newData[ activeProduct ].push( newJ );
        setData( newData );

        setNewJourney( newJ );
        setActiveJourney( newJ );

        setShowAdd( true );
    };

    const setDuration = ( e ) =>
    {
        setNewJourney( {
            ...newJourney,
            duration: +e.target.value || 0
        } );
    };


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy huddle" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppLayout
                onChangeProduct={ setProduct }
                rightNavItems={ getNames( data[ activeProduct ] ) }
                activeRightItem={ activeJourney?.journeyName }
                hasMainAdd
                hasSideAdd
                onSideAdd={ onAddJourney }
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
                    ( showAdd || ( activeJourney && !activeJourney.events.length ) ) ? (
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

                {
                    !activeJourney ? <div style={ { minHeight: "50vh" } } className="flex items-center justify-center">

                        <div>
                            <h1 className="text-[24px] leading-[32px] font-[600]">
                                Click <q>Add</q> in the right side menu
                            </h1>

                        </div>
                    </div> : null
                }

            </AppLayout>
        </div>
    );
}
