import { apiClient, type ApiResponse, type PaginatedResponse } from './apiClient';
import type { FormResponse } from '../types';

// Backend DTO interfaces
export interface CreateFormResponseRequest {
    formId: string;
    responses: Record<string, any>;
    userIdentifier: string;
    submissionData?: Record<string, any>;
}

export interface FormResponseDto {
    id: string;
    formId: string;
    responses: Record<string, any>;
    submissionData: Record<string, any>;
    userIdentifier: string;
    submittedAt: string;
    createdAt: string;
}

export interface ResponsesQueryParams {
    pageNumber?: number;
    pageSize?: number;
    formId?: string;
    startDate?: string;
    endDate?: string;
    userIdentifier?: string;
}

export interface ResponseAnalytics {
    totalResponses: number;
    averageCompletionTime: number;
    completionRate: number;
    responsesByDate: Array<{ date: string; count: number }>;
    fieldAnalytics: Array<{
        fieldId: string;
        fieldLabel: string;
        responseCount: number;
        mostCommonAnswers: Array<{ value: string; count: number }>;
    }>;
}

class FormResponsesApiService {
    /**
     * Get form responses with optional filtering
     */
    async getResponses(params?: ResponsesQueryParams): Promise<ApiResponse<PaginatedResponse<FormResponseDto>>> {
        const query = new URLSearchParams();

        if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString());
        if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
        if (params?.formId) query.append('formId', params.formId);
        if (params?.startDate) query.append('startDate', params.startDate);
        if (params?.endDate) query.append('endDate', params.endDate);
        if (params?.userIdentifier) query.append('userIdentifier', params.userIdentifier);

        const queryString = query.toString();
        return apiClient.get<PaginatedResponse<FormResponseDto>>(
            `/form-responses${queryString ? `?${queryString}` : ''}`
        );
    }

    /**
     * Get responses for a specific form
     */
    async getFormResponses(formId: string, params?: Omit<ResponsesQueryParams, 'formId'>): Promise<ApiResponse<PaginatedResponse<FormResponseDto>>> {
        return this.getResponses({ ...params, formId });
    }

    /**
     * Get a single response by ID
     */
    async getResponse(id: string): Promise<ApiResponse<FormResponseDto>> {
        return apiClient.get<FormResponseDto>(`/form-responses/${id}`);
    }

    /**
     * Submit a new form response
     */
    async submitResponse(responseData: FormResponse): Promise<ApiResponse<FormResponseDto>> {
        const request: CreateFormResponseRequest = {
            formId: responseData.formId,
            responses: responseData.responses,
            userIdentifier: responseData.userIdentifier,
            submissionData: {
                ...responseData
            }
        };

        return apiClient.post<FormResponseDto>('/form-responses', request);
    }

    /**
     * Delete a response
     */
    async deleteResponse(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(`/form-responses/${id}`);
    }

    /**
     * Get response analytics for a form
     */
    async getResponseAnalytics(formId: string): Promise<ApiResponse<ResponseAnalytics>> {
        return apiClient.get<ResponseAnalytics>(`/form-responses/analytics/${formId}`);
    }

    /**
     * Export responses to CSV
     */
    async exportResponses(formId: string, format: 'csv' | 'excel' = 'csv'): Promise<ApiResponse<Blob>> {
        try {
            const response = await fetch(`${apiClient['baseURL']}/form-responses/export/${formId}?format=${format}`, {
                method: 'GET',
                headers: {
                    'Accept': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.statusText}`);
            }

            const blob = await response.blob();
            return {
                success: true,
                data: blob
            };
        } catch (error) {
            return {
                success: false,
                message: 'Export failed',
                errors: [(error as Error).message]
            };
        }
    }

    /**
     * Get response validation results
     */
    async validateResponse(formId: string, responses: Record<string, any>): Promise<ApiResponse<{
        isValid: boolean;
        errors: Array<{ fieldId: string; message: string }>;
    }>> {
        return apiClient.post(`/form-responses/validate/${formId}`, { responses });
    }
}

export const formResponsesApi = new FormResponsesApiService();