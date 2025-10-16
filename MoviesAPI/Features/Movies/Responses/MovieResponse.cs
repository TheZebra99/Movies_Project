namespace MoviesAPI.Features.Movies.Responses;

public class MovieResponse
{
    public int id { get; set; }
    public string title { get; set; } = "";
    public string? description { get; set; }
    public DateTime release_date { get; set; }
    public string? director { get; set; }
    public string? genre { get; set; }
    public int? runtime_minutes { get; set; }
    public string? poster_url { get; set; }
    public DateTime created_at { get; set; }

    // new rating statistics
    public double? average_rating { get; set; }
    public int review_count { get; set; }
}