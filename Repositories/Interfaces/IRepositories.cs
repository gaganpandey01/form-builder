using FormBuilderApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace FormBuilderApi.Repositories.Interfaces;

public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression);
    Task<T> AddAsync(T entity);
    Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities);
    Task<T> UpdateAsync(T entity);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<int> CountAsync();
    Task<int> CountAsync(Expression<Func<T, bool>> expression);
}

public interface IFormRepository : IGenericRepository<Form>
{
    Task<Form?> GetFormWithFieldsAsync(Guid id);
    Task<Form?> GetFormWithSettingsAsync(Guid id);
    Task<Form?> GetFullFormAsync(Guid id);
    Task<IEnumerable<Form>> GetFormsWithSettingsAsync(int pageNumber, int pageSize);
    Task<IEnumerable<Form>> SearchFormsAsync(string searchTerm, int pageNumber, int pageSize);
}

public interface IFormFieldRepository : IGenericRepository<FormField>
{
    Task<IEnumerable<FormField>> GetFieldsByFormIdAsync(Guid formId);
    Task<IEnumerable<FormField>> GetChildFieldsAsync(Guid parentId);
    Task<FormField?> GetFieldWithChildrenAsync(Guid id);
    Task<bool> DeleteFieldsByFormIdAsync(Guid formId);
    Task<int> GetMaxOrderAsync(Guid formId);
}

public interface IFormResponseRepository : IGenericRepository<FormResponse>
{
    Task<IEnumerable<FormResponse>> GetResponsesByFormIdAsync(Guid formId, int pageNumber, int pageSize);
    Task<int> CountResponsesByFormIdAsync(Guid formId);
    Task<bool> HasUserResponseAsync(Guid formId, string userIdentifier);
    Task<IEnumerable<FormResponse>> GetResponsesByUserAsync(string userIdentifier);
}

public interface IFormSettingsRepository : IGenericRepository<FormSettings>
{
    Task<FormSettings?> GetByFormIdAsync(Guid formId);
    Task<bool> DeleteByFormIdAsync(Guid formId);
}