import classNames from 'classnames';
import React from 'react';

const DrawerSubTitle = ( { children, className } ) =>
{
    return (
        <h3 className={ classNames
            ( "mb-[8px] text-[#595959] text-[20px] leading-[28px] font-[600]", className ) }>{ children }</h3>
    );
};

export default DrawerSubTitle;
