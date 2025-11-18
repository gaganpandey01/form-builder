import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService } from '../../services/formServices';
import { responseService } from '../../services/responseServices';
import type { Form } from '../../types';
import { FieldRenderer } from './FieldRenderer';
import { useConditionalLogic } from '../../hooks/useConditionalLogic';
import './FormRenderer.css';

export const FormRenderer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form, setForm] = useState<Form | null>(null);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const visibleFields = useConditionalLogic(form?.fields || [], responses);

    useEffect(() => {
        if (id) {
            loadForm(id);
        }
    }, [id]);

    const loadForm = async (formId: string) => {
        try {
            const result = await formService.getForm(formId);
            if (result.success) {
                setForm(result.data);
            }
        } catch (error) {
            console.error('Error loading form:', error);
        }
    };

    const handleFieldChange = (fieldId: string, value: any) => {
        setResponses(prev => ({ ...prev, [fieldId]: value }));
    };

    const validateForm = (): boolean => {
        const visibleRequiredFields = form?.fields.filter(
            field => field.required && visibleFields[field.id || '']
        );

        for (const field of visibleRequiredFields || []) {
            const value = responses[field.id || ''];
            if (!value || (typeof value === 'string' && !value.trim())) {
                alert(`Please fill in the required field: ${field.label}`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSubmitting(true);
            const result = await responseService.submitResponse({
                formId: id!,
                userIdentifier: 'user@example.com', // Replace with actual user identification
                responseData: responses,
            });

            if (result.success) {
                setSubmitted(true);
            } else {
                alert('Error submitting form: ' + result.message);
            }
        } catch (error: any) {
            console.error('Error submitting form:', error);
            alert('Error submitting form: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!form) return <div className="loading">Loading form...</div>;

    if (submitted) {
        return (
            <div className="form-renderer">
                <div className="success-message">
                    <h2>✅ {form.settings.successMessage || 'Form submitted successfully!'}</h2>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Back to Forms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="form-renderer">
            <div className="form-container">
                <div className="form-header">
                    <h1>{form.title}</h1>
                    {form.description && <p>{form.description}</p>}
                </div>

                <form onSubmit={handleSubmit}>
                    {form.fields
                        .filter(field => visibleFields[field.id || ''])
                        .sort((a, b) => a.order - b.order)
                        .map(field => (
                            <FieldRenderer
                                key={field.id}
                                field={field}
                                value={responses[field.id || ''] || ''}
                                onChange={(value) => field.id && handleFieldChange(field.id, value)}
                            />
                        ))}

                    <div className="form-actions">
                        <button type="submit" disabled={submitting} className="btn-primary btn-large">
                            {submitting ? 'Submitting...' : (form.settings.submitButtonText || 'Submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
