import format from 'date-fns/format';
import formatDistance from 'date-fns/formatDistance';
import differenceInDays from 'date-fns/differenceInDays';
import isBefore from 'date-fns/isBefore';


const getTimeAgo = ( date, addSuffix = true ) =>
{
    if ( !date )
    {
        return "N/A";
    }
    const now = new Date();

    const actualDate = date.includes( "Now" ) ? now : date;

    let formattedDate = formatDistance( new Date( actualDate ), now, {
        addSuffix
    } );

    if ( formattedDate.includes( "sec" ) )
    {
        return "Now";
    }

    return formattedDate.replace( "about ", "" );
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
    formatDateTime,
    differenceInDays,
    isBefore
};
