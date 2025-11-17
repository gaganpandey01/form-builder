/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LucideIcon } from "lucide-react";
export interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "date"
    | "time"
    | "url"
    | "phone";
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  // New properties for conditional logic
  conditionalLogic?: ConditionalLogic;
  validation?: FieldValidation;
  autofill?: AutofillConfig;
  metadata?: Record<string, any>;
}

export interface ConditionalLogic {
  enabled: boolean;
  condition: "show" | "hide";
  rules: ConditionalRule[];
  operator: "and" | "or";
}

export interface ConditionalRule {
  fieldId: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than";
  value: string;
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
  customCloseTime?: number; // in hours
  isClosed: boolean;
  createdAt: string;
  // New properties for multi-step forms
  isMultiStep: boolean;
  stepsPerPage: number;
  showProgressBar: boolean;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  settings: FormSettings;
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

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FormField[];
  createdAt: string;
  isCustom: true;
}


export interface FieldTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon; // Changed from string to LucideIcon
  category:
    | "contact"
    | "address"
    | "personal"
    | "business"
    | "event"
    | "feedback";
  fields: FormField[];
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
