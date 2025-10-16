using Microsoft.EntityFrameworkCore;
using MoviesAPI.Data;
using MoviesAPI.Models;

namespace MoviesAPI.Repositories;

public interface IReviewRepository
{
    // define operations for reviews inside the interface
    // operations are asynchronous, don't have to wait for operations to finish...
    Task<IEnumerable<Review>> GetMovieReviewsAsync(int movieId);
    Task<IEnumerable<Review>> GetUserReviewsAsync(int userId);
    Task<Review?> GetByIdAsync(int id);
    Task<Review?> GetUserReviewForMovieAsync(int userId, int movieId);
    Task<Review> CreateAsync(Review review);
    Task<Review> UpdateAsync(Review review);
    Task<bool> DeleteAsync(int id);
    Task<bool> UserHasReviewedMovieAsync(int userId, int movieId);
    Task<double?> GetAverageRatingForMovieAsync(int movieId);
    Task<int> GetReviewCountForMovieAsync(int movieId);
}

public class ReviewRepository : IReviewRepository
{
    private readonly ApplicationDbContext _context; // use an instance of a table "reviews", a connection to the database

    // constructor
    public ReviewRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // async method with await = don't have to wait for the operation to finish, move on to the next task
    // updated method to include both the user and the movie
    public async Task<IEnumerable<Review>> GetMovieReviewsAsync(int movieId)
    {
        return await _context.Reviews
            .Include(r => r.User) // load user data with the review
            .Include(r => r.Movie) // load movie data with the review
            .Where(r => r.movie_id == movieId)
            .OrderByDescending(r => r.created_at) // newest reviews first
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetUserReviewsAsync(int userId)
    {
        return await _context.Reviews
            .Include(r => r.Movie) // load movie data with the review
            .Where(r => r.user_id == userId)
            .OrderByDescending(r => r.created_at) // newest reviews first
            .ToListAsync();
    }

    public async Task<Review?> GetByIdAsync(int id)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Movie)
            .FirstOrDefaultAsync(r => r.id == id);
    }

    public async Task<Review?> GetUserReviewForMovieAsync(int userId, int movieId)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Movie)
            .FirstOrDefaultAsync(r => r.user_id == userId && r.movie_id == movieId);
    }

    public async Task<Review> CreateAsync(Review review)
    {
        _context.Reviews.Add(review); // add a new review to the database
        await _context.SaveChangesAsync(); // INSERT operation, save the changes <- actual SQL execution happens here
        return review;
    }

    public async Task<Review> UpdateAsync(Review review)
    {
        _context.Reviews.Update(review); // update the review data
        await _context.SaveChangesAsync(); // UPDATE operation <- actual SQL execution happens here
        return review;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var review = await GetByIdAsync(id);
        if (review == null)
            return false; // review not found

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync(); // DELETE operation <- actual SQL execution happens here
        return true; // successfully deleted
    }

    public async Task<bool> UserHasReviewedMovieAsync(int userId, int movieId)
    {
        return await _context.Reviews
            .AnyAsync(r => r.user_id == userId && r.movie_id == movieId);
    }

    public async Task<double?> GetAverageRatingForMovieAsync(int movieId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.movie_id == movieId)
            .ToListAsync();
        
        if (!reviews.Any())
            return null; // no reviews yet
        
        return reviews.Average(r => r.rating);
    }

    public async Task<int> GetReviewCountForMovieAsync(int movieId)
    {
        return await _context.Reviews
            .Where(r => r.movie_id == movieId)
            .CountAsync();
    }
}