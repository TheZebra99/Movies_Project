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
    private readonly IReviewRepository _reviewRepository; // new, take the interface from ReviewRepository.cs

    // (updated) constructor for MovieService
    public MovieService(IMovieRepository movieRepository, IReviewRepository reviewRepository)
    {
        _movieRepository = movieRepository;
        _reviewRepository = reviewRepository;
    }

    public async Task<IEnumerable<MovieResponse>> GetAllMoviesAsync()
    {
        var movies = await _movieRepository.GetAllAsync();
        // map each movie entity to a response
        return movies.Select(m => MapToResponse(m));
    }

    // updated method to include ratings and reviews
    // new new method to include revenue, screenshots and trailer
    public async Task<MovieResponse?> GetMovieByIdAsync(int id)
    {
        var movie = await _movieRepository.GetByIdAsync(id);
        if (movie == null)
            return null;
        
        // get rating stats
        var averageRating = await _reviewRepository.GetAverageRatingForMovieAsync(id);
        var reviewCount = await _reviewRepository.GetReviewCountForMovieAsync(id);
        
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
            created_at = movie.created_at,
            average_rating = averageRating,
            review_count = reviewCount,
            revenue = movie.revenue,          // new
            trailer_url = movie.trailer_url,  // new
            screenshots = movie.screenshots   // new
        };
    }

    // new, updated method to avoid creating duplicates (Uses MovieExistsAsync)
    // new new CreateMovieAsync with the new parameters for Movie constructor
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
            request.poster_url,
            request.revenue,        // new
            request.trailer_url,    // new
            request.screenshots     // new
        );

        // save to database
        var createdMovie = await _movieRepository.CreateAsync(movie);
        
        // return success with the movie
        return (true, null, MapToResponse(createdMovie));
    }

    // new UpdateMovieAsync with the new parameters for UpdateDetails
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
            request.poster_url,
            request.revenue,        // new
            request.trailer_url,    // new
            request.screenshots     // new
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

    // updated helper method to map Movie entity to MovieResponse
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
            created_at = movie.created_at,
            revenue = movie.revenue,          // new
            trailer_url = movie.trailer_url,  // new
            screenshots = movie.screenshots   // new
        };
    }

    // new new updated method to include reviews and ratings (revenue, screenshots and trailer)
    public async Task<PaginatedMoviesResponse> GetMoviesWithFiltersAsync(MovieQueryParameters parameters)
    {
        var (moviesWithRatings, totalCount) = await _movieRepository.GetMoviesWithFiltersAndRatingsAsync(parameters);
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)parameters.pageSize);
        
        return new PaginatedMoviesResponse
        {
            movies = moviesWithRatings.Select(m => new MovieResponse
            {
                id = m.Movie.id,
                title = m.Movie.title,
                description = m.Movie.description,
                release_date = m.Movie.release_date,
                director = m.Movie.director,
                genre = m.Movie.genre,
                runtime_minutes = m.Movie.runtime_minutes,
                poster_url = m.Movie.poster_url,
                created_at = m.Movie.created_at,
                average_rating = m.AverageRating,
                review_count = m.ReviewCount,
                revenue = m.Movie.revenue,          // new
                trailer_url = m.Movie.trailer_url,  // new
                screenshots = m.Movie.screenshots   // new
            }),
            page = parameters.page,
            pageSize = parameters.pageSize,
            totalCount = totalCount,
            totalPages = totalPages,
            hasPreviousPage = parameters.page > 1,
            hasNextPage = parameters.page < totalPages
        };
    }
}