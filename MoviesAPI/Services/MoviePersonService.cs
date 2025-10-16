using MoviesAPI.Models;
using MoviesAPI.Repositories;
using MoviesAPI.Features.People.Requests;
using MoviesAPI.Features.People.Responses;

namespace MoviesAPI.Services;

public interface IMoviePersonService
{
    Task<IEnumerable<MoviePersonResponse>> GetMovieCastAndCrewAsync(int movieId);
    Task<(bool Success, string? Error)> AddPersonToMovieAsync(int movieId, AddPersonToMovieRequest request);
    Task<(bool Success, string? Error)> RemovePersonFromMovieAsync(int movieId, int personId, PersonRole role);
}

public class MoviePersonService : IMoviePersonService
{
    private readonly IMoviePersonRepository _moviePersonRepository;
    private readonly IMovieRepository _movieRepository;
    private readonly IPersonRepository _personRepository;

    public MoviePersonService(
        IMoviePersonRepository moviePersonRepository,
        IMovieRepository movieRepository,
        IPersonRepository personRepository)
    {
        _moviePersonRepository = moviePersonRepository;
        _movieRepository = movieRepository;
        _personRepository = personRepository;
    }

    public async Task<IEnumerable<MoviePersonResponse>> GetMovieCastAndCrewAsync(int movieId)
    {
        var castAndCrew = await _moviePersonRepository.GetMovieCastAndCrewAsync(movieId);

        return castAndCrew.Select(mp => new MoviePersonResponse
        {
            person_id = mp.person_id,
            person_name = mp.Person.name,
            role = mp.role,
            character_name = mp.character_name,
            billing_order = mp.billing_order
        });
    }

    // updated method to check for duplicates before adding the person
    public async Task<(bool Success, string? Error)> AddPersonToMovieAsync(int movieId, AddPersonToMovieRequest request)
    {
        // check if movie exists
        var movieExists = await _movieRepository.ExistsAsync(movieId);
        if (!movieExists)
            return (false, "Movie not found");

        // check if person exists
        var personExists = await _personRepository.ExistsAsync(request.person_id);
        if (!personExists)
            return (false, "Person not found");

        // check if this person is already added to this movie in this role
        var castAndCrew = await _moviePersonRepository.GetMovieCastAndCrewAsync(movieId);
        var alreadyAdded = castAndCrew.Any(mp => 
            mp.person_id == request.person_id && 
            mp.role == request.role);
        
        if (alreadyAdded)
            return (false, "This person is already added to the movie in this role");

        var moviePerson = new MoviePerson(
            movieId, 
            request.person_id, 
            request.role, 
            request.character_name, 
            request.billing_order);

        await _moviePersonRepository.AddPersonToMovieAsync(moviePerson);

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> RemovePersonFromMovieAsync(int movieId, int personId, PersonRole role)
    {
        var removed = await _moviePersonRepository.RemovePersonFromMovieAsync(movieId, personId, role);
        
        if (!removed)
            return (false, "Person not found in movie cast/crew");

        return (true, null);
    }
}