namespace MoviesAPI.Features.Auth.Responses;

public class UserResponse // no password field for the response! (contains only public user information)
{
    public int id { get; set; }
    public string email { get; set; } = "";
    public string username { get; set; } = "";
    public string display_name { get; set; } = "";
    public DateTime creation_date { get; set; }
}

public class AuthResponse // returned by /auth/register and /auth/login
{
    public UserResponse user { get; set; } = null!;
    public string token { get; set; } = "";
}