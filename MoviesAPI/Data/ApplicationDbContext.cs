using Microsoft.EntityFrameworkCore;
using MoviesAPI.Models;

namespace MoviesAPI.Data;

public class ApplicationDbContext : DbContext // inherit DbContext from EntityFramework Core...
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) // base constructor taken from DbContext - with the connection string...
    {
    }

    public DbSet<User> Users { get; set; } = null!; // Users table in the DB
    public DbSet<Movie> Movies { get; set; } = null!; // New Movies table in the DB
    public DbSet<Watchlist> Watchlists { get; set; } = null!; // New Watchlists table in the DB
    protected override void OnModelCreating(ModelBuilder modelBuilder) //override the method from DbContext
    {
        base.OnModelCreating(modelBuilder);

        // build the users table
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            entity.HasKey(e => e.id);

            entity.Property(e => e.id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd(); // auto increment index...

            entity.Property(e => e.email)
                .HasColumnName("email")
                .HasMaxLength(254)
                .IsRequired();

            entity.HasIndex(e => e.email)
                .IsUnique()
                .HasDatabaseName("index_users_email");

            entity.Property(e => e.username)
                .HasColumnName("username")
                .HasMaxLength(30)
                .IsRequired();

            entity.HasIndex(e => e.username)
                .IsUnique()
                .HasDatabaseName("index_users_username");

            entity.Property(e => e.display_name)
                .HasColumnName("display_name")
                .HasMaxLength(60);

            entity.Property(e => e.password_hash)
                .HasColumnName("password_hash")
                .IsRequired();

            entity.Property(e => e.creation_date)
                .HasColumnName("creation_date")
                .HasDefaultValueSql("NOW()");

            entity.Property(e => e.role) // new property
                .HasColumnName("role")
                .HasMaxLength(20)
                .HasDefaultValue("User")
                .IsRequired();
        }
        );

        // configure the table for Movies
        modelBuilder.Entity<Movie>(entity =>
        {
            entity.ToTable("movies");

            entity.HasKey(e => e.id);
            entity.Property(e => e.id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd(); // auto increment index...

            entity.Property(e => e.title)
                .HasColumnName("title")
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.description)
                .HasColumnName("description")
                .HasMaxLength(2000);

            entity.Property(e => e.release_date)
                .HasColumnName("release_date")
                .IsRequired();

            entity.Property(e => e.director)
                .HasColumnName("director")
                .HasMaxLength(100);

            entity.Property(e => e.genre)
                .HasColumnName("genre")
                .HasMaxLength(50);

            entity.Property(e => e.runtime_minutes)
                .HasColumnName("runtime_minutes");

            entity.Property(e => e.poster_url)
                .HasColumnName("poster_url")
                .HasMaxLength(500);

            entity.Property(e => e.created_at)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()");

            entity.HasIndex(e => e.title)
                .HasDatabaseName("index_movies_title");
        });
        
        // configure the table for watchlists
        //Cascade Deletion:
        // If a user is deleted -> their watchlist entries are automatically removed
        // If a movie is deleted -> its automatically removed from everyones watchlist
        modelBuilder.Entity<Watchlist>(entity =>
        {
            entity.ToTable("watchlists");
            
            // Composite primary key (user_id + movie_id together) = no repeating movies in the watchlist!
            entity.HasKey(e => new { e.user_id, e.movie_id });
            
            entity.Property(e => e.added_at)
                .HasColumnName("added_at")
                .HasDefaultValueSql("NOW()");
            
            // Foreign key to User
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.user_id)
                .OnDelete(DeleteBehavior.Cascade); // if user deleted, remove their watchlist entries
                
            // Foreign key to Movie
            entity.HasOne(e => e.Movie)
                .WithMany()
                .HasForeignKey(e => e.movie_id)
                .OnDelete(DeleteBehavior.Cascade); // if movie deleted, remove from all watchlists
        });
    }
}