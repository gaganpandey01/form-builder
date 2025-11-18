import React from 'react';
import type { FormField, ConditionalLogic, ConditionalRule } from '../../types';

interface ConditionalLogicEditorProps {
    field: FormField;
    allFields: FormField[];
    onUpdate: (updates: Partial<FormField>) => void;
}

export const ConditionalLogicEditor: React.FC<ConditionalLogicEditorProps> = ({
    field,
    allFields,
    onUpdate,
}) => {
    const logic: ConditionalLogic = field.conditionalLogic || {
        enabled: true,
        condition: 'show',
        operator: 'and',
        rules: [],
    };

    const updateLogic = (updates: Partial<ConditionalLogic>) => {
        onUpdate({
            conditionalLogic: { ...logic, ...updates, enabled: true },
        });
    };

    const addRule = () => {
        updateLogic({
            rules: [...logic.rules, { fieldId: '', operator: 'equals', value: '' }],
        });
    };

    const updateRule = (index: number, updates: Partial<ConditionalRule>) => {
        const newRules = logic.rules.map((rule, i) =>
            i === index ? { ...rule, ...updates } : rule
        );
        updateLogic({ rules: newRules });
    };

    const removeRule = (index: number) => {
        updateLogic({
            rules: logic.rules.filter((_, i) => i !== index),
        });
    };

    const availableFields = allFields.filter(f => f.id !== field.id);

    return (
        <div className="conditional-logic-editor">
            <div className="logic-header">
                <select
                    value={logic.condition}
                    onChange={(e) => updateLogic({ condition: e.target.value as 'show' | 'hide' })}
                >
                    <option value="show">Show</option>
                    <option value="hide">Hide</option>
                </select>
                <span>this field when</span>
                {logic.rules.length > 1 && (
                    <select
                        value={logic.operator}
                        onChange={(e) => updateLogic({ operator: e.target.value as 'and' | 'or' })}
                    >
                        <option value="and">All</option>
                        <option value="or">Any</option>
                    </select>
                )}
                <span>of the following conditions are met:</span>
            </div>

            {logic.rules.map((rule, index) => (
                <div key={index} className="rule-editor">
                    <select
                        value={rule.fieldId}
                        onChange={(e) => updateRule(index, { fieldId: e.target.value })}
                    >
                        <option value="">Select Field</option>
                        {availableFields.map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                    </select>

                    <select
                        value={rule.operator}
                        onChange={(e) => updateRule(index, { operator: e.target.value as any })}
                    >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="not_contains">Not Contains</option>
                        <option value="starts_with">Starts With</option>
                        <option value="ends_with">Ends With</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="is_empty">Is Empty</option>
                        <option value="is_not_empty">Is Not Empty</option>
                    </select>

                    {!['is_empty', 'is_not_empty'].includes(rule.operator) && (
                        <input
                            type="text"
                            placeholder="Value"
                            value={rule.value}
                            onChange={(e) => updateRule(index, { value: e.target.value })}
                        />
                    )}

                    <button onClick={() => removeRule(index)} className="btn-icon btn-danger">
                        ×
                    </button>
                </div>
            ))}

            <button onClick={addRule} className="btn-secondary btn-small">
                + Add Rule
            </button>
        </div>
    );
};
