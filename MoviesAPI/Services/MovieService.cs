using MoviesAPI.Models;
using MoviesAPI.Repositories;
using MoviesAPI.Features.Movies.Requests;
using MoviesAPI.Features.Movies.Responses;

namespace MoviesAPI.Services;

// service interface
public interface IMovieService
{
    Task<IEnumerable<MovieResponse>> GetAllMoviesAsync();
    Task<MovieResponse?> GetMovieByIdAsync(int id);
    // updated method in the interface to exclude duplicates (new return type)
    Task<(bool Success, string? Error, MovieResponse? Movie)> CreateMovieAsync(CreateMovieRequest request);
    Task<MovieResponse?> UpdateMovieAsync(int id, UpdateMovieRequest request);
    Task<bool> DeleteMovieAsync(int id);
    // new method to get paginated movies (with search filters)
    Task<PaginatedMoviesResponse> GetMoviesWithFiltersAsync(MovieQueryParameters parameters);
}

public class MovieService : IMovieService
{
    private readonly IMovieRepository _movieRepository; // take the interface from MovieRepository.cs

    // constructor for MovieService
    public MovieService(IMovieRepository movieRepository)
    {
        _movieRepository = movieRepository;
    }

    public async Task<IEnumerable<MovieResponse>> GetAllMoviesAsync()
    {
        var movies = await _movieRepository.GetAllAsync();
        // map each movie entity to a response
        return movies.Select(m => MapToResponse(m));
    }

    public async Task<MovieResponse?> GetMovieByIdAsync(int id)
    {
        var movie = await _movieRepository.GetByIdAsync(id);
        // if movie not found, return null
        if (movie == null)
            return null;

        return MapToResponse(movie);
    }

    // new, updated method to avoid creating duplicates (Uses MovieExistsAsync)
    public async Task<(bool Success, string? Error, MovieResponse? Movie)> CreateMovieAsync(CreateMovieRequest request)
    {
        // check if movie already exists (same title + release year)
        var exists = await _movieRepository.MovieExistsAsync(request.title, request.release_date);
        if (exists)
        {
            return (false, "A movie with this title and release year already exists", null);
        }

        // create new movie entity
        var movie = new Movie(
            request.title,
            request.release_date,
            request.description,
            request.director,
            request.genre,
            request.runtime_minutes,
            request.poster_url
        );

        // save to database
        var createdMovie = await _movieRepository.CreateAsync(movie);
        
        // return success with the movie
        return (true, null, MapToResponse(createdMovie));
    }

    public async Task<MovieResponse?> UpdateMovieAsync(int id, UpdateMovieRequest request)
    {
        // check if movie exists
        var movie = await _movieRepository.GetByIdAsync(id);
        if (movie == null)
            return null; // movie not found

        // update movie details
        movie.UpdateDetails(
            request.title,
            request.description,
            request.release_date,
            request.director,
            request.genre,
            request.runtime_minutes,
            request.poster_url
        );

        // save changes to database
        var updatedMovie = await _movieRepository.UpdateAsync(movie);
        
        return MapToResponse(updatedMovie);
    }

    public async Task<bool> DeleteMovieAsync(int id)
    {
        // attempt to delete, returns true if successful
        return await _movieRepository.DeleteAsync(id);
    }

    // helper method to map Movie entity to MovieResponse
    private MovieResponse MapToResponse(Movie movie)
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

    public async Task<PaginatedMoviesResponse> GetMoviesWithFiltersAsync(MovieQueryParameters parameters)
    {
        var (movies, totalCount) = await _movieRepository.GetMoviesWithFiltersAsync(parameters);
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)parameters.pageSize);
        
        return new PaginatedMoviesResponse
        {
            movies = movies.Select(m => MapToResponse(m)),
            page = parameters.page,
            pageSize = parameters.pageSize,
            totalCount = totalCount,
            totalPages = totalPages,
            hasPreviousPage = parameters.page > 1,
            hasNextPage = parameters.page < totalPages
        };
    }
}