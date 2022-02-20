import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import
{
    Card
} from 'antd';
import CardHeaderButton from '../../Dashboard/CardHeaderButton';

const StyledCard = styled( Card )`
   transform:  ${ props => props.invert };
   margin-bottom: 135px;
   font-size:30px;
`;

import styles from './Deck.module.css';


const StatementCard = (
    {
        index,
        onEditClick,
        info,
        product,
    }
) =>
{

    const oldHeight = useRef();
    const animateRef = useRef();
    const elRef = useRef();
    const [ invert, setInvert ] = useState( "" );

    useEffect( () => 
    {
        if ( elRef && elRef.current )
        {
            let el = elRef.current;
            let newOffset = el.getBoundingClientRect().top;
            let invert = ( +oldHeight.current ) - newOffset;
            oldHeight.current = newOffset;
            setInvert( `translateY(${ invert }px)` );

            animateRef.current = requestAnimationFrame( () => 
            {
                setInvert( "" );
            } );

            return () => cancelAnimationFrame( animateRef.current );
        }
    }, [ index ] );

    return (
        <StyledCard
            ref={ elRef }
            invert={ invert }
            className={ invert ? "" : styles.animate }
            extra={ <CardHeaderButton onClick={ () => onEditClick( info ) } >Edit</CardHeaderButton> }
            title="Guiding Statement">


            <p>  { `For ${ info.targetCustomer }, who ${ info.need }, the ${ product } is a [product category or description] that ${ info.keyBenefits }.` }</p>


            <br />

            <p>

                { `Unlike ${ info.competitors }, our product ${ info.differentiators }.` }

            </p>
        </StyledCard>
    );
};

export default StatementCard;
