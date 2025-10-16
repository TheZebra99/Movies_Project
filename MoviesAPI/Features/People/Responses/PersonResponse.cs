namespace MoviesAPI.Features.People.Responses;

public class PersonResponse
{
    public int id { get; set; }
    public string name { get; set; } = "";
    public string? biography { get; set; }
    public DateTime? birth_date { get; set; }
    public string? photo_url { get; set; }
    public DateTime created_at { get; set; }
}