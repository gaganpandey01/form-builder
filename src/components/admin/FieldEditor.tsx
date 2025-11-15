import React, { useState } from "react";
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
  // Drag and drop props
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
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 transition-all ${
        isDragging ? "opacity-50 rotate-2" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded touch-manipulation"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="text-lg font-semibold w-full border-b-2 border-transparent hover:border-gray-300 focus:border-purple-500 outline-none px-2 py-1 min-h-[44px] sm:min-h-auto"
              placeholder="Question"
            />
            <p className="text-sm text-gray-500 mt-1 px-2">
              Field #{index + 1} • {field.type}
            </p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 ml-2">
          <button
            onClick={() => duplicateField(field.id)}
            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition touch-manipulation"
            title="Duplicate field"
          >
            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-500 hover:bg-gray-50 p-2 rounded-lg transition touch-manipulation"
            title="Advanced settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => deleteField(field.id)}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition touch-manipulation"
            title="Delete field"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {field.type !== "checkbox" &&
          field.type !== "radio" &&
          field.type !== "select" && (
            <input
              type="text"
              value={field.placeholder || ""}
              onChange={(e) =>
                updateField(field.id, { placeholder: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none min-h-[44px]"
              placeholder="Placeholder text"
            />
          )}

        {(field.type === "select" ||
          field.type === "radio" ||
          field.type === "checkbox") && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Options:</p>
            {field.options?.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none min-h-[44px]"
                />
                <button
                  onClick={() => removeOption(i)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition touch-manipulation min-h-[44px] min-w-[44px]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium py-2 touch-manipulation"
            >
              + Add Option
            </button>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer py-2">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) =>
              updateField(field.id, { required: e.target.checked })
            }
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Required field
          </span>
        </label>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-800">Advanced Settings</h4>

            {/* Autofill Settings */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-700">
                Autofill & Mobile Optimization
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autocomplete
                  </label>
                  <select
                    value={field.autofill?.autocomplete || ""}
                    onChange={(e) =>
                      updateAutofillSettings({
                        autocomplete: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
                  >
                    <option value="">Select autocomplete</option>
                    <option value="name">Full Name</option>
                    <option value="given-name">First Name</option>
                    <option value="family-name">Last Name</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="organization">Company</option>
                    <option value="organization-title">Job Title</option>
                    <option value="street-address">Street Address</option>
                    <option value="address-line1">Address Line 1</option>
                    <option value="address-line2">Address Line 2</option>
                    <option value="address-level1">State/Province</option>
                    <option value="address-level2">City</option>
                    <option value="postal-code">ZIP/Postal Code</option>
                    <option value="country-name">Country</option>
                    <option value="bday">Birthday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input Mode (Mobile)
                  </label>
                  <select
                    value={field.autofill?.inputMode || ""}
                    onChange={(e) =>
                      updateAutofillSettings({
                        inputMode: (e.target.value as any) || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
                  >
                    <option value="">Default</option>
                    <option value="text">Text</option>
                    <option value="email">Email Keyboard</option>
                    <option value="tel">Phone Keyboard</option>
                    <option value="url">URL Keyboard</option>
                    <option value="numeric">Number Pad</option>
                    <option value="decimal">Decimal Keyboard</option>
                    <option value="search">Search</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Validation Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Validation Pattern (RegEx)
              </label>
              <input
                type="text"
                value={field.validation?.pattern || ""}
                onChange={(e) =>
                  updateField(field.id, {
                    validation: {
                      ...field.validation,
                      pattern: e.target.value || undefined,
                    },
                  })
                }
                placeholder="^[A-Z]{2,}$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
              />
            </div>

            {/* Conditional Logic */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowConditional(!showConditional)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 py-2 touch-manipulation"
              >
                {showConditional ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Conditional Logic
              </button>

              {showConditional && (
                <div className="mt-4 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer py-2">
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
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enable conditional logic
                    </span>
                  </label>

                  {field.conditionalLogic?.enabled && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex flex-col sm:flex-row gap-4">
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
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
                        >
                          <option value="show">Show</option>
                          <option value="hide">Hide</option>
                        </select>
                        <span className="text-sm text-gray-600 self-center">
                          this field if:
                        </span>
                      </div>

                      {field.conditionalLogic.rules.map((rule, ruleIndex) => (
                        <div
                          key={ruleIndex}
                          className="space-y-2 sm:space-y-0 sm:flex sm:gap-2 sm:items-center"
                        >
                          <select
                            value={rule.fieldId}
                            onChange={(e) =>
                              updateConditionalRule(ruleIndex, {
                                fieldId: e.target.value,
                              })
                            }
                            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
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
                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
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
                            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-h-[44px]"
                          />

                          <button
                            onClick={() => removeConditionalRule(ruleIndex)}
                            className="w-full sm:w-auto px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition touch-manipulation min-h-[44px]"
                          >
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      ))}

                      {field.conditionalLogic.rules.length > 1 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Logic Operator:
                          </label>
                          <div className="flex flex-col sm:flex-row gap-4 mt-1">
                            <label className="flex items-center gap-2">
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
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-sm">
                                AND (all rules must match)
                              </span>
                            </label>
                            <label className="flex items-center gap-2">
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
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-sm">
                                OR (any rule can match)
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={addConditionalRule}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium py-2 touch-manipulation"
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
