using Microsoft.EntityFrameworkCore;
using MoviesAPI.Data;
using MoviesAPI.Models;
using MoviesAPI.Features.Movies.Requests;

namespace MoviesAPI.Repositories;

public interface IMovieRepository
{
    // define operations for movies inside the interface
    // operations are asynchronous, don't have to wait for operations to finish...
    Task<IEnumerable<Movie>> GetAllAsync();
    Task<Movie?> GetByIdAsync(int id);
    Task<Movie> CreateAsync(Movie movie);
    Task<Movie> UpdateAsync(Movie movie);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    // new method to return paginated movies
    Task<(IEnumerable<Movie> Movies, int TotalCount)> GetMoviesWithFiltersAsync(MovieQueryParameters parameters);
    // new method to prevent the creation of duplicate movies
    Task<bool> MovieExistsAsync(string title, DateTime releaseDate);
    // new method to sort the films (keep GetMoviesWithFiltersAsync just in case...)
    Task<(IEnumerable<(Movie Movie, double? AverageRating, int ReviewCount)> Movies, int TotalCount)> GetMoviesWithFiltersAndRatingsAsync(MovieQueryParameters parameters);
}

public class MovieRepository : IMovieRepository // using the methods from the interface
{
    private readonly ApplicationDbContext _context; // use an instance of a table "movies", a connection to the database

    // constructor
    public MovieRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // async method with await = don't have to wait for the operation to finish, move on to the next task
    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        return await _context.Movies
            .OrderByDescending(m => m.created_at) // newest movies first
            .ToListAsync();
    }

    // Task <T> = a result that will come later...
    public async Task<Movie?> GetByIdAsync(int id)
    {
        return await _context.Movies.FindAsync(id);
    }

    public async Task<Movie> CreateAsync(Movie movie)
    {
        _context.Movies.Add(movie); // add a new movie to the database
        await _context.SaveChangesAsync(); // INSERT operation, save the changes <- actual SQL execution happens here
        return movie;
    }

    public async Task<Movie> UpdateAsync(Movie movie)
    {
        _context.Movies.Update(movie); // update the movie data
        await _context.SaveChangesAsync(); // UPDATE operation <- actual SQL execution happens here
        return movie;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var movie = await GetByIdAsync(id);
        if (movie == null)
            return false; // movie not found

        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync(); // DELETE operation <- actual SQL execution happens here
        return true; // successfully deleted
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Movies
            .AnyAsync(m => m.id == id);
    }

    // update the old method to be in line with the other one (leave it just in case)
    public async Task<(IEnumerable<Movie> Movies, int TotalCount)> GetMoviesWithFiltersAsync(MovieQueryParameters parameters)
    {
        // call the new method with ratings
        var (moviesWithRatings, totalCount) = await GetMoviesWithFiltersAndRatingsAsync(parameters);
        
        // extract just the movies (ignore ratings)
        var movies = moviesWithRatings.Select(m => m.Movie);
        
        return (movies, totalCount);
    }

    // new method to prevent duplicates (with added time conversion)
    public async Task<bool> MovieExistsAsync(string title, DateTime releaseDate)
    {
        var normalizedTitle = title.Trim().ToLower();

        // Convert to UTC if not already
        var releaseDateUtc = releaseDate.Kind == DateTimeKind.Utc
            ? releaseDate
            : DateTime.SpecifyKind(releaseDate, DateTimeKind.Utc);

        return await _context.Movies
            .AnyAsync(m =>
                m.title.ToLower() == normalizedTitle &&
                m.release_date.Date == releaseDateUtc.Date
            );
    }
    
    // new method to get sorted movies
    public async Task<(IEnumerable<(Movie Movie, double? AverageRating, int ReviewCount)> Movies, int TotalCount)> GetMoviesWithFiltersAndRatingsAsync(MovieQueryParameters parameters)
    {
        // start with all movies
        var query = _context.Movies.AsQueryable();
        
        // apply search filter (title contains search term)
        if (!string.IsNullOrWhiteSpace(parameters.search))
        {
            var searchTerm = parameters.search.Trim().ToLower();
            query = query.Where(m => m.title.ToLower().Contains(searchTerm));
        }
        
        // apply genre filter (exact match, case-insensitive)
        if (!string.IsNullOrWhiteSpace(parameters.genre))
        {
            var genreFilter = parameters.genre.Trim().ToLower();
            query = query.Where(m => m.genre != null && m.genre.ToLower() == genreFilter);
        }
        
        // apply director filter (contains director name)
        if (!string.IsNullOrWhiteSpace(parameters.director))
        {
            var directorFilter = parameters.director.Trim().ToLower();
            query = query.Where(m => m.director != null && m.director.ToLower().Contains(directorFilter));
        }
        
        // apply year filter (exact year match)
        if (parameters.year.HasValue)
        {
            query = query.Where(m => m.release_date.Year == parameters.year.Value);
        }
        
        // get total count before pagination
        var totalCount = await query.CountAsync();
        
        // join with reviews to get rating stats
        var moviesWithRatings = await query
            .GroupJoin(
                _context.Reviews,
                movie => movie.id,
                review => review.movie_id,
                (movie, reviews) => new
                {
                    Movie = movie,
                    AverageRating = reviews.Any() ? (double?)reviews.Average(r => r.rating) : null,
                    ReviewCount = reviews.Count()
                }
            )
            .ToListAsync();
        
        // apply sorting
        IEnumerable<(Movie Movie, double? AverageRating, int ReviewCount)> sortedMovies;
        
        switch (parameters.sortBy)
        {
            case MovieSortBy.Rating:
                sortedMovies = parameters.sortDirection == SortDirection.Descending
                    ? moviesWithRatings.OrderByDescending(m => m.AverageRating ?? 0)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount))
                    : moviesWithRatings.OrderBy(m => m.AverageRating ?? 0)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount));
                break;
            
            case MovieSortBy.ReviewCount:
                sortedMovies = parameters.sortDirection == SortDirection.Descending
                    ? moviesWithRatings.OrderByDescending(m => m.ReviewCount)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount))
                    : moviesWithRatings.OrderBy(m => m.ReviewCount)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount));
                break;
            
            case MovieSortBy.ReleaseDate:
                sortedMovies = parameters.sortDirection == SortDirection.Descending
                    ? moviesWithRatings.OrderByDescending(m => m.Movie.release_date)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount))
                    : moviesWithRatings.OrderBy(m => m.Movie.release_date)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount));
                break;
            
            case MovieSortBy.Title:
                sortedMovies = parameters.sortDirection == SortDirection.Descending
                    ? moviesWithRatings.OrderByDescending(m => m.Movie.title)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount))
                    : moviesWithRatings.OrderBy(m => m.Movie.title)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount));
                break;
            
            default: // CreatedDate
                sortedMovies = parameters.sortDirection == SortDirection.Descending
                    ? moviesWithRatings.OrderByDescending(m => m.Movie.created_at)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount))
                    : moviesWithRatings.OrderBy(m => m.Movie.created_at)
                        .Select(m => (m.Movie, m.AverageRating, m.ReviewCount));
                break;
        }
        
        // apply pagination
        var paginatedMovies = sortedMovies
            .Skip((parameters.page - 1) * parameters.pageSize)
            .Take(parameters.pageSize)
            .ToList();
        
        return (paginatedMovies, totalCount);
    }
}