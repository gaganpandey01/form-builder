import React from "react";
import { Plus, Layout } from "lucide-react";
import type { FieldType } from "../../types";

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
          className="px-4 py-2 rounded-lg transition text-sm font-medium touch-manipulation"
          style={{
            background: "var(--accent-light)",
            border: "2px solid var(--accent)",
            color: "var(--text-primary)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.border = "2px solid var(--accent-dark)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.border = "2px solid var(--accent)")
          }
        >
          <Layout className="w-4 h-4 inline mr-2" />
          Field Templates
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {fieldTypes.map(({ type, label }) => (
          <button
            key={String(type)}
            onClick={() => addField(type)}
            className="px-4 py-3 rounded-lg transition text-sm font-medium touch-manipulation min-h-[44px]"
            style={{
              background: "var(--primary-50)",
              border: "2px solid var(--primary-200)",
              color: "var(--text-primary)",
            }}
            onMouseOver={(e) =>
            (e.currentTarget.style.border =
              "2px solid var(--primary-400)")
            }
            onMouseOut={(e) =>
            (e.currentTarget.style.border =
              "2px solid var(--primary-200)")
            }
          >
            <Plus className="w-4 h-4 inline mr-2" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AddFieldSection;
