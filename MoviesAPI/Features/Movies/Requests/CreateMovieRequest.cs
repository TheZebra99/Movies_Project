using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.Movies.Requests;

public class CreateMovieRequest
{
    [Required]
    [MaxLength(200)]
    public string title { get; set; } = "";

    [MaxLength(2000)]
    public string? description { get; set; }

    [Required]
    public DateTime release_date { get; set; }

    [MaxLength(100)]
    public string? director { get; set; }

    [MaxLength(50)]
    public string? genre { get; set; }

    [Range(1, 1000)]
    public int? runtime_minutes { get; set; }

    [MaxLength(500)]
    [Url]
    public string? poster_url { get; set; }
}