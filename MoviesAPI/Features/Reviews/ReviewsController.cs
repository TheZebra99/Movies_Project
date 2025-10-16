using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoviesAPI.Services;
using MoviesAPI.Features.Reviews.Requests;

namespace MoviesAPI.Features.Reviews;

/*
Public Endpoints logic:
Anyone can view reviews
Anyone can see rating statistics

Protected Endpoints logic:
Must be logged in to create/edit/delete reviews
Users can only edit/delete their own reviews
The service layer checks ownership before allowing updates/deletes
*/

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    // constructor
    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    // GET /api/reviews/movie/{movieId} - Get all reviews for a movie (PUBLIC)
    [HttpGet("movie/{movieId}")]
    public async Task<IActionResult> GetMovieReviews(int movieId)
    {
        var reviews = await _reviewService.GetMovieReviewsAsync(movieId);
        return Ok(reviews);
    }

    // GET /api/reviews/movie/{movieId}/stats - Get rating statistics for a movie (PUBLIC)
    [HttpGet("movie/{movieId}/stats")]
    public async Task<IActionResult> GetMovieRatingStats(int movieId)
    {
        var stats = await _reviewService.GetMovieRatingStatsAsync(movieId);
        return Ok(stats);
    }

    // GET /api/reviews/user/{userId} - Get all reviews by a specific user (PUBLIC)
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserReviews(int userId)
    {
        var reviews = await _reviewService.GetUserReviewsAsync(userId);
        return Ok(reviews);
    }

    // GET /api/reviews/{id} - Get specific review by ID (PUBLIC)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetReviewById(int id)
    {
        var review = await _reviewService.GetReviewByIdAsync(id);
        
        if (review == null)
            return NotFound(new { error = "Review not found" });

        return Ok(review);
    }

    // POST /api/reviews - Create a new review (AUTHENTICATED)
    [HttpPost]
    [Authorize] // must be logged in
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // get the current user's ID from the JWT token
        var userId = GetCurrentUserId();

        var (success, error, review) = await _reviewService.CreateReviewAsync(userId, request);
        
        if (!success)
            return BadRequest(new { error });

        // return 201 Created with location header
        return CreatedAtAction(
            nameof(GetReviewById),
            new { id = review!.id },
            review
        );
    }

    // PUT /api/reviews/{id} - Update own review (AUTHENTICATED)
    [HttpPut("{id}")]
    [Authorize] // must be logged in
    public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // get the current user's ID from the JWT token
        var userId = GetCurrentUserId();

        var (success, error, review) = await _reviewService.UpdateReviewAsync(userId, id, request);

        if (!success)
        {
            // check if it's a not found or forbidden error
            if (error == "Review not found")
                return NotFound(new { error });
            else
                return Forbid(); // user doesn't own this review
        }

        return Ok(review);
    }

    // updated method to include admin being able to delete other users reviews
    // DELETE /api/reviews/{id} - Delete own review (or any review if admin)
    [HttpDelete("{id}")]
    [Authorize] // must be logged in
    public async Task<IActionResult> DeleteReview(int id)
    {
        // get the current user's ID from the JWT token
        var userId = GetCurrentUserId();
        
        // check if user is admin
        var isAdmin = User.IsInRole("Admin");

        var (success, error) = await _reviewService.DeleteReviewAsync(userId, id, isAdmin);
        
        if (!success)
        {
            // check if it's a not found or forbidden error
            if (error == "Review not found")
                return NotFound(new { error });
            else
                return Forbid(); // user doesn't own this review and is not admin
        }

        return Ok(new { message = "Review deleted successfully" });
    }

    // helper method to extract user ID from JWT token
    private int GetCurrentUserId()
    {
        // the "sub" claim contains the user ID (we set this in AuthService)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                          ?? User.FindFirst("sub");
        
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");

        return int.Parse(userIdClaim.Value);
    }
}