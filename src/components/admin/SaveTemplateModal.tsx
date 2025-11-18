import { useState } from "react";
import { toast } from "../../utils/toast";
import { X, Save, FileText, Clipboard, BarChart, File, User, Calendar, Star, Settings } from "lucide-react";
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
  const [selectedIcon, setSelectedIcon] = useState<any>(FileText);
  const [saving, setSaving] = useState(false);

  const icons = [
    { icon: FileText, name: "FileText" },
    { icon: Clipboard, name: "Clipboard" },
    { icon: BarChart, name: "BarChart" },
    { icon: File, name: "File" },
    { icon: User, name: "User" },
    { icon: Calendar, name: "Calendar" },
    { icon: Star, name: "Star" },
    { icon: Settings, name: "Settings" },
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
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="rounded-xl shadow-2xl max-w-md w-full"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{ borderBottom: '1px solid var(--border-light)' }}
        >
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Save as Template</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ color: 'var(--icon-secondary)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--border-light)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Template Name *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{ border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              placeholder="Enter template name"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg outline-none resize-none"
              style={{ border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              placeholder="Describe what this template is for"
              rows={3}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((iconItem) => {
                const IconComponent = iconItem.icon;
                return (
                  <button
                    key={iconItem.name}
                    type="button"
                    onClick={() => setSelectedIcon(iconItem.icon)}
                    className="w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition"
                    style={selectedIcon === iconItem.icon
                      ? { border: '2px solid var(--primary-500)', background: 'var(--primary-50)' }
                      : { border: '2px solid var(--border-light)' }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg p-4" style={{ background: 'var(--border-light)' }}>
            <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Template will include:
            </h4>
            <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
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
        <div
          className="px-6 py-4 flex gap-3"
          style={{ borderTop: '1px solid var(--border-light)' }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg transition"
            style={{ color: 'var(--text-primary)', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--border-light)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              !templateName.trim() || saving || form.fields.length === 0
            }
            className="flex-1 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
            style={
              !templateName.trim() || saving || form.fields.length === 0
                ? { background: 'var(--border-light)', color: 'var(--text-disabled)', cursor: 'not-allowed' }
                : { background: 'var(--primary-600)', color: 'var(--text-inverse)' }
            }
            onMouseOver={e => {
              if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--primary-700)';
            }}
            onMouseOut={e => {
              if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--primary-600)';
            }}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
