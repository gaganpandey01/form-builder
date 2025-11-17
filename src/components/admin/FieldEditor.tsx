import { useState } from "react";
import {
  Trash2,
  X,
  GripVertical,
  Settings,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";
import type { FormField, ConditionalRule } from "../../types";

interface FieldEditorProps {
  field: FormField;
  index: number;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  allFields: FormField[];
  isDragging?: boolean;
  dragHandleProps?: any;
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
}: FieldEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConditional, setShowConditional] = useState(false);

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
      enabled: false,
      condition: "show",
      rules: [],
      operator: "and",
    };

    const newRule: ConditionalRule = {
      fieldId: "",
      operator: "equals",
      value: "",
    };

    updateField(field.id, {
      conditionalLogic: {
        ...conditionalLogic,
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
    updateField(field.id, {
      conditionalLogic: {
        ...conditionalLogic,
        rules: conditionalLogic.rules.filter((_, i) => i !== ruleIndex),
      },
    });
  };

  const availableFields = allFields.filter((f) => f.id !== field.id);

  const updateAutofillSettings = (updates: Partial<FormField["autofill"]>) => {
    updateField(field.id, {
      autofill: { ...field.autofill, ...updates },
    });
  };

  return (
    <div
      className={`rounded-xl border transition-all ${isDragging ? "opacity-50 rotate-2" : ""
        }`}
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border-medium)",
        boxShadow: "0 1px 3px var(--shadow-sm), 0 1px 2px var(--shadow-sm)",
      }}
    >
      {/* Header Section */}
      <div
        className="p-4 sm:p-6 border-b"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-2 rounded-lg touch-manipulation transition-colors hover:bg-gray-50"
              style={{ color: "var(--text-secondary)" }}
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={field.label}
                onChange={(e) =>
                  updateField(field.id, { label: e.target.value })
                }
                className="text-lg font-semibold w-full px-3 py-2 rounded-lg transition-all outline-none border-2 min-h-[44px] sm:min-h-auto"
                style={{
                  color: "var(--text-primary)",
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-light)",
                }}
                placeholder="Question"
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--primary-500)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-light)")
                }
              />
              <p
                className="text-xs mt-2 px-3 font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Field #{index + 1} • {field.type.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-3">
            <button
              onClick={() => duplicateField(field.id)}
              className="p-2.5 rounded-lg transition-all touch-manipulation hover:bg-blue-50"
              style={{ color: "var(--primary-600)" }}
              title="Duplicate field"
            >
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2.5 rounded-lg transition-all touch-manipulation ${showAdvanced ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              style={{ color: "var(--text-secondary)" }}
              title="Advanced settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => deleteField(field.id)}
              className="p-2.5 rounded-lg transition-all touch-manipulation hover:bg-red-50"
              style={{ color: "var(--error)" }}
              title="Delete field"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* Placeholder Input */}
        {field.type !== "checkbox" &&
          field.type !== "radio" &&
          field.type !== "select" && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Placeholder Text
              </label>
              <input
                type="text"
                value={field.placeholder || ""}
                onChange={(e) =>
                  updateField(field.id, { placeholder: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg transition-all outline-none border-2 min-h-[44px]"
                style={{
                  border: "2px solid var(--border-medium)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
                placeholder="Enter placeholder text"
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--primary-500)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-medium)")
                }
              />
            </div>
          )}

        {/* Options Section */}
        {(field.type === "select" ||
          field.type === "radio" ||
          field.type === "checkbox") && (
            <div>
              <label
                className="block text-sm font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Options
              </label>
              <div className="space-y-3">
                {field.options?.map((opt, i) => (
                  <div key={i} className="flex gap-3">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg transition-all outline-none border-2 min-h-[44px]"
                      style={{
                        border: "2px solid var(--border-medium)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--primary-500)")
                      }
                      onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--border-medium)")
                      }
                    />
                    <button
                      onClick={() => removeOption(i)}
                      className="px-4 py-3 rounded-lg transition-all touch-manipulation min-h-[44px] min-w-[44px] hover:bg-red-50"
                      style={{ color: "var(--error)" }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="text-sm font-semibold py-2.5 px-4 rounded-lg transition-all hover:bg-blue-50"
                  style={{ color: "var(--primary-600)" }}
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

        {/* Required Field Checkbox */}
        <div
          className="p-4 rounded-lg"
          style={{ background: "var(--bg-secondary)" }}
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                updateField(field.id, { required: e.target.checked })
              }
              className="w-5 h-5 rounded focus:ring-2 outline-none"
              style={{ accentColor: "var(--primary-600)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Required field
            </span>
          </label>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div
            className="pt-6 mt-6 space-y-6"
            style={{ borderTop: "2px solid var(--border-light)" }}
          >
          

          

            {/* Validation Settings */}
            <div
              className="p-5 rounded-lg space-y-4"
              style={{ background: "var(--bg-secondary)" }}
            >
              <h5
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Validation Rules
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Min Length
                  </label>
                  <input
                    type="number"
                    value={field.validation?.minLength || ""}
                    onChange={(e) =>
                      updateField(field.id, {
                        validation: {
                          ...field.validation,
                          minLength: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg transition-all outline-none border-2 text-sm min-h-[44px]"
                    style={{
                      border: "2px solid var(--border-medium)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--primary-500)")
                    }
                    onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--border-medium)")
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Max Length
                  </label>
                  <input
                    type="number"
                    value={field.validation?.maxLength || ""}
                    onChange={(e) =>
                      updateField(field.id, {
                        validation: {
                          ...field.validation,
                          maxLength: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg transition-all outline-none border-2 text-sm min-h-[44px]"
                    style={{
                      border: "2px solid var(--border-medium)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--primary-500)")
                    }
                    onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--border-medium)")
                    }
                  />
                </div>
              </div>


              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Custom Error Message
                </label>
                <input
                  type="text"
                  value={field.validation?.customMessage || ""}
                  onChange={(e) =>
                    updateField(field.id, {
                      validation: {
                        ...field.validation,
                        customMessage: e.target.value || undefined,
                      },
                    })
                  }
                  placeholder="Please enter a valid value"
                  className="w-full px-4 py-3 rounded-lg transition-all outline-none border-2 text-sm min-h-[44px]"
                  style={{
                    border: "2px solid var(--border-medium)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--primary-500)")
                  }
                  onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "var(--border-medium)")
                  }
                />
              </div>
            </div>

            {/* Conditional Logic */}
            <div
              className="p-5 rounded-lg"
              style={{ background: "var(--bg-secondary)" }}
            >
              <button
                onClick={() => setShowConditional(!showConditional)}
                className="flex items-center gap-2 text-lg font-semibold w-full py-2 touch-manipulation transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                {showConditional ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
                Conditional Logic
              </button>

              {showConditional && (
                <div className="mt-4 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/50">
                    <input
                      type="checkbox"
                      checked={field.conditionalLogic?.enabled || false}
                      onChange={(e) =>
                        updateField(field.id, {
                          conditionalLogic: {
                            enabled: e.target.checked,
                            condition: "show",
                            rules: [],
                            operator: "and",
                            ...(field.conditionalLogic || {}),
                          },
                        })
                      }
                      className="w-5 h-5 rounded focus:ring-2 outline-none"
                      style={{ accentColor: "var(--primary-600)" }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Enable conditional logic
                    </span>
                  </label>

                  {field.conditionalLogic?.enabled && (
                    <div
                      className="space-y-4 p-4 rounded-lg"
                      style={{
                        background: "var(--bg-primary)",
                        border: "2px solid var(--border-light)",
                      }}
                    >
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <select
                          value={field.conditionalLogic.condition}
                          onChange={(e) =>
                            updateField(field.id, {
                              conditionalLogic: {
                                ...field.conditionalLogic!,
                                condition: e.target.value as "show" | "hide",
                              },
                            })
                          }
                          className="px-1 py-1 rounded-lg transition-all outline-none border-2 text-sm min-h-[30px] font-semibold"
                          style={{
                            border: "2px solid var(--border-medium)",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                          }}
                        >
                          <option value="show">Show</option>
                          <option value="hide">Hide</option>
                        </select>
                        <span
                          className="text-base font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          this field if:
                        </span>
                      </div>

                      {field.conditionalLogic.rules.map((rule, ruleIndex) => (
                        <div
                          key={ruleIndex}
                          className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 sm:items-center p-3 rounded-lg"
                          style={{ background: "var(--bg-secondary)" }}
                        >
                          <select
                            value={rule.fieldId}
                            onChange={(e) =>
                              updateConditionalRule(ruleIndex, {
                                fieldId: e.target.value,
                              })
                            }
                            className="w-full sm:flex-1 px-4 py-3 rounded-lg transition-all outline-none border-2 text-sm min-h-[44px]"
                            style={{
                              border: "2px solid var(--border-medium)",
                              background: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                          >
                            <option value="">Select field</option>
                            {availableFields.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label}
                              </option>
                            ))}
                          </select>

                          <select
                            value={rule.operator}
                            onChange={(e) =>
                              updateConditionalRule(ruleIndex, {
                                operator: e.target
                                  .value as ConditionalRule["operator"],
                              })
                            }
                            className="w-full sm:w-auto px-4 py-3 rounded-lg transition-all outline-none border-2 text-sm min-h-[44px]"
                            style={{
                              border: "2px solid var(--border-medium)",
                              background: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                          >
                            <option value="equals">equals</option>
                            <option value="not_equals">not equals</option>
                            <option value="contains">contains</option>
                            <option value="not_contains">not contains</option>
                            <option value="greater_than">greater than</option>
                            <option value="less_than">less than</option>
                          </select>

                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) =>
                              updateConditionalRule(ruleIndex, {
                                value: e.target.value,
                              })
                            }
                            placeholder="Value"
                            className="w-full sm:flex-1 px-4 py-3 rounded-lg transition-all outline-none border-2 text-sm min-h-[44px]"
                            style={{
                              border: "2px solid var(--border-medium)",
                              background: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                          />

                          <button
                            onClick={() => removeConditionalRule(ruleIndex)}
                            className="w-full sm:w-auto px-4 py-3 rounded-lg transition-all hover:bg-red-50 touch-manipulation min-h-[44px]"
                            style={{ color: "var(--error)" }}
                          >
                            <X className="w-5 h-5 mx-auto" />
                          </button>
                        </div>
                      ))}

                      {field.conditionalLogic.rules.length > 1 && (
                        <div className="pt-3">
                          <label
                            className="block text-sm font-semibold mb-3"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Logic Operator:
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/50">
                              <input
                                type="radio"
                                checked={
                                  field.conditionalLogic.operator === "and"
                                }
                                onChange={() =>
                                  updateField(field.id, {
                                    conditionalLogic: {
                                      ...field.conditionalLogic!,
                                      operator: "and",
                                    },
                                  })
                                }
                                className="w-5 h-5 rounded"
                                style={{ accentColor: "var(--primary-600)" }}
                              />
                              <span
                                className="text-sm font-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                AND (all rules must match)
                              </span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/50">
                              <input
                                type="radio"
                                checked={
                                  field.conditionalLogic.operator === "or"
                                }
                                onChange={() =>
                                  updateField(field.id, {
                                    conditionalLogic: {
                                      ...field.conditionalLogic!,
                                      operator: "or",
                                    },
                                  })
                                }
                                className="w-5 h-5 rounded"
                                style={{ accentColor: "var(--primary-600)" }}
                              />
                              <span
                                className="text-sm font-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                OR (any rule can match)
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={addConditionalRule}
                        className="text-sm font-semibold py-2.5 px-4 rounded-lg transition-all hover:bg-blue-50 w-full sm:w-auto"
                        style={{ color: "var(--primary-600)" }}
                      >
                        + Add Rule
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}