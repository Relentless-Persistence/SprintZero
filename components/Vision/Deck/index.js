import React, { useState, useEffect } from 'react';
import StatementCard from './Card';



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
        <div className='pt-[18px]'>

            {
                cards.map( ( o, i ) => <StatementCard
                    info={ o.info }
                    onEditClick={ setInfo }
                    index={ i }
                    product={ product }
                    isActive={ i === 0 }
                    key={ o.createdAt } /> )
            }
        </div>
    );
};

export default Deck;
