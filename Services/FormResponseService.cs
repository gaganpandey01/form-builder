using AutoMapper;
using FormBuilderApi.Models.DTOs;
using FormBuilderApi.Models.Entities;
using FormBuilderApi.Repositories.Interfaces;
using FormBuilderApi.Services.Interfaces;
using System.Text.Json;

namespace FormBuilderApi.Services.Implementations;

public class FormResponseService : IFormResponseService
{
    private readonly IFormResponseRepository _responseRepository;
    private readonly IFormRepository _formRepository;
    private readonly IFormValidationService _validationService;
    private readonly IMapper _mapper;
    private readonly ILogger<FormResponseService> _logger;

    public FormResponseService(
        IFormResponseRepository responseRepository,
        IFormRepository formRepository,
        IFormValidationService validationService,
        IMapper mapper,
        ILogger<FormResponseService> logger)
    {
        _responseRepository = responseRepository;
        _formRepository = formRepository;
        _validationService = validationService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ApiResponse<PaginatedResponse<FormResponseDto>>> GetFormResponsesAsync(Guid formId, int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var responses = await _responseRepository.GetResponsesByFormIdAsync(formId, pageNumber, pageSize);
            var totalCount = await _responseRepository.CountResponsesByFormIdAsync(formId);
            
            var responseDtos = _mapper.Map<List<FormResponseDto>>(responses);
            
            var paginatedResponse = new PaginatedResponse<FormResponseDto>
            {
                Data = responseDtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return new ApiResponse<PaginatedResponse<FormResponseDto>>
            {
                Success = true,
                Message = "Responses retrieved successfully",
                Data = paginatedResponse
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving responses for form {FormId}", formId);
            return new ApiResponse<PaginatedResponse<FormResponseDto>>
            {
                Success = false,
                Message = "An error occurred while retrieving responses",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<FormResponseDto>> GetResponseByIdAsync(Guid id)
    {
        try
        {
            var response = await _responseRepository.GetByIdAsync(id);
            if (response == null)
            {
                return new ApiResponse<FormResponseDto>
                {
                    Success = false,
                    Message = "Response not found"
                };
            }

            var responseDto = _mapper.Map<FormResponseDto>(response);
            return new ApiResponse<FormResponseDto>
            {
                Success = true,
                Message = "Response retrieved successfully",
                Data = responseDto
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving response with id {ResponseId}", id);
            return new ApiResponse<FormResponseDto>
            {
                Success = false,
                Message = "An error occurred while retrieving the response",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<FormResponseDto>> SubmitResponseAsync(CreateFormResponseDto responseDto)
    {
        try
        {
            // Check if form exists
            var formExists = await _formRepository.ExistsAsync(responseDto.FormId);
            if (!formExists)
            {
                return new ApiResponse<FormResponseDto>
                {
                    Success = false,
                    Message = "Form not found"
                };
            }

            // Check if form is open
            var isFormOpen = await _validationService.IsFormOpenAsync(responseDto.FormId);
            if (!isFormOpen)
            {
                return new ApiResponse<FormResponseDto>
                {
                    Success = false,
                    Message = "Form is not accepting responses"
                };
            }

            // Check if user can submit
            var canUserSubmit = await _validationService.CanUserSubmitAsync(responseDto.FormId, responseDto.UserIdentifier);
            if (!canUserSubmit)
            {
                return new ApiResponse<FormResponseDto>
                {
                    Success = false,
                    Message = "Multiple responses not allowed for this form"
                };
            }

            // Validate response data
            var validationResult = await _validationService.ValidateResponseAsync(responseDto.FormId, responseDto.ResponseData);
            if (!validationResult.Success)
            {
                return new ApiResponse<FormResponseDto>
                {
                    Success = false,
                    Message = "Invalid response data",
                    Errors = validationResult.Errors
                };
            }

            var response = new FormResponse
            {
                Id = Guid.NewGuid(),
                FormId = responseDto.FormId,
                UserIdentifier = responseDto.UserIdentifier,
                ResponseData = JsonSerializer.Serialize(responseDto.ResponseData),
                SubmittedAt = DateTime.UtcNow
            };

            var createdResponse = await _responseRepository.AddAsync(response);
            var createdResponseDto = _mapper.Map<FormResponseDto>(createdResponse);

            return new ApiResponse<FormResponseDto>
            {
                Success = true,
                Message = "Response submitted successfully",
                Data = createdResponseDto
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting response for form {FormId}", responseDto.FormId);
            return new ApiResponse<FormResponseDto>
            {
                Success = false,
                Message = "An error occurred while submitting the response",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<bool>> DeleteResponseAsync(Guid id)
    {
        try
        {
            var exists = await _responseRepository.ExistsAsync(id);
            if (!exists)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Response not found"
                };
            }

            var deleted = await _responseRepository.DeleteAsync(id);
            
            return new ApiResponse<bool>
            {
                Success = deleted,
                Message = deleted ? "Response deleted successfully" : "Failed to delete response",
                Data = deleted
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting response with id {ResponseId}", id);
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "An error occurred while deleting the response",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<PaginatedResponse<FormResponseDto>>> GetUserResponsesAsync(string userIdentifier)
    {
        try
        {
            var responses = await _responseRepository.GetResponsesByUserAsync(userIdentifier);
            var responseDtos = _mapper.Map<List<FormResponseDto>>(responses);
            
            var paginatedResponse = new PaginatedResponse<FormResponseDto>
            {
                Data = responseDtos,
                TotalCount = responseDtos.Count,
                PageNumber = 1,
                PageSize = responseDtos.Count
            };

            return new ApiResponse<PaginatedResponse<FormResponseDto>>
            {
                Success = true,
                Message = "User responses retrieved successfully",
                Data = paginatedResponse
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving responses for user {UserIdentifier}", userIdentifier);
            return new ApiResponse<PaginatedResponse<FormResponseDto>>
            {
                Success = false,
                Message = "An error occurred while retrieving user responses",
                Errors = [ex.Message]
            };
        }
    }
}

public class FormValidationService : IFormValidationService
{
    private readonly IFormRepository _formRepository;
    private readonly IFormResponseRepository _responseRepository;
    private readonly IFormFieldRepository _fieldRepository;
    private readonly ILogger<FormValidationService> _logger;

    public FormValidationService(
        IFormRepository formRepository,
        IFormResponseRepository responseRepository,
        IFormFieldRepository fieldRepository,
        ILogger<FormValidationService> logger)
    {
        _formRepository = formRepository;
        _responseRepository = responseRepository;
        _fieldRepository = fieldRepository;
        _logger = logger;
    }

    public async Task<ApiResponse<bool>> ValidateFormAsync(Guid formId)
    {
        try
        {
            var form = await _formRepository.GetFormWithFieldsAsync(formId);
            if (form == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Form not found"
                };
            }

            var errors = new List<string>();

            // Check if form has at least one field
            if (!form.Fields.Any())
            {
                errors.Add("Form must have at least one field");
            }

            // Validate field configuration
            foreach (var field in form.Fields)
            {
                if (string.IsNullOrEmpty(field.Label))
                {
                    errors.Add($"Field at position {field.Order} must have a label");
                }

                if (field.Type == "select" || field.Type == "radio" || field.Type == "checkbox")
                {
                    if (string.IsNullOrEmpty(field.Options))
                    {
                        errors.Add($"Field '{field.Label}' of type '{field.Type}' must have options");
                    }
                }
            }

            return new ApiResponse<bool>
            {
                Success = !errors.Any(),
                Message = errors.Any() ? "Form validation failed" : "Form is valid",
                Data = !errors.Any(),
                Errors = errors
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating form {FormId}", formId);
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "An error occurred while validating the form",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<ApiResponse<bool>> ValidateResponseAsync(Guid formId, object responseData)
    {
        try
        {
            var form = await _formRepository.GetFormWithFieldsAsync(formId);
            if (form == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Form not found"
                };
            }

            var errors = new List<string>();
            var responseDict = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(responseData));

            if (responseDict == null)
            {
                errors.Add("Invalid response data format");
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Response validation failed",
                    Errors = errors
                };
            }

            // Validate required fields
            foreach (var field in form.Fields.Where(f => f.Required))
            {
                if (!responseDict.ContainsKey(field.Id.ToString()) || 
                    responseDict[field.Id.ToString()] == null ||
                    string.IsNullOrEmpty(responseDict[field.Id.ToString()].ToString()))
                {
                    errors.Add($"Field '{field.Label}' is required");
                }
            }

            // Validate field types and formats
            foreach (var field in form.Fields)
            {
                var fieldId = field.Id.ToString();
                if (!responseDict.ContainsKey(fieldId) || responseDict[fieldId] == null)
                    continue;

                var value = responseDict[fieldId].ToString();
                if (string.IsNullOrEmpty(value))
                    continue;

                switch (field.Type.ToLower())
                {
                    case "email":
                        if (!IsValidEmail(value))
                            errors.Add($"Field '{field.Label}' must be a valid email address");
                        break;
                    case "number":
                        if (!double.TryParse(value, out _))
                            errors.Add($"Field '{field.Label}' must be a valid number");
                        break;
                    case "date":
                        if (!DateTime.TryParse(value, out _))
                            errors.Add($"Field '{field.Label}' must be a valid date");
                        break;
                    case "url":
                        if (!Uri.TryCreate(value, UriKind.Absolute, out _))
                            errors.Add($"Field '{field.Label}' must be a valid URL");
                        break;
                }

                // Validate field-specific rules
                if (!string.IsNullOrEmpty(field.ValidationRules))
                {
                    try
                    {
                        var validationRules = JsonSerializer.Deserialize<Dictionary<string, object>>(field.ValidationRules);
                        ValidateFieldRules(field.Label, value, validationRules, errors);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse validation rules for field {FieldId}", field.Id);
                    }
                }
            }

            return new ApiResponse<bool>
            {
                Success = !errors.Any(),
                Message = errors.Any() ? "Response validation failed" : "Response is valid",
                Data = !errors.Any(),
                Errors = errors
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating response for form {FormId}", formId);
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "An error occurred while validating the response",
                Errors = [ex.Message]
            };
        }
    }

    public async Task<bool> CanUserSubmitAsync(Guid formId, string userIdentifier)
    {
        try
        {
            var form = await _formRepository.GetFormWithSettingsAsync(formId);
            if (form == null || form.Settings == null)
                return false;

            if (form.Settings.AllowMultipleResponses)
                return true;

            var hasExistingResponse = await _responseRepository.HasUserResponseAsync(formId, userIdentifier);
            return !hasExistingResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserIdentifier} can submit to form {FormId}", userIdentifier, formId);
            return false;
        }
    }

    public async Task<bool> IsFormOpenAsync(Guid formId)
    {
        try
        {
            var form = await _formRepository.GetFormWithSettingsAsync(formId);
            if (form == null || form.Settings == null)
                return false;

            if (form.Settings.IsClosed)
                return false;

            switch (form.Settings.CloseType.ToLower())
            {
                case "datetime":
                    if (form.Settings.CloseDateTime.HasValue)
                        return DateTime.UtcNow <= form.Settings.CloseDateTime.Value;
                    break;
                case "custom":
                    if (form.Settings.CustomCloseTime.HasValue)
                    {
                        var closeTime = form.Settings.CreatedAt.AddHours(form.Settings.CustomCloseTime.Value);
                        return DateTime.UtcNow <= closeTime;
                    }
                    break;
                case "manual":
                default:
                    return true;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if form {FormId} is open", formId);
            return false;
        }
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private static void ValidateFieldRules(string fieldLabel, string value, Dictionary<string, object>? validationRules, List<string> errors)
    {
        if (validationRules == null)
            return;

        if (validationRules.TryGetValue("minLength", out var minLengthObj) && 
            int.TryParse(minLengthObj.ToString(), out var minLength) &&
            value.Length < minLength)
        {
            errors.Add($"Field '{fieldLabel}' must be at least {minLength} characters long");
        }

        if (validationRules.TryGetValue("maxLength", out var maxLengthObj) && 
            int.TryParse(maxLengthObj.ToString(), out var maxLength) &&
            value.Length > maxLength)
        {
            errors.Add($"Field '{fieldLabel}' must not exceed {maxLength} characters");
        }

        if (validationRules.TryGetValue("pattern", out var patternObj) && 
            !string.IsNullOrEmpty(patternObj.ToString()))
        {
            try
            {
                var regex = new System.Text.RegularExpressions.Regex(patternObj.ToString()!);
                if (!regex.IsMatch(value))
                {
                    var customMessage = validationRules.TryGetValue("customMessage", out var msgObj) && 
                                        !string.IsNullOrEmpty(msgObj.ToString())
                        ? msgObj.ToString()
                        : $"Field '{fieldLabel}' format is invalid";
                    
                    errors.Add(customMessage!);
                }
            }
            catch
            {
                // Invalid regex pattern, skip validation
            }
        }
    }
}