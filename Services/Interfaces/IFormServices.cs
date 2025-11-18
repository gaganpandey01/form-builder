using FormBuilderApi.Models.DTOs;

namespace FormBuilderApi.Services.Interfaces;

public interface IFormService
{
    Task<ApiResponse<PaginatedResponse<FormDto>>> GetAllFormsAsync(int pageNumber = 1, int pageSize = 10);
    Task<ApiResponse<FormDto>> GetFormByIdAsync(Guid id);
    Task<ApiResponse<FormDto>> CreateFormAsync(CreateFormDto createFormDto);
    Task<ApiResponse<FormDto>> UpdateFormAsync(Guid id, UpdateFormDto updateFormDto);
    Task<ApiResponse<bool>> DeleteFormAsync(Guid id);
    Task<ApiResponse<PaginatedResponse<FormDto>>> SearchFormsAsync(string searchTerm, int pageNumber = 1, int pageSize = 10);
    Task<ApiResponse<bool>> DuplicateFormAsync(Guid id);
}

public interface IFormResponseService
{
    Task<ApiResponse<PaginatedResponse<FormResponseDto>>> GetFormResponsesAsync(Guid formId, int pageNumber = 1, int pageSize = 10);
    Task<ApiResponse<FormResponseDto>> GetResponseByIdAsync(Guid id);
    Task<ApiResponse<FormResponseDto>> SubmitResponseAsync(CreateFormResponseDto responseDto);
    Task<ApiResponse<bool>> DeleteResponseAsync(Guid id);
    Task<ApiResponse<PaginatedResponse<FormResponseDto>>> GetUserResponsesAsync(string userIdentifier);
}

public interface IFormValidationService
{
    Task<ApiResponse<bool>> ValidateFormAsync(Guid formId);
    Task<ApiResponse<bool>> ValidateResponseAsync(Guid formId, object responseData);
    Task<bool> CanUserSubmitAsync(Guid formId, string userIdentifier);
    Task<bool> IsFormOpenAsync(Guid formId);
}