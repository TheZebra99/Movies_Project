using Microsoft.AspNetCore.Mvc;
using MoviesAPI.Features.Auth.Requests;
using MoviesAPI.Features.Auth.Responses;
using MoviesAPI.Services;

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
}