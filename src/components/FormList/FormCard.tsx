import React from 'react';
import type { Form } from '../../types';

interface FormCardProps {
    form: Form;
    onEdit: () => void;
    onView: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

export const FormCard: React.FC<FormCardProps> = ({
    form,
    onEdit,
    onView,
    onDelete,
    onDuplicate
}) => {
    return (
        <div className="form-card">
            <h3>{form.title}</h3>
            <p>{form.description || 'No description'}</p>
            <div className="form-card-meta">
                <span>{form.fields.length} fields</span>
                <span>{new Date(form.createdAt || '').toLocaleDateString()}</span>
            </div>
            <div className="form-card-actions">
                <button onClick={onView} className="btn-primary">View</button>
                <button onClick={onEdit} className="btn-secondary">Edit</button>
                <button onClick={onDuplicate} className="btn-secondary">Duplicate</button>
                <button onClick={onDelete} className="btn-danger">Delete</button>
            </div>
        </div>
    );
};
