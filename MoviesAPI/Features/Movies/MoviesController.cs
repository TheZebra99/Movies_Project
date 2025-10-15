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

    // GET /api/movies - Get all movies (PUBLIC - no authentication required)
    [HttpGet]
    public async Task<IActionResult> GetAllMovies()
    {
        var movies = await _movieService.GetAllMoviesAsync();
        return Ok(movies);
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

    // POST /api/movies - Create new movie (ADMIN ONLY)
    [HttpPost]
    [Authorize(Roles = "Admin")] // only admins can create movies
    public async Task<IActionResult> CreateMovie([FromBody] CreateMovieRequest request)
    {
        // validation happens automatically via data annotations
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var movie = await _movieService.CreateMovieAsync(request);
        
        // return 201 Created with location header
        return CreatedAtAction(
            nameof(GetMovieById), 
            new { id = movie.id }, 
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