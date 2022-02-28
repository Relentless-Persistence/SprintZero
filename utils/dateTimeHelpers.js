import format from 'date-fns/format';
import formatDistance from 'date-fns/formatDistance';


const getTimeAgo = ( date, addSuffix = false ) =>
{
    if ( !date )
    {
        return "N/A";
    }
    const now = new Date();

    let formattedDate = formatDistance( new Date( date ), now, {
        addSuffix
    } );

    if ( formattedDate.includes( "sec" ) )
    {
        return "Now";
    }

    return formattedDate;
};

const formatDateTime = ( date, shape = "yyyy-LL-dd" ) =>
{
    if ( !date )
    {
        return "N/A";
    }
    return format( new Date( date ), shape );

};



export
{
    getTimeAgo,
    formatDateTime
};
