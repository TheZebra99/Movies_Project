namespace MoviesAPI.Models;

public class Movie
{
    public int id { get; private set; }
    public string title { get; private set; } = "";
    public string? description { get; private set; }
    public DateTime release_date { get; private set; }
    public string? director { get; private set; }
    public string? genre { get; private set; }
    public int? runtime_minutes { get; private set; }
    public string? poster_url { get; private set; }
    public DateTime created_at { get; private set; } = DateTime.UtcNow;
    
    // EF Core needs an empty constructor...
    protected Movie() { }
    
    // Constructor
    public Movie(
        string title,
        DateTime releaseDate,
        string? description = null,
        string? director = null,
        string? genre = null,
        int? runtimeMinutes = null,
        string? posterUrl = null
    )
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required", nameof(title));
            
        this.title = title.Trim();
        
        // Convert to UTC if not already
        this.release_date = releaseDate.Kind == DateTimeKind.Utc 
            ? releaseDate 
            : DateTime.SpecifyKind(releaseDate, DateTimeKind.Utc);
        
        this.description = description?.Trim();
        this.director = director?.Trim();
        this.genre = genre?.Trim();
        this.runtime_minutes = runtimeMinutes;
        this.poster_url = posterUrl?.Trim();
    }
    
    // Method to update movie details
    public void UpdateDetails(
        string? title = null,
        string? description = null,
        DateTime? releaseDate = null,
        string? director = null,
        string? genre = null,
        int? runtimeMinutes = null,
        string? posterUrl = null
    )
    {
        if (!string.IsNullOrWhiteSpace(title))
            this.title = title.Trim();
        if (description != null)
            this.description = description.Trim();
        if (releaseDate.HasValue)
        {
            // Convert to UTC if not already
            this.release_date = releaseDate.Value.Kind == DateTimeKind.Utc 
                ? releaseDate.Value 
                : DateTime.SpecifyKind(releaseDate.Value, DateTimeKind.Utc);
        }
        if (director != null)
            this.director = director.Trim();
        if (genre != null)
            this.genre = genre.Trim();
        if (runtimeMinutes.HasValue)
            this.runtime_minutes = runtimeMinutes;
        if (posterUrl != null)
            this.poster_url = posterUrl.Trim();
    }
}