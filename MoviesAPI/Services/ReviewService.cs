using MoviesAPI.Models;
using MoviesAPI.Repositories;
using MoviesAPI.Features.Reviews.Requests;
using MoviesAPI.Features.Reviews.Responses;

namespace MoviesAPI.Services;

public interface IReviewService
{
    Task<IEnumerable<ReviewResponse>> GetMovieReviewsAsync(int movieId);
    Task<IEnumerable<ReviewResponse>> GetUserReviewsAsync(int userId);
    Task<ReviewResponse?> GetReviewByIdAsync(int id);
    Task<(bool Success, string? Error, ReviewResponse? Review)> CreateReviewAsync(int userId, CreateReviewRequest request);
    Task<(bool Success, string? Error, ReviewResponse? Review)> UpdateReviewAsync(int userId, int reviewId, UpdateReviewRequest request);
    // changed the method to include admin being able to delete users reviews
    Task<(bool Success, string? Error)> DeleteReviewAsync(int userId, int reviewId, bool isAdmin = false);
    Task<MovieRatingStats> GetMovieRatingStatsAsync(int movieId);
}

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IMovieRepository _movieRepository;

    // constructor
    public ReviewService(IReviewRepository reviewRepository, IMovieRepository movieRepository)
    {
        _reviewRepository = reviewRepository;
        _movieRepository = movieRepository;
    }

    public async Task<IEnumerable<ReviewResponse>> GetMovieReviewsAsync(int movieId)
    {
        var reviews = await _reviewRepository.GetMovieReviewsAsync(movieId);
        return reviews.Select(r => MapToResponse(r));
    }

    public async Task<IEnumerable<ReviewResponse>> GetUserReviewsAsync(int userId)
    {
        var reviews = await _reviewRepository.GetUserReviewsAsync(userId);
        return reviews.Select(r => MapToResponse(r));
    }

    public async Task<ReviewResponse?> GetReviewByIdAsync(int id)
    {
        var review = await _reviewRepository.GetByIdAsync(id);
        return review == null ? null : MapToResponse(review);
    }

    public async Task<(bool Success, string? Error, ReviewResponse? Review)> CreateReviewAsync(int userId, CreateReviewRequest request)
    {
        // check if movie exists
        var movieExists = await _movieRepository.ExistsAsync(request.movie_id);
        if (!movieExists)
            return (false, "Movie not found", null);

        // check if user already reviewed this movie
        var alreadyReviewed = await _reviewRepository.UserHasReviewedMovieAsync(userId, request.movie_id);
        if (alreadyReviewed)
            return (false, "You have already reviewed this movie", null);

        // create new review
        var review = new Review(userId, request.movie_id, request.rating, request.review_text);
        var createdReview = await _reviewRepository.CreateAsync(review);

        // reload with navigation properties
        var fullReview = await _reviewRepository.GetByIdAsync(createdReview.id);
        
        return (true, null, MapToResponse(fullReview!));
    }

    public async Task<(bool Success, string? Error, ReviewResponse? Review)> UpdateReviewAsync(int userId, int reviewId, UpdateReviewRequest request)
    {
        // get the review
        var review = await _reviewRepository.GetByIdAsync(reviewId);
        if (review == null)
            return (false, "Review not found", null);

        // check if user owns this review
        if (review.user_id != userId)
            return (false, "You can only edit your own reviews", null);

        // update review
        review.UpdateReview(request.rating, request.review_text);
        var updatedReview = await _reviewRepository.UpdateAsync(review);

        return (true, null, MapToResponse(updatedReview));
    }

    // changed the method to include admins being able to delete users reviews
    public async Task<(bool Success, string? Error)> DeleteReviewAsync(int userId, int reviewId, bool isAdmin = false)
    {
        // get the review
        var review = await _reviewRepository.GetByIdAsync(reviewId);
        if (review == null)
            return (false, "Review not found");

        // admins can delete any review, users can only delete their own
        if (!isAdmin && review.user_id != userId)
            return (false, "You can only delete your own reviews");

        // delete review
        await _reviewRepository.DeleteAsync(reviewId);
        return (true, null);
    }

    public async Task<MovieRatingStats> GetMovieRatingStatsAsync(int movieId)
    {
        var averageRating = await _reviewRepository.GetAverageRatingForMovieAsync(movieId);
        var reviewCount = await _reviewRepository.GetReviewCountForMovieAsync(movieId);

        return new MovieRatingStats
        {
            movie_id = movieId,
            average_rating = averageRating,
            review_count = reviewCount
        };
    }

    // helper method to map Review entity to ReviewResponse DTO
    private ReviewResponse MapToResponse(Review review)
    {
        return new ReviewResponse
        {
            id = review.id,
            user_id = review.user_id,
            username = review.User.username,
            user_display_name = review.User.display_name,
            user_profile_pic_url = review.User.profile_pic_url, // new field to include the profile pic
            movie_id = review.movie_id,
            movie_title = review.Movie.title,
            rating = review.rating,
            review_text = review.review_text,
            created_at = review.created_at,
            updated_at = review.updated_at
        };
    }
}