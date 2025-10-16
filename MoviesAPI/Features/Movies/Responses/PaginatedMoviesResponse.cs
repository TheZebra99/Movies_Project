namespace MoviesAPI.Features.Movies.Responses;

public class PaginatedMoviesResponse
{
    public IEnumerable<MovieResponse> movies { get; set; } = new List<MovieResponse>();
    public int page { get; set; }
    public int pageSize { get; set; }
    public int totalCount { get; set; }
    public int totalPages { get; set; }
    public bool hasPreviousPage { get; set; }
    public bool hasNextPage { get; set; }
}