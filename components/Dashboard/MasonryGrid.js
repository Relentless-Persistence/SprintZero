import React from 'react';
import styled from 'styled-components';
import Masonry from 'react-masonry-css';

const Grid = styled( Masonry )`
    display: flex;
    width:auto;
    gap:16px;

`;

const breakpointColumnsObj = {
    0: 1,
    500: 2
};


const MasonryGrid = ( {
    columnClassName,
    className,
    breakpointCols = breakpointColumnsObj,
    children } ) =>
{
    return (
        <Grid
            breakpointCols={ breakpointCols }
            className={ className }
            columnClassName={ columnClassName }
        >

            { children }

        </Grid>
    );
};

export default MasonryGrid;
