import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';

import AppLayout from "../../../components/Dashboard/AppLayout";


import { splitRoutes } from "../../../utils";

import fakeData from "../../../fakeData/tasks.json";
import products from "../../../fakeData/products.json";



export default function Release ()
{
    const { pathname } = useRouter();

    const [ data, setData ] = useState( fakeData );

    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );


    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy tasks" />
                <link rel="icon" href="/favicon.ico" />
            </Head>


            <AppLayout   >

                <h1>Release</h1>
            </AppLayout>
        </div>
    );
}
