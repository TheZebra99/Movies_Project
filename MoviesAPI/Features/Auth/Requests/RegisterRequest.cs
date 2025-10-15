using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.Auth.Requests;


public class RegisterRequest
{
    [Required] // annotations for field validation
    [EmailAddress]
    public string email { get; set; } = "";

    [Required]
    [ // regex - 3-30 characters, letters, digits and signs
        RegularExpression(@"^[a-zA-Z0-9_.-]{3,30}$",
        ErrorMessage = "username must be 3–30 chars: letters, digits, _ . - only")
    ]
    public string username { get; set; } = "";


    [Required]
    [
        RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$",
        ErrorMessage = "password must be 8+ chars and include upper, lower, and a digit")
    ]
    public string password { get; set; } = "";
    
    [MaxLength(60)] // not required
    public string? display_name { get; set; }
}