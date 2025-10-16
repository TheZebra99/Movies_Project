using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.Auth.Requests;

public class ChangePasswordRequest
{
    [Required]
    public string current_password { get; set; } = "";

    [Required]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$",
        ErrorMessage = "New password must be 8+ chars and include upper, lower, and a digit")]
    public string new_password { get; set; } = "";
}