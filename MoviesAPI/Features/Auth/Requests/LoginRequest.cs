using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Features.Auth.Requests
{
    public class LoginRequest
    {
        // use either username or email for logging in (login field)
        [Required]
        [MaxLength(254)]
        public string login { get; set; } = "";

        [Required]
        public string password { get; set; } = "";
    }
}