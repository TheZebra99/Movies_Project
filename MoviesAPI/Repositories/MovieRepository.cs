using Microsoft.EntityFrameworkCore;
using MoviesAPI.Data;
using MoviesAPI.Models;

namespace MoviesAPI.Repositories;

public interface IMovieRepository
{
    // define operations for movies inside the interface
    // operations are asynchronous, don't have to wait for operations to finish...
    Task<IEnumerable<Movie>> GetAllAsync();
    Task<Movie?> GetByIdAsync(int id);
    Task<Movie> CreateAsync(Movie movie);
    Task<Movie> UpdateAsync(Movie movie);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}

public class MovieRepository : IMovieRepository // using the methods from the interface
{
    private readonly ApplicationDbContext _context; // use an instance of a table "movies", a connection to the database

    // constructor
    public MovieRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // async method with await = don't have to wait for the operation to finish, move on to the next task
    public async Task<IEnumerable<Movie>> GetAllAsync()
    {
        return await _context.Movies
            .OrderByDescending(m => m.created_at) // newest movies first
            .ToListAsync();
    }

    // Task <T> = a result that will come later...
    public async Task<Movie?> GetByIdAsync(int id)
    {
        return await _context.Movies.FindAsync(id);
    }

    public async Task<Movie> CreateAsync(Movie movie)
    {
        _context.Movies.Add(movie); // add a new movie to the database
        await _context.SaveChangesAsync(); // INSERT operation, save the changes <- actual SQL execution happens here
        return movie;
    }

    public async Task<Movie> UpdateAsync(Movie movie)
    {
        _context.Movies.Update(movie); // update the movie data
        await _context.SaveChangesAsync(); // UPDATE operation <- actual SQL execution happens here
        return movie;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var movie = await GetByIdAsync(id);
        if (movie == null)
            return false; // movie not found

        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync(); // DELETE operation <- actual SQL execution happens here
        return true; // successfully deleted
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Movies
            .AnyAsync(m => m.id == id);
    }
}