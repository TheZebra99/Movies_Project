using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MoviesAPI.Models;
using MoviesAPI.Repositories;
using MoviesAPI.Features.Auth.Requests;
using MoviesAPI.Features.Auth.Responses;

namespace MoviesAPI.Services;

// services interface
public interface IAuthService
{
    // tuple return type (4 types)
    Task<(bool Success, string? Error, UserResponse? User, string? Token)> RegisterAsync(RegisterRequest request);
    Task<(bool Success, string? Error, UserResponse? User, string? Token)> LoginAsync(LoginRequest request);

    // new method for changing the password
    Task<(bool Success, string? Error)> ChangePasswordAsync(int userId, string currentPassword, string newPassword);

    // new method for the users profile endpoint
    Task<(bool Success, string? Error, UserResponse? User)> GetCurrentUserProfileAsync(int userId);

    // new method for updating the profile
    Task<(bool Success, string? Error, UserResponse? User)> UpdateProfileAsync(int userId, UpdateProfileRequest request);
}

public class AuthService : IAuthService
{
    // This is just a variable that holds a reference to something that implements IUserRepository
    // Using the interface (instead of the class UserRepository) gives us flexibility and testability
    // Later we can swap implementations without changing the code
    private readonly IUserRepository _userRepository; // take the interface from UserRepository.cs
    private readonly IConfiguration _configuration; // take the interface for appsettings.json

    // constructor for AuthService
    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<(bool Success, string? Error, UserResponse? User, string? Token)> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(request.email))
        {
            return (false, "Email already registered", null, null); // return (bool, string?, UserResponse?, string?) tuple
        } // UserResponse? can be UserResponse or null...

        // Check if username already exists
        if (await _userRepository.UsernameExistsAsync(request.username))
        {
            return (false, "Username already taken", null, null);
        }

        // Create new user
        var user = new User(request.email, request.username, request.display_name);
        user.SetPassword(request.password);

        // Save to the database
        var createdUser = await _userRepository.CreateAsync(user);

        // Generate a JWT token
        var token = GenerateJwtToken(createdUser);

        // Create a response
        var userResponse = new UserResponse
        {
            id = createdUser.id,
            email = createdUser.email,
            username = createdUser.username,
            display_name = createdUser.display_name,
            creation_date = createdUser.creation_date,
            role = createdUser.role, // new field
            profile_pic_url = user.profile_pic_url // new field to include the profile pic
        };

        return (true, null, userResponse, token);
    }

    // do the same for Login
    public async Task<(bool Success, string? Error, UserResponse? User, string? Token)> LoginAsync(LoginRequest request)
    {
        User? user = null;

        // Determine if login is email or username
        if (request.login.Contains("@"))
        {
            user = await _userRepository.GetByEmailAsync(request.login);
        }
        else
        {
            user = await _userRepository.GetByUsernameAsync(request.login);
        }

        // Check if user exists
        if (user == null)
        {
            return (false, "Invalid credentials", null, null);
        }

        // Verify password
        if (!user.VerifyPassword(request.password))
        {
            return (false, "Invalid credentials", null, null);
        }

        // Generate JWT token
        var token = GenerateJwtToken(user);

        // Create response
        var userResponse = new UserResponse
        {
            id = user.id,
            email = user.email,
            username = user.username,
            display_name = user.display_name,
            creation_date = user.creation_date,
            role = user.role, // new field
            profile_pic_url = user.profile_pic_url // new field to include the profile pic
        };

        return (true, null, userResponse, token);
    }

    // a JWT token gets sent with every request...
    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // generate a jwt token with the required user fields
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.email),
            new Claim("username", user.username),
            new Claim(ClaimTypes.Role, user.role), // new line
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // token id
        };

        // token properties
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // new method for changing the password
    public async Task<(bool Success, string? Error)> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return (false, "User not found");

        try
        {
            user.ChangePassword(currentPassword, newPassword);
            await _userRepository.UpdateAsync(user);
            return (true, null);
        }
        catch (ArgumentException ex)
        {
            return (false, ex.Message);
        }
    }

    // new method for the users profile endpoint
    public async Task<(bool Success, string? Error, UserResponse? User)> GetCurrentUserProfileAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return (false, "User not found", null);

        var userResponse = new UserResponse
        {
            id = user.id,
            email = user.email,
            username = user.username,
            display_name = user.display_name,
            creation_date = user.creation_date,
            role = user.role,
            profile_pic_url = user.profile_pic_url
        };

        return (true, null, userResponse);
    }

    // new method for updating the profile
    public async Task<(bool Success, string? Error, UserResponse? User)> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return (false, "User not found", null);

        // Check if new email already exists (if changing email)
        if (!string.IsNullOrWhiteSpace(request.email) && request.email.Trim().ToLowerInvariant() != user.email)
        {
            if (await _userRepository.EmailExistsAsync(request.email))
                return (false, "Email already registered", null);
        }

        // Check if new username already exists (if changing username)
        if (!string.IsNullOrWhiteSpace(request.username) && request.username.Trim() != user.username)
        {
            if (await _userRepository.UsernameExistsAsync(request.username))
                return (false, "Username already taken", null);
        }

        // Update profile
        user.UpdateProfile(request.email, request.username, request.display_name, request.profile_pic_url);
        await _userRepository.UpdateAsync(user);

        var userResponse = new UserResponse
        {
            id = user.id,
            email = user.email,
            username = user.username,
            display_name = user.display_name,
            creation_date = user.creation_date,
            role = user.role,
            profile_pic_url = user.profile_pic_url
        };

        return (true, null, userResponse);
    }
}