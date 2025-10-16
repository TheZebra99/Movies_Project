using Microsoft.EntityFrameworkCore;
using MoviesAPI.Data;
using MoviesAPI.Models;

namespace MoviesAPI.Repositories;

public interface IWatchlistRepository
{
    // define operations for watchlist inside the interface
    // operations are asynchronous, don't have to wait for operations to finish...
    Task<IEnumerable<Watchlist>> GetUserWatchlistAsync(int userId);
    Task<Watchlist?> GetWatchlistEntryAsync(int userId, int movieId);
    Task<Watchlist> AddToWatchlistAsync(Watchlist watchlist);
    Task<bool> RemoveFromWatchlistAsync(int userId, int movieId);
    Task<bool> IsInWatchlistAsync(int userId, int movieId);
    // new method for searching inside the watchlist
    Task<IEnumerable<Watchlist>> SearchUserWatchlistAsync(int userId, string searchTerm);
}

public class WatchlistRepository : IWatchlistRepository
{
    private readonly ApplicationDbContext _context; // use an instance of a table "watchlists", a connection to the database

    // constructor
    public WatchlistRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // async method with await = don't have to wait for the operation to finish, move on to the next task
    public async Task<IEnumerable<Watchlist>> GetUserWatchlistAsync(int userId)
    {
        return await _context.Watchlists
            .Include(w => w.Movie) // load the movie data with the watchlist entry
            .Where(w => w.user_id == userId)
            .OrderByDescending(w => w.added_at) // most recently added first
            .ToListAsync();
    }

    public async Task<Watchlist?> GetWatchlistEntryAsync(int userId, int movieId)
    {
        return await _context.Watchlists
            .Include(w => w.Movie)
            .FirstOrDefaultAsync(w => w.user_id == userId && w.movie_id == movieId);
    }

    public async Task<Watchlist> AddToWatchlistAsync(Watchlist watchlist)
    {
        _context.Watchlists.Add(watchlist); // add to watchlist
        await _context.SaveChangesAsync(); // INSERT operation, save the changes <- actual SQL execution happens here
        return watchlist;
    }

    public async Task<bool> RemoveFromWatchlistAsync(int userId, int movieId)
    {
        var entry = await GetWatchlistEntryAsync(userId, movieId);
        if (entry == null)
            return false; // not in watchlist

        _context.Watchlists.Remove(entry);
        await _context.SaveChangesAsync(); // DELETE operation <- actual SQL execution happens here
        return true; // successfully removed
    }

    public async Task<bool> IsInWatchlistAsync(int userId, int movieId)
    {
        return await _context.Watchlists
            .AnyAsync(w => w.user_id == userId && w.movie_id == movieId);
    }

    // new method to search inside the watchlist
    public async Task<IEnumerable<Watchlist>> SearchUserWatchlistAsync(int userId, string searchTerm)
    {
        var normalizedSearch = searchTerm.Trim().ToLower();
        
        return await _context.Watchlists
            .Include(w => w.Movie)
            .Where(w => w.user_id == userId && 
                        w.Movie.title.ToLower().Contains(normalizedSearch))
            .OrderByDescending(w => w.added_at)
            .ToListAsync();
    }
}