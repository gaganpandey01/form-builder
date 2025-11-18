/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LucideIcon } from "lucide-react";
export interface FormField {
  id: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date" | "time" | "phone" | "url" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  conditionalLogic?: {
    enabled: boolean;
    condition: "show" | "hide";
    rules: ConditionalRule[];
    operator: "and" | "or";
  };
  parentId?: string; // Track parent question for hierarchy
  depth?: number; // Track nesting depth for indentation
  metadata?: Record<string, any>; // For additional field data like datePurpose
  autofill?: AutofillConfig;
}

export interface ConditionalLogic {
  enabled: boolean;
  condition: "show" | "hide";
  rules: ConditionalRule[];
  operator: "and" | "or";
}

export interface ConditionalRule {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than";
  value: string;
  question?: string;
  triggerType?: "yes" | "no" | "custom"; // Trigger condition type
  customValue?: string; // For custom trigger conditions
  childFields?: FormField[]; // ✅ Changed from boolean to FormField[] for nested questions
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customMessage?: string;
}

export interface FormSettings {
  allowMultipleResponses: boolean;
  closeType: "manual" | "datetime" | "custom";
  closeDateTime?: string;
  customCloseTime?: number;
  isClosed: boolean;
  createdAt: string;
  lastModified?: string | null;  // ✓ Changed to accept null
  isMultiStep: boolean;
  stepsPerPage: number;
  showProgressBar: boolean;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings?: {
    [key: string]: any;
  };
  lastModified?: string | null;  // ✓ Changed to accept null
}

export interface FormResponse {
  id: string;
  formId: string;
  responses: Record<string, any>;
  submittedAt: string;
  userIdentifier: string;
}

export interface ValidationError {
  fieldId: string;
  message: string;
}

export type ViewType = "admin" | "form" | "responses";

export interface FieldType {
  type: FormField["type"];
  label: string;
}

export interface CustomTemplate extends FieldTemplate {
  isCustom: true;
  createdAt: string;
}


export interface FieldTemplate {
  id: string;
  name: string;
  description: string;
  fields: Partial<FormField>[];
  category?: string;
  icon: LucideIcon;
  isCustom?: boolean;
}

export interface AutofillConfig {
  autocomplete?: string;
  inputMode?:
  | "text"
  | "email"
  | "tel"
  | "url"
  | "numeric"
  | "decimal"
  | "search";
  pattern?: string;
}
