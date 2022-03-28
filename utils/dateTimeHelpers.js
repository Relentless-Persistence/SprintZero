import format from 'date-fns/format';
import formatDistance from 'date-fns/formatDistance';
import differenceInDays from 'date-fns/differenceInDays';
import isBefore from 'date-fns/isBefore';
import intervalToDuration from 'date-fns/intervalToDuration';
import isWithinInterval from 'date-fns/isWithinInterval';
import add from 'date-fns/add';


const getTimeAgo = ( date, addSuffix = true ) =>
{
    if ( !date )
    {
        return "N/A";
    }
    const now = new Date();

    const actualDate = date?.toString().includes( "Now" ) ? now : date;

    let formattedDate = formatDistance( new Date( actualDate ), now, {
        addSuffix,
        includeSeconds: true
    } );

    return formattedDate.replace( "less than", "" ).replace( "about ", "" ).replace( "minute", "min" ).replace( "second", "sec" );
};

const formatDateTime = ( date, shape = "yyyy-LL-dd" ) =>
{
    if ( !date )
    {
        return "N/A";
    }
    return format( new Date( date ), shape );

};

const formatDate = ( date, shape = "EEEE, MMM do" ) =>
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
    formatDate,
    differenceInDays,
    isBefore,
    intervalToDuration,
    isWithinInterval,
    add

};
