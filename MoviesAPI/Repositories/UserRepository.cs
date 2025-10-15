using Microsoft.EntityFrameworkCore;
using MoviesAPI.Data;
using MoviesAPI.Models;

namespace MoviesAPI.Repositories; // repository = design pattern that handles operations

public interface IUserRepository
{
    // define operations for the user inside the interface
    // operations are asynchrous, dont have to wait for operations to finish...
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> UsernameExistsAsync(string username);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(int id);
}

public class UserRepository : IUserRepository // using the methods from the interface
{
    private readonly ApplicationDbContext _context; // use an instance of a table "users", a connection to the database

    //constructor
    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    //async method with await = dont have to wait for the operation to finish, move on to the next task        
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    // Task <T> = a result that will come later...
    public async Task<User?> GetByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return await _context.Users
            .FirstOrDefaultAsync(u =>
                u.email == normalizedEmail
            );
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        var normalizedUsername = username.Trim();
        return await _context.Users
            .FirstOrDefaultAsync(u =>
                u.username == normalizedUsername
            );
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return await _context.Users
            .AnyAsync(u =>
                u.email == normalizedEmail
            );
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        var normalizedUsername = username.Trim();
        return await _context.Users
            .AnyAsync(u =>
            u.username == normalizedUsername
            );
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user); // add a new user to the database
        await _context.SaveChangesAsync(); // INSERT operation, save the changes <- actual SQL execution happens here
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        _context.Users.Update(user); // update the user data
        await _context.SaveChangesAsync(); // UPDATE operation <- actual SQL execution happens here
        return user;
    }

    public async Task DeleteAsync(int id)
    {
        var user = await GetByIdAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync(); // REMOVE operation <- actual SQL execution happens here
        }
    }
}