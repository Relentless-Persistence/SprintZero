import React from 'react';
import styled from 'styled-components';

import
{
    Board as RBoard,
    useCard,
    useColumn
} from 'react-sdndk';

import
{
    Card as Acard,
    Row,
    Col,
} from 'antd';


const StyledCol = styled( Acard )`
    min-height:450px;
`;

const StyledCard = styled.div`
    width:100%;
    border-bottom: 1px solid #D9D9D9;
    background:#fff;
    display: grid;
    grid-template-columns:40px 1fr;
    padding:16px;
    align-items:center;
    gap:10px;
    opacity: ${ props => props.$isDraggging ? 0 : 1 };
`;

const Card = ( { children, id, colId, onCardDrop } ) =>
{
    const [ card, isDragging ] = useCard( {
        id,
        colId,
        onDrop: ( idTarget ) =>
        {
            onCardDrop?.( idTarget, { id, colId } );
        }
    } );

    return <StyledCard
        ref={ ( node ) => card( node ) }
    >
        { children }
    </StyledCard>;
};

const Column = ( {
    children,
    columnId,
    columnName,
    header,
    onCardEntry
} ) =>
{
    const col = useColumn( {
        columnId,
        onCardEntry: ( card ) =>
        {
            onCardEntry?.( card, columnId );
        }
    } );

    return (
        <StyledCol
            ref={ col }
            extra={ header }
            title={ columnName }
            bodyStyle={ {
                padding: "0"
            } }
            headStyle={ {
                background: "#F5F5F5",
            } }
        >
            { children }
        </StyledCol> )
        ;
};



const Board = ( { columns = [],
    onDrop,
    onSwap,
    columnHeaderRenders,
    children,
    renderColumn,
    colCount = 3 } ) =>
{


    const swapCard = ( target, current ) =>
    {

        onSwap( target, current );

    };

    const entryCard = ( card, targetColId ) =>
    {
        onDrop( card, targetColId );

    };


    return (
        <RBoard>
            <Row className="py-6" gutter={ [ 12, 12 ] }>
                {
                    columns?.map( ( ( col, i ) => (
                        <Col
                            span={ 24 / colCount }
                            key={ col.columnId }>
                            <Column
                                columnId={ col.columnId }
                                columnName={ col.columnName }
                                onCardEntry={ entryCard }
                                header={ columnHeaderRenders[ i ] }
                                key={ col.columnId }>

                                {
                                    col?.data?.map( ( card, i ) => ( <Card
                                        key={ card.id }
                                        id={ card.id }
                                        colId={ col.columnId }
                                        onCardDrop={ swapCard }>
                                        { renderColumn( card, i ) }
                                    </Card> )
                                    )
                                }

                                {/* {
                                    col?.data?.map( ( card, i ) => (
                                        <Card
                                            key={ card.id }
                                            id={ card.id }
                                            colId={ col.columnId }
                                            onCardDrop={ swapCard }
                                        >
                                            <Index>{ i + 1 }</Index>

                                            <div>
                                                <StyledItem $color={ card.color }>
                                                    <span>x</span>

                                                    <p>
                                                        { card.title }</p>
                                                </StyledItem>
                                            </div>


                                        </Card>
                                    ) )
                                } */}

                            </Column>
                        </Col>
                    ) )
                    )
                }
            </Row>
        </RBoard>
    );
};


export
{
    Board
};
