namespace MoviesAPI.Models;

public class Watchlist
{
    public int user_id { get; private set; }
    public int movie_id { get; private set; }
    public DateTime added_at { get; private set; } = DateTime.UtcNow;
    
    // Navigation properties (for Entity Framework relationships)
    public User User { get; private set; } = null!;
    public Movie Movie { get; private set; } = null!;
    
    // EF Core needs an empty constructor
    protected Watchlist() { }
    
    // Constructor
    public Watchlist(int userId, int movieId)
    {
        user_id = userId;
        movie_id = movieId;
    }
}