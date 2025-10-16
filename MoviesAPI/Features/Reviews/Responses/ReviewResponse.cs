namespace MoviesAPI.Features.Reviews.Responses;

public class ReviewResponse
{
    public int id { get; set; }
    public int user_id { get; set; }
    public string username { get; set; } = "";
    public string user_display_name { get; set; } = "";
    public int movie_id { get; set; }
    public string movie_title { get; set; } = "";
    public int rating { get; set; }
    public string? review_text { get; set; }
    public DateTime created_at { get; set; }
    public DateTime? updated_at { get; set; }
}