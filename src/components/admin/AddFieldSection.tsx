import React from "react";
import { Plus, Layout } from "lucide-react";


import type { FormField } from "../../types";

type AddFieldSectionProps = {
  fieldTypes: { type: FormField["type"]; label: string }[];
  addField: (type: FormField["type"]) => void;
  setShowTemplates: (show: boolean) => void;
};

const AddFieldSection: React.FC<AddFieldSectionProps> = ({
  fieldTypes,
  addField,
  setShowTemplates,
}) => {
  return (
    <div
      className="rounded-xl shadow-sm border p-4 sm:p-6"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border-light)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h3
          className="font-semibold text-lg"
          style={{ color: "var(--text-primary)" }}
        >
          Add Field
        </h3>
        <button
          onClick={() => setShowTemplates(true)}
          className="px-3 py-1.5 rounded-md transition text-xs font-medium touch-manipulation"
          style={{
            background: "var(--accent-light)",
            border: "1px solid var(--accent)",
            color: "var(--text-primary)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.border = "1px solid var(--accent-dark)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.border = "1px solid var(--accent)")
          }
        >
          <Layout className="w-3 h-3 inline mr-1" />
          Templates
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* API integration point: Fetch available field types from backend configuration */}
        {fieldTypes.map(({ type, label }) => (
          <button
            key={String(type)}
            onClick={() => addField(type)}
            className="px-2 py-2 rounded-md transition text-xs font-medium touch-manipulation min-h-[32px]"
            style={{
              background: "var(--primary-50)",
              border: "1px solid var(--primary-200)",
              color: "var(--text-primary)",
            }}
            onMouseOver={(e) =>
            (e.currentTarget.style.border =
              "1px solid var(--primary-400)")
            }
            onMouseOut={(e) =>
            (e.currentTarget.style.border =
              "1px solid var(--primary-200)")
            }
          >
            <Plus className="w-3 h-3 inline mr-1" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AddFieldSection;
