import { toast } from "react-toastify";
import type { FormField, ValidationError } from "../types";

export const validateField = (
  field: FormField,
  value: any
): ValidationError | null => {
  // console.log(field, "badiiiii ")
  // if (!field.validation && !field.required) return null;
  // Required field validation
  if (
    field.required &&
    (!value || (Array.isArray(value) && value.length === 0))
  ) {
    return {
      fieldId: field.id,
      message: `${field.label} is required`,
    };
  }

  if (!value) return null;
  //date validation
  if (field.type === "date") {
    const fieldName = field.label;
    console.log(fieldName, "fielNamekdief");
    const currDate = new Date().toISOString().split("T")[0];
    if (
      (fieldName === "DOB" || fieldName === "Date Of Birth") &&
      value > currDate
    ) {
      toast.error("Birth Date cannot be in future");
    }
  }
  const validation = field.validation;
  console.log(validation, "validation");
  if (!validation) return null;

  // String length validation
  if (validation.minLength && value.length < validation.minLength) {
    return {
      fieldId: field.id,
      message:
        validation.customMessage ||
        `Minimum ${validation.minLength} characters required`,
    };
  }

  if (validation.maxLength && value.length > validation.maxLength) {
    return {
      fieldId: field.id,
      message:
        validation.customMessage ||
        `Maximum ${validation.maxLength} characters allowed`,
    };
  }

  // Pattern validation (regex)
  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      return {
        fieldId: field.id,
        message: validation.customMessage || "Invalid format",
      };
    }
  }

  // Email validation
  if (field.type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        fieldId: field.id,
        message: "Please enter a valid email address",
      };
    }
  }

  // URL validation
  if (field.type === "url") {
    try {
      new URL(value);
    } catch {
      return {
        fieldId: field.id,
        message: "Please enter a valid URL",
      };
    }
  }

  // Phone validation
  if (field.type === "phone") {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
      return {
        fieldId: field.id,
        message: "Please enter a valid phone number",
      };
    }
  }

  return null;
};

export const validateAllFields = (
  fields: FormField[],
  formData: Record<string, any>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  fields.forEach((field) => {
    const error = validateField(field, formData[field.id]);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};
