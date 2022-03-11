import format from 'date-fns/format';
import formatDistance from 'date-fns/formatDistance';
import differenceInDays from 'date-fns/differenceInDays';
import isBefore from 'date-fns/isBefore';


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

const formatDate = (date, shape = "EEEE, MMM do") => {
  if (!date) {
    return "N/A";
  }
  return format(new Date(date), shape);
};



export
{
    getTimeAgo,
    formatDateTime,
    formatDate,
    differenceInDays,
    isBefore
};
