using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoviesAPI.Services;
using MoviesAPI.Features.Movies.Requests;

namespace MoviesAPI.Features.Movies;

[ApiController]
[Route("api/movies")]
public class MoviesController : ControllerBase
{
    private readonly IMovieService _movieService;

    // constructor
    public MoviesController(IMovieService movieService)
    {
        _movieService = movieService;
    }

    // changed this to include pagination and filters
    // GET /api/movies - Get all movies with optional filters and pagination (PUBLIC)
    [HttpGet]
    public async Task<IActionResult> GetAllMovies([FromQuery] MovieQueryParameters parameters)
    {
        var result = await _movieService.GetMoviesWithFiltersAsync(parameters);
        return Ok(result);
    }

    // GET /api/movies/{id} - Get movie by ID (PUBLIC - no authentication required)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMovieById(int id)
    {
        var movie = await _movieService.GetMovieByIdAsync(id);

        if (movie == null)
            return NotFound(new { error = "Movie not found" });

        return Ok(movie);
    }

    // new, updated method to include checking for duplicates
    // POST /api/movies - Create new movie (ADMIN ONLY)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateMovie([FromBody] CreateMovieRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, error, movie) = await _movieService.CreateMovieAsync(request);
        
        if (!success)
            return BadRequest(new { error });
        
        return CreatedAtAction(
            nameof(GetMovieById), 
            new { id = movie!.id }, 
            movie
        );
    }

    // PUT /api/movies/{id} - Update movie (ADMIN ONLY)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")] // only admins can update movies
    public async Task<IActionResult> UpdateMovie(int id, [FromBody] UpdateMovieRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var movie = await _movieService.UpdateMovieAsync(id, request);
        
        if (movie == null)
            return NotFound(new { error = "Movie not found" });

        return Ok(movie);
    }

    // DELETE /api/movies/{id} - Delete movie (ADMIN ONLY)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")] // only admins can delete movies
    public async Task<IActionResult> DeleteMovie(int id)
    {
        var success = await _movieService.DeleteMovieAsync(id);
        
        if (!success)
            return NotFound(new { error = "Movie not found" });

        return Ok(new { message = "Movie deleted successfully" });
    }
}