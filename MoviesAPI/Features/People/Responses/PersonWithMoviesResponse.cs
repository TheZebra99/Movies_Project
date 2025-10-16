using MoviesAPI.Features.Movies.Responses;

namespace MoviesAPI.Features.People.Responses;

public class PersonWithMoviesResponse
{
    public PersonResponse person { get; set; } = null!;
    public IEnumerable<MovieCredits> movies { get; set; } = new List<MovieCredits>();
}

public class MovieCredits
{
    public int movie_id { get; set; }
    public string movie_title { get; set; } = "";
    public string role { get; set; } = "";
    public string? character_name { get; set; }
    public DateTime release_date { get; set; }
}