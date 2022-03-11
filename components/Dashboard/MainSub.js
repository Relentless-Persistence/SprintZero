import React from 'react';
import classNames from 'classnames';

const MainSub = ( { children, className } ) =>
{
    return (
        <p className={ classNames( "text-[#595959] pb-[16px] pr-[62px]", className ) }>
            { children }
        </p>
    );
};

export default MainSub;
