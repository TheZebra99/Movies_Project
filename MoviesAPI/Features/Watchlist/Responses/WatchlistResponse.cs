using MoviesAPI.Features.Movies.Responses;

namespace MoviesAPI.Features.Watchlist.Responses;

public class WatchlistResponse
{
    public MovieResponse movie { get; set; } = null!;
    public DateTime added_at { get; set; }
}