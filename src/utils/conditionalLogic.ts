import type { FormField, ConditionalRule } from "../types";

export const evaluateCondition = (
  rule: ConditionalRule,
  formData: Record<string, any>
): boolean => {
  const fieldValue = formData[rule.fieldId];
  const ruleValue = rule.value;

  if (fieldValue === undefined || fieldValue === null) {
    return rule.operator === "not_equals" || rule.operator === "not_contains";
  }

  const fieldValueStr = Array.isArray(fieldValue)
    ? fieldValue.join(",")
    : String(fieldValue);

  switch (rule.operator) {
    case "equals":
      return fieldValueStr === ruleValue;
    case "not_equals":
      return fieldValueStr !== ruleValue;
    case "contains":
      return fieldValueStr.toLowerCase().includes(ruleValue.toLowerCase());
    case "not_contains":
      return !fieldValueStr.toLowerCase().includes(ruleValue.toLowerCase());
    case "greater_than":
      return parseFloat(fieldValueStr) > parseFloat(ruleValue);
    case "less_than":
      return parseFloat(fieldValueStr) < parseFloat(ruleValue);
    default:
      return false;
  }
};

export const shouldShowField = (
  field: FormField,
  formData: Record<string, any>
): boolean => {
  if (!field.conditionalLogic || !field.conditionalLogic.enabled) {
    return true;
  }

  const { rules, operator, condition } = field.conditionalLogic;

  if (rules.length === 0) return true;

  let result: boolean;

  if (operator === "and") {
    result = rules.every((rule) => evaluateCondition(rule, formData));
  } else {
    result = rules.some((rule) => evaluateCondition(rule, formData));
  }

  return condition === "show" ? result : !result;
};

export const getVisibleFields = (
  fields: FormField[],
  formData: Record<string, any>
): FormField[] => {
  return fields.filter((field) => shouldShowField(field, formData));
};
