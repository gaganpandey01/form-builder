import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Save,
  Settings,
  QrCode,
  Copy,
  Check,
  X,
  Layout,
} from "lucide-react";
import type {
  Form,
  FormField,
  FieldType,
  FieldTemplate,
  CustomTemplate,
} from "../../types";
import { generateId, generateQRCode } from "../../utils/generators";
import { getSmartDefaults } from "../../utils/fieldTemplates";
import { FieldEditor } from "./FieldEditor";
import { FormSettings } from "./FormSettings";
import { FieldTemplates } from "./FieldTemplates";
import { SaveTemplateModal } from "./SaveTemplateModal";

interface AdminPanelProps {
  form: Form;
  setForm: (form: Form) => void;
  forms: Form[];
  setForms: (forms: Form[]) => void;
}

function SortableFieldItem({
  field,
  index,
  updateField,
  deleteField,
  allFields,
}: {
  field: FormField;
  index: number;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  allFields: FormField[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
  };

  // dragHandleProps contains attributes & listeners to spread on the drag handle inside FieldEditor
  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <FieldEditor
        field={field}
        index={index}
        updateField={updateField}
        deleteField={deleteField}
        allFields={allFields}
        isDragging={isDragging}
        dragHandleProps={dragHandleProps}
        duplicateField={function (id: string): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
}

export function AdminPanel({
  form,
  setForm,
  forms,
  setForms,
}: AdminPanelProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [copied, setCopied] = useState(false);

  const formUrl = `${window.location.origin}?formId=${form.id}`;

  const fieldTypes: FieldType[] = [
    { type: "text", label: "Short Text" },
    { type: "textarea", label: "Long Text" },
    { type: "email", label: "Email" },
    { type: "number", label: "Number" },
    { type: "phone", label: "Phone" },
    { type: "url", label: "URL" },
    { type: "date", label: "Date" },
    { type: "time", label: "Time" },
    { type: "select", label: "Dropdown" },
    { type: "radio", label: "Multiple Choice" },
    { type: "checkbox", label: "Checkboxes" },
    { type: "file", label: "File Upload" },
  ];

  const addField = (type: FormField["type"]) => {
    const smartDefaults = getSmartDefaults(type);
    const newField: FormField = {
      id: generateId(),
      type,
      label: `New ${type} field`,
      required: false,
      placeholder:
        "placeholder" in smartDefaults ? smartDefaults.placeholder : "",
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? ["Option 1"]
          : undefined,
      autofill: smartDefaults.autofill,
    };
    setForm({ ...form, fields: [...form.fields, newField] });
  };

  const addTemplate = (template: FieldTemplate | CustomTemplate) => {
    const newFields = template.fields.map((fieldData) => ({
      ...fieldData,
      id: generateId(),
    }));
    setForm({ ...form, fields: [...form.fields, ...newFields] });
    setShowTemplates(false);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setForm({
      ...form,
      fields: form.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const deleteField = (id: string) => {
    setForm({
      ...form,
      fields: form.fields.filter((f) => f.id !== id),
    });
  };

  const duplicateField = (id: string) => {
    const fieldToDuplicate = form.fields.find((f) => f.id === id);
    if (fieldToDuplicate) {
      const duplicatedField: FormField = {
        ...fieldToDuplicate,
        id: generateId(),
        label: `${fieldToDuplicate.label} (Copy)`,
      };
      const fieldIndex = form.fields.findIndex((f) => f.id === id);
      const newFields = [...form.fields];
      newFields.splice(fieldIndex + 1, 0, duplicatedField);
      setForm({ ...form, fields: newFields });
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = form.fields.findIndex((f) => f.id === String(active.id));
    const newIndex = form.fields.findIndex((f) => f.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const newFields = arrayMove(form.fields, oldIndex, newIndex);
    setForm({ ...form, fields: newFields });
  };

  const saveForm = () => {
    setForms(forms.map((f) => (f.id === form.id ? form : f)));
    toast.success("Form saved successfully!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Form Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="text-2xl sm:text-3xl font-bold w-full border-none outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 min-h-[44px]"
          placeholder="Form Title"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full mt-4 border-none outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 text-gray-600 min-h-[80px] resize-y"
          placeholder="Form Description"
          rows={2}
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={saveForm}
            className="flex-1 sm:flex-none px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition touch-manipulation"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save Form
          </button>
          <button
            onClick={() => setShowSaveTemplate(true)}
            disabled={form.fields.length === 0}
            className={`flex-1 sm:flex-none px-4 py-3 rounded-lg transition touch-manipulation ${
              form.fields.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
            title={
              form.fields.length === 0
                ? "Add fields to save as template"
                : "Save this form as a reusable template"
            }
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Save as Template
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex-1 sm:flex-none px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition touch-manipulation"
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex-1 sm:flex-none px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition touch-manipulation"
          >
            <QrCode className="w-4 h-4 inline mr-2" />
            QR Code
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 sm:flex-none px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition touch-manipulation"
          >
            {copied ? (
              <Check className="w-4 h-4 inline mr-2" />
            ) : (
              <Copy className="w-4 h-4 inline mr-2" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && <FormSettings form={form} setForm={setForm} />}

      {/* QR Code Panel */}
      {showQR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">QR Code</h3>
            <button
              onClick={() => setShowQR(false)}
              className="touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={generateQRCode(formUrl)}
              alt="Form QR Code"
              className="border-4 border-gray-200 rounded-lg max-w-full h-auto"
            />
            <p className="mt-4 text-sm text-gray-600 break-all text-center">
              {formUrl}
            </p>
          </div>
        </div>
      )}

      {/* Form Fields with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={form.fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {form.fields.map((field, index) => (
              <SortableFieldItem
                key={field.id}
                field={field}
                index={index}
                updateField={updateField}
                deleteField={deleteField}
                allFields={form.fields}
              />
            ))}

            {form.fields.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm sm:text-base">
                  No fields added yet. Add your first field below.
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Field Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="font-semibold text-lg">Add Field</h3>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition text-sm font-medium touch-manipulation"
          >
            <Layout className="w-4 h-4 inline mr-2" />
            Field Templates
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fieldTypes.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => addField(type)}
              className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition text-sm font-medium touch-manipulation min-h-[44px]"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Field Templates Modal */}
      {showTemplates && (
        <FieldTemplates
          onAddTemplate={addTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <SaveTemplateModal
          form={form}
          onClose={() => setShowSaveTemplate(false)}
          onSaved={() => {
            // Success message is now shown in SaveTemplateModal component
          }}
        />
      )}
    </div>
  );
}
