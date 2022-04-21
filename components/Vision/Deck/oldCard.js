import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import
{
    Card,
    Button
} from 'antd';


const StyledCard = styled( Card )`
   transform:  ${ props => props.invert };
   margin-bottom: 135px;
   box-shadow: ${ props => props.$active ? "0px 4px 4px rgba(0, 0, 0, 0.25), 1px -1px 4px rgba(0, 0, 0, 0.1)" : "" };
  border-radius: 2px;

  .ant-card-head
    {
        min-height:unset;
    }

    .ant-card-head-title
    {
        padding:0
    }

    .ant-card-head-wrapper
    {
        margin:20px 0;
    }
    .ant-card-extra
    {
        padding:0
    }
`;

import { CardTitle } from '../../Dashboard/CardTitle';


const StatementCard = (
    {
        index,
        onEditClick,
        info,
        product,
        isActive
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
            className={ invert ? "" : "deck-animate" }
            $active={ isActive }
            extra={ <Button className="text-[#262626] text-[14px] leading[22px]" onClick={ () => onEditClick( info ) } >Edit</Button> }
            title={ <CardTitle className='!text-[16px] !leading[24px]'>Guiding Statement</CardTitle> }>


            <p className='text-[30px] leading-[38px]'>  { `For ${ info.targetCustomer }, who ${ info.need }, the ${ product } is a [product category or description] that ${ info.keyBenefits }.` }</p>


            <br />

            <p className='text-[30px] leading-[38px]'>

                { `Unlike ${ info.competitors }, our product ${ info.differentiators }.` }

            </p>
        </StyledCard>
    );
};

export default StatementCard;
