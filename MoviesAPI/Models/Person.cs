namespace MoviesAPI.Models;

public class Person
{
    public int id { get; private set; }
    public string name { get; private set; } = "";
    public string? biography { get; private set; }
    public DateTime? birth_date { get; private set; }
    public string? photo_url { get; private set; }
    public DateTime created_at { get; private set; } = DateTime.UtcNow;
    
    // EF Core needs this
    protected Person() { }

    // updated constructor to include utc conversion
    public Person(string name, string? biography = null, DateTime? birthDate = null, string? photoUrl = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required", nameof(name));

        this.name = name.Trim();
        this.biography = biography?.Trim();

        // Convert birth_date to UTC if provided
        if (birthDate.HasValue)
        {
            this.birth_date = birthDate.Value.Kind == DateTimeKind.Utc
                ? birthDate.Value
                : DateTime.SpecifyKind(birthDate.Value, DateTimeKind.Utc);
        }

        this.photo_url = photoUrl?.Trim();
    }
    
    // updated method with utc conversion
    public void UpdateDetails(string? name = null, string? biography = null, 
                            DateTime? birthDate = null, string? photoUrl = null)
    {
        if (!string.IsNullOrWhiteSpace(name))
            this.name = name.Trim();
        if (biography != null)
            this.biography = biography.Trim();
        if (birthDate.HasValue)
        {
            // Convert to UTC if not already
            this.birth_date = birthDate.Value.Kind == DateTimeKind.Utc 
                ? birthDate.Value 
                : DateTime.SpecifyKind(birthDate.Value, DateTimeKind.Utc);
        }
        if (photoUrl != null)
            this.photo_url = photoUrl.Trim();
    }
}