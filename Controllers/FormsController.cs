using FormBuilderApi.Models.DTOs;
using FormBuilderApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace FormBuilderApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FormsController : ControllerBase
{
    private readonly IFormService _formService;
    private readonly ILogger<FormsController> _logger;

    public FormsController(IFormService formService, ILogger<FormsController> logger)
    {
        _formService = formService;
        _logger = logger;
    }

    /// <summary>
    /// Get all forms with pagination
    /// </summary>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <returns>Paginated list of forms</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<FormDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<FormDto>>>> GetAllForms(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10)
    {
        if (pageNumber < 1)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Page number must be greater than 0"
            });
        }

        if (pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Page size must be between 1 and 100"
            });
        }

        var result = await _formService.GetAllFormsAsync(pageNumber, pageSize);
        
        return result.Success ? Ok(result) : StatusCode(500, result);
    }

    /// <summary>
    /// Get a specific form by ID
    /// </summary>
    /// <param name="id">Form ID</param>
    /// <returns>Form details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FormDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<FormDto>>> GetFormById(Guid id)
    {
        var result = await _formService.GetFormByIdAsync(id);
        
        if (!result.Success && result.Message == "Form not found")
            return NotFound(result);
            
        return result.Success ? Ok(result) : StatusCode(500, result);
    }

    /// <summary>
    /// Create a new form
    /// </summary>
    /// <param name="createFormDto">Form data</param>
    /// <returns>Created form</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<FormDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<FormDto>>> CreateForm([FromBody] CreateFormDto? createFormDto)
    {
        if (createFormDto == null)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Request body cannot be null",
                Errors = new List<string> { "The createFormDto field is required." }
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Invalid form data",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var result = await _formService.CreateFormAsync(createFormDto);
        
        if (result.Success)
        {
            return CreatedAtAction(nameof(GetFormById), new { id = result.Data!.Id }, result);
        }
        
        return StatusCode(500, result);
    }

    /// <summary>
    /// Update an existing form
    /// </summary>
    /// <param name="id">Form ID</param>
    /// <param name="updateFormDto">Updated form data</param>
    /// <returns>Updated form</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FormDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<FormDto>>> UpdateForm(Guid id, [FromBody] UpdateFormDto updateFormDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Invalid form data",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var result = await _formService.UpdateFormAsync(id, updateFormDto);
        
        if (!result.Success && result.Message == "Form not found")
            return NotFound(result);
            
        return result.Success ? Ok(result) : StatusCode(500, result);
    }

    /// <summary>
    /// Delete a form
    /// </summary>
    /// <param name="id">Form ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteForm(Guid id)
    {
        var result = await _formService.DeleteFormAsync(id);
        
        if (!result.Success && result.Message == "Form not found")
            return NotFound(result);
            
        return result.Success ? Ok(result) : StatusCode(500, result);
    }

    /// <summary>
    /// Search forms
    /// </summary>
    /// <param name="searchTerm">Search term</param>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <returns>Paginated search results</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<FormDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<FormDto>>>> SearchForms(
        [FromQuery] string searchTerm = "",
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10)
    {
        if (pageNumber < 1)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Page number must be greater than 0"
            });
        }

        if (pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Page size must be between 1 and 100"
            });
        }

        var result = await _formService.SearchFormsAsync(searchTerm, pageNumber, pageSize);
        
        return result.Success ? Ok(result) : StatusCode(500, result);
    }

    /// <summary>
    /// Duplicate a form
    /// </summary>
    /// <param name="id">Form ID to duplicate</param>
    /// <returns>Success status</returns>
    [HttpPost("{id:guid}/duplicate")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> DuplicateForm(Guid id)
    {
        var result = await _formService.DuplicateFormAsync(id);
        
        if (!result.Success && result.Message == "Form not found")
            return NotFound(result);
            
        return result.Success ? Ok(result) : StatusCode(500, result);
    }
}

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ResponsesController : ControllerBase
{
    private readonly IFormResponseService _responseService;
    private readonly ILogger<ResponsesController> _logger;

    public ResponsesController(IFormResponseService responseService, ILogger<ResponsesController> logger)
    {
        _responseService = responseService;
        _logger = logger;
    }

    /// <summary>
    /// Get responses for a specific form
    /// </summary>
    /// <param name="formId">Form ID</param>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <returns>Paginated form responses</returns>
    [HttpGet("form/{formId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<FormResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<FormResponseDto>>>> GetFormResponses(
        Guid formId,
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10)
    {
        if (pageNumber < 1)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Page number must be greater than 0"
            });
        }

        if (pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Page size must be between 1 and 100"
            });
        }

        var result = await _responseService.GetFormResponsesAsync(formId, pageNumber, pageSize);
        
        return result.Success ? Ok(result) : StatusCode(500, result);
    }

    /// <summary>
    /// Get a specific response by ID
    /// </summary>
    /// <param name="id">Response ID</param>
    /// <returns>Response details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FormResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<FormResponseDto>>> GetResponseById(Guid id)
    {
        var result = await _responseService.GetResponseByIdAsync(id);
        
        if (!result.Success && result.Message == "Response not found")
            return NotFound(result);
            
        return result.Success ? Ok(result) : StatusCode(500, result);
    }

    /// <summary>
    /// Submit a new response to a form
    /// </summary>
    /// <param name="responseDto">Response data</param>
    /// <returns>Created response</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<FormResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<FormResponseDto>>> SubmitResponse([FromBody] CreateFormResponseDto responseDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Invalid response data",
                Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList()
            });
        }

        var result = await _responseService.SubmitResponseAsync(responseDto);
        
        if (result.Success)
        {
            return CreatedAtAction(nameof(GetResponseById), new { id = result.Data!.Id }, result);
        }
        
        return result.Message == "Form not found" ? NotFound(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a response
    /// </summary>
    /// <param name="id">Response ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteResponse(Guid id)
    {
        var result = await _responseService.DeleteResponseAsync(id);
        
        if (!result.Success && result.Message == "Response not found")
            return NotFound(result);
            
        return result.Success ? Ok(result) : StatusCode(500, result);
    }

    /// <summary>
    /// Get responses for a specific user
    /// </summary>
    /// <param name="userIdentifier">User identifier</param>
    /// <returns>User responses</returns>
    [HttpGet("user/{userIdentifier}")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<FormResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<FormResponseDto>>>> GetUserResponses(
        [Required] string userIdentifier)
    {
        if (string.IsNullOrWhiteSpace(userIdentifier))
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "User identifier is required"
            });
        }

        var result = await _responseService.GetUserResponsesAsync(userIdentifier);
        
        return result.Success ? Ok(result) : StatusCode(500, result);
    }
}