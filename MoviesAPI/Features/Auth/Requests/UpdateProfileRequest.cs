using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.Auth.Requests;

public class UpdateProfileRequest
{
    [EmailAddress]
    [MaxLength(254)]
    public string? email { get; set; }

    [RegularExpression(@"^[a-zA-Z0-9_.-]{3,30}$",
        ErrorMessage = "username must be 3–30 chars: letters, digits, _ . - only")]
    public string? username { get; set; }

    [MaxLength(60)]
    public string? display_name { get; set; }

    [MaxLength(500)]
    [Url]
    public string? profile_pic_url { get; set; }
}