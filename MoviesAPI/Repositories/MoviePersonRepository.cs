using Microsoft.EntityFrameworkCore;
using MoviesAPI.Data;
using MoviesAPI.Models;

namespace MoviesAPI.Repositories;

public interface IMoviePersonRepository
{
    Task<IEnumerable<MoviePerson>> GetMovieCastAndCrewAsync(int movieId);
    Task<MoviePerson> AddPersonToMovieAsync(MoviePerson moviePerson);
    Task<bool> RemovePersonFromMovieAsync(int movieId, int personId, PersonRole role);
}

public class MoviePersonRepository : IMoviePersonRepository
{
    private readonly ApplicationDbContext _context;

    public MoviePersonRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MoviePerson>> GetMovieCastAndCrewAsync(int movieId)
    {
        return await _context.MoviePeople
            .Include(mp => mp.Person)
            .Where(mp => mp.movie_id == movieId)
            .OrderBy(mp => mp.role)
            .ThenBy(mp => mp.billing_order ?? int.MaxValue)
            .ToListAsync();
    }

    public async Task<MoviePerson> AddPersonToMovieAsync(MoviePerson moviePerson)
    {
        _context.MoviePeople.Add(moviePerson);
        await _context.SaveChangesAsync();
        return moviePerson;
    }

    public async Task<bool> RemovePersonFromMovieAsync(int movieId, int personId, PersonRole role)
    {
        var moviePerson = await _context.MoviePeople
            .FirstOrDefaultAsync(mp => 
                mp.movie_id == movieId && 
                mp.person_id == personId && 
                mp.role == role);

        if (moviePerson == null)
            return false;

        _context.MoviePeople.Remove(moviePerson);
        await _context.SaveChangesAsync();
        return true;
    }
}