import React from 'react';
import type { FormField } from '../../types';

interface FieldRendererProps {
    field: FormField;
    value: any;
    onChange: (value: any) => void;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange }) => {
    const renderInput = () => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'url':
            case 'number':
            case 'date':
            case 'time':
            case 'datetime':
                return (
                    <input
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="form-input"
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="form-textarea"
                        rows={4}
                    />
                );

            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={field.required}
                        className="form-select"
                    >
                        <option value="">Select an option</option>
                        {field.options?.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case 'radio':
                return (
                    <div className="radio-group">
                        {field.options?.map((option, index) => (
                            <label key={index} className="radio-label">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => onChange(e.target.value)}
                                    required={field.required}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="checkbox-group">
                        {field.options?.map((option, index) => (
                            <label key={index} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    value={option}
                                    checked={(value || []).includes(option)}
                                    onChange={(e) => {
                                        const currentValues = value || [];
                                        const newValues = e.target.checked
                                            ? [...currentValues, option]
                                            : currentValues.filter((v: string) => v !== option);
                                        onChange(newValues);
                                    }}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                );

            default:
                return <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
        }
    };

    return (
        <div className="field-wrapper">
            <label className="field-label">
                {field.label}
                {field.required && <span className="required-indicator"> *</span>}
            </label>
            {renderInput()}
            {field.metadata?.helpText && (
                <div className="field-help-text">{field.metadata.helpText}</div>
            )}
        </div>
    );
};
