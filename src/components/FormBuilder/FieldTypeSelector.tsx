import React from 'react';

interface FieldTypeSelectorProps {
    onSelect: (type: string) => void;
}

export const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = ({ onSelect }) => {
    const fieldTypes = [
        { type: 'text', label: 'Text Input', icon: '📝' },
        { type: 'textarea', label: 'Text Area', icon: '📄' },
        { type: 'email', label: 'Email', icon: '📧' },
        { type: 'number', label: 'Number', icon: '🔢' },
        { type: 'date', label: 'Date', icon: '📅' },
        { type: 'time', label: 'Time', icon: '⏰' },
        { type: 'select', label: 'Dropdown', icon: '📋' },
        { type: 'radio', label: 'Radio Buttons', icon: '🔘' },
        { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
        { type: 'url', label: 'URL', icon: '🔗' },
    ];

    return (
        <div className="field-type-selector">
            <h3>Add Field</h3>
            <div className="field-types-grid">
                {fieldTypes.map(({ type, label, icon }) => (
                    <button
                        key={type}
                        onClick={() => onSelect(type)}
                        className="field-type-button"
                    >
                        <span className="field-type-icon">{icon}</span>
                        <span className="field-type-label">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
