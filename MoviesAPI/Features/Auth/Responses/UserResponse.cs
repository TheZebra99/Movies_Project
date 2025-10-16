namespace MoviesAPI.Features.Auth.Responses;

public class UserResponse // no password field for the response! (contains only public user information)
{
    public int id { get; set; }
    public string email { get; set; } = "";
    public string username { get; set; } = "";
    public string display_name { get; set; } = "";
    // added new field to include the profile picture in the response
    public string? profile_pic_url { get; set; }
    public DateTime creation_date { get; set; }
    public string role { get; set; } = ""; // new field
}

public class AuthResponse // returned by /auth/register and /auth/login
{
    public UserResponse user { get; set; } = null!;
    public string token { get; set; } = "";
}