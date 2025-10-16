namespace MoviesAPI.Models;

public class User
{
    public int id { get; private set; }
    public string email { get; private set; } = "";
    public string username { get; private set; } = "";
    public string display_name { get; private set; } = "";
    public DateTime creation_date { get; private set; } = DateTime.UtcNow;
    [System.Text.Json.Serialization.JsonIgnore]
    public string password_hash { get; private set; } = "";

    public string role { get; private set; } = "User"; // role

    // new field with a profile picture
    public string? profile_pic_url { get; private set; }

    // constructors
    protected User()
    { }

    
    // updated constructor to include the profile picture
    public User(string email, string username, string? displayName = null, string? profilePicUrl = null)
    {
        // check for empty fields
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("email required", nameof(email));
        if (string.IsNullOrWhiteSpace(username))
            throw new ArgumentException("username required", nameof(username));

        var normalizedEmail = email.Trim().ToLowerInvariant(); // Trim = remove whitespace before the input, ToLowerInvariant = lower case the email
        var normalizedUsername = username.Trim();

        // check if displayName is empty, otherwise set to username
        string normalizedDisplayName;
        if (string.IsNullOrWhiteSpace(displayName))
        {
            normalizedDisplayName = username;
        }
        else
        {
            normalizedDisplayName = displayName.Trim();
        }

        this.email = normalizedEmail;
        this.username = normalizedUsername;
        this.display_name = normalizedDisplayName;
        this.profile_pic_url = profilePicUrl?.Trim();
    }

    public void SetPassword(string raw_password)
    {
        password_hash = BCrypt.Net.BCrypt.HashPassword(raw_password);
    }

    public bool VerifyPassword(string raw_password)
    {
        return BCrypt.Net.BCrypt.Verify(raw_password, password_hash);
    }

    // new method for changing the password
    public void ChangePassword(string currentPassword, string newPassword)
    {
        if (!VerifyPassword(currentPassword))
            throw new ArgumentException("Current password is incorrect");
        
        SetPassword(newPassword);
    }

    public void SetRole(string newRole)
    {
        if (newRole != "User" && newRole != "Admin")
            throw new ArgumentException("Invalid role. Must be 'User' or 'Admin'", nameof(newRole));

        role = newRole;
    }
    
    // new method to update the profile
    public void UpdateProfile(string? email = null, string? username = null, string? displayName = null, string? profilePicUrl = null)
    {
        if (!string.IsNullOrWhiteSpace(email))
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            this.email = normalizedEmail;
        }
        
        if (!string.IsNullOrWhiteSpace(username))
        {
            var normalizedUsername = username.Trim();
            this.username = normalizedUsername;
        }
        
        if (!string.IsNullOrWhiteSpace(displayName))
            display_name = displayName.Trim();
        
        if (profilePicUrl != null)
            profile_pic_url = profilePicUrl.Trim();
    }

}
