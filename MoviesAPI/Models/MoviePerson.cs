namespace MoviesAPI.Models;

public class MoviePerson
{
    public int movie_id { get; private set; }
    public int person_id { get; private set; }
    public PersonRole role { get; private set; }
    public string? character_name { get; private set; } // for actors
    public int? billing_order { get; private set; } // 1 = lead, 2 = supporting, etc.
    
    // Navigation properties
    public Movie Movie { get; private set; } = null!;
    public Person Person { get; private set; } = null!;
    
    // EF Core needs this
    protected MoviePerson() { }
    
    // Constructor
    public MoviePerson(int movieId, int personId, PersonRole role, 
                       string? characterName = null, int? billingOrder = null)
    {
        movie_id = movieId;
        person_id = personId;
        this.role = role;
        character_name = characterName?.Trim();
        billing_order = billingOrder;
    }
    
    // Method to update
    public void UpdateDetails(string? characterName = null, int? billingOrder = null)
    {
        if (characterName != null)
            character_name = characterName.Trim();
        if (billingOrder.HasValue)
            billing_order = billingOrder;
    }
}