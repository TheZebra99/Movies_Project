using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.People.Requests;

public class CreatePersonRequest
{
    [Required]
    [MaxLength(100)]
    public string name { get; set; } = "";

    [MaxLength(5000)]
    public string? biography { get; set; }

    public DateTime? birth_date { get; set; }

    [MaxLength(500)]
    [Url]
    public string? photo_url { get; set; }
}