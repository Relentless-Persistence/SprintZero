
const scaleToVal = ( value = 0, maxScreen = 500, maxVal = 100 ) =>
{
    return +( maxVal * value ) / maxScreen;
};

const scaleToScreen = ( value = 0, maxScreen = 500, maxVal = 100 ) =>
{
    return ( maxScreen * value ) / maxVal;
};

const timeScale = ( minScreen = 0, maxScreen = 600, startDateMs, endDateMs, screenVal = 0 ) =>
{
    const screenDiff = maxScreen - minScreen;
    const screenValOffset = screenVal - minScreen;

    const timeDiff = endDateMs - startDateMs;

    const LHS = screenValOffset / screenDiff;

    const time = ( LHS * ( timeDiff ) ) + startDateMs;

    return time;
};

export
{
    scaleToScreen,
    scaleToVal,
    timeScale
};
