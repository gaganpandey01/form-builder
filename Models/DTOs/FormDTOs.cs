using System.ComponentModel.DataAnnotations;

namespace FormBuilderApi.Models.DTOs;

public class FormDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModified { get; set; }
    public List<FormFieldDto> Fields { get; set; } = new();
    public FormSettingsDto Settings { get; set; } = new();
}

public class CreateFormDto
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string Description { get; set; } = string.Empty;
    
    public List<CreateFormFieldDto> Fields { get; set; } = new();
    public CreateFormSettingsDto Settings { get; set; } = new();
}

public class UpdateFormDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public List<UpdateFormFieldDto>? Fields { get; set; }
    public UpdateFormSettingsDto? Settings { get; set; }
}

public class FormFieldDto
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Placeholder { get; set; }
    public bool Required { get; set; }
    public int Order { get; set; }
    public object? ValidationRules { get; set; }
    public object? Options { get; set; }
    public object? ConditionalLogic { get; set; }
    public object? Metadata { get; set; }
    public Guid? ParentId { get; set; }
    public int Depth { get; set; }
    public List<FormFieldDto> Children { get; set; } = new();
}

public class CreateFormFieldDto
{
    public string? Id { get; set; }  // ✅ Changed from Guid? to string?
    
    [Required(ErrorMessage = "Field type is required")]
    public string Type { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Field label is required")]
    [StringLength(200, ErrorMessage = "Label cannot exceed 200 characters")]
    public string Label { get; set; } = string.Empty;
    
    [StringLength(500, ErrorMessage = "Placeholder cannot exceed 500 characters")]
    public string? Placeholder { get; set; }
    
    public bool Required { get; set; }
    
    [Range(0, int.MaxValue, ErrorMessage = "Order must be a non-negative number")]
    public int Order { get; set; }
    
    public object? ValidationRules { get; set; }
    public List<string>? Options { get; set; }
    public ConditionalLogicDto? ConditionalLogic { get; set; }
    public string? ParentId { get; set; }  // ✅ Changed from Guid? to string?
    
    [Range(0, 10, ErrorMessage = "Depth must be between 0 and 10")]
    public int Depth { get; set; }
    
    public object? Metadata { get; set; }
}


public class UpdateFormFieldDto
{
    public string? Id { get; set; }  // ✅ Changed from Guid? to string?
    public string? Type { get; set; }
    public string? Label { get; set; }
    public string? Placeholder { get; set; }
    public bool? Required { get; set; }
    public int? Order { get; set; }
    public object? ValidationRules { get; set; }
    public object? Options { get; set; }
    public ConditionalLogicDto? ConditionalLogic { get; set; }
    public object? Metadata { get; set; }
    public string? ParentId { get; set; }  // ✅ Changed from Guid? to string?
    public int? Depth { get; set; }
}


public class FormSettingsDto
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public bool AllowMultipleResponses { get; set; }
    public string CloseType { get; set; } = "manual";
    public DateTime? CloseDateTime { get; set; }
    public int? CustomCloseTime { get; set; }
    public bool IsClosed { get; set; }
    public bool IsMultiStep { get; set; }
    public int StepsPerPage { get; set; }
    public bool ShowProgressBar { get; set; }
    public string? SubmitButtonText { get; set; }
    public string? SuccessMessage { get; set; }
    public string? Theme { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModified { get; set; }
}

public class CreateFormSettingsDto
{
    public bool AllowMultipleResponses { get; set; } = true;
    public string CloseType { get; set; } = "manual";
    public DateTime? CloseDateTime { get; set; }
    public int? CustomCloseTime { get; set; }
    public bool IsClosed { get; set; } = false;
    public bool IsMultiStep { get; set; } = false;
    public int StepsPerPage { get; set; } = 5;
    public bool ShowProgressBar { get; set; } = true;
    public string? SubmitButtonText { get; set; }
    public string? SuccessMessage { get; set; }
    public string? Theme { get; set; } = "light";
}

public class UpdateFormSettingsDto
{
    public bool? AllowMultipleResponses { get; set; }
    public string? CloseType { get; set; }
    public DateTime? CloseDateTime { get; set; }
    public int? CustomCloseTime { get; set; }
    public bool? IsClosed { get; set; }
    public bool? IsMultiStep { get; set; }
    public int? StepsPerPage { get; set; }
    public bool? ShowProgressBar { get; set; }
    public string? SubmitButtonText { get; set; }
    public string? SuccessMessage { get; set; }
    public string? Theme { get; set; }
}

public class FormResponseDto
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public string UserIdentifier { get; set; } = string.Empty;
    public object ResponseData { get; set; } = new();
    public DateTime SubmittedAt { get; set; }
}

public class CreateFormResponseDto
{
    public Guid FormId { get; set; }
    public string UserIdentifier { get; set; } = string.Empty;
    public object ResponseData { get; set; } = new();
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string> Errors { get; set; } = new();
}

public class PaginatedResponse<T>
{
    public List<T> Data { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => PageNumber < TotalPages;
    public bool HasPreviousPage => PageNumber > 1;
}
