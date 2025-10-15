using MoviesAPI.Models;
using MoviesAPI.Repositories;
using MoviesAPI.Features.Watchlist.Requests;
using MoviesAPI.Features.Watchlist.Responses;
using MoviesAPI.Features.Movies.Responses;

namespace MoviesAPI.Services;

public interface IWatchlistService
{
    Task<IEnumerable<WatchlistResponse>> GetUserWatchlistAsync(int userId);
    Task<(bool Success, string? Error)> AddToWatchlistAsync(int userId, AddToWatchlistRequest request);
    Task<(bool Success, string? Error)> RemoveFromWatchlistAsync(int userId, int movieId);
}

public class WatchlistService : IWatchlistService
{
    private readonly IWatchlistRepository _watchlistRepository;
    private readonly IMovieRepository _movieRepository;

    // constructor
    public WatchlistService(IWatchlistRepository watchlistRepository, IMovieRepository movieRepository)
    {
        _watchlistRepository = watchlistRepository;
        _movieRepository = movieRepository;
    }

    public async Task<IEnumerable<WatchlistResponse>> GetUserWatchlistAsync(int userId)
    {
        var watchlist = await _watchlistRepository.GetUserWatchlistAsync(userId);
        
        // map to response DTOs
        return watchlist.Select(w => new WatchlistResponse
        {
            movie = MapMovieToResponse(w.Movie),
            added_at = w.added_at
        });
    }

    public async Task<(bool Success, string? Error)> AddToWatchlistAsync(int userId, AddToWatchlistRequest request)
    {
        // check if movie exists
        var movieExists = await _movieRepository.ExistsAsync(request.movie_id);
        if (!movieExists)
            return (false, "Movie not found");

        // check if already in watchlist
        var alreadyInWatchlist = await _watchlistRepository.IsInWatchlistAsync(userId, request.movie_id);
        if (alreadyInWatchlist)
            return (false, "Movie is already in your watchlist");

        // add to watchlist
        var watchlistEntry = new Models.Watchlist(userId, request.movie_id);
        await _watchlistRepository.AddToWatchlistAsync(watchlistEntry);

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> RemoveFromWatchlistAsync(int userId, int movieId)
    {
        var removed = await _watchlistRepository.RemoveFromWatchlistAsync(userId, movieId);
        
        if (!removed)
            return (false, "Movie not found in your watchlist");

        return (true, null);
    }

    // helper method to map Movie entity to MovieResponse DTO
    private MovieResponse MapMovieToResponse(Movie movie)
    {
        return new MovieResponse
        {
            id = movie.id,
            title = movie.title,
            description = movie.description,
            release_date = movie.release_date,
            director = movie.director,
            genre = movie.genre,
            runtime_minutes = movie.runtime_minutes,
            poster_url = movie.poster_url,
            created_at = movie.created_at
        };
    }
}