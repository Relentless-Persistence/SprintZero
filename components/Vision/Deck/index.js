import React, { useState, useEffect } from 'react';
import StatementCard from './Card';

const data =
    [
        {
            value: `1 Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis velit blanditiis impedit quidem et quam dolorem sunt quis saepe, nihil dolor officiis cum itaque dicta sint dolores, consequuntur odit. Libero.
        `
        },
        {
            value: `2 Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis velit blanditiis impedit quidem et quam dolorem sunt quis saepe, nihil dolor officiis cum itaque dicta sint dolores, consequuntur odit. Libero.
        `
        },
        {
            value: `3 Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis velit blanditiis impedit quidem et quam dolorem sunt quis saepe, nihil dolor officiis cum itaque dicta sint dolores, consequuntur odit. Libero.
        `
        }
    ];

let index = 4;

const Deck = (
    {
        setInfo,
        activeIndex = 0,
        list = [],
        product
    }
) =>
{
    const [ cards, setCards ] = useState( [] );

    useEffect( () =>
    {
        setCards( [ ...list ].slice( 0, activeIndex + 1 ).reverse() );
    }, [ activeIndex, list ] );


    return (
        <div>

            {
                cards.map( ( o, i ) => <StatementCard
                    info={ o.info }
                    onEditClick={ setInfo }
                    index={ i }
                    product={ product }
                    key={ o.createdAt } /> )
            }
        </div>
    );
};

export default Deck;
