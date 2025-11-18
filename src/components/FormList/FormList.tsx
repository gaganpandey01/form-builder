import React, { useEffect, useState } from 'react';
import { formService } from '../../services/formServices';
import type { Form } from '../../types';
import { FormCard } from './FormCard';
import './FormList.css';

export const FormList: React.FC<{ onEdit: (id: string) => void; onView: (id: string) => void }> = ({ onEdit, onView }) => {
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadForms();
    }, [currentPage, searchTerm]);

    const loadForms = async () => {
        try {
            setLoading(true);
            const result = searchTerm
                ? await formService.searchForms(searchTerm, currentPage, 10)
                : await formService.getForms(currentPage, 10);

            if (result.success) {
                setForms(result.data.data);
                setTotalPages(result.data.totalPages);
            }
        } catch (error) {
            console.error('Error loading forms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this form?')) return;

        try {
            await formService.deleteForm(id);
            loadForms();
        } catch (error) {
            console.error('Error deleting form:', error);
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            await formService.duplicateForm(id);
            loadForms();
        } catch (error) {
            console.error('Error duplicating form:', error);
        }
    };

    if (loading) return <div className="loading">Loading forms...</div>;

    return (
        <div className="form-list">
            <div className="form-list-header">
                <h1>My Forms</h1>
                <input
                    type="text"
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="forms-grid">
                {forms.map(form => (
                    <FormCard
                        key={form.id}
                        form={form}
                        onEdit={() => form.id && onEdit(form.id)}
                        onView={() => form.id && onView(form.id)}
                        onDelete={() => form.id && handleDelete(form.id)}
                        onDuplicate={() => form.id && handleDuplicate(form.id)}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
