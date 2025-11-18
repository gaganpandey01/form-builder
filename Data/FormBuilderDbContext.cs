using Microsoft.EntityFrameworkCore;
using FormBuilderApi.Models.Entities;

namespace FormBuilderApi.Data;

public class FormBuilderDbContext : DbContext
{
    public FormBuilderDbContext(DbContextOptions<FormBuilderDbContext> options) : base(options)
    {
    }

    public DbSet<Form> Forms { get; set; }
    public DbSet<FormField> FormFields { get; set; }
    public DbSet<FormResponse> FormResponses { get; set; }
    public DbSet<FormSettings> FormSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Form configuration
        modelBuilder.Entity<Form>(entity =>
        {
            entity.ToTable("Forms");
            entity.HasIndex(e => e.Title);
            entity.HasIndex(e => e.CreatedAt);
            
            // One-to-many relationship with FormFields
            entity.HasMany(f => f.Fields)
                  .WithOne(ff => ff.Form)
                  .HasForeignKey(ff => ff.FormId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            // One-to-many relationship with FormResponses
            entity.HasMany(f => f.Responses)
                  .WithOne(fr => fr.Form)
                  .HasForeignKey(fr => fr.FormId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            // One-to-one relationship with FormSettings
            entity.HasOne(f => f.Settings)
                  .WithOne(fs => fs.Form)
                  .HasForeignKey<FormSettings>(fs => fs.FormId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // FormField configuration
        modelBuilder.Entity<FormField>(entity =>
        {
            entity.ToTable("FormFields");
            entity.HasIndex(e => new { e.FormId, e.Order });
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.ParentId);
            
            // Self-referencing relationship for hierarchy
            entity.HasOne(ff => ff.Parent)
                  .WithMany(ff => ff.Children)
                  .HasForeignKey(ff => ff.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // FormResponse configuration
        modelBuilder.Entity<FormResponse>(entity =>
        {
            entity.ToTable("FormResponses");
            entity.HasIndex(e => e.FormId);
            entity.HasIndex(e => e.SubmittedAt);
            entity.HasIndex(e => e.UserIdentifier);
        });

        // FormSettings configuration
        modelBuilder.Entity<FormSettings>(entity =>
        {
            entity.ToTable("FormSettings");
            entity.HasIndex(e => e.FormId).IsUnique();
        });

        // Configure PostgreSQL specific features
        modelBuilder.HasPostgresExtension("uuid-ossp");
        
        // Configure JSONB columns for PostgreSQL
        modelBuilder.Entity<FormField>()
            .Property(e => e.ValidationRules)
            .HasColumnType("jsonb");
            
        modelBuilder.Entity<FormField>()
            .Property(e => e.Options)
            .HasColumnType("jsonb");
            
        modelBuilder.Entity<FormField>()
            .Property(e => e.ConditionalLogic)
            .HasColumnType("jsonb");
            
        modelBuilder.Entity<FormField>()
            .Property(e => e.Metadata)
            .HasColumnType("jsonb");
            
        modelBuilder.Entity<FormResponse>()
            .Property(e => e.ResponseData)
            .HasColumnType("jsonb");
    }
}