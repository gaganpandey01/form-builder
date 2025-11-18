import React, { useState } from 'react';
import type { FormField } from '../../types';
import { ConditionalLogicEditor } from './ConditionalLogicEditor';

interface FieldEditorProps {
    field: FormField;
    allFields: FormField[];
    onUpdate: (updates: Partial<FormField>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
    field,
    allFields,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
}) => {
    const [showConditionalLogic, setShowConditionalLogic] = useState(field.conditionalLogic?.enabled || false);
    const needsOptions = ['select', 'radio', 'checkbox'].includes(field.type);

    const handleOptionsChange = (value: string) => {
        const options = value.split('\n').filter(opt => opt.trim());
        onUpdate({ options });
    };

    return (
        <div className="field-editor">
            <div className="field-editor-header">
                <span className="field-type-badge">{field.type}</span>
                <div className="field-actions">
                    <button onClick={onMoveUp} className="btn-icon" title="Move Up">↑</button>
                    <button onClick={onMoveDown} className="btn-icon" title="Move Down">↓</button>
                    <button onClick={onDelete} className="btn-icon btn-danger" title="Delete">🗑️</button>
                </div>
            </div>

            <div className="field-editor-body">
                <div className="form-group">
                    <label>Field Label *</label>
                    <input
                        type="text"
                        value={field.label}
                        onChange={(e) => onUpdate({ label: e.target.value })}
                        placeholder="Enter field label"
                    />
                </div>

                <div className="form-group">
                    <label>Placeholder</label>
                    <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => onUpdate({ placeholder: e.target.value })}
                        placeholder="Enter placeholder text"
                    />
                </div>

                {needsOptions && (
                    <div className="form-group">
                        <label>Options (one per line)</label>
                        <textarea
                            value={field.options?.join('\n') || ''}
                            onChange={(e) => handleOptionsChange(e.target.value)}
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                            rows={4}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => onUpdate({ required: e.target.checked })}
                        />
                        Required Field
                    </label>
                </div>

                <div className="conditional-logic-section">
                    <button
                        onClick={() => setShowConditionalLogic(!showConditionalLogic)}
                        className="btn-secondary"
                    >
                        {showConditionalLogic ? '− Hide' : '+ Add'} Conditional Logic
                    </button>

                    {showConditionalLogic && (
                        <ConditionalLogicEditor
                            field={field}
                            allFields={allFields}
                            onUpdate={onUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
