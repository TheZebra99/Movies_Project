using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoviesAPI.Services;
using MoviesAPI.Features.Watchlist.Requests;

namespace MoviesAPI.Features.Watchlist;

[ApiController]
[Route("api/watchlist")]
[Authorize] // ALL endpoints require authentication (registered users only)
public class WatchlistController : ControllerBase
{
    private readonly IWatchlistService _watchlistService;

    // constructor
    public WatchlistController(IWatchlistService watchlistService)
    {
        _watchlistService = watchlistService;
    }

    // GET /api/watchlist - Get my watchlist
    [HttpGet]
    public async Task<IActionResult> GetMyWatchlist()
    {
        // get the current user's ID from the JWT token
        var userId = GetCurrentUserId();
        
        var watchlist = await _watchlistService.GetUserWatchlistAsync(userId);
        return Ok(watchlist);
    }

    // POST /api/watchlist - Add movie to my watchlist
    [HttpPost]
    public async Task<IActionResult> AddToWatchlist([FromBody] AddToWatchlistRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // get the current user's ID from the JWT token
        var userId = GetCurrentUserId();
        
        var (success, error) = await _watchlistService.AddToWatchlistAsync(userId, request);
        
        if (!success)
            return BadRequest(new { error });

        return Ok(new { message = "Movie added to watchlist" });
    }

    // DELETE /api/watchlist/{movieId} - Remove movie from my watchlist
    [HttpDelete("{movieId}")]
    public async Task<IActionResult> RemoveFromWatchlist(int movieId)
    {
        // get the current user's ID from the JWT token
        var userId = GetCurrentUserId();
        
        var (success, error) = await _watchlistService.RemoveFromWatchlistAsync(userId, movieId);
        
        if (!success)
            return NotFound(new { error });

        return Ok(new { message = "Movie removed from watchlist" });
    }

    // helper method to extract user ID from JWT token
    private int GetCurrentUserId()
    {
        // the "sub" claim contains the user ID (we set this in AuthService)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                          ?? User.FindFirst("sub");
        
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");

        return int.Parse(userIdClaim.Value);
    }
}