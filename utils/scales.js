
const scaleToVal = ( value = 0, maxScreen = 500, maxVal = 100 ) =>
{
    return +( maxVal * value ) / maxScreen;
};

const scaleToScreen = ( value = 0, maxScreen = 500, maxVal = 100 ) =>
{
    return ( maxScreen * value ) / maxVal;
};

export
{
    scaleToScreen,
    scaleToVal
};
