import React from "react";
import type { Form, FormSettings as FormSettingsType } from "../../types";

interface FormSettingsProps {
  form: Form;
  setForm: (form: Form) => void;
}

export function FormSettings({ form, setForm }: FormSettingsProps) {
  const updateSettings = (updates: Partial<FormSettingsType>) => {
    setForm({ ...form, settings: { ...form.settings, ...updates } });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold mb-6">Form Settings</h3>

      <div className="space-y-6">
        {/* Multiple Responses */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.settings.allowMultipleResponses}
              onChange={(e) =>
                updateSettings({ allowMultipleResponses: e.target.checked })
              }
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <div>
              <span className="font-medium">Allow multiple responses</span>
              <p className="text-sm text-gray-500">
                Users can submit the form more than once
              </p>
            </div>
          </label>
        </div>

        {/* Multi-Step Form Settings */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-800 mb-4">Multi-Step Form</h4>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.settings.isMultiStep || false}
                onChange={(e) =>
                  updateSettings({
                    isMultiStep: e.target.checked,
                    stepsPerPage: e.target.checked ? 5 : undefined,
                    showProgressBar: e.target.checked ? true : undefined,
                  })
                }
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div>
                <span className="font-medium">Enable multi-step form</span>
                <p className="text-sm text-gray-500">
                  Break form into multiple steps for better user experience
                </p>
              </div>
            </label>

            {form.settings.isMultiStep && (
              <div className="ml-8 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Fields per step:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.settings.stepsPerPage || 5}
                    onChange={(e) =>
                      updateSettings({ stepsPerPage: parseInt(e.target.value) })
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.showProgressBar !== false}
                    onChange={(e) =>
                      updateSettings({ showProgressBar: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Show progress bar
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Close Type */}
        <div>
          <label className="block font-medium mb-3">Form Closing Options</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={form.settings.closeType === "manual"}
                onChange={() => updateSettings({ closeType: "manual" })}
                className="w-4 h-4 text-purple-600"
              />
              <span>Manual close only</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={form.settings.closeType === "datetime"}
                onChange={() => updateSettings({ closeType: "datetime" })}
                className="w-4 h-4 text-purple-600"
              />
              <span>Close at specific date and time</span>
            </label>

            {form.settings.closeType === "datetime" && (
              <input
                type="datetime-local"
                value={form.settings.closeDateTime || ""}
                onChange={(e) =>
                  updateSettings({ closeDateTime: e.target.value })
                }
                className="ml-7 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={form.settings.closeType === "custom"}
                onChange={() => updateSettings({ closeType: "custom" })}
                className="w-4 h-4 text-purple-600"
              />
              <span>Close after custom time</span>
            </label>

            {form.settings.closeType === "custom" && (
              <div className="ml-7 flex items-center gap-2">
                <input
                  type="number"
                  value={form.settings.customCloseTime || 24}
                  onChange={(e) =>
                    updateSettings({
                      customCloseTime: parseInt(e.target.value),
                    })
                  }
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  min="1"
                />
                <span className="text-sm text-gray-600">hours from now</span>
              </div>
            )}
          </div>
        </div>

        {/* Manual Close/Open */}
        <div>
          <button
            onClick={() =>
              updateSettings({ isClosed: !form.settings.isClosed })
            }
            className={`px-6 py-3 rounded-lg font-medium transition ${
              form.settings.isClosed
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {form.settings.isClosed ? "Open Form" : "Close Form"}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Current status:{" "}
            <span className="font-medium">
              {form.settings.isClosed ? "Closed" : "Open"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
