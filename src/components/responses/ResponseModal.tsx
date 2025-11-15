import React from "react";
import { X } from "lucide-react";
import type { Form, FormResponse } from "../../types";

interface ResponseModalProps {
  response: FormResponse;
  form: Form;
  onClose: () => void;
}

export function ResponseModal({ response, form, onClose }: ResponseModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Response Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Submitted:</span>{" "}
              {new Date(response.submittedAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">User ID:</span>{" "}
              {response.userIdentifier}
            </p>
          </div>

          {form.fields.map((field) => (
            <div
              key={field.id}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              <p className="font-semibold text-gray-800 mb-2">{field.label}</p>
              <div className="bg-purple-50 rounded-lg px-4 py-3">
                <p className="text-gray-700">
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
