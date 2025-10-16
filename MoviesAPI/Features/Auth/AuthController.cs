using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoviesAPI.Features.Auth.Requests;
using MoviesAPI.Features.Auth.Responses;
using MoviesAPI.Services;
using System.Security.Claims;

namespace MoviesAPI.Features.Auth;

[ApiController] // ApiController automatically handles the 400 error codes...
[Route("auth")]
public class AuthController : ControllerBase // inherit from base class
{
    private readonly IAuthService _authService;

    // constructor with dependency injection
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        // (bool, string?, UserResponse?, string?) tuple is returned from RegisterAsync inside AuthService.cs
        var (success, error, user, token) = await _authService.RegisterAsync(request); // call the register operation

        if (!success)
        {
            return BadRequest(new { message = error }); // 400 error code 
        }

        var response = new AuthResponse 
        {
            user = user!,
            token = token!
        };

        return Ok(response); // return AuthResponse with user data and JWT token (200 http code)
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        // same tuple for LoginAsync from AuthService.cs
        var (success, error, user, token) = await _authService.LoginAsync(request);

        if (!success)
        {
            return Unauthorized(new { message = error }); // 401 code if the login data is not correct
        }

        var response = new AuthResponse
        {
            user = user!,
            token = token!
        };

        return Ok(response); // 200 http code
    }

    // new endpoint for logging out
    // POST /api/auth/logout - Logout (token is actually cleared on frontend)
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // with JWT, logout is handled client-side by deleting the token
        // this endpoint exists for consistency and future token blacklisting
        return Ok(new { message = "Logged out successfully. Please delete your token." });
    }

    // new endpoint for changing the password
    // POST /api/auth/change-password - Change password
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        var (success, error) = await _authService.ChangePasswordAsync(userId, request.current_password, request.new_password);

        if (!success)
            return BadRequest(new { error });

        return Ok(new { message = "Password changed successfully" });
    }

    // helper method for changing the password
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");
        return int.Parse(userIdClaim.Value);
    }

    // new endpoint for getting the users profile
    // GET /api/auth/profile - Get current user profile
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var (success, error, user) = await _authService.GetCurrentUserProfileAsync(userId);

        if (!success)
            return NotFound(new { error });

        return Ok(user);
    }

    // new endpoint for changing the profile
    // PUT /api/auth/profile - Update profile
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        var (success, error, user) = await _authService.UpdateProfileAsync(userId, request);

        if (!success)
            return BadRequest(new { error });

        return Ok(user);
    }
}