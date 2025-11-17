import type { FormField, ValidationError } from "../types";

// * Checks if a value is empty (undefined, null, empty string, or empty array)
const isEmpty = (value: any) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

// * Validates if a string is a valid email address
const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// * Validates if a string is a valid phone number (international format)
const isValidPhone = (value: string) =>
  /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ""));

// * Validates if a string is a valid URL
const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// ! Validates if a required field is empty
const validateRequired = (field: FormField, value: any): ValidationError | null => {
  if (field.required && isEmpty(value)) {
    return {
      fieldId: field.id,
      message: `${field.label} is required`,
    };
  }
  return null;
};

// ! Validates date fields for past/future constraints
const validateDate = (field: FormField, value: any): ValidationError | null => {
  if (field.type !== "date" || isEmpty(value)) return null;
  const time = field.metadata?.dateTime;
  const currDate = new Date();
  const inputDate = new Date(value);

  // Reset time to midnight for date-only comparison
  currDate.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  // Check if date should not be in the future
  if (time === "past" && inputDate > currDate) {
    return {
      fieldId: field.id,
      message: `${field.label} cannot be in the future`,
    };
  }

  // Check if date should not be in the past
  if (time === "future" && inputDate < currDate) {
    return {
      fieldId: field.id,
      message: `${field.label} cannot be in the past`,
    };
  }

  return null;
};


// ! Validates string length constraints (min/max)
const validateStringLength = (field: FormField, value: any): ValidationError | null => {
  const { validation } = field;
  if (!validation || typeof value !== "string") return null;

  // ? Check minimum length
  if (validation.minLength && value.length < validation.minLength) {
    return {
      fieldId: field.id,
      message: validation.customMessage || `Minimum ${validation.minLength} characters required`,
    };
  }
  // ? Check maximum length
  if (validation.maxLength && value.length > validation.maxLength) {
    return {
      fieldId: field.id,
      message: validation.customMessage || `Maximum ${validation.maxLength} characters allowed`,
    };
  }
  return null;
};

// ! Validates a string against a custom regex pattern
const validatePattern = (field: FormField, value: any): ValidationError | null => {
  const { validation } = field;
  if (!validation?.pattern || typeof value !== "string") return null;

  const regex = new RegExp(validation.pattern);
  if (!regex.test(value)) {
    return {
      fieldId: field.id,
      message: validation.customMessage || "Invalid format",
    };
  }
  return null;
};

// ! Validates email fields
const validateEmail = (field: FormField, value: any): ValidationError | null => {
  if (field.type === "email" && !isValidEmail(value)) {
    return {
      fieldId: field.id,
      message: "Please enter a valid email address",
    };
  }
  return null;
};

// ! Validates URL fields
const validateUrl = (field: FormField, value: any): ValidationError | null => {
  if (field.type === "url" && !isValidUrl(value)) {
    return {
      fieldId: field.id,
      message: "Please enter a valid URL",
    };
  }
  return null;
};

// ! Validates phone number fields
const validatePhone = (field: FormField, value: any): ValidationError | null => {
  if (field.type === "phone" && !isValidPhone(value)) {
    return {
      fieldId: field.id,
      message: "Please enter a valid phone number",
    };
  }
  return null;
};

// * Runs all validations for a single field and returns the first error found
export const validateField = (
  field: FormField,
  value: any
): ValidationError | null => {
  return (
    validateRequired(field, value) ||
    validateDate(field, value) ||
    validateStringLength(field, value) ||
    validatePattern(field, value) ||
    validateEmail(field, value) ||
    validateUrl(field, value) ||
    validatePhone(field, value) ||
    null
  );
};

// * Validates all fields in a form and returns an array of errors
export const validateAllFields = (
  fields: FormField[],
  formData: Record<string, any>
): ValidationError[] => {
  return fields
    .map((field) => validateField(field, formData[field.id]))
    .filter((error): error is ValidationError => !!error);
};
