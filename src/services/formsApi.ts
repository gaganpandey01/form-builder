import { apiClient, type ApiResponse, type PaginatedResponse } from './apiClient';
import type { Form } from '../types';

// Backend DTO interfaces
export interface CreateFormRequest {
    title: string;
    description: string;
    configuration: {
        fields: Form["fields"];
        settings: Form["settings"];
    };
}

export interface UpdateFormRequest {
    title?: string;
    description?: string;
    configuration?: {
        fields?: Form["fields"];
        settings?: Form["settings"];
    };
    isActive?: boolean;
}

// Backend returns this structure
export interface BackendFormDto {
    id: string;
    title: string;
    description: string;
    configuration: string | {
        fields: Form["fields"];
        settings: Form["settings"];
    };
    createdAt: string;
    lastModified: string | null;
}

// Frontend Form type
export interface FormDto extends Form {
    createdAt: string;
    lastModified: string | null;
}

export interface FormsQueryParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    isActive?: boolean;
}

class FormsApiService {
    /**
     * Helper to convert backend DTO to frontend Form
     */
    private mapBackendToFrontend(backendForm: BackendFormDto): FormDto {
        // Parse configuration if it's a string
        const config = typeof backendForm.configuration === 'string'
            ? JSON.parse(backendForm.configuration)
            : backendForm.configuration;

        return {
            id: backendForm.id,
            title: backendForm.title || '',
            description: backendForm.description || '',
            fields: config?.fields || [],
            settings: config?.settings || {
                isMultiStep: false,
                stepsPerPage: 5,
                showProgressBar: true,
                allowMultipleResponses: false,
                requireAuthentication: false,
                isClosed: false,
                closeType: 'manual',
                closeDateTime: null,
                customCloseTime: null,
                createdAt: backendForm.createdAt
            },
            createdAt: backendForm.createdAt,
            lastModified: backendForm.lastModified
        };
    }

    /**
     * Get all forms with optional pagination and filtering
     */
    async getForms(params?: FormsQueryParams): Promise<ApiResponse<PaginatedResponse<FormDto>>> {
        const query = new URLSearchParams();

        if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString());
        if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
        if (params?.searchTerm) query.append('searchTerm', params.searchTerm);
        if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());

        const queryString = query.toString();
        const response = await apiClient.get<PaginatedResponse<BackendFormDto>>(
            `/forms${queryString ? `?${queryString}` : ''}`
        );

        // Map backend DTOs to frontend Forms
        if (response.success && response.data) {
            return {
                success: true,
                data: {
                    ...response.data,
                    items: response.data.items.map(item => this.mapBackendToFrontend(item))
                }
            };
        }

        return response as any;
    }

    /**
     * Get a single form by ID
     */
    async getForm(id: string): Promise<ApiResponse<FormDto>> {
        const response = await apiClient.get<BackendFormDto>(`/forms/${id}`);

        if (response.success && response.data) {
            return {
                success: true,
                data: this.mapBackendToFrontend(response.data)
            };
        }

        return response as any;
    }

    /**
     * Create a new form
     */
    async createForm(formData: Form): Promise<ApiResponse<FormDto>> {
        const request: CreateFormRequest = {
            title: formData.title,
            description: formData.description||"",
            configuration: {
                fields: formData.fields,
                settings: formData.settings
            }
        };

        const response = await apiClient.post<BackendFormDto>('/forms', request);

        if (response.success && response.data) {
            return {
                success: true,
                data: this.mapBackendToFrontend(response.data)
            };
        }

        return response as any;
    }

    /**
     * Update an existing form
     */
    async updateForm(id: string, formData: Partial<Form>): Promise<ApiResponse<FormDto>> {
        const request: UpdateFormRequest = {
            title: formData.title,
            description: formData.description,
            configuration: formData.fields || formData.settings ? {
                fields: formData.fields,
                settings: formData.settings
            } : undefined
        };

        const response = await apiClient.put<BackendFormDto>(`/forms/${id}`, request);

        if (response.success && response.data) {
            return {
                success: true,
                data: this.mapBackendToFrontend(response.data)
            };
        }

        return response as any;
    }

    /**
     * Delete a form
     */
    async deleteForm(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(`/forms/${id}`);
    }

    /**
     * Toggle form active status
     */
    async toggleFormStatus(id: string, isActive: boolean): Promise<ApiResponse<FormDto>> {
        const response = await apiClient.put<BackendFormDto>(`/forms/${id}`, { isActive });

        if (response.success && response.data) {
            return {
                success: true,
                data: this.mapBackendToFrontend(response.data)
            };
        }

        return response as any;
    }

    /**
     * Get form statistics
     */
    async getFormStats(id: string): Promise<ApiResponse<{
        totalResponses: number;
        averageCompletionTime: number;
        completionRate: number;
        lastResponseDate?: string;
    }>> {
        return apiClient.get(`/forms/${id}/stats`);
    }

    /**
     * Duplicate a form
     */
    async duplicateForm(id: string, title?: string): Promise<ApiResponse<FormDto>> {
        const response = await apiClient.post<BackendFormDto>(`/forms/${id}/duplicate`, { title });

        if (response.success && response.data) {
            return {
                success: true,
                data: this.mapBackendToFrontend(response.data)
            };
        }

        return response as any;
    }
}

export const formsApi = new FormsApiService();
