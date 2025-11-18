import { useCallback, useState, useEffect, useRef } from "react";
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
import { saveForm as apiSaveForm } from "../../utils/storage";


// Direct component imports instead of barrel exports
// import { FieldEditor } from "./FieldEditor";
import { FormSettings } from "./FormSettings";
import { FieldTemplates } from "./FieldTemplates";
import { SaveTemplateModal } from "./SaveTemplateModal";
import { DatePurposeSelector as DatePurposeModal } from "../DatePurposeSelector";
import AddFieldSection from "./AddFieldSection";
import { FieldsList } from "./FieldsList";
import { FormHeader } from "./FormHeader";
import { QRPanel } from "./QRPanel";
import FormFooter from "./FormFooter";


interface AdminPanelProps {
  form: Form;
  setForm: (form: Form) => void;
  forms: Form[];
  setForms: (forms: Form[]) => void;
}


export function AdminPanel({
  form,
  setForm,
  forms,
  setForms,
}: AdminPanelProps) {
  // Normalize form to ensure fields always exists
  const safeForm: Form = {
    ...form,
    fields: form.fields ?? [],
    settings: form.settings ?? ({} as Form["settings"]),
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDatePurposeModal, setShowDatePurposeModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");


  // Auto-save functionality with debouncing
  const saveTimeoutRef = useRef<number>(0);


  useEffect(() => {
    // Mark as unsaved when form changes
    setSaveStatus("unsaved");


    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }


    // Set new timeout for auto-save (debounced)
    saveTimeoutRef.current = window.setTimeout(() => {
      setSaveStatus("saving");


      // API integration point: Auto-save form changes to backend
      const updatedForms = forms.map((f) => (f.id === safeForm.id ? safeForm : f));
      setForms(updatedForms);


      // Mark as saved after a brief delay
      setTimeout(() => setSaveStatus("saved"), 500);
    }, 2000); // Auto-save after 2 seconds of inactivity


    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [safeForm, forms, setForms]);


  const formUrl = `${window.location.origin}?formId=${safeForm.id}`;


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


  // RECURSIVE HELPER: Update nested child fields
  const updateFieldRecursively = (
    fields: FormField[],
    targetId: string,
    updates: Partial<FormField>
  ): FormField[] => {
    return fields.map((field) => {
      // If this is the target field, update it
      if (field.id === targetId) {
        return { ...field, ...updates };
      }


      // If this field has conditional logic with child fields, search recursively
      if (field.conditionalLogic?.rules) {
        const updatedRules = field.conditionalLogic.rules.map((rule) => {
          if (Array.isArray(rule.childFields)) {
            return {
              ...rule,
              childFields: updateFieldRecursively(
                rule.childFields,
                targetId,
                updates
              ),
            };
          }
          return rule;
        });


        return {
          ...field,
          conditionalLogic: {
            ...field.conditionalLogic,
            rules: updatedRules,
          },
        };
      }


      return field;
    });
  };


  // RECURSIVE HELPER: Delete nested child fields
  const deleteFieldRecursively = (
    fields: FormField[],
    targetId: string
  ): FormField[] => {
    return fields
      .filter((field) => field.id !== targetId)
      .map((field) => {
        // If this field has conditional logic with child fields, search recursively
        if (field.conditionalLogic?.rules) {
          const updatedRules = field.conditionalLogic.rules.map((rule) => {
            if (Array.isArray(rule.childFields) && rule.childFields.length > 0) {
              return {
                ...rule,
                childFields: deleteFieldRecursively(
                  rule.childFields,
                  targetId
                ),
              };
            }
            return rule;
          });


          return {
            ...field,
            conditionalLogic: {
              ...field.conditionalLogic,
              rules: updatedRules,
            },
          };
        }


        return field;
      });
  };


  // RECURSIVE HELPER: Duplicate nested child fields
  const duplicateFieldRecursively = (
    fields: FormField[],
    targetId: string
  ): FormField[] => {
    const result: FormField[] = [];


    for (const field of fields) {
      // Create a deep copy to avoid mutation
      const fieldCopy: FormField = { ...field };
      result.push(fieldCopy);


      // If this is the target field, duplicate it
      if (field.id === targetId) {
        const duplicatedField: FormField = {
          ...field,
          id: generateId(),
          label: `${field.label} (Copy)`,
        };
        result.push(duplicatedField);
      }


      // If this field has conditional logic with child fields, search recursively
      if (field.conditionalLogic?.rules) {
        const updatedRules = field.conditionalLogic.rules.map((rule) => {
          if (Array.isArray(rule.childFields) && rule.childFields.length > 0) {
            return {
              ...rule,
              childFields: duplicateFieldRecursively(
                rule.childFields,
                targetId
              ),
            };
          }
          return rule;
        });


        // Get the last added field and update its conditional logic
        const lastFieldIndex = result.length - 1;
        result[lastFieldIndex] = {
          ...result[lastFieldIndex],
          conditionalLogic: {
            ...field.conditionalLogic,
            rules: updatedRules,
          },
        };
      }
    }


    return result;
  };


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
      // autofill: smartDefaults.autofill, // Removed because FormField does not support 'autofill'
    };
    setForm({ ...safeForm, fields: [...safeForm.fields, newField] });
    toast.success(`${type} field added!`);
  };


  const handleDatePurposeSelect = (
    purpose: string,
    category: string,
    time: string
  ) => {
    const newField: FormField = {
      id: generateId(),
      type: "date",
      label: purpose,
      required: false,
      placeholder: "",
      metadata: {
        datePurpose: purpose,
        dateCategory: category,
        dateTime: time,
      },
    };
    setForm({ ...safeForm, fields: [...safeForm.fields, newField] });
    toast.success(`Date field "${purpose}" added!`);
    setShowDatePurposeModal(false);
  };



  const addTemplate = (template: FieldTemplate | CustomTemplate) => {
    const newFields: FormField[] = template.fields.map((fieldData) => {
      if (!fieldData.type) {
        throw new Error('Template field must have a type');
      }
      return {
        ...fieldData,
        id: generateId(),
      } as FormField;
    });


    setForm({ ...safeForm, fields: [...safeForm.fields, ...newFields] });
    setShowTemplates(false);
  };


  // Updated updateField with recursive support
  const updateField = (id: string, updates: Partial<FormField>) => {
    setForm({
      ...safeForm,
      fields: updateFieldRecursively(safeForm.fields, id, updates),
    });
  };


  // Updated deleteField with recursive support
  const deleteField = (id: string) => {
    setForm({
      ...safeForm,
      fields: deleteFieldRecursively(safeForm.fields, id),
    });
  };


  // Updated duplicateField with recursive support
  const duplicateField = (id: string) => {
    setForm({
      ...safeForm,
      fields: duplicateFieldRecursively(safeForm.fields, id),
    });
  };


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;


    const oldIndex = safeForm.fields.findIndex((f) => f.id === String(active.id));
    const newIndex = safeForm.fields.findIndex((f) => f.id === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;


    const newFields = arrayMove(safeForm.fields, oldIndex, newIndex);
    setForm({ ...safeForm, fields: newFields });
  };


  const saveForm = async () => {
    // Ensure the form has required fields for saving
    if (!safeForm.title.trim()) {
      toast.error("Please add a form title before saving");
      return;
    }


    if (safeForm.fields.length === 0) {
      toast.warning("Form has no fields, but saving anyway");
    }


    setSaveStatus("saving");


    try {
      // Update last modified timestamp at root
      const updatedForm: Form = {
        ...safeForm,
        lastModified: new Date().toISOString()
      };


      // Save to backend API
      const result = await apiSaveForm(updatedForm);


      console.log("Saved form", result.data);
      if (result.success && result.data) {
        // Normalize the saved form to ensure fields/settings exist
        const saved: Form = {
          ...result.data,
          fields: result.data.fields ?? [],
          settings: result.data.settings ?? ({} as Form["settings"]),
        };


        // Update form state with saved data (includes new GUID id from backend)
        setForm(saved);


        // Update forms array: replace by id or add if new
        let nextForms = forms.map((f) =>
          f.id === safeForm.id || f.id === saved.id ? saved : f
        );


        if (!nextForms.some((f) => f.id === saved.id)) {
          nextForms = [...nextForms, saved];
        }


        setForms(nextForms);


        setSaveStatus("saved");
        toast.success("Form saved successfully!");
      } else {
        setSaveStatus("unsaved");
        toast.error(result.error || "Failed to save form");
      }
    } catch (error) {
      setSaveStatus("unsaved");
      console.error("Error saving form:", error);
      toast.error("Failed to save form. Please try again.");
    }
  };



  const handleSaveTemplate = useCallback(() => {
    if (safeForm.fields.length === 0) {
      toast.error("Add fields before saving as template");
      return;
    }
    setShowSaveTemplate(true);
  }, [safeForm.fields.length]);


  const copyToClipboard = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      <FormHeader
        formTitle={safeForm.title}
        setFormTitle={(title) => setForm({ ...safeForm, title })}
        formDescription={safeForm.description}
        setFormDescription={(desc) => setForm({ ...safeForm, description: desc })}
        onSave={saveForm}
        onSaveTemplate={() => setShowSaveTemplate(true)}
        onSettings={() => setShowSettings(!showSettings)}
        onShowQR={() => setShowQR(!showQR)}
        onCopy={copyToClipboard}
        saveStatus={saveStatus}
        copied={copied}
        fieldsLength={safeForm.fields.length}
        showSettings={showSettings}
        showQR={showQR}
      />


      {showSettings && <FormSettings form={safeForm} setForm={setForm} />}


      {showQR && (
        <QRPanel
          formUrl={formUrl}
          qrCodeSrc={generateQRCode(formUrl)}
          onClose={() => setShowQR(false)}
        />
      )}


      <FieldsList
        fields={safeForm.fields}
        updateField={updateField}
        deleteField={deleteField}
        duplicateField={duplicateField}
        onDragEnd={handleDragEnd}
      />


      <AddFieldSection
        fieldTypes={fieldTypes}
        addField={(type) => addField(type)}
        setShowTemplates={setShowTemplates}
      />


      {showTemplates && (
        <FieldTemplates
          onAddTemplate={addTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}


      {showSaveTemplate && (
        <SaveTemplateModal
          form={safeForm}
          onClose={() => setShowSaveTemplate(false)}
          onSaved={() => { }}
        />
      )}


      <DatePurposeModal
        isOpen={showDatePurposeModal}
        onClose={() => setShowDatePurposeModal(false)}
        onSelect={handleDatePurposeSelect}
      />


      <FormFooter
        onSave={saveForm}
        onSaveTemplate={handleSaveTemplate}
        canSaveTemplate={safeForm.fields.length > 0}
      />
    </div>
  );
}
