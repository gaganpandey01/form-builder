import { useCallback, useState } from "react";
import { toast } from "../../utils/toast";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import type {
  Form,
  FormField,
  FieldType,
  FieldTemplate,
  CustomTemplate,
} from "../../types";
import { generateId, generateQRCode } from "../../utils/generators";
import { getSmartDefaults } from "../../utils/fieldTemplates";

// Direct component imports instead of barrel exports
import { FieldEditor } from "./FieldEditor";
import { FormSettings } from "./FormSettings";
import { FieldTemplates } from "./FieldTemplates";
import { SaveTemplateModal } from "./SaveTemplateModal";
import { DatePurposeSelector as DatePurposeModal } from "../DatePurposeSelector";
import AddFieldSection from "./AddFieldSection";
import { FieldsList } from "./FieldsList";
import { FormHeader } from "./FormHeader";
import { QRPanel } from "./QRPanel";
import FormFooter from "./FormFooter";

// #region Types
interface AdminPanelProps {
  form: Form;
  setForm: (form: Form) => void;
  forms: Form[];
  setForms: (forms: Form[]) => void;
}
// #endregion

// #region Sortable Field Item
// Removed unused SortableFieldItem
// #endregion

// #region AdminPanel Main Component
export function AdminPanel({
  form,
  setForm,
  forms,
  setForms,
}: AdminPanelProps) {
  // #region State
  const [showSettings, setShowSettings] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDatePurposeModal, setShowDatePurposeModal] = useState(false);
  // #endregion

  // #region Constants
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
  // #endregion

  // #region Field Operations
  const addField = (type: FieldType["type"]) => {
    if (type === "date") {
      setShowDatePurposeModal(true);
      return;
    }

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
    toast.success(`${type} field added!`);
  };

  const handleDatePurposeSelect = (
    purpose: string,
    category: string,
    time: string
  ) => {
    const smartDefaults = getSmartDefaults("date");
    const newField: FormField = {
      id: generateId(),
      type: "date",
      label: purpose,
      required: false,
      placeholder: "",
      autofill: smartDefaults.autofill,
      metadata: {
        datePurpose: purpose,
        dateCategory: category,
        dateTime: time,
      },
    };
    setForm({ ...form, fields: [...form.fields, newField] });
    toast.success(`Date field "${purpose}" added!`);
    setShowDatePurposeModal(false);
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
  // #endregion

  // #region Drag and Drop
  // Removed unused sensors declaration

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = form.fields.findIndex((f) => f.id === String(active.id));
    const newIndex = form.fields.findIndex((f) => f.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const newFields = arrayMove(form.fields, oldIndex, newIndex);
    setForm({ ...form, fields: newFields });
  };
  // #endregion

  // #region Form Actions
  const saveForm = () => {
    setForms(forms.map((f) => (f.id === form.id ? form : f)));
    toast.success("Form saved successfully!");
  };
  const handleSaveTemplate = useCallback(() => {
    if (form.fields.length === 0) {
      toast.error("Add fields before saving as template");
      return;
    }
    setShowSaveTemplate(true);
  }, [form.fields.length]);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  // #endregion

  // #region Render
  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      {/* Form Header */}
      <FormHeader
        formTitle={form.title}
        setFormTitle={(title) => setForm({ ...form, title })}
        formDescription={form.description}
        setFormDescription={(desc) => setForm({ ...form, description: desc })}
        onSave={saveForm}
        onSaveTemplate={() => setShowSaveTemplate(true)}
        onSettings={() => setShowSettings(!showSettings)}
        onShowQR={() => setShowQR(!showQR)}
        onCopy={copyToClipboard}
        copied={copied}
        fieldsLength={form.fields.length}
        showSettings={showSettings}
        showQR={showQR}
      />

      {/* Settings Panel */}
      {showSettings && <FormSettings form={form} setForm={setForm} />}

      {/* QR Code Panel */}
      {showQR && (
        <QRPanel
          formUrl={formUrl}
          qrCodeSrc={generateQRCode(formUrl)}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* Form Fields List */}
      <FieldsList
        fields={form.fields}
        updateField={updateField}
        deleteField={deleteField}
        duplicateField={duplicateField}
        onDragEnd={handleDragEnd}
      />

      {/* Add Field Section */}
      <AddFieldSection
        fieldTypes={fieldTypes}
        addField={(type) => addField(type)}
        setShowTemplates={setShowTemplates}
      />

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
          onSaved={() => { }}
        />
      )}

      {/* Date Purpose Selection Modal */}
      <DatePurposeModal
        isOpen={showDatePurposeModal}
        onClose={() => setShowDatePurposeModal(false)}
        onSelect={handleDatePurposeSelect}
      />
      <FormFooter
        onSave={saveForm}
        onSaveTemplate={handleSaveTemplate}
        canSaveTemplate={form.fields.length > 0}
      />
    </div>
  );
  // #endregion
}
// #endregion
