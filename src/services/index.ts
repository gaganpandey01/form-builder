// Main API services index
export { apiClient } from './apiClient';
export type { ApiResponse, PaginatedResponse } from './apiClient';

export { formsApi } from './formsApi';
export type {
    CreateFormRequest,
    UpdateFormRequest,
    FormDto,
    FormsQueryParams
} from './formsApi';

export { formResponsesApi } from './formResponsesApi';
export type {
    CreateFormResponseRequest,
    FormResponseDto,
    ResponsesQueryParams,
    ResponseAnalytics
} from './formResponsesApi';

// Utility function to handle API errors consistently
export const handleApiError = (error: { success: false; message?: string; errors?: string[] }) => {
    console.error('API Error:', error);

    const message = error.message || 'An unexpected error occurred';
    const details = error.errors?.join(', ') || '';

    return `${message}${details ? `: ${details}` : ''}`;
};

// API configuration
export const API_CONFIG = {
    BASE_URL: 'http://localhost:5070/api',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
} as const;