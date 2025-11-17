// FormFooter.tsx
import React from 'react';
import { Save, Plus } from 'lucide-react';

interface FormFooterProps {
    onSave: () => void;
    onSaveTemplate: () => void;
    canSaveTemplate?: boolean;
}

const FormFooter: React.FC<FormFooterProps> = ({
    onSave,
    onSaveTemplate,
    canSaveTemplate = true
}) => {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 p-4 shadow-lg z-50"
            style={{
                background: 'var(--bg-primary)',
                borderTop: '1px solid var(--border-light)',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
        >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 justify-end">
                {/* Save Template Button */}
                <button
                    type="button"
                    onClick={onSaveTemplate}
                    disabled={!canSaveTemplate}
                    className="px-4 py-2.5 rounded-lg transition touch-manipulation text-sm font-medium"
                    style={
                        canSaveTemplate
                            ? {
                                background: 'var(--warning)',
                                color: 'var(--text-inverse)',
                                border: 'none'
                            }
                            : {
                                background: 'var(--border-light)',
                                color: 'var(--text-disabled)',
                                cursor: 'not-allowed',
                                border: 'none'
                            }
                    }
                    title={
                        canSaveTemplate
                            ? "Save this form as a reusable template"
                            : "Add fields to save as template"
                    }
                    onMouseOver={e => {
                        if (canSaveTemplate) {
                            e.currentTarget.style.background = 'var(--warning-dark)';
                        }
                    }}
                    onMouseOut={e => {
                        if (canSaveTemplate) {
                            e.currentTarget.style.background = 'var(--warning)';
                        }
                    }}
                >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Save Template
                </button>

                {/* Primary Save Button */}
                <button
                    type="button"
                    onClick={onSave}
                    className="w-full sm:w-auto sm:min-w-[200px] px-6 py-3 rounded-lg transition touch-manipulation font-semibold text-base shadow-md"
                    style={{ background: 'var(--success)', color: 'var(--text-inverse)' }}
                    onMouseOver={e => {
                        e.currentTarget.style.background = 'var(--success-dark)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = 'var(--success)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <Save className="w-5 h-5 inline mr-2" />
                    Save Form
                </button>
            </div>
        </div>
    );
};

export default FormFooter;
