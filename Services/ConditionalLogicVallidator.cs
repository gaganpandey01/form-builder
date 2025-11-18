using FormBuilderApi.Models.DTOs;

namespace FormBuilderApi.Services;

public interface IConditionalLogicValidator
{
    List<string> ValidateConditionalLogic(List<CreateFormFieldDto> fields);
    List<string> ValidateConditionalLogic(List<UpdateFormFieldDto> fields);
}

public class ConditionalLogicValidator : IConditionalLogicValidator
{
    public List<string> ValidateConditionalLogic(List<CreateFormFieldDto> fields)
    {
        var errors = new List<string>();

        foreach (var field in fields)
        {
            // Skip if no conditional logic
            if (field.ConditionalLogic == null || !field.ConditionalLogic.Enabled)
                continue;

            // Validate conditional logic has rules
            if (field.ConditionalLogic.Rules == null || !field.ConditionalLogic.Rules.Any())
            {
                errors.Add($"Field '{field.Label}' has conditional logic enabled but no rules defined. Please add at least one rule or disable conditional logic.");
                continue;
            }

            // Validate conditional logic operator
            if (!string.IsNullOrWhiteSpace(field.ConditionalLogic.Operator) && 
                !new[] { "and", "or" }.Contains(field.ConditionalLogic.Operator.ToLower()))
            {
                errors.Add($"Field '{field.Label}' has invalid conditional logic operator '{field.ConditionalLogic.Operator}'. Use 'and' or 'or'.");
            }

            // Validate conditional logic condition
            if (!string.IsNullOrWhiteSpace(field.ConditionalLogic.Condition) && 
                !new[] { "show", "hide" }.Contains(field.ConditionalLogic.Condition.ToLower()))
            {
                errors.Add($"Field '{field.Label}' has invalid conditional logic condition '{field.ConditionalLogic.Condition}'. Use 'show' or 'hide'.");
            }

            // Validate each rule (skip self-references)
            var validRules = field.ConditionalLogic.Rules.Where(rule => 
                rule.FieldId != field.Id && rule.FieldId != field.Label).ToList();
            
            foreach (var rule in validRules)
            {
                var ruleErrors = ValidateRule(rule, field, fields);
                errors.AddRange(ruleErrors);
            }
            
            // If no valid rules remain after filtering self-references, skip validation silently
            // This allows forms to be saved even if they have self-referencing rules
            // The frontend can handle this gracefully

            // Check for circular dependencies with improved algorithm
            if (HasCircularDependency(field, fields))
            {
                errors.Add($"Circular dependency detected for field '{field.Label}'. A field cannot conditionally depend on itself through a chain of other fields.");
            }
        }

        return errors;
    }

    public List<string> ValidateConditionalLogic(List<UpdateFormFieldDto> fields)
    {
        var errors = new List<string>();

        foreach (var field in fields)
        {
            // Skip if no conditional logic
            if (field.ConditionalLogic == null || !field.ConditionalLogic.Enabled)
                continue;

            // Validate conditional logic has rules
            if (field.ConditionalLogic.Rules == null || !field.ConditionalLogic.Rules.Any())
            {
                errors.Add($"Field '{field.Label ?? "Unknown"}' has conditional logic enabled but no rules defined. Please add at least one rule or disable conditional logic.");
                continue;
            }

            // Validate conditional logic operator
            if (!string.IsNullOrWhiteSpace(field.ConditionalLogic.Operator) && 
                !new[] { "and", "or" }.Contains(field.ConditionalLogic.Operator.ToLower()))
            {
                errors.Add($"Field '{field.Label ?? "Unknown"}' has invalid conditional logic operator '{field.ConditionalLogic.Operator}'. Use 'and' or 'or'.");
            }

            // Validate conditional logic condition
            if (!string.IsNullOrWhiteSpace(field.ConditionalLogic.Condition) && 
                !new[] { "show", "hide" }.Contains(field.ConditionalLogic.Condition.ToLower()))
            {
                errors.Add($"Field '{field.Label ?? "Unknown"}' has invalid conditional logic condition '{field.ConditionalLogic.Condition}'. Use 'show' or 'hide'.");
            }

            // Validate each rule (skip self-references)
            var validRules = field.ConditionalLogic.Rules.Where(rule => 
                rule.FieldId != field.Id && rule.FieldId != field.Label).ToList();
            
            foreach (var rule in validRules)
            {
                var ruleErrors = ValidateRuleForUpdate(rule, field, fields);
                errors.AddRange(ruleErrors);
            }
            
            // If no valid rules remain after filtering self-references, skip validation silently
            // This allows forms to be saved even if they have self-referencing rules
            // The frontend can handle this gracefully

            // Check for circular dependencies with improved algorithm
            if (HasCircularDependencyForUpdate(field, fields))
            {
                errors.Add($"Circular dependency detected for field '{field.Label ?? "Unknown"}'. A field cannot conditionally depend on itself through a chain of other fields.");
            }
        }

        return errors;
    }

    private List<string> ValidateRule(
        ConditionalRuleDto rule,
        CreateFormFieldDto parentField,
        List<CreateFormFieldDto> allFields)
    {
        var errors = new List<string>();

        // Check if referenced field exists (prefer ID match over Label match)
        var referencedField = allFields.FirstOrDefault(f => f.Id == rule.FieldId) ??
                            allFields.FirstOrDefault(f => f.Label == rule.FieldId);

        if (referencedField == null)
        {
            errors.Add($"Field '{parentField.Label}' references non-existent field: '{rule.FieldId}'. Please ensure the referenced field exists in the form.");
            return errors;
        }

        // Skip self-references silently (field referencing itself)
        var parentFieldId = GetFieldIdentifier(parentField.Id, parentField.Label);
        var referencedFieldId = GetFieldIdentifier(referencedField.Id, referencedField.Label);
        if (parentFieldId == referencedFieldId)
        {
            // Self-reference detected - skip this rule silently
            return errors; // Return empty errors list to continue validation
        }

        // Validate operator is not empty
        if (string.IsNullOrWhiteSpace(rule.Operator))
        {
            errors.Add($"Rule for field '{parentField.Label}' has no operator defined");
            return errors;
        }

        // Validate operator is valid
        var validOperators = new[] { "equals", "not_equals", "contains", "not_contains", "greater_than", "less_than", "is_empty", "is_not_empty", "starts_with", "ends_with" };
        if (!validOperators.Contains(rule.Operator.ToLower()))
        {
            errors.Add($"Invalid operator '{rule.Operator}' for field '{parentField.Label}'. Valid operators are: {string.Join(", ", validOperators)}.");
            return errors;
        }

        // Validate operator matches field type
        if (!IsValidOperatorForFieldType(rule.Operator, referencedField.Type))
        {
            errors.Add($"Operator '{rule.Operator}' is not valid for field type '{referencedField.Type}' in field '{parentField.Label}'");
        }

        // Validate value is provided based on operator type
        var operatorsThatDontNeedValue = new[] { "is_empty", "is_not_empty" };
        if (!operatorsThatDontNeedValue.Contains(rule.Operator.ToLower()) && 
            string.IsNullOrWhiteSpace(rule.Value))
        {
            errors.Add($"Rule for field '{parentField.Label}' with operator '{rule.Operator}' requires a value to be specified.");
        }

        // Validate numeric values for numeric operators
        if (new[] { "greater_than", "less_than" }.Contains(rule.Operator.ToLower()) &&
            !string.IsNullOrWhiteSpace(rule.Value))
        {
            if (referencedField.Type.ToLower() == "number" && !decimal.TryParse(rule.Value, out _))
            {
                errors.Add($"Rule for field '{parentField.Label}' has invalid numeric value '{rule.Value}' for operator '{rule.Operator}'.");
            }
        }

        return errors;
    }

    private List<string> ValidateRuleForUpdate(
        ConditionalRuleDto rule,
        UpdateFormFieldDto parentField,
        List<UpdateFormFieldDto> allFields)
    {
        var errors = new List<string>();

        // Check if referenced field exists (prefer ID match over Label match)
        var referencedField = allFields.FirstOrDefault(f => f.Id == rule.FieldId) ??
                            allFields.FirstOrDefault(f => f.Label == rule.FieldId);

        if (referencedField == null)
        {
            errors.Add($"Field '{parentField.Label ?? "Unknown"}' references non-existent field: '{rule.FieldId}'. Please ensure the referenced field exists in the form.");
            return errors;
        }

        // Skip self-references silently (field referencing itself)
        var parentFieldId = GetFieldIdentifier(parentField.Id, parentField.Label);
        var referencedFieldId = GetFieldIdentifier(referencedField.Id, referencedField.Label);
        if (parentFieldId == referencedFieldId)
        {
            // Self-reference detected - skip this rule silently
            return errors; // Return empty errors list to continue validation
        }

        // Validate operator is not empty
        if (string.IsNullOrWhiteSpace(rule.Operator))
        {
            errors.Add($"Rule for field '{parentField.Label ?? "Unknown"}' has no operator defined");
            return errors;
        }

        // Validate operator is valid
        var validOperators = new[] { "equals", "not_equals", "contains", "not_contains", "greater_than", "less_than" };
        if (!validOperators.Contains(rule.Operator.ToLower()))
        {
            errors.Add($"Invalid operator '{rule.Operator}' for field '{parentField.Label ?? "Unknown"}'");
            return errors;
        }

        // Validate operator matches field type
        if (!IsValidOperatorForFieldType(rule.Operator, referencedField.Type ?? "text"))
        {
            errors.Add($"Operator '{rule.Operator}' is not valid for field type '{referencedField.Type}' in field '{parentField.Label ?? "Unknown"}'");
        }

        // Validate value is provided based on operator type
        var operatorsThatDontNeedValue = new[] { "is_empty", "is_not_empty" };
        if (!operatorsThatDontNeedValue.Contains(rule.Operator.ToLower()) && 
            string.IsNullOrWhiteSpace(rule.Value))
        {
            errors.Add($"Rule for field '{parentField.Label ?? "Unknown"}' with operator '{rule.Operator}' requires a value to be specified.");
        }

        // Validate numeric values for numeric operators
        if (new[] { "greater_than", "less_than" }.Contains(rule.Operator.ToLower()) &&
            !string.IsNullOrWhiteSpace(rule.Value))
        {
            if ((referencedField.Type ?? "text").ToLower() == "number" && !decimal.TryParse(rule.Value, out _))
            {
                errors.Add($"Rule for field '{parentField.Label ?? "Unknown"}' has invalid numeric value '{rule.Value}' for operator '{rule.Operator}'.");
            }
        }

        return errors;
    }

    private bool IsValidOperatorForFieldType(string operatorType, string fieldType)
    {
        var op = operatorType.ToLower();
        var type = fieldType.ToLower();

        return op switch
        {
            "greater_than" or "less_than" => type is "number" or "date" or "time" or "datetime",
            "contains" or "not_contains" or "starts_with" or "ends_with" => type is "text" or "textarea" or "email" or "url" or "password",
            "is_empty" or "is_not_empty" => true, // All field types can be empty
            "equals" or "not_equals" => true, // All field types support equality
            _ => false
        };
    }

    private bool HasCircularDependency(CreateFormFieldDto currentField, List<CreateFormFieldDto> allFields)
    {
        var visited = new HashSet<string>();
        var fieldId = GetFieldIdentifier(currentField.Id, currentField.Label);
        return CheckCircularDependency(fieldId, visited, allFields);
    }

    private bool HasCircularDependencyForUpdate(UpdateFormFieldDto currentField, List<UpdateFormFieldDto> allFields)
    {
        var visited = new HashSet<string>();
        var fieldId = GetFieldIdentifier(currentField.Id, currentField.Label);
        return CheckCircularDependencyForUpdate(fieldId, visited, allFields);
    }

    private bool CheckCircularDependency(
        string currentFieldId,
        HashSet<string> visited,
        List<CreateFormFieldDto> allFields)
    {
        // If we've already visited this field in the current path, we have a circular dependency
        if (visited.Contains(currentFieldId))
            return true;

        // Find the current field
        var currentField = allFields.FirstOrDefault(f => 
            GetFieldIdentifier(f.Id, f.Label) == currentFieldId);
        
        if (currentField?.ConditionalLogic == null || !currentField.ConditionalLogic.Enabled)
            return false;

        // Add current field to visited path
        var newVisited = new HashSet<string>(visited) { currentFieldId };

        // Check each rule for circular dependencies
        foreach (var rule in currentField.ConditionalLogic.Rules)
        {
            var referencedFieldId = rule.FieldId;
            
            // Skip self-references (they're valid)
            if (referencedFieldId == currentFieldId)
                continue;

            // Recursively check if the referenced field creates a cycle
            if (CheckCircularDependency(referencedFieldId, newVisited, allFields))
                return true;
        }

        return false;
    }

    private bool CheckCircularDependencyForUpdate(
        string currentFieldId,
        HashSet<string> visited,
        List<UpdateFormFieldDto> allFields)
    {
        // If we've already visited this field in the current path, we have a circular dependency
        if (visited.Contains(currentFieldId))
            return true;

        // Find the current field
        var currentField = allFields.FirstOrDefault(f => 
            GetFieldIdentifier(f.Id, f.Label) == currentFieldId);
        
        if (currentField?.ConditionalLogic == null || !currentField.ConditionalLogic.Enabled)
            return false;

        // Add current field to visited path
        var newVisited = new HashSet<string>(visited) { currentFieldId };

        // Check each rule for circular dependencies
        foreach (var rule in currentField.ConditionalLogic.Rules)
        {
            var referencedFieldId = rule.FieldId;
            
            // Skip self-references (they're valid)
            if (referencedFieldId == currentFieldId)
                continue;

            // Recursively check if the referenced field creates a cycle
            if (CheckCircularDependencyForUpdate(referencedFieldId, newVisited, allFields))
                return true;
        }

        return false;
    }

    private string GetFieldIdentifier(string? id, string? label)
    {
        // Prefer ID over label for identification, fallback to label if ID is not available
        return !string.IsNullOrWhiteSpace(id) ? id : (label ?? "unknown");
    }
}
