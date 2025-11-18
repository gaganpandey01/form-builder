# Conditional Logic Validation Documentation

## Overview
The backend now provides comprehensive validation for conditional logic in forms. This ensures that forms are structurally sound and logical before being saved.

## Validation Features

### 1. **Field Reference Validation**
- ✅ Ensures referenced fields exist in the form
- ✅ Prevents referencing non-existent fields
- ✅ Supports both ID and Label-based references (ID preferred)

### 2. **Self-Reference Prevention**
- ✅ Detects and prevents fields from referencing themselves
- ✅ Provides clear error messages for self-references

### 3. **Circular Dependency Detection**
- ✅ Advanced algorithm to detect circular dependencies
- ✅ Prevents infinite loops in conditional logic
- ✅ Example: Field A depends on Field B, Field B depends on Field A

### 4. **Operator Validation**
- ✅ **Supported Operators:**
  - `equals` - Exact match comparison
  - `not_equals` - Not equal comparison
  - `contains` - Text contains substring
  - `not_contains` - Text doesn't contain substring
  - `greater_than` - Numeric/Date comparison
  - `less_than` - Numeric/Date comparison
  - `is_empty` - Field is empty
  - `is_not_empty` - Field has value
  - `starts_with` - Text starts with value
  - `ends_with` - Text ends with value

### 5. **Field Type Compatibility**
- ✅ **Text Fields:** `equals`, `not_equals`, `contains`, `not_contains`, `starts_with`, `ends_with`, `is_empty`, `is_not_empty`
- ✅ **Number Fields:** `equals`, `not_equals`, `greater_than`, `less_than`, `is_empty`, `is_not_empty`
- ✅ **Date/Time Fields:** `equals`, `not_equals`, `greater_than`, `less_than`, `is_empty`, `is_not_empty`
- ✅ **Select/Radio Fields:** `equals`, `not_equals`, `is_empty`, `is_not_empty`

### 6. **Value Validation**
- ✅ Ensures values are provided when required by operator
- ✅ Validates numeric values for numeric operators
- ✅ Operators like `is_empty` don't require values

### 7. **Conditional Logic Structure Validation**
- ✅ **Condition:** Must be "show" or "hide"
- ✅ **Operator:** Must be "and" or "or" for multiple rules
- ✅ **Rules:** At least one rule required when conditional logic is enabled

## Error Messages
The validation provides descriptive error messages to help developers understand and fix issues:

- `"Field 'FieldName' references non-existent field: 'InvalidFieldId'. Please ensure the referenced field exists in the form."`
- `"Field 'FieldName' cannot reference itself in conditional logic."`
- `"Circular dependency detected for field 'FieldName'. A field cannot conditionally depend on itself through a chain of other fields."`
- `"Invalid operator 'invalid_op' for field 'FieldName'. Valid operators are: equals, not_equals, contains, not_contains, greater_than, less_than, is_empty, is_not_empty, starts_with, ends_with."`
- `"Operator 'greater_than' is not valid for field type 'text' in field 'FieldName'."`

## Integration
The validation is automatically triggered when:
- Creating new forms (`POST /api/forms`)
- Updating existing forms (`PUT /api/forms/{id}`)

## Usage Examples

### ✅ Valid Conditional Logic
```json
{
  "conditionalLogic": {
    "enabled": true,
    "condition": "show",
    "operator": "and",
    "rules": [
      {
        "fieldId": "age_field",
        "operator": "greater_than",
        "value": "18"
      }
    ]
  }
}
```

### ❌ Invalid Examples
```json
// Self-reference
{
  "conditionalLogic": {
    "enabled": true,
    "rules": [
      {
        "fieldId": "same_field_id", // ❌ Cannot reference itself
        "operator": "equals",
        "value": "test"
      }
    ]
  }
}

// Invalid operator for field type
{
  "conditionalLogic": {
    "enabled": true,
    "rules": [
      {
        "fieldId": "text_field",
        "operator": "greater_than", // ❌ Not valid for text fields
        "value": "10"
      }
    ]
  }
}
```

## Benefits
1. **Data Integrity:** Ensures forms are logically consistent
2. **Error Prevention:** Catches issues before forms are saved
3. **Better UX:** Provides clear error messages for debugging
4. **Maintainability:** Prevents complex debugging of broken conditional logic
5. **Scalability:** Handles complex forms with multiple dependencies

The validation system is designed to be strict enough to catch real issues while being flexible enough to support complex conditional logic scenarios.