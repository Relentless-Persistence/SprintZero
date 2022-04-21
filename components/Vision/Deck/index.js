import React, { useState, useEffect, useRef } from 'react';
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
    const cardRefs = useRef();

    useEffect( () =>
    {
        setCards( list );
    }, [ list ] );




    const atTop = [ ...cards ].slice( activeIndex ).reverse();
    const movedDown = activeIndex !== 0 ? [ ...cards ].slice( 0, activeIndex ).reverse() : [];

    const length = atTop.length;
    const length2 = movedDown.length;



    return (
        <div className='pt-[18px] relative'>

            <StatementCard
                info={ atTop[ 0 ]?.info }
                onEditClick={ null }
                style={ {
                    position: "relative",
                    visibility: "hidden",
                } }
                index={ 0 }
                product={ product } />


            {
                atTop?.map( ( o, i ) => <StatementCard
                    info={ o.info }
                    onEditClick={ setInfo }
                    style={ {
                        transform: `translateY(${ ( length - i - 1 ) * 10 }px)`,
                        zIndex: i
                    } }
                    index={ i }
                    product={ product }
                    isActive={ i === ( cards.length - activeIndex - 1 ) }
                    key={ o.createdAt } /> )
            }


            {
                movedDown?.map( ( o, i ) => <StatementCard
                    info={ o.info }
                    onEditClick={ setInfo }
                    index={ i }
                    product={ product }
                    style={ {
                        transform: `translateY(-100%)`,
                        transitionDelay: `${ ( length2 - 1 - i ) * 100 }ms`
                    } }
                    isDown
                    key={ o.createdAt } /> )
            }
        </div>
    );
};

export default Deck;
