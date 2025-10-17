using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoviesAPI.Data;
using MoviesAPI.Features.Auth.Responses;
using Microsoft.EntityFrameworkCore;

namespace MoviesAPI.Features.Users;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")] // Only admins can access user management
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET /api/users/{id}/public - new get user public profile endpoint (NO AUTH REQUIRED)
    [HttpGet("{id}/public")]
    [AllowAnonymous] // Override the Admin requirement for this endpoint
    public async Task<IActionResult> GetUserPublicProfile(int id)
    {
        var user = await _context.Users.FindAsync(id);
        
        if (user == null)
            return NotFound(new { error = "User not found" });

        // Return only public information (no email)
        var publicProfile = new
        {
            id = user.id,
            username = user.username,
            display_name = user.display_name,
            profile_pic_url = user.profile_pic_url,
            creation_date = user.creation_date,
            role = user.role
        };

        return Ok(publicProfile);
    }


    // GET /api/users - Get all users
    [HttpGet]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var totalCount = await _context.Users.CountAsync();
        var users = await _context.Users
            .OrderBy(u => u.id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserResponse
            {
                id = u.id,
                email = u.email,
                username = u.username,
                display_name = u.display_name,
                profile_pic_url = u.profile_pic_url,
                creation_date = u.creation_date,
                role = u.role
            })
            .ToListAsync();

        return Ok(new
        {
            users,
            page,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    // GET /api/users/{id} - Get user by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        
        if (user == null)
            return NotFound(new { error = "User not found" });

        var userResponse = new UserResponse
        {
            id = user.id,
            email = user.email,
            username = user.username,
            display_name = user.display_name,
            profile_pic_url = user.profile_pic_url,
            creation_date = user.creation_date,
            role = user.role
        };

        return Ok(userResponse);
    }

    // DELETE /api/users/{id} - Delete user (cascade deletes reviews)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        
        if (user == null)
            return NotFound(new { error = "User not found" });

        // Prevent deleting yourself
        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (currentUserId == id)
            return BadRequest(new { error = "You cannot delete your own account" });

        // EF Core will handle cascade deletion
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User '{user.username}' deleted successfully" });
    }
}