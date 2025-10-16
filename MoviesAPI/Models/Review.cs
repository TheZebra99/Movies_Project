namespace MoviesAPI.Models;

public class Review
{
    public int id { get; private set; }
    public int user_id { get; private set; }
    public int movie_id { get; private set; }
    public int rating { get; private set; } // 1-10 scale
    public string? review_text { get; private set; }
    public DateTime created_at { get; private set; } = DateTime.UtcNow;
    public DateTime? updated_at { get; private set; }
    
    // Navigation properties
    public User User { get; private set; } = null!;
    public Movie Movie { get; private set; } = null!;
    
    // EF Core needs this
    protected Review() { }
    
    // Constructor
    public Review(int userId, int movieId, int rating, string? reviewText = null)
    {
        if (rating < 1 || rating > 10)
            throw new ArgumentException("Rating must be between 1 and 10", nameof(rating));
        
        user_id = userId;
        movie_id = movieId;
        this.rating = rating;
        review_text = reviewText?.Trim();
    }
    
    // Method to update review
    public void UpdateReview(int? newRating = null, string? newReviewText = null)
    {
        if (newRating.HasValue)
        {
            if (newRating.Value < 1 || newRating.Value > 10)
                throw new ArgumentException("Rating must be between 1 and 10", nameof(newRating));
            
            rating = newRating.Value;
        }
        
        if (newReviewText != null)
            review_text = newReviewText.Trim();
        
        updated_at = DateTime.UtcNow;
    }
}