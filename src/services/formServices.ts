import { apiClient } from './api';
import type { ApiResponse, Form, PaginatedResponse } from '../types';

export class FormService {
    async getForms(pageNumber = 1, pageSize = 10): Promise<ApiResponse<PaginatedResponse<Form>>> {
        return apiClient.get(`/forms?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    }

    async getForm(id: string): Promise<ApiResponse<Form>> {
        return apiClient.get(`/forms/${id}`);
    }

    async createForm(form: Form): Promise<ApiResponse<Form>> {
        return apiClient.post('/forms', form);
    }

    async updateForm(id: string, form: Form): Promise<ApiResponse<Form>> {
        return apiClient.put(`/forms/${id}`, form);
    }

    async deleteForm(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete(`/forms/${id}`);
    }

    async searchForms(searchTerm: string, pageNumber = 1, pageSize = 10): Promise<ApiResponse<PaginatedResponse<Form>>> {
        return apiClient.get(`/forms/search?searchTerm=${encodeURIComponent(searchTerm)}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
    }

    async duplicateForm(id: string): Promise<ApiResponse<Form>> {
        return apiClient.post(`/forms/${id}/duplicate`, {});
    }
}

export const formService = new FormService();
