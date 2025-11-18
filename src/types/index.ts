export interface Form {
  id?: string;
  title: string;
  description?: string;
  createdAt?: string;
  lastModified?: string;
  fields: FormField[];
  settings: FormSettings;
}

export interface FormField {
  id?: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
  validationRules?: ValidationRules;
  conditionalLogic?: ConditionalLogic;
  parentId?: string;
  depth: number;
  metadata?: Record<string, any>;
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'url';

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface ConditionalLogic {
  enabled: boolean;
  condition: 'show' | 'hide';
  operator: 'and' | 'or';
  rules: ConditionalRule[];
}

export interface ConditionalRule {
  fieldId: string;
  operator: OperatorType;
  value: string;
}

export type OperatorType =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty';

export interface FormSettings {
  allowMultipleResponses: boolean;
  closeType?: string;
  closeDateTime?: string;
  customCloseTime?: number;
  isClosed: boolean;
  isMultiStep: boolean;
  stepsPerPage: number;
  showProgressBar: boolean;
  submitButtonText?: string;
  successMessage?: string;
  theme?: string;
}

export interface FormResponse {
  id?: string;
  formId: string;
  userIdentifier: string;
  responseData: Record<string, any>;
  submittedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
