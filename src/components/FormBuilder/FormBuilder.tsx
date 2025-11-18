import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formService } from '../../services/formServices';
import type { Form, FormField } from '../../types';
import { FieldEditor } from './FieldEditor';
import { FieldTypeSelector } from './FieldTypeSelector';
import './FormBuilder.css';

export const FormBuilder: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form, setForm] = useState<Form>({
        title: '',
        description: '',
        fields: [],
        settings: {
            allowMultipleResponses: true,
            isClosed: false,
            isMultiStep: false,
            stepsPerPage: 5,
            showProgressBar: true,
        },
    });
    const [saving, setSaving] = useState(false);

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

    const addField = (type: string) => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            type: type as any,
            label: `New ${type} field`,
            required: false,
            order: form.fields.length + 1,
            depth: 0,
            conditionalLogic: {
                enabled: false,
                condition: 'show',
                operator: 'and',
                rules: [],
            },
        };

        setForm(prev => ({
            ...prev,
            fields: [...prev.fields, newField],
        }));
    };

    const updateField = (fieldId: string, updates: Partial<FormField>) => {
        setForm(prev => ({
            ...prev,
            fields: prev.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
            ),
        }));
    };

    const deleteField = (fieldId: string) => {
        setForm(prev => ({
            ...prev,
            fields: prev.fields.filter(field => field.id !== fieldId),
        }));
    };

    const moveField = (fieldId: string, direction: 'up' | 'down') => {
        const index = form.fields.findIndex(f => f.id === fieldId);
        if (index === -1) return;

        const newFields = [...form.fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newFields.length) return;

        [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];

        newFields.forEach((field, idx) => {
            field.order = idx + 1;
        });

        setForm(prev => ({ ...prev, fields: newFields }));
    };

    const saveForm = async () => {
        if (!form.title.trim()) {
            alert('Please enter a form title');
            return;
        }

        try {
            setSaving(true);
            const result = id
                ? await formService.updateForm(id, form)
                : await formService.createForm(form);

            if (result.success) {
                alert('Form saved successfully!');
                navigate('/');
            } else {
                alert('Error saving form: ' + (result.errors?.join(', ') || result.message));
            }
        } catch (error: any) {
            console.error('Error saving form:', error);
            alert('Error saving form: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="form-builder">
            <div className="form-builder-header">
                <button onClick={() => navigate('/')} className="btn-secondary">
                    ← Back
                </button>
                <h1>{id ? 'Edit Form' : 'Create New Form'}</h1>
                <button onClick={saveForm} disabled={saving} className="btn-primary">
                    {saving ? 'Saving...' : 'Save Form'}
                </button>
            </div>

            <div className="form-builder-content">
                <div className="form-header-editor">
                    <input
                        type="text"
                        placeholder="Form Title"
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        className="form-title-input"
                    />
                    <textarea
                        placeholder="Form Description (optional)"
                        value={form.description || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        className="form-description-input"
                        rows={3}
                    />
                </div>

                <div className="form-settings">
                    <h3>Form Settings</h3>
                    <label>
                        <input
                            type="checkbox"
                            checked={form.settings.allowMultipleResponses}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                settings: { ...prev.settings, allowMultipleResponses: e.target.checked }
                            }))}
                        />
                        Allow Multiple Responses
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={form.settings.showProgressBar}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                settings: { ...prev.settings, showProgressBar: e.target.checked }
                            }))}
                        />
                        Show Progress Bar
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={form.settings.isMultiStep}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                settings: { ...prev.settings, isMultiStep: e.target.checked }
                            }))}
                        />
                        Multi-Step Form
                    </label>
                </div>

                <div className="fields-section">
                    <h3>Form Fields</h3>
                    {form.fields.length === 0 && (
                        <p className="no-fields-message">No fields added yet. Select a field type below to get started.</p>
                    )}
                    {form.fields
                        .sort((a, b) => a.order - b.order)
                        .map((field) => (
                            <FieldEditor
                                key={field.id}
                                field={field}
                                allFields={form.fields}
                                onUpdate={(updates) => field.id && updateField(field.id, updates)}
                                onDelete={() => field.id && deleteField(field.id)}
                                onMoveUp={() => field.id && moveField(field.id, 'up')}
                                onMoveDown={() => field.id && moveField(field.id, 'down')}
                            />
                        ))}
                </div>

                <FieldTypeSelector onSelect={addField} />
            </div>
        </div>
    );
};
