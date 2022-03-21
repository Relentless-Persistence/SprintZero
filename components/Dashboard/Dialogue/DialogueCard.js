import React from 'react';

import
{
    Card,
    Tag
} from 'antd';

import CardHeaderButton from "../CardHeaderButton";
import { getTimeAgo } from '../../../utils';

const DialogueCard = (
    {
        id,
        name,
        updatedAt,
        post,
        region,
        education,
        notes = [],
        setItem,
        openDrawer
    }
) =>
{
    const handleOpen = () =>
    {
        openDrawer( true );
        setItem( {
            id,
            name,
            updatedAt,
            post,
            region,
            education,
            notes
        } );
    };
    return (
        <Card
            //bordered={ false }
            extra={ <CardHeaderButton onClick={ handleOpen } >View</CardHeaderButton> }
            title={ name }
            headStyle={ {
                background: "#F5F5F5",
            } }
        >
            <p>
                Last Updated { getTimeAgo( new Date( updatedAt ), true ) }
            </p>

            <br />

            <Tag color="default">{ post }</Tag>
        </Card>
    );
};

export
{
    DialogueCard
};
