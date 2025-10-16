using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MoviesAPI.Services;
using MoviesAPI.Features.People.Requests;

namespace MoviesAPI.Features.People;

[ApiController]
[Route("api/people")]
public class PeopleController : ControllerBase
{
    private readonly IPersonService _personService;

    public PeopleController(IPersonService personService)
    {
        _personService = personService;
    }

    // GET /api/people - Get all people (PUBLIC)
    [HttpGet]
    public async Task<IActionResult> GetAllPeople()
    {
        var people = await _personService.GetAllPeopleAsync();
        return Ok(people);
    }

    // GET /api/people/{id} - Get person by ID (PUBLIC)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPersonById(int id)
    {
        var person = await _personService.GetPersonByIdAsync(id);
        
        if (person == null)
            return NotFound(new { error = "Person not found" });

        return Ok(person);
    }

    // GET /api/people/{id}/movies - Get person with all their movies (PUBLIC)
    [HttpGet("{id}/movies")]
    public async Task<IActionResult> GetPersonWithMovies(int id)
    {
        var personWithMovies = await _personService.GetPersonWithMoviesAsync(id);
        
        if (personWithMovies == null)
            return NotFound(new { error = "Person not found" });

        return Ok(personWithMovies);
    }

    // POST /api/people - Create new person (ADMIN ONLY)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreatePerson([FromBody] CreatePersonRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, error, person) = await _personService.CreatePersonAsync(request);
        
        if (!success)
            return BadRequest(new { error });

        return CreatedAtAction(nameof(GetPersonById), new { id = person!.id }, person);
    }

    // PUT /api/people/{id} - Update person (ADMIN ONLY)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePerson(int id, [FromBody] UpdatePersonRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, error, person) = await _personService.UpdatePersonAsync(id, request);
        
        if (!success)
            return NotFound(new { error });

        return Ok(person);
    }

    // DELETE /api/people/{id} - Delete person (ADMIN ONLY)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePerson(int id)
    {
        var (success, error) = await _personService.DeletePersonAsync(id);
        
        if (!success)
            return NotFound(new { error });

        return Ok(new { message = "Person deleted successfully" });
    }
}