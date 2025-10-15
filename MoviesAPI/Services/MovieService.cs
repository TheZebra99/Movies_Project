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
    Task<MovieResponse> CreateMovieAsync(CreateMovieRequest request);
    Task<MovieResponse?> UpdateMovieAsync(int id, UpdateMovieRequest request);
    Task<bool> DeleteMovieAsync(int id);
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

    public async Task<MovieResponse> CreateMovieAsync(CreateMovieRequest request)
    {
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
        
        // return as response
        return MapToResponse(createdMovie);
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
}