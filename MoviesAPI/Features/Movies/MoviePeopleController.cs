using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoviesAPI.Models;
using MoviesAPI.Services;
using MoviesAPI.Features.People.Requests;

namespace MoviesAPI.Features.Movies;

[ApiController]
[Route("api/movies/{movieId}/people")]
public class MoviePeopleController : ControllerBase
{
    private readonly IMoviePersonService _moviePersonService;

    public MoviePeopleController(IMoviePersonService moviePersonService)
    {
        _moviePersonService = moviePersonService;
    }

    // GET /api/movies/{movieId}/people - Get cast and crew for a movie (PUBLIC)
    [HttpGet]
    public async Task<IActionResult> GetMovieCastAndCrew(int movieId)
    {
        var castAndCrew = await _moviePersonService.GetMovieCastAndCrewAsync(movieId);
        return Ok(castAndCrew);
    }

    // POST /api/movies/{movieId}/people - Add person to movie (ADMIN ONLY)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddPersonToMovie(int movieId, [FromBody] AddPersonToMovieRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, error) = await _moviePersonService.AddPersonToMovieAsync(movieId, request);
        
        if (!success)
            return BadRequest(new { error });

        return Ok(new { message = "Person added to movie successfully" });
    }

    // DELETE /api/movies/{movieId}/people/{personId}/{role} - Remove person from movie (ADMIN ONLY)
    [HttpDelete("{personId}/{role}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemovePersonFromMovie(int movieId, int personId, PersonRole role)
    {
        var (success, error) = await _moviePersonService.RemovePersonFromMovieAsync(movieId, personId, role);
        
        if (!success)
            return NotFound(new { error });

        return Ok(new { message = "Person removed from movie successfully" });
    }
}