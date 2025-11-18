import { useEffect, useState } from 'react';
import type { FormField, ConditionalRule } from '../types';

export const useConditionalLogic = (
    fields: FormField[],
    responses: Record<string, any>
) => {
    const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const newVisibility: Record<string, boolean> = {};

        fields.forEach(field => {
            if (!field.id) return;

            if (field.conditionalLogic?.enabled) {
                const shouldShow = evaluateRules(
                    field.conditionalLogic.rules,
                    field.conditionalLogic.operator
                );
                newVisibility[field.id] =
                    field.conditionalLogic.condition === 'show' ? shouldShow : !shouldShow;
            } else {
                newVisibility[field.id] = true;
            }
        });

        setVisibleFields(newVisibility);
    }, [fields, responses]);

    const evaluateRules = (rules: ConditionalRule[], operator: 'and' | 'or'): boolean => {
        if (!rules || rules.length === 0) return false;

        const results = rules.map(rule => {
            const fieldValue = responses[rule.fieldId];

            switch (rule.operator) {
                case 'equals':
                    return fieldValue === rule.value;
                case 'not_equals':
                    return fieldValue !== rule.value;
                case 'contains':
                    return fieldValue?.toString().includes(rule.value);
                case 'not_contains':
                    return !fieldValue?.toString().includes(rule.value);
                case 'starts_with':
                    return fieldValue?.toString().startsWith(rule.value);
                case 'ends_with':
                    return fieldValue?.toString().endsWith(rule.value);
                case 'greater_than':
                    return parseFloat(fieldValue) > parseFloat(rule.value);
                case 'less_than':
                    return parseFloat(fieldValue) < parseFloat(rule.value);
                case 'is_empty':
                    return !fieldValue || fieldValue === '';
                case 'is_not_empty':
                    return fieldValue && fieldValue !== '';
                default:
                    return false;
            }
        });

        return operator === 'and'
            ? results.every(result => result)
            : results.some(result => result);
    };

    return visibleFields;
};
