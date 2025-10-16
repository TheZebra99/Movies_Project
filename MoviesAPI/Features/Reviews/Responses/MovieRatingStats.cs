namespace MoviesAPI.Features.Reviews.Responses;

public class MovieRatingStats
{
    public int movie_id { get; set; }
    public double? average_rating { get; set; }
    public int review_count { get; set; }
}