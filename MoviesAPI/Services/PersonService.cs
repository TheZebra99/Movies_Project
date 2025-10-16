using MoviesAPI.Models;
using MoviesAPI.Repositories;
using MoviesAPI.Features.People.Requests;
using MoviesAPI.Features.People.Responses;

namespace MoviesAPI.Services;

public interface IPersonService
{
    Task<IEnumerable<PersonResponse>> GetAllPeopleAsync();
    Task<PersonResponse?> GetPersonByIdAsync(int id);
    Task<PersonWithMoviesResponse?> GetPersonWithMoviesAsync(int id);
    Task<(bool Success, string? Error, PersonResponse? Person)> CreatePersonAsync(CreatePersonRequest request);
    Task<(bool Success, string? Error, PersonResponse? Person)> UpdatePersonAsync(int id, UpdatePersonRequest request);
    Task<(bool Success, string? Error)> DeletePersonAsync(int id);
}

public class PersonService : IPersonService
{
    private readonly IPersonRepository _personRepository;

    public PersonService(IPersonRepository personRepository)
    {
        _personRepository = personRepository;
    }

    public async Task<IEnumerable<PersonResponse>> GetAllPeopleAsync()
    {
        var people = await _personRepository.GetAllAsync();
        return people.Select(p => MapToResponse(p));
    }

    public async Task<PersonResponse?> GetPersonByIdAsync(int id)
    {
        var person = await _personRepository.GetByIdAsync(id);
        return person == null ? null : MapToResponse(person);
    }

    public async Task<PersonWithMoviesResponse?> GetPersonWithMoviesAsync(int id)
    {
        var person = await _personRepository.GetByIdAsync(id);
        if (person == null)
            return null;

        var movieCredits = await _personRepository.GetPersonMoviesAsync(id);

        return new PersonWithMoviesResponse
        {
            person = MapToResponse(person),
            movies = movieCredits.Select(mp => new MovieCredits
            {
                movie_id = mp.movie_id,
                movie_title = mp.Movie.title,
                role = mp.role.ToString(),
                character_name = mp.character_name,
                release_date = mp.Movie.release_date
            })
        };
    }

    public async Task<(bool Success, string? Error, PersonResponse? Person)> CreatePersonAsync(CreatePersonRequest request)
    {
        // check if person already exists
        var exists = await _personRepository.PersonExistsAsync(request.name);
        if (exists)
            return (false, "A person with this name already exists", null);

        var person = new Person(request.name, request.biography, request.birth_date, request.photo_url);
        var createdPerson = await _personRepository.CreateAsync(person);

        return (true, null, MapToResponse(createdPerson));
    }

    public async Task<(bool Success, string? Error, PersonResponse? Person)> UpdatePersonAsync(int id, UpdatePersonRequest request)
    {
        var person = await _personRepository.GetByIdAsync(id);
        if (person == null)
            return (false, "Person not found", null);

        person.UpdateDetails(request.name, request.biography, request.birth_date, request.photo_url);
        var updatedPerson = await _personRepository.UpdateAsync(person);

        return (true, null, MapToResponse(updatedPerson));
    }

    public async Task<(bool Success, string? Error)> DeletePersonAsync(int id)
    {
        var deleted = await _personRepository.DeleteAsync(id);
        if (!deleted)
            return (false, "Person not found");

        return (true, null);
    }

    private PersonResponse MapToResponse(Person person)
    {
        return new PersonResponse
        {
            id = person.id,
            name = person.name,
            biography = person.biography,
            birth_date = person.birth_date,
            photo_url = person.photo_url,
            created_at = person.created_at
        };
    }
}