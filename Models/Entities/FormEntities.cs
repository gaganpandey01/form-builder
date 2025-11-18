using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FormBuilderApi.Models.Entities;

public class Form
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastModified { get; set; }
    
    // Navigation properties
    public virtual ICollection<FormField> Fields { get; set; } = new List<FormField>();
    public virtual ICollection<FormResponse> Responses { get; set; } = new List<FormResponse>();
    public virtual FormSettings Settings { get; set; } = null!;
}

public class FormField
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid FormId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // text, email, number, etc.
    
    [Required]
    [MaxLength(200)]
    public string Label { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Placeholder { get; set; }
    
    public bool Required { get; set; }
    
    public int Order { get; set; }
    
    // JSON stored validation rules
    [Column(TypeName = "jsonb")]
    public string? ValidationRules { get; set; }
    
    // JSON stored options for select/radio/checkbox
    [Column(TypeName = "jsonb")]
    public string? Options { get; set; }
    
    // JSON stored conditional logic
    [Column(TypeName = "jsonb")]
    public string? ConditionalLogic { get; set; }
    
    // JSON stored metadata
    [Column(TypeName = "jsonb")]
    public string? Metadata { get; set; }
    
    // Hierarchy support
    public Guid? ParentId { get; set; }
    public int Depth { get; set; } = 0;
    
    // Navigation properties
    [ForeignKey("FormId")]
    public virtual Form Form { get; set; } = null!;
    
    [ForeignKey("ParentId")]
    public virtual FormField? Parent { get; set; }
    
    public virtual ICollection<FormField> Children { get; set; } = new List<FormField>();
}

public class FormResponse
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid FormId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string UserIdentifier { get; set; } = string.Empty;
    
    // JSON stored responses
    [Column(TypeName = "jsonb")]
    public string ResponseData { get; set; } = "{}";
    
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    [ForeignKey("FormId")]
    public virtual Form Form { get; set; } = null!;
}

public class FormSettings
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid FormId { get; set; }
    
    public bool AllowMultipleResponses { get; set; } = true;
    
    [MaxLength(50)]
    public string CloseType { get; set; } = "manual"; // manual, datetime, custom
    
    public DateTime? CloseDateTime { get; set; }
    
    public int? CustomCloseTime { get; set; } // in hours
    
    public bool IsClosed { get; set; } = false;
    
    // Multi-step form properties
    public bool IsMultiStep { get; set; } = false;
    public int StepsPerPage { get; set; } = 5;
    public bool ShowProgressBar { get; set; } = true;
    
    // Additional settings
    [MaxLength(100)]
    public string? SubmitButtonText { get; set; }
    
    [MaxLength(500)]
    public string? SuccessMessage { get; set; }
    
    [MaxLength(20)]
    public string? Theme { get; set; } = "light"; // light, dark, auto
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastModified { get; set; }
    
    // Navigation properties
    [ForeignKey("FormId")]
    public virtual Form Form { get; set; } = null!;
}