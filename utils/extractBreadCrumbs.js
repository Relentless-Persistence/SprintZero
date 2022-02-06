const splitRoutes = ( path, begin = "/dashboard/" ) =>
{
    return path.replace( begin, "" )
        .split( "/" );
};

export { splitRoutes };
