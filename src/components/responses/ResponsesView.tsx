import React, { useState } from "react";
import { Users, Download } from "lucide-react";
import type { Form, FormResponse } from "../../types";
import { exportToExcel } from "../../utils/export";
import { ResponseModal } from "./ResponseModal";

interface ResponsesViewProps {
  form: Form;
  responses: FormResponse[];
}

export function ResponsesView({ form, responses }: ResponsesViewProps) {
  const [viewMode, setViewMode] = useState<"table" | "individual">("table");
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
          <div className="flex gap-3">
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "individual" : "table")
              }
              className="px-4 py-2 rounded-lg transition"
              style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--border-medium)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--border-light)')}
            >
              {viewMode === "table" ? "Individual View" : "Table View"}
            </button>
            <button
              onClick={() => exportToExcel(form, responses)}
              className="px-4 py-2 rounded-lg transition"
              style={{ background: 'var(--success)', color: 'var(--text-inverse)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--success-dark)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--success)')}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export to Excel
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
        <div className="space-y-4">
          {responses.map((response) => (
            <div
              key={response.id}
              className="rounded-xl shadow-sm border p-6"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Submitted: {new Date(response.submittedAt).toLocaleString()}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    User: {response.userIdentifier.substring(0, 8)}...
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {form.fields.map((field) => (
                  <div key={field.id}>
                    <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {field.label}
                    </p>
                    <p
                      className="px-4 py-2 rounded-lg"
                      style={{ color: 'var(--text-secondary)', background: 'var(--border-light)' }}
                    >
                      {Array.isArray(response.responses[field.id])
                        ? response.responses[field.id].join(", ")
                        : response.responses[field.id] || "-"}
                    </p>
                  </div>
                ))}
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
