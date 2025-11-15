import React from "react";
import type { FormField } from "../../types";

interface FormFieldInputProps {
  field: FormField;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  onFileChange: (file: File) => void;
  error?: string;
}
export function FormFieldInput({
  field,
  value,
  onChange,
  onFileChange,
  error,
}: FormFieldInputProps) {
  const baseInputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors min-h-[44px] text-base ${
    error
      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
      : "border-gray-300"
  }`;

  const getAutofillProps = () => {
    const props: any = {};
    if (field.autofill?.autocomplete) {
      props.autoComplete = field.autofill.autocomplete;
    }
    if (field.autofill?.inputMode) {
      props.inputMode = field.autofill.inputMode;
    }
    if (field.autofill?.pattern) {
      props.pattern = field.autofill.pattern;
    }
    return props;
  };

  switch (field.type) {
    case "text":
    case "email":
    case "url":
    case "phone":
      return (
        <input
          type={field.type === "phone" ? "tel" : field.type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className={baseInputClasses}
          {...getAutofillProps()}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className={baseInputClasses}
          {...getAutofillProps()}
        />
      );

    case "textarea":
      return (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={4}
          className={`${baseInputClasses} resize-y min-h-[100px]`}
          {...getAutofillProps()}
        />
      );

    case "date":
      return (
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={baseInputClasses}
          {...getAutofillProps()}
        />
      );

    case "time":
      return (
        <input
          type="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={baseInputClasses}
          {...getAutofillProps()}
        />
      );

    case "select":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={`${baseInputClasses} bg-white`}
          {...getAutofillProps()}
        >
          <option value="">Select an option</option>
          {field.options?.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "radio":
      return (
        <div className="space-y-3">
          {field.options?.map((opt, i) => (
            <label
              key={i}
              className="flex items-center gap-3 cursor-pointer py-2 touch-manipulation"
            >
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
                className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-700 text-base">{opt}</span>
            </label>
          ))}
        </div>
      );

    case "checkbox":
      return (
        <div className="space-y-3">
          {field.options?.map((opt, i) => (
            <label
              key={i}
              className="flex items-center gap-3 cursor-pointer py-2 touch-manipulation"
            >
              <input
                type="checkbox"
                checked={Array.isArray(value) ? value.includes(opt) : false}
                onChange={(e) => {
                  const currentValue: string[] = Array.isArray(value)
                    ? [...value]
                    : value
                    ? [value]
                    : [];
                  if (e.target.checked) {
                    if (!currentValue.includes(opt)) {
                      onChange([...currentValue, opt]);
                    }
                  } else {
                    onChange(currentValue.filter((v: string) => v !== opt));
                  }
                }}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-700 text-base">{opt}</span>
            </label>
          ))}
        </div>
      );

    case "file":
      return (
        <div>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileChange(file);
                onChange(file.name);
              }
            }}
            required={field.required}
            className={`${baseInputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:text-sm`}
          />
          <p className="text-sm text-gray-500 mt-2">
            Note: File upload using Multer (backend integration pending)
          </p>
        </div>
      );

    default:
      return null;
  }
}
