using MoviesAPI.Models;

namespace MoviesAPI.Features.People.Responses;

public class MoviePersonResponse
{
    public int person_id { get; set; }
    public string person_name { get; set; } = "";
    public PersonRole role { get; set; }
    public string? character_name { get; set; }
    public int? billing_order { get; set; }
}