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
    
    protected override void OnModelCreating(ModelBuilder modelBuilder) //override the method from DbContext
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>(entity =>
        {
            // build the users table
            entity.ToTable("users");
            
            entity.HasKey(e => e.id);

            entity.Property(e => e.id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

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
        }
        );
    }
}