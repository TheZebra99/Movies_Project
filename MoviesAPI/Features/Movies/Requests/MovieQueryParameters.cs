using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.Movies.Requests;

public class MovieQueryParameters
{
    // Search by title (case-insensitive, partial match)
    public string? search { get; set; }
    
    // Filter by genre (exact match, case-insensitive)
    public string? genre { get; set; }
    
    // Filter by director (case-insensitive, partial match)
    public string? director { get; set; }
    
    // Filter by release year
    public int? year { get; set; }
    
    // Pagination
    [Range(1, int.MaxValue)]
    public int page { get; set; } = 1; // default to page 1
    
    [Range(1, 100)]
    public int pageSize { get; set; } = 10; // default to 10 items per page
}