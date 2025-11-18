using FormBuilderApi.Data;
using FormBuilderApi.Models.Entities;
using FormBuilderApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FormBuilderApi.Repositories.Implementations;

public class FormRepository : GenericRepository<Form>, IFormRepository
{
    public FormRepository(FormBuilderDbContext context) : base(context)
    {
    }

    public async Task<Form?> GetFormWithFieldsAsync(Guid id)
    {
        return await _dbSet
            .Include(f => f.Fields.OrderBy(ff => ff.Order))
            .ThenInclude(ff => ff.Children.OrderBy(c => c.Order))
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<Form?> GetFormWithSettingsAsync(Guid id)
    {
        return await _dbSet
            .Include(f => f.Settings)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<Form?> GetFullFormAsync(Guid id)
    {
        return await _dbSet
            .Include(f => f.Fields.OrderBy(ff => ff.Order))
            .ThenInclude(ff => ff.Children.OrderBy(c => c.Order))
            .Include(f => f.Settings)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<IEnumerable<Form>> GetFormsWithSettingsAsync(int pageNumber, int pageSize)
    {
        return await _dbSet
            .Include(f => f.Settings)
            .OrderByDescending(f => f.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Form>> SearchFormsAsync(string searchTerm, int pageNumber, int pageSize)
    {
        var query = _dbSet.AsQueryable();
        
        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(f => 
                f.Title.Contains(searchTerm) || 
                f.Description.Contains(searchTerm));
        }

        return await query
            .Include(f => f.Settings)
            .OrderByDescending(f => f.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
}

public class FormFieldRepository : GenericRepository<FormField>, IFormFieldRepository
{
    public FormFieldRepository(FormBuilderDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<FormField>> GetFieldsByFormIdAsync(Guid formId)
    {
        return await _dbSet
            .Where(ff => ff.FormId == formId)
            .OrderBy(ff => ff.Order)
            .ToListAsync();
    }

    public async Task<IEnumerable<FormField>> GetChildFieldsAsync(Guid parentId)
    {
        return await _dbSet
            .Where(ff => ff.ParentId == parentId)
            .OrderBy(ff => ff.Order)
            .ToListAsync();
    }

    public async Task<FormField?> GetFieldWithChildrenAsync(Guid id)
    {
        return await _dbSet
            .Include(ff => ff.Children.OrderBy(c => c.Order))
            .FirstOrDefaultAsync(ff => ff.Id == id);
    }

    public async Task<bool> DeleteFieldsByFormIdAsync(Guid formId)
    {
        var fields = await _dbSet.Where(ff => ff.FormId == formId).ToListAsync();
        _dbSet.RemoveRange(fields);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetMaxOrderAsync(Guid formId)
    {
        var maxOrder = await _dbSet
            .Where(ff => ff.FormId == formId)
            .MaxAsync(ff => (int?)ff.Order);
        
        return maxOrder ?? 0;
    }
}

public class FormResponseRepository : GenericRepository<FormResponse>, IFormResponseRepository
{
    public FormResponseRepository(FormBuilderDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<FormResponse>> GetResponsesByFormIdAsync(Guid formId, int pageNumber, int pageSize)
    {
        return await _dbSet
            .Where(fr => fr.FormId == formId)
            .OrderByDescending(fr => fr.SubmittedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> CountResponsesByFormIdAsync(Guid formId)
    {
        return await _dbSet.CountAsync(fr => fr.FormId == formId);
    }

    public async Task<bool> HasUserResponseAsync(Guid formId, string userIdentifier)
    {
        return await _dbSet
            .AnyAsync(fr => fr.FormId == formId && fr.UserIdentifier == userIdentifier);
    }

    public async Task<IEnumerable<FormResponse>> GetResponsesByUserAsync(string userIdentifier)
    {
        return await _dbSet
            .Where(fr => fr.UserIdentifier == userIdentifier)
            .OrderByDescending(fr => fr.SubmittedAt)
            .ToListAsync();
    }
}

public class FormSettingsRepository : GenericRepository<FormSettings>, IFormSettingsRepository
{
    public FormSettingsRepository(FormBuilderDbContext context) : base(context)
    {
    }

    public async Task<FormSettings?> GetByFormIdAsync(Guid formId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(fs => fs.FormId == formId);
    }

    public async Task<bool> DeleteByFormIdAsync(Guid formId)
    {
        var settings = await GetByFormIdAsync(formId);
        if (settings == null)
            return false;

        _dbSet.Remove(settings);
        await _context.SaveChangesAsync();
        return true;
    }
}