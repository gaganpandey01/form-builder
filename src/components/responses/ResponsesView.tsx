import { useState } from "react";
import { Users, Download } from "lucide-react";
import type { Form, FormResponse } from "../../types";
import { exportToExcel } from "../../utils/export";
import { ResponseModal } from "./ResponseModal";

interface ResponsesViewProps {
  form: Form;
  responses: FormResponse[];
}

export function ResponsesView({ form, responses }: ResponsesViewProps) {
  // API integration point: Connect to backend to fetch form responses
  // Example: const { data: responses, loading } = useQuery('/api/forms/:id/responses')
  const [viewMode, setViewMode] = useState<"table" | "individual">("individual"); // Default to card view
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null
  );

  if (responses.length === 0) {
    return (
      <div
        className="rounded-xl shadow-sm border p-12 text-center"
        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
      >
        <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--icon-disabled)' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          No Responses Yet
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Responses will appear here once users submit the form.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl shadow-sm border p-6"
        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {form.title} - Responses
            </h2>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
              {responses.length} total responses
            </p>
          </div>
          <div className="flex gap-2">
            {/* API integration point: Save user view preferences */}
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "individual" : "table")
              }
              className="px-3 py-1.5 rounded-md transition text-sm"
              style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--border-medium)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--border-light)')}
            >
              {viewMode === "table" ? "Cards" : "Table"}
            </button>
            {/* API integration point: Connect to export service for different formats */}
            <button
              onClick={() => exportToExcel(form, responses)}
              className="px-3 py-1.5 rounded-md transition text-sm"
              style={{ background: 'var(--success)', color: 'var(--text-inverse)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--success-dark)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--success)')}
            >
              <Download className="w-3 h-3 inline mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div
          className="rounded-xl shadow-sm border overflow-hidden"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'var(--border-light)', borderBottom: '1px solid var(--border-medium)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Submission Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    User ID
                  </th>
                  {form.fields.map((field) => (
                    <th
                      key={field.id}
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr
                    key={response.id}
                    style={{ cursor: 'pointer' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--border-light)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
                  >
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(response.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {response.userIdentifier.substring(0, 8)}...
                    </td>
                    {form.fields.map((field) => (
                      <td
                        key={field.id}
                        className="px-6 py-4 text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {Array.isArray(response.responses[field.id])
                          ? response.responses[field.id].join(", ")
                          : response.responses[field.id] || "-"}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedResponse(response)}
                        className="font-medium"
                        style={{ color: 'var(--primary-600)' }}
                        onMouseOver={e => (e.currentTarget.style.color = 'var(--primary-700)')}
                        onMouseOut={e => (e.currentTarget.style.color = 'var(--primary-600)')}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* API integration point: Add real-time updates for new responses */}
          {responses.map((response) => (
            <div
              key={response.id}
              className="rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
              onClick={() => setSelectedResponse(response)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }}></div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Response #{responses.indexOf(response) + 1}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(response.submittedAt).toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    User: {response.userIdentifier.substring(0, 8)}...
                  </p>
                </div>
                <button
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}
                  onClick={(e) => { e.stopPropagation(); setSelectedResponse(response); }}
                >
                  View
                </button>
              </div>
              <div className="space-y-2">
                {form.fields.slice(0, 3).map((field) => (
                  <div key={field.id} className="border-l-2 pl-2" style={{ borderColor: 'var(--border-medium)' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {field.label}
                    </p>
                    <p
                      className="text-xs px-2 py-1 rounded text-ellipsis overflow-hidden"
                      style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
                    >
                      {Array.isArray(response.responses[field.id])
                        ? response.responses[field.id].join(", ")
                        : response.responses[field.id] || "-"}
                    </p>
                  </div>
                ))}
                {form.fields.length > 3 && (
                  <p className="text-xs text-center pt-2" style={{ color: 'var(--text-secondary)' }}>
                    +{form.fields.length - 3} more fields
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedResponse && (
        <ResponseModal
          response={selectedResponse}
          form={form}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  );
}
