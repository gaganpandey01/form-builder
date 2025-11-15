import React from "react";
import { Plus, Settings } from "lucide-react";

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
        <Settings className="w-12 h-12 text-purple-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">
        Create Your First Form
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Build professional forms with multiple field types, manage responses,
        and export data to Excel.
      </p>
      <button
        onClick={onCreateNew}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl transition font-medium text-lg"
      >
        <Plus className="w-5 h-5 inline mr-2" />
        Create New Form
      </button>
    </div>
  );
}
