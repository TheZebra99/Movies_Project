using MoviesAPI.Features.People.Responses;

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

    // Rating statistics
    public double? average_rating { get; set; }
    public int review_count { get; set; }

    // new fields for the frontend
    public decimal? revenue { get; set; }
    public string? trailer_url { get; set; }
    public List<string>? screenshots { get; set; }

    // new Cast and Crew fields
    public List<MoviePersonResponse>? cast { get; set; }
    public List<MoviePersonResponse>? crew { get; set; }
}