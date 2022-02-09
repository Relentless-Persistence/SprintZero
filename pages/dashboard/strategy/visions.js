import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import
{
    Row,
    Col,
    Input
} from 'antd';

import AppLayout from "../../../components/Dashboard/AppLayout";
import ItemCard from "../../../components/Dashboard/ItemCard";

import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/productData.json";
import products from "../../../fakeData/products.json";


const getGoalNames = ( goals ) =>
{
    const goalNames = goals.map( g => g.name );

    return goalNames;
};

const visions = [ "Today", "2d ago", "Last week" ];

export default function Visions ()
{
    const [ vision, setVision ] = useState( visions[ 0 ] );

    const { pathname } = useRouter();


    const addVision = () =>
    {
        alert( "Hello" );
    };

    const setActiveVison = ( visionName ) =>
    {
        setVision( visionName );

    };




    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy objectives" />
                <link rel="icon" href="/favicon.ico" />
            </Head>



            <AppLayout
                rightNavItems={ visions }
                activeRightItem={ vision }
                setActiveRightNav={ setActiveVison }
                onMainAdd={ addVision }
                hasSideAdd={ false }
                defaultText="Statement"
                breadCrumbItems={ splitRoutes( pathname ) }>


                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet totam, sapiente hic sed voluptatum deserunt velit labore aperiam. Illo repellendus placeat ipsam quas quod consequatur temporibus, id asperiores laudantium sapiente?</p>


            </AppLayout>
        </div>
    );
}
