using AutoMapper;
using FormBuilderApi.Models.DTOs;
using FormBuilderApi.Models.Entities;
using FormBuilderApi.Repositories.Interfaces;
using FormBuilderApi.Services.Interfaces;
using System.Text.Json;

namespace FormBuilderApi.Services.Implementations;

public class FormService : IFormService
{
    private readonly IFormRepository _formRepository;
    private readonly IFormFieldRepository _fieldRepository;
    private readonly IFormSettingsRepository _settingsRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<FormService> _logger;
    private readonly IConditionalLogicValidator _conditionalLogicValidator;  // ✅ Added

    public FormService(
        IFormRepository formRepository,
        IFormFieldRepository fieldRepository,
        IFormSettingsRepository settingsRepository,
        IMapper mapper,
        ILogger<FormService> logger,
        IConditionalLogicValidator conditionalLogicValidator)  // ✅ Added
    {
        _formRepository = formRepository;
        _fieldRepository = fieldRepository;
        _settingsRepository = settingsRepository;
        _mapper = mapper;
        _logger = logger;
        _conditionalLogicValidator = conditionalLogicValidator;  // ✅ Added
    }

    public async Task<ApiResponse<PaginatedResponse<FormDto>>> GetAllFormsAsync(int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var forms = await _formRepository.GetFormsWithSettingsAsync(pageNumber, pageSize);
            var totalCount = await _formRepository.CountAsync();
            
            var formDtos = _mapper.Map<List<FormDto>>(forms);
            
            var paginatedResponse = new PaginatedResponse<FormDto>
            {
                Data = formDtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return new ApiResponse<PaginatedResponse<FormDto>>
            {
                Success = true,
                Message = "Forms retrieved successfully",
                Data = paginatedResponse
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving forms");
            return new ApiResponse<PaginatedResponse<FormDto>>
            {
                Success = false,
                Message = "An error occurred while retrieving forms",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<FormDto>> GetFormByIdAsync(Guid id)
    {
        try
        {
            var form = await _formRepository.GetFullFormAsync(id);
            if (form == null)
            {
                return new ApiResponse<FormDto>
                {
                    Success = false,
                    Message = "Form not found"
                };
            }

            var formDto = _mapper.Map<FormDto>(form);
            return new ApiResponse<FormDto>
            {
                Success = true,
                Message = "Form retrieved successfully",
                Data = formDto
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving form with id {FormId}", id);
            return new ApiResponse<FormDto>
            {
                Success = false,
                Message = "An error occurred while retrieving the form",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<FormDto>> CreateFormAsync(CreateFormDto createFormDto)
    {
        try
        {
            // ✅ ADDED: Validate conditional logic before creating anything
            var validationErrors = _conditionalLogicValidator.ValidateConditionalLogic(createFormDto.Fields);
            if (validationErrors.Any())
            {
                _logger.LogWarning("Conditional logic validation failed: {Errors}", 
                    string.Join(", ", validationErrors));
                
                return new ApiResponse<FormDto>
                {
                    Success = false,
                    Message = "Conditional logic validation failed",
                    Errors = validationErrors
                };
            }
            // ✅ END ADDITION

            var form = new Form
            {
                Id = Guid.NewGuid(),
                Title = createFormDto.Title,
                Description = createFormDto.Description,
                CreatedAt = DateTime.UtcNow
            };

            var createdForm = await _formRepository.AddAsync(form);

            // Create settings
            var settings = new FormSettings
            {
                Id = Guid.NewGuid(),
                FormId = createdForm.Id,
                AllowMultipleResponses = createFormDto.Settings.AllowMultipleResponses,
                CloseType = createFormDto.Settings.CloseType,
                CloseDateTime = createFormDto.Settings.CloseDateTime,
                CustomCloseTime = createFormDto.Settings.CustomCloseTime,
                IsClosed = createFormDto.Settings.IsClosed,
                IsMultiStep = createFormDto.Settings.IsMultiStep,
                StepsPerPage = createFormDto.Settings.StepsPerPage,
                ShowProgressBar = createFormDto.Settings.ShowProgressBar,
                SubmitButtonText = createFormDto.Settings.SubmitButtonText,
                SuccessMessage = createFormDto.Settings.SuccessMessage,
                Theme = createFormDto.Settings.Theme,
                CreatedAt = DateTime.UtcNow
            };

            await _settingsRepository.AddAsync(settings);

            // Create fields
            foreach (var fieldDto in createFormDto.Fields)
            {
                var field = new FormField
                {
                    Id = Guid.NewGuid(),
                    FormId = createdForm.Id,
                    Type = fieldDto.Type,
                    Label = fieldDto.Label,
                    Placeholder = fieldDto.Placeholder,
                    Required = fieldDto.Required,
                    Order = fieldDto.Order,
                    ValidationRules = fieldDto.ValidationRules != null ? JsonSerializer.Serialize(fieldDto.ValidationRules) : null,
                    Options = fieldDto.Options != null ? JsonSerializer.Serialize(fieldDto.Options) : null,
                    ConditionalLogic = fieldDto.ConditionalLogic != null ? JsonSerializer.Serialize(fieldDto.ConditionalLogic) : null,
                    Metadata = fieldDto.Metadata != null ? JsonSerializer.Serialize(fieldDto.Metadata) : null,
                    ParentId = !string.IsNullOrWhiteSpace(fieldDto.ParentId) && Guid.TryParse(fieldDto.ParentId, out var parentGuid) ? parentGuid : null,
                    Depth = fieldDto.Depth
                };

                await _fieldRepository.AddAsync(field);
            }

            // Retrieve the complete form
            var fullForm = await _formRepository.GetFullFormAsync(createdForm.Id);
            var formDto = _mapper.Map<FormDto>(fullForm);

            return new ApiResponse<FormDto>
            {
                Success = true,
                Message = "Form created successfully",
                Data = formDto
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating form");
            return new ApiResponse<FormDto>
            {
                Success = false,
                Message = "An error occurred while creating the form",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<FormDto>> UpdateFormAsync(Guid id, UpdateFormDto updateFormDto)
    {
        try
        {
            var form = await _formRepository.GetFullFormAsync(id);
            if (form == null)
            {
                return new ApiResponse<FormDto>
                {
                    Success = false,
                    Message = "Form not found"
                };
            }

            // ✅ ADDED: Validate conditional logic if fields are being updated
            if (updateFormDto.Fields != null && updateFormDto.Fields.Any())
            {
                var validationErrors = _conditionalLogicValidator.ValidateConditionalLogic(updateFormDto.Fields);
                if (validationErrors.Any())
                {
                    _logger.LogWarning("Conditional logic validation failed for form {FormId}: {Errors}", 
                        id, string.Join(", ", validationErrors));
                    
                    return new ApiResponse<FormDto>
                    {
                        Success = false,
                        Message = "Conditional logic validation failed",
                        Errors = validationErrors
                    };
                }
            }
            // ✅ END ADDITION

            // Update form properties
            if (updateFormDto.Title != null)
                form.Title = updateFormDto.Title;
            
            if (updateFormDto.Description != null)
                form.Description = updateFormDto.Description;
            
            form.LastModified = DateTime.UtcNow;

            await _formRepository.UpdateAsync(form);

            // Update settings if provided
            if (updateFormDto.Settings != null)
            {
                var settings = form.Settings;
                if (updateFormDto.Settings.AllowMultipleResponses.HasValue)
                    settings.AllowMultipleResponses = updateFormDto.Settings.AllowMultipleResponses.Value;
                
                if (updateFormDto.Settings.CloseType != null)
                    settings.CloseType = updateFormDto.Settings.CloseType;
                
                if (updateFormDto.Settings.CloseDateTime.HasValue)
                    settings.CloseDateTime = updateFormDto.Settings.CloseDateTime;
                
                if (updateFormDto.Settings.CustomCloseTime.HasValue)
                    settings.CustomCloseTime = updateFormDto.Settings.CustomCloseTime;
                
                if (updateFormDto.Settings.IsClosed.HasValue)
                    settings.IsClosed = updateFormDto.Settings.IsClosed.Value;
                
                if (updateFormDto.Settings.IsMultiStep.HasValue)
                    settings.IsMultiStep = updateFormDto.Settings.IsMultiStep.Value;
                
                if (updateFormDto.Settings.StepsPerPage.HasValue)
                    settings.StepsPerPage = updateFormDto.Settings.StepsPerPage.Value;
                
                if (updateFormDto.Settings.ShowProgressBar.HasValue)
                    settings.ShowProgressBar = updateFormDto.Settings.ShowProgressBar.Value;
                
                if (updateFormDto.Settings.SubmitButtonText != null)
                    settings.SubmitButtonText = updateFormDto.Settings.SubmitButtonText;
                
                if (updateFormDto.Settings.SuccessMessage != null)
                    settings.SuccessMessage = updateFormDto.Settings.SuccessMessage;
                
                if (updateFormDto.Settings.Theme != null)
                    settings.Theme = updateFormDto.Settings.Theme;

                settings.LastModified = DateTime.UtcNow;
                await _settingsRepository.UpdateAsync(settings);
            }

            // Update fields if provided (simplified - full implementation would handle field updates, additions, deletions)
            if (updateFormDto.Fields != null)
            {
                // For simplicity, we'll delete all existing fields and recreate them
                await _fieldRepository.DeleteFieldsByFormIdAsync(id);
                
                foreach (var fieldDto in updateFormDto.Fields)
                {
                    var field = new FormField
                    {
                        Id = !string.IsNullOrWhiteSpace(fieldDto.Id) && Guid.TryParse(fieldDto.Id, out var fieldGuid) ? fieldGuid : Guid.NewGuid(),
                        FormId = id,
                        Type = fieldDto.Type ?? "text",
                        Label = fieldDto.Label ?? "",
                        Placeholder = fieldDto.Placeholder,
                        Required = fieldDto.Required ?? false,
                        Order = fieldDto.Order ?? 0,
                        ValidationRules = fieldDto.ValidationRules != null ? JsonSerializer.Serialize(fieldDto.ValidationRules) : null,
                        Options = fieldDto.Options != null ? JsonSerializer.Serialize(fieldDto.Options) : null,
                        ConditionalLogic = fieldDto.ConditionalLogic != null ? JsonSerializer.Serialize(fieldDto.ConditionalLogic) : null,
                        Metadata = fieldDto.Metadata != null ? JsonSerializer.Serialize(fieldDto.Metadata) : null,
                        ParentId = !string.IsNullOrWhiteSpace(fieldDto.ParentId) && Guid.TryParse(fieldDto.ParentId, out var parentGuid) ? parentGuid : null,
                        Depth = fieldDto.Depth ?? 0
                    };

                    await _fieldRepository.AddAsync(field);
                }
            }

            // Retrieve the updated form
            var updatedForm = await _formRepository.GetFullFormAsync(id);
            var formDto = _mapper.Map<FormDto>(updatedForm);

            return new ApiResponse<FormDto>
            {
                Success = true,
                Message = "Form updated successfully",
                Data = formDto
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating form with id {FormId}", id);
            return new ApiResponse<FormDto>
            {
                Success = false,
                Message = "An error occurred while updating the form",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<bool>> DeleteFormAsync(Guid id)
    {
        try
        {
            var exists = await _formRepository.ExistsAsync(id);
            if (!exists)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Form not found"
                };
            }

            var deleted = await _formRepository.DeleteAsync(id);
            
            return new ApiResponse<bool>
            {
                Success = deleted,
                Message = deleted ? "Form deleted successfully" : "Failed to delete form",
                Data = deleted
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting form with id {FormId}", id);
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "An error occurred while deleting the form",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<PaginatedResponse<FormDto>>> SearchFormsAsync(string searchTerm, int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var forms = await _formRepository.SearchFormsAsync(searchTerm, pageNumber, pageSize);
            
            // Count total matching forms
            var totalCount = string.IsNullOrEmpty(searchTerm) 
                ? await _formRepository.CountAsync()
                : await _formRepository.CountAsync(f => f.Title.Contains(searchTerm) || f.Description.Contains(searchTerm));
            
            var formDtos = _mapper.Map<List<FormDto>>(forms);
            
            var paginatedResponse = new PaginatedResponse<FormDto>
            {
                Data = formDtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return new ApiResponse<PaginatedResponse<FormDto>>
            {
                Success = true,
                Message = "Search completed successfully",
                Data = paginatedResponse
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching forms with term {SearchTerm}", searchTerm);
            return new ApiResponse<PaginatedResponse<FormDto>>
            {
                Success = false,
                Message = "An error occurred while searching forms",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<bool>> DuplicateFormAsync(Guid id)
    {
        try
        {
            var originalForm = await _formRepository.GetFullFormAsync(id);
            if (originalForm == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Form not found"
                };
            }

            var newForm = new Form
            {
                Id = Guid.NewGuid(),
                Title = $"{originalForm.Title} (Copy)",
                Description = originalForm.Description,
                CreatedAt = DateTime.UtcNow
            };

            var createdForm = await _formRepository.AddAsync(newForm);

            // Duplicate settings
            var newSettings = new FormSettings
            {
                Id = Guid.NewGuid(),
                FormId = createdForm.Id,
                AllowMultipleResponses = originalForm.Settings.AllowMultipleResponses,
                CloseType = originalForm.Settings.CloseType,
                CloseDateTime = originalForm.Settings.CloseDateTime,
                CustomCloseTime = originalForm.Settings.CustomCloseTime,
                IsClosed = false, // New form should be open
                IsMultiStep = originalForm.Settings.IsMultiStep,
                StepsPerPage = originalForm.Settings.StepsPerPage,
                ShowProgressBar = originalForm.Settings.ShowProgressBar,
                SubmitButtonText = originalForm.Settings.SubmitButtonText,
                SuccessMessage = originalForm.Settings.SuccessMessage,
                Theme = originalForm.Settings.Theme,
                CreatedAt = DateTime.UtcNow
            };

            await _settingsRepository.AddAsync(newSettings);

            // Duplicate fields
            foreach (var field in originalForm.Fields)
            {
                var newField = new FormField
                {
                    Id = Guid.NewGuid(),
                    FormId = createdForm.Id,
                    Type = field.Type,
                    Label = field.Label,
                    Placeholder = field.Placeholder,
                    Required = field.Required,
                    Order = field.Order,
                    ValidationRules = field.ValidationRules,
                    Options = field.Options,
                    ConditionalLogic = field.ConditionalLogic,
                    Metadata = field.Metadata,
                    ParentId = field.ParentId,
                    Depth = field.Depth
                };

                await _fieldRepository.AddAsync(newField);
            }

            return new ApiResponse<bool>
            {
                Success = true,
                Message = "Form duplicated successfully",
                Data = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating form with id {FormId}", id);
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "An error occurred while duplicating the form",
                Errors = [ex.Message]
            };
        }
    }
}
