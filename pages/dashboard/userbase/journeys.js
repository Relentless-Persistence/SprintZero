import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";

import AppLayout from "../../../components/Dashboard/AppLayout";


export default function Journeys ()
{



    return (
        <div className="mb-8">
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy huddle" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppLayout>
                <h1>In progress</h1>
            </AppLayout>
        </div>
    );
}
