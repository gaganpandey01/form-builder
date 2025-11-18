
import { Plus, Settings } from "lucide-react";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="rounded-xl shadow-sm border p-16 text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
      <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, var(--primary-100), var(--accent-teal-100))' }}>
        <Settings className="w-12 h-12" style={{ color: 'var(--primary-600)' }} />
      </div>
      <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--primary-900)' }}>
        Create Your First Form
      </h2>
      <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--secondary-700)' }}>
        Build professional forms with multiple field types, manage responses,
        and export data to Excel.
      </p>
      <button
        onClick={onCreateNew}
        className="px-8 py-4 rounded-xl transition font-medium text-lg"
        style={{ background: 'linear-gradient(90deg, var(--primary-600), var(--primary-400))', color: 'var(--text-inverse)' }}
        onMouseOver={e => (e.currentTarget.style.boxShadow = '0 8px 32px 0 var(--shadow-lg)')}
        onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
      >
        <Plus className="w-5 h-5 inline mr-2" />
        Create New Form
      </button>
    </div>
  );
}
