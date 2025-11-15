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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          No Responses Yet
        </h2>
        <p className="text-gray-600">
          Responses will appear here once users submit the form.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {form.title} - Responses
            </h2>
            <p className="text-gray-600 mt-1">
              {responses.length} total responses
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "individual" : "table")
              }
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              {viewMode === "table" ? "Individual View" : "Table View"}
            </button>
            <button
              onClick={() => exportToExcel(form, responses)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Submission Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    User ID
                  </th>
                  {form.fields.map((field) => (
                    <th
                      key={field.id}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responses.map((response) => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(response.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {response.userIdentifier.substring(0, 8)}...
                    </td>
                    {form.fields.map((field) => (
                      <td
                        key={field.id}
                        className="px-6 py-4 text-sm text-gray-600"
                      >
                        {Array.isArray(response.responses[field.id])
                          ? response.responses[field.id].join(", ")
                          : response.responses[field.id] || "-"}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedResponse(response)}
                        className="text-purple-600 hover:text-purple-700 font-medium"
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
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(response.submittedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    User: {response.userIdentifier.substring(0, 8)}...
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {form.fields.map((field) => (
                  <div key={field.id}>
                    <p className="font-medium text-gray-700 mb-1">
                      {field.label}
                    </p>
                    <p className="text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
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
