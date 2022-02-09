const checkEmptyObject = ( obj ) =>
{
    return !!( obj
        && Object.keys( obj ).length === 0
        && Object.getPrototypeOf( obj ) === Object.prototype );
};

const checkEmptyArray = ( array ) =>
{
    return !!( array
        && Array.isArray( array )
        && array.length === 0 );
};

export
{
    checkEmptyArray,
    checkEmptyObject
};
