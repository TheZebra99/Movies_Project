using Microsoft.EntityFrameworkCore;
using MoviesAPI.Data;
using MoviesAPI.Models;

namespace MoviesAPI.Repositories;

public interface IPersonRepository
{
    Task<IEnumerable<Person>> GetAllAsync();
    Task<Person?> GetByIdAsync(int id);
    Task<Person> CreateAsync(Person person);
    Task<Person> UpdateAsync(Person person);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> PersonExistsAsync(string name);
    Task<IEnumerable<MoviePerson>> GetPersonMoviesAsync(int personId);
}

public class PersonRepository : IPersonRepository
{
    private readonly ApplicationDbContext _context;

    public PersonRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Person>> GetAllAsync()
    {
        return await _context.People
            .OrderBy(p => p.name)
            .ToListAsync();
    }

    public async Task<Person?> GetByIdAsync(int id)
    {
        return await _context.People.FindAsync(id);
    }

    public async Task<Person> CreateAsync(Person person)
    {
        _context.People.Add(person);
        await _context.SaveChangesAsync();
        return person;
    }

    public async Task<Person> UpdateAsync(Person person)
    {
        _context.People.Update(person);
        await _context.SaveChangesAsync();
        return person;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var person = await GetByIdAsync(id);
        if (person == null)
            return false;

        _context.People.Remove(person);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.People.AnyAsync(p => p.id == id);
    }

    public async Task<bool> PersonExistsAsync(string name)
    {
        var normalizedName = name.Trim().ToLower();
        return await _context.People.AnyAsync(p => p.name.ToLower() == normalizedName);
    }

    public async Task<IEnumerable<MoviePerson>> GetPersonMoviesAsync(int personId)
    {
        return await _context.MoviePeople
            .Include(mp => mp.Movie)
            .Where(mp => mp.person_id == personId)
            .OrderBy(mp => mp.billing_order ?? int.MaxValue)
            .ToListAsync();
    }
}