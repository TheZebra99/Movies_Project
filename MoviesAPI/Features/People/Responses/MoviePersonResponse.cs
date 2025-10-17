using MoviesAPI.Models;

namespace MoviesAPI.Features.People.Responses;

public class MoviePersonResponse
{
    public int id { get; set; }  // new, MoviePerson record ID
    public int person_id { get; set; }
    public string person_name { get; set; } = "";
    public string? person_photo_url { get; set; }  // new, persons photo
    public PersonRole role { get; set; }
    public string? character_name { get; set; }
    public int? billing_order { get; set; }
}