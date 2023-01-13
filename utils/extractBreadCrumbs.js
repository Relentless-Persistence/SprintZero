const splitRoutes = ( path, begin = "/[productSlug]/" ) =>
{
    return path.replace( begin, "" )
        .split( "/" );
};

export { splitRoutes };
