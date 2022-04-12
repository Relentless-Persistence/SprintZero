import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from 'next/router';
import
{
    Row,
    Col,
    Card,
    Checkbox,
    Input,
    Avatar
} from 'antd';

import AppCheckbox from '../../../components/AppCheckbox';

import AppLayout from "../../../components/Dashboard/AppLayout";
import { splitRoutes, getTimeAgo } from "../../../utils";

import fakeData from "../../../fakeData/huddleData.json";
import products from "../../../fakeData/products.json";
import styled from "styled-components";

const generateRightNav = ( items ) =>
{
    if ( !items?.length )
    {
        return [ "Now" ];
    }

    return items.map( it => (
        {
            render: () => getTimeAgo( it.createdAt ),
            value: it.createdAt
        }
    ) );
};


const MyCard = styled( Card )`
border: 1px solid #D9D9D9;
    .ant-card-meta-title
    {
        margin-bottom:0 !important;
    }

    .ant-card-body 
    {
        flex-grow: 1;
        max-height:65vh;
        overflow-y:auto;
        padding:12px 16px;
    }

    .section
    {
        margin-bottom:20px;
        h4
        {
            font-weight: 600;
            font-size: 16px;
            line-height: 24px;
            margin-bottom:5px;
        }

        .ant-checkbox-checked .ant-checkbox-inner 
        {
            background: #4A801D;
            border: 1px solid #4A801D;
            border-radius: 2px;
        }
    }
`;


export default function Huddle ()
{
    const { pathname } = useRouter();
    const [ activeProduct, setActiveProduct ] = useState( products[ 0 ] );
    const user = "Arlene McCoy";

    const [ showAddNews, setShowAddNews ] = useState( {
        blockers: false,
        today: false,
        yesterday: false
    } );

    const [ addText, setAddText ] = useState( {
        blockers: "",
        today: "",
        yesterday: ""
    } );


    const [ data, setData ] = useState( fakeData );
    const [ activeTimeIndex, setActiveTimeIndex ] = useState( 0 );
    const [ activeTime, setActiveTime ] = useState( data[ activeProduct ][ activeTimeIndex ] );

    const setProduct = ( product ) =>
    {
        setActiveProduct( product );
        setActiveTimeIndex( 0 );
        setActiveTime( data[ product ][ 0 ] );
    };

    const setActiveRightNav = ( date ) =>
    {
        const activeData = data[ activeProduct ];

        const huddleIndex = activeData.findIndex( h => h.createdAt === date );


        if ( huddleIndex > -1 )
        {
            const huddle = activeData[ huddleIndex ];
            setActiveTime( huddle );
            setActiveTimeIndex( huddleIndex );

        }
    };

    const handleCheck = ( itemIndex, sectionKey, cardIndex ) =>
    {
        const newData = { ...data };
        const activeData = newData[ activeProduct ];
        const comments = activeData[ activeTimeIndex ].comments;


        comments[ cardIndex ].data[ sectionKey ][ itemIndex ].complete = !comments[ cardIndex ].data[ sectionKey ][ itemIndex ].complete;

        setData( newData );



    };

    const onClickAddNew = ( sectionKey, cardIndex ) =>
    {
        setShowAddNews( {
            ...showAddNews,
            [ sectionKey ]: true
        } );

        const newData = { ...data };
        const activeData = newData[ activeProduct ];
        const comments = activeData[ activeTimeIndex ].comments;

        comments[ cardIndex ].data[ sectionKey ].push( {
            text: "",
            complete: false
        } );

        setData( newData );

    };

    const doneAddNew = ( e, sectionKey, cardIndex ) =>
    {
        if ( e.key === "Enter" )
        {
            setShowAddNews( {
                blockers: false,
                today: false,
                yesterday: false
            } );

            const newData = { ...data };
            const activeData = newData[ activeProduct ];
            let comments = activeData[ activeTimeIndex ].comments;

            const val = addText[ sectionKey ].trim();

            if ( val )
            {
                const length = comments[ cardIndex ].data[ sectionKey ].length - 1;
                comments[ cardIndex ].data[ sectionKey ][ length ].text = val;
            }
            else
            {
                comments[ cardIndex ].data[ sectionKey ].pop();
            }

            setData( newData );

            setAddText( {
                blockers: "",
                today: "",
                yesterday: ""
            } );
        }


    };

    const onChange = ( e, field ) =>
    {
        console.log( 9 );
        setAddText( {
            ...addText,
            [ field ]: e.target.value
        } );
    };

    const rightNav = generateRightNav( data[ activeProduct ] );


    return (
        <div>
            <Head>
                <title>Dashboard | Sprint Zero</title>
                <meta name="description" content="Sprint Zero strategy huddle" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <AppLayout
                onChangeProduct={ setProduct }
                hasSideAdd={ false }
                defaultText={ activeTime ? getTimeAgo( new Date( activeTime?.createdAt ) ) : "" }
                rightNavItems={ rightNav }
                setActiveRightNav={ setActiveRightNav }
                activeRightItem={ activeTime?.createdAt }
                mainClass="mr-[140px]"
                breadCrumbItems={ splitRoutes( pathname ) }>

                <Row
                    className="max-w-[1200px] overflow-x-auto"
                    gutter={ [ 16, 16 ] }>

                    {
                        activeTime ? <>
                            {
                                activeTime?.comments?.map( ( c, index ) => (
                                    <Col
                                        className="flex"
                                        key={ index } span={ 8 }>
                                        <MyCard
                                            style={ { display: 'flex', flexDirection: 'column' } }
                                            title={ <Card.Meta
                                                avatar={ <Avatar
                                                    size={ 48 }
                                                    src={ c.avatar }
                                                    style={ {
                                                        border: "2px solid #315613"
                                                    } }
                                                /> }
                                                title={ c.name }
                                                description={ c.role }
                                            /> }>


                                            <section>

                                                <div className="section">
                                                    <h4>Blockers</h4>

                                                    {
                                                        c.data?.blockers?.length ? (
                                                            <ul>
                                                                {
                                                                    c.data?.blockers.map( ( d, i ) => (
                                                                        !( i == c.data?.blockers.length - 1 && showAddNews.blockers ) ? <li key={ i }>

                                                                            <Checkbox
                                                                                onChange={ () => handleCheck( i, "blockers", index ) }
                                                                                checked={ d.complete } >
                                                                                {
                                                                                    d.complete ? <strike>
                                                                                        { d.text }
                                                                                    </strike> : d.text
                                                                                }
                                                                            </Checkbox>
                                                                        </li> : null
                                                                    ) )
                                                                }

                                                                {
                                                                    c.name === user ?
                                                                        (
                                                                            <li>
                                                                                {
                                                                                    showAddNews.blockers ?
                                                                                        <Input
                                                                                            value={ addText.blockers }
                                                                                            onKeyPress={ ( e ) => doneAddNew( e, "blockers", index ) }
                                                                                            onChange={ ( e ) => onChange( e, "blockers" ) }
                                                                                        />
                                                                                        : <AppCheckbox
                                                                                            checked={ false }
                                                                                            onChange={ () => onClickAddNew( "blockers", index ) }>
                                                                                            <span className='text-[#BFBFBF]'>
                                                                                                Add New
                                                                                            </span>
                                                                                        </AppCheckbox>
                                                                                }
                                                                            </li>
                                                                        )
                                                                        : null
                                                                }
                                                            </ul>
                                                        ) : <p className="text-[#595959]" >None</p>
                                                    }


                                                </div>

                                                <div className="section">
                                                    <h4>Today</h4>

                                                    {
                                                        c.data?.today?.length ? ( <ul>
                                                            {
                                                                c.data?.today?.map( ( d, i ) => (
                                                                    !( i == c.data?.today.length - 1 && showAddNews.today ) ? <li key={ i }>
                                                                        <Checkbox onChange={ () => handleCheck( i, "today", index ) }
                                                                            checked={ d.complete } >{
                                                                                d.complete ? <strike>
                                                                                    { d.text }
                                                                                </strike> : d.text
                                                                            }</Checkbox>
                                                                    </li> : null
                                                                ) )
                                                            }

                                                            {
                                                                c.name === user ?
                                                                    (
                                                                        <li>
                                                                            {
                                                                                showAddNews.today ?
                                                                                    <Input
                                                                                        value={ addText.today }
                                                                                        onKeyPress={ ( e ) => doneAddNew( e, "today", index ) }
                                                                                        onChange={ ( e ) => onChange( e, "today" ) }
                                                                                    />
                                                                                    : <AppCheckbox
                                                                                        checked={ false }
                                                                                        onChange={ () => onClickAddNew( "today", index ) }>
                                                                                        <span className='text-[#BFBFBF]'>
                                                                                            Add New
                                                                                        </span>
                                                                                    </AppCheckbox>
                                                                            }
                                                                        </li>
                                                                    )
                                                                    : null
                                                            }
                                                        </ul> ) : <p className="text-[#595959]" >None</p>
                                                    }

                                                </div>

                                                <div className="section">
                                                    <h4>Yesterday</h4>

                                                    {
                                                        c.data?.yesterday?.length ? (
                                                            <ul>
                                                                {
                                                                    c.data?.yesterday?.map( ( d, i ) => (
                                                                        !( i == c.data?.yesterday.length - 1 && showAddNews.yesterday ) ? <li key={ i }>
                                                                            <Checkbox onChange={ () => handleCheck( i, "yesterday", index ) }
                                                                                checked={ d.complete } >{
                                                                                    d.complete ? <strike>
                                                                                        { d.text }
                                                                                    </strike> : d.text
                                                                                }</Checkbox>
                                                                        </li> : null
                                                                    ) )
                                                                }


                                                                {
                                                                    c.name === user ?
                                                                        (
                                                                            <li>
                                                                                {
                                                                                    showAddNews.yesterday ?
                                                                                        <Input
                                                                                            value={ addText.yesterday }
                                                                                            onKeyPress={ ( e ) => doneAddNew( e, "yesterday", index ) }
                                                                                            onChange={ ( e ) => onChange( e, "yesterday" ) }
                                                                                        />
                                                                                        : <AppCheckbox
                                                                                            checked={ false }
                                                                                            onChange={ () => onClickAddNew( "yesterday", index ) }>
                                                                                            <span className='text-[#BFBFBF]'>
                                                                                                Add New
                                                                                            </span>
                                                                                        </AppCheckbox>
                                                                                }
                                                                            </li>
                                                                        )
                                                                        : null
                                                                }
                                                            </ul>
                                                        ) : <p className="text-[#595959]" >None</p>
                                                    }

                                                </div>

                                            </section>
                                        </MyCard>
                                    </Col>
                                ) )
                            }</> : <h2 className="text-[#595959] text-center" >Nothing to see</h2>

                    }

                </Row>


            </AppLayout>
        </div>
    );
}
