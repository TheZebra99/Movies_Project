namespace MoviesAPI.Features.Movies.Requests;

// sorting options
public enum MovieSortBy
{
    CreatedDate,    // newest movies first (default)
    Rating,         // highest rated first
    ReviewCount,    // most reviewed first
    ReleaseDate,    // newest release date first
    Title           // alphabetical
}

public enum SortDirection
{
    Descending,     // default
    Ascending
}