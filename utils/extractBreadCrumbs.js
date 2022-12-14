const splitRoutes = ( path, begin = "/[productSlug]/dashboard/" ) =>
{
    return path.replace( begin, "" )
        .split( "/" );
};

export { splitRoutes };
