
import { X } from "lucide-react";
import type { Form, FormResponse } from "../../types";

interface ResponseModalProps {
  response: FormResponse;
  form: Form;
  onClose: () => void;
}

export function ResponseModal({ response, form, onClose }: ResponseModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div
          className="sticky top-0 flex justify-between items-center px-6 py-4"
          style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}
        >
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Response Details</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ color: 'var(--icon-secondary)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--border-light)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-lg p-4" style={{ background: 'var(--border-light)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium">Submitted:</span>{' '}
              {new Date(response.submittedAt).toLocaleString()}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium">User ID:</span>{' '}
              {response.userIdentifier}
            </p>
          </div>

          {form.fields.map((field) => (
            <div
              key={field.id}
              className="pb-4 last:border-0"
              style={{ borderBottom: '1px solid var(--border-light)' }}
            >
              <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{field.label}</p>
              <div className="rounded-lg px-4 py-3" style={{ background: 'var(--accent-light)' }}>
                <p style={{ color: 'var(--text-primary)' }}>
                  {Array.isArray(response.responses[field.id])
                    ? response.responses[field.id].join(", ")
                    : response.responses[field.id] || "No response"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
