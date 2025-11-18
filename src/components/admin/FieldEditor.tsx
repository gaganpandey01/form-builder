import { useState } from "react";
import {
  Trash2,
  X,
  GripVertical,
  Settings,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Calendar,
} from "lucide-react";
import type { FormField, ConditionalRule } from "../../types";
import { DatePurposeSelector } from "../DatePurposeSelector";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface FieldEditorProps {
  field: FormField;
  index: number;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  allFields: FormField[];
  isDragging?: boolean;
  dragHandleProps?: any;
  depth?: number;
  parentPath?: string;
}

export function FieldEditor({
  field,
  index,
  updateField,
  deleteField,
  duplicateField,
  allFields,
  isDragging,
  dragHandleProps,
  depth = 0,
  parentPath = "",
}: FieldEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConditional, setShowConditional] = useState(false);
  const [showDatePurposeModal, setShowDatePurposeModal] = useState(false);
  const [pendingDateRuleIndex, setPendingDateRuleIndex] = useState<number | null>(null);
  const [dateValue, setDateValue] = useState<Date | null>(null);

  const indentationStyle = {
    marginLeft: `${depth * 12}px`,
    borderLeft: depth > 0 ? "2px solid var(--primary-300)" : "none",
    paddingLeft: depth > 0 ? "6px" : "0",
  };

  const getQuestionNumber = () => {
    if (depth === 0) {
      return `Q${index + 1}`;
    }
    return `${parentPath}.${index + 1}`;
  };

  const currentQuestionNumber = getQuestionNumber();

  const addOption = () => {
    const options = field.options || [];
    updateField(field.id, {
      options: [...options, `Option ${options.length + 1}`],
    });
  };

  const updateOption = (optIndex: number, value: string) => {
    const options = [...(field.options || [])];
    options[optIndex] = value;
    updateField(field.id, { options });
  };

  const removeOption = (optIndex: number) => {
    updateField(field.id, {
      options: field.options?.filter((_, i) => i !== optIndex),
    });
  };

  const addConditionalRule = () => {
    const conditionalLogic = field.conditionalLogic || {
      enabled: true,
      condition: "show",
      rules: [],
      operator: "and",
    };

    const newRule: ConditionalRule = {
      fieldId: field.id,
      operator: "equals",
      value: "",
      triggerType: "yes",
      childFields: [],
    };

    updateField(field.id, {
      conditionalLogic: {
        ...conditionalLogic,
        enabled: true,
        rules: [...conditionalLogic.rules, newRule],
      },
    });
  };

  const updateConditionalRule = (
    ruleIndex: number,
    updates: Partial<ConditionalRule>
  ) => {
    const conditionalLogic = field.conditionalLogic!;
    const newRules = [...conditionalLogic.rules];
    newRules[ruleIndex] = { ...newRules[ruleIndex], ...updates };

    updateField(field.id, {
      conditionalLogic: {
        ...conditionalLogic,
        rules: newRules,
      },
    });
  };

  const removeConditionalRule = (ruleIndex: number) => {
    const conditionalLogic = field.conditionalLogic!;
    const remainingRules = conditionalLogic.rules.filter((_, i) => i !== ruleIndex);

    updateField(field.id, {
      conditionalLogic: {
        ...conditionalLogic,
        rules: remainingRules,
        enabled: remainingRules.length > 0,
      },
    });
  };

  const handleDatePurposeSelect = (purpose: string, category: string, timeType: string) => {
    if (pendingDateRuleIndex === null) return;

    const conditionalLogic = field.conditionalLogic!;
    const rule = conditionalLogic.rules[pendingDateRuleIndex];

    const newChildField: FormField = {
      id: `${field.id}-child-${Date.now()}-${Math.random()}`,
      type: "date",
      label: purpose,
      required: false,
      parentId: field.id,
      depth: (field.depth || 0) + 1,
      placeholder: "",
      metadata: {
        datePurpose: purpose,
        dateCategory: category,
        dateTime: timeType,
      },
    };

    const childFields = rule.childFields || [];
    updateConditionalRule(pendingDateRuleIndex, {
      childFields: [...childFields, newChildField],
    });

    setShowDatePurposeModal(false);
    setPendingDateRuleIndex(null);
  };

  const addChildQuestion = (ruleIndex: number, fieldType: FormField["type"] = "text") => {
    if (fieldType === 'date') {
      setPendingDateRuleIndex(ruleIndex);
      setShowDatePurposeModal(true);
      return;
    }

    const conditionalLogic = field.conditionalLogic!;
    const rule = conditionalLogic.rules[ruleIndex];

    const newChildField: FormField = {
      id: `${field.id}-child-${Date.now()}-${Math.random()}`,
      type: fieldType,
      label: `New ${fieldType} question`,
      required: false,
      parentId: field.id,
      depth: (field.depth || 0) + 1,
      ...(fieldType === "select" || fieldType === "radio" || fieldType === "checkbox"
        ? { options: ["Option 1"] }
        : {}),
      ...(fieldType !== "select" && fieldType !== "radio" && fieldType !== "checkbox"
        ? { placeholder: `Enter ${fieldType}...` }
        : {}),
    };

    const childFields = rule.childFields || [];
    updateConditionalRule(ruleIndex, {
      childFields: [...childFields, newChildField],
    });
  };

  const updateChildField = (
    ruleIndex: number,
    childIndex: number,
    updates: Partial<FormField>
  ) => {
    const conditionalLogic = field.conditionalLogic!;
    const rule = conditionalLogic.rules[ruleIndex];
    const childFields = [...(rule.childFields || [])];
    childFields[childIndex] = { ...childFields[childIndex], ...updates };

    updateConditionalRule(ruleIndex, {
      childFields,
    });
  };

  const deleteChildField = (ruleIndex: number, childIndex: number) => {
    const conditionalLogic = field.conditionalLogic!;
    const rule = conditionalLogic.rules[ruleIndex];
    const childFields = (rule.childFields || []).filter((_, i) => i !== childIndex);

    updateConditionalRule(ruleIndex, {
      childFields,
    });
  };

  const duplicateChildField = (ruleIndex: number, childIndex: number) => {
    const conditionalLogic = field.conditionalLogic!;
    const rule = conditionalLogic.rules[ruleIndex];
    const childFields = [...(rule.childFields || [])];
    const fieldToDuplicate = childFields[childIndex];

    const duplicatedField: FormField = {
      ...fieldToDuplicate,
      id: `${fieldToDuplicate.id}-copy-${Date.now()}`,
      label: `${fieldToDuplicate.label} (Copy)`,
    };

    updateConditionalRule(ruleIndex, {
      childFields: [...childFields, duplicatedField],
    });
  };

  return (
    <>
      <div style={indentationStyle} className="mb-2">
        <div
          className={`rounded-lg border transition-all ${isDragging ? "opacity-50 rotate-2" : ""}`}
          style={{
            background: depth > 0 ? "var(--bg-secondary)" : "var(--bg-primary)",
            borderColor: depth > 0 ? "var(--primary-200)" : "var(--border-medium)",
            boxShadow: "0 1px 2px var(--shadow-sm)",
          }}
        >
          {/* Compact Header */}
          <div className="p-2 sm:p-3 border-b" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {depth === 0 && (
                  <div {...dragHandleProps} className="cursor-grab p-1" style={{ color: "var(--text-secondary)" }}>
                    <GripVertical className="w-4 h-4" />
                  </div>
                )}

                {depth > 0 && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "var(--primary-100)",
                      color: "var(--primary-600)",
                      border: "1px solid var(--primary-300)",
                    }}
                  >
                    {depth}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={field.label || ""}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="text-sm font-semibold w-full px-2 py-1 rounded border"
                    style={{
                      color: "var(--text-primary)",
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border-light)",
                    }}
                    placeholder={`${currentQuestionNumber} - Question`}
                  />
                  <p className="text-xs mt-0.5 px-2" style={{ color: "var(--text-secondary)" }}>
                    {currentQuestionNumber} • {field.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => duplicateField(field.id)}
                  className="p-1.5 rounded hover:bg-blue-50"
                  style={{ color: "var(--primary-600)" }}
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`p-1.5 rounded ${showAdvanced ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  style={{ color: "var(--text-secondary)" }}
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="p-1.5 rounded hover:bg-red-50"
                  style={{ color: "var(--error)" }}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Compact Content */}
          <div className="p-2 sm:p-3 space-y-2">
            {/* Date Picker */}
            {field.type === "date" && (
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-primary)" }}>Date</label>
                <div className="relative">
                  <DatePicker
                    selected={dateValue}
                    onChange={(date) => setDateValue(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText={field.placeholder || "Select date"}
                    className="w-full px-2 py-1.5 pr-8 rounded border text-xs"
                    showPopperArrow={false}
                    isClearable
                  />
                  <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--icon-secondary)" }} />
                </div>
                {field.metadata && (
                  <div className="mt-1 p-1.5 rounded text-xs" style={{ background: "var(--bg-secondary)" }}>
                    <p><strong>Purpose:</strong> {field.metadata.datePurpose}</p>
                  </div>
                )}
              </div>
            )}

            {/* Placeholder */}
            {field.type !== "checkbox" && field.type !== "radio" && field.type !== "select" && field.type !== "date" && (
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-primary)" }}>Placeholder</label>
                <input
                  type="text"
                  value={field.placeholder || ""}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border text-xs"
                  placeholder="Enter placeholder"
                />
              </div>
            )}

            {/* Options */}
            {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-primary)" }}>Options</label>
                <div className="space-y-1.5">
                  {field.options?.map((option, idx) => (
                    <div key={idx} className="flex gap-1.5">
                      <input
                        type="text"
                        value={option || ""}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded border text-xs"
                        placeholder={`Option ${idx + 1}`}
                      />
                      <button onClick={() => removeOption(idx)} className="p-1.5 rounded hover:bg-red-50" style={{ color: "var(--error)" }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="w-full px-2 py-1.5 rounded border border-dashed text-xs font-medium hover:bg-blue-50"
                    style={{ borderColor: "var(--primary-300)", color: "var(--primary-600)" }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            )}

            {/* Required */}
            <div className="flex items-center justify-between p-2 rounded" style={{ background: "var(--bg-secondary)" }}>
              <label className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Required</label>
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="w-4 h-4 rounded"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="border-t p-2 sm:p-3 space-y-2" style={{ borderColor: "var(--border-light)" }}>
              {/* Split Screen: Validation | Conditional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Left: Validation */}
                <div className="p-2 rounded space-y-2" style={{ background: "var(--bg-secondary)" }}>
                  <h6 className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Validation</h6>

                  {/* Min/Max in same line */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Min</label>
                      <input
                        type="number"
                        value={field.validation?.minLength || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            validation: { ...field.validation, minLength: e.target.value ? parseInt(e.target.value) : undefined },
                          })
                        }
                        className="w-full px-2 py-1 rounded border text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Max</label>
                      <input
                        type="number"
                        value={field.validation?.maxLength || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            validation: { ...field.validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined },
                          })
                        }
                        className="w-full px-2 py-1 rounded border text-xs"
                        placeholder="∞"
                      />
                    </div>
                  </div>

                  {/* Error Message Below */}
                  <div>
                    <label className="block text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Error Msg</label>
                    <input
                      type="text"
                      value={field.validation?.customMessage || ""}
                      onChange={(e) =>
                        updateField(field.id, {
                          validation: { ...field.validation, customMessage: e.target.value || undefined },
                        })
                      }
                      placeholder="Custom error"
                      className="w-full px-2 py-1 rounded border text-xs"
                    />
                  </div>
                </div>

                {/* Right: Conditional Logic */}
                <div className="p-2 rounded" style={{ background: "var(--bg-secondary)" }}>
                  <button
                    onClick={() => setShowConditional(!showConditional)}
                    className="flex items-center justify-between w-full text-xs font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span>Conditional</span>
                    {showConditional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showConditional && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.conditionalLogic?.enabled || false}
                          onChange={(e) =>
                            updateField(field.id, {
                              conditionalLogic: {
                                enabled: e.target.checked,
                                condition: "show",
                                rules: field.conditionalLogic?.rules || [],
                                operator: "and",
                              },
                            })
                          }
                          className="w-3.5 h-3.5 rounded"
                        />
                        <span className="text-xs" style={{ color: "var(--text-primary)" }}>Enable</span>
                      </label>

                      {field.conditionalLogic?.enabled && (
                        <div className="space-y-2">
                          {field.conditionalLogic.rules.map((rule, ruleIdx) => (
                            <div key={ruleIdx} className="p-2 rounded border text-xs" style={{ borderColor: "var(--border-medium)" }}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Rule {ruleIdx + 1}</span>
                                <button onClick={() => removeConditionalRule(ruleIdx)} className="p-0.5 hover:bg-red-50" style={{ color: "var(--error)" }}>
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <select
                                value={rule.triggerType || "yes"}
                                onChange={(e) =>
                                  updateConditionalRule(ruleIdx, {
                                    triggerType: e.target.value as "yes" | "no" | "custom",
                                    value: e.target.value === "yes" ? "yes" : e.target.value === "no" ? "no" : "",
                                  })
                                }
                                className="w-full px-2 py-1 rounded border text-xs mb-1"
                              >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                                <option value="custom">Custom</option>
                              </select>

                              {rule.triggerType === "custom" && (
                                <input
                                  type="text"
                                  value={rule.value || ""}
                                  onChange={(e) => updateConditionalRule(ruleIdx, { value: e.target.value })}
                                  placeholder="Value"
                                  className="w-full px-2 py-1 rounded border text-xs mb-1"
                                />
                              )}

                              {rule.childFields && rule.childFields.length > 0 && (
                                <div className="mt-1 space-y-1">
                                  {rule.childFields.map((childField, childIdx) => (
                                    <FieldEditor
                                      key={childField.id}
                                      field={childField}
                                      index={childIdx}
                                      updateField={(id, updates) => updateChildField(ruleIdx, childIdx, updates)}
                                      deleteField={() => deleteChildField(ruleIdx, childIdx)}
                                      duplicateField={() => duplicateChildField(ruleIdx, childIdx)}
                                      allFields={allFields}
                                      depth={(field.depth || 0) + 1}
                                      parentPath={currentQuestionNumber}
                                    />
                                  ))}
                                </div>
                              )}

                              <div className="mt-1 flex gap-1 flex-wrap">
                                {["text", "number", "email", "date"].map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => addChildQuestion(ruleIdx, type as FormField["type"])}
                                    className="px-1.5 py-0.5 rounded text-xs hover:bg-blue-50"
                                    style={{ border: "1px solid var(--primary-300)", color: "var(--primary-600)" }}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={addConditionalRule}
                            className="w-full px-2 py-1 rounded border border-dashed text-xs font-medium hover:bg-blue-50"
                            style={{ borderColor: "var(--primary-300)", color: "var(--primary-600)" }}
                          >
                            + Rule
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDatePurposeModal && (
        <DatePurposeSelector
          isOpen={showDatePurposeModal}
          onSelect={handleDatePurposeSelect}
          onClose={() => {
            setShowDatePurposeModal(false);
            setPendingDateRuleIndex(null);
          }}
        />
      )}
    </>
  );
}
