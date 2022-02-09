import formatDistance from 'date-fns/formatDistance';

const getTimeAgo = ( date ) =>
{
    if ( !date )
    {
        return "N/A";
    }
    const now = new Date();

    let formattedDate = formatDistance( new Date( date ), now );

    if ( formattedDate.includes( "sec" ) )
    {
        return "Now";
    }

    return formattedDate;
};



export
{
    getTimeAgo
};
