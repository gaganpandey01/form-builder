import { apiClient } from './api';
import type { ApiResponse, FormResponse, PaginatedResponse } from '../types';

export class ResponseService {
    async submitResponse(response: FormResponse): Promise<ApiResponse<FormResponse>> {
        return apiClient.post('/forms/responses', response);
    }

    async getFormResponses(formId: string, pageNumber = 1, pageSize = 10): Promise<ApiResponse<PaginatedResponse<FormResponse>>> {
        return apiClient.get(`/forms/form/${formId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    }

    async getResponse(id: string): Promise<ApiResponse<FormResponse>> {
        return apiClient.get(`/forms/responses/${id}`);
    }

    async deleteResponse(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete(`/forms/responses/${id}`);
    }

    async getUserResponses(userIdentifier: string): Promise<ApiResponse<FormResponse[]>> {
        return apiClient.get(`/forms/responses/user/${encodeURIComponent(userIdentifier)}`);
    }
}

export const responseService = new ResponseService();
