import React, { useState } from "react";
import { Plus, Eye, Settings, Users, ChevronDown } from "lucide-react";
import type { Form, ViewType } from "../../types";

interface HeaderProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  onCreateNew: () => void;
  forms: Form[];
  setSelectedFormId: (id: string) => void;
  setCurrentForm: (form: Form) => void;
  currentForm: Form | null;
}

export function Header({
  view,
  setView,
  onCreateNew,
  forms,
  setSelectedFormId,
  setCurrentForm,
  currentForm,
}: HeaderProps) {
  const [showFormList, setShowFormList] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              FormBuilder Pro
            </h1>
            <div className="relative">
              <button
                onClick={() => setShowFormList(!showFormList)}
                className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                <span>Select Form</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFormList && (
                <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-lg w-64 max-h-96 overflow-auto z-50">
                  {forms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => {
                        setSelectedFormId(form.id);
                        setCurrentForm(form);
                        setShowFormList(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b"
                    >
                      <div className="font-medium">{form.title}</div>
                      <div className="text-xs text-gray-500">
                        {form.fields.length} fields
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("admin")}
              className={`px-4 py-2 rounded-lg transition ${
                view === "admin"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Builder
            </button>
            <button
              onClick={() => {
                if (currentForm) {
                  setSelectedFormId(currentForm.id);
                }
                setView("form");
              }}
              className={`px-4 py-2 rounded-lg transition ${
                view === "form"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Preview
            </button>
            <button
              onClick={() => {
                if (currentForm) {
                  setSelectedFormId(currentForm.id);
                }
                setView("responses");
              }}
              className={`px-4 py-2 rounded-lg transition ${
                view === "responses"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Responses
            </button>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              New Form
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
