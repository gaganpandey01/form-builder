import React, { useState } from "react";
import { toast } from "react-toastify";
import { X, Save } from "lucide-react";
import type { Form, CustomTemplate } from "../../types";
import { generateId } from "../../utils/generators";
import { addCustomTemplate } from "../../utils/templateStorage";

interface SaveTemplateModalProps {
  form: Form;
  onClose: () => void;
  onSaved: () => void;
}

export function SaveTemplateModal({
  form,
  onClose,
  onSaved,
}: SaveTemplateModalProps) {
  const [templateName, setTemplateName] = useState(form.title || "My Template");
  const [description, setDescription] = useState(
    form.description || "Custom template"
  );
  const [selectedIcon, setSelectedIcon] = useState("📝");
  const [saving, setSaving] = useState(false);

  const icons = [
    "📝",
    "📋",
    "📊",
    "📑",
    "📄",
    "🎯",
    "✅",
    "📌",
    "🎨",
    "⭐",
    "🔥",
    "💡",
  ];

  const handleSave = () => {
    if (!templateName.trim()) return;
    if (form.fields.length === 0) {
      toast.error("Cannot save template with no fields");
      return;
    }

    setSaving(true);

    const customTemplate: CustomTemplate = {
      id: generateId(),
      name: templateName.trim(),
      description: description.trim() || "Custom template",
      icon: selectedIcon,
      fields: form.fields.map((field) => ({
        ...field,
        id: generateId(), // Generate new IDs for template fields
      })),
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    try {
      addCustomTemplate(customTemplate);
      toast.success("Template saved successfully!");
      onSaved();
      onClose();
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Save as Template</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Enter template name"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              placeholder="Describe what this template is for"
              rows={3}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition ${
                    selectedIcon === icon
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">
              Template will include:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • {form.fields.length} field
                {form.fields.length !== 1 ? "s" : ""}
              </li>
              <li>• Field types and labels</li>
              <li>• Validation rules</li>
              <li>• Conditional logic (if any)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              !templateName.trim() || saving || form.fields.length === 0
            }
            className={`flex-1 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
              !templateName.trim() || saving || form.fields.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
