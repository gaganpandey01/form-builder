import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Plus, X, Search, Trash2, Edit2 } from "lucide-react";
import type { FieldTemplate, CustomTemplate } from "../../types";
import {
  fieldTemplates,
  getTemplatesByCategory,
} from "../../utils/fieldTemplates";
import {
  Clipboard,
  Save,
  User,
  MapPin,
  IdCard,
  Briefcase,
  PartyPopper,
  Star,
} from "lucide-react";
import {
  loadCustomTemplates,
  deleteCustomTemplate,
} from "../../utils/templateStorage";

interface FieldTemplatesProps {
  onAddTemplate: (template: FieldTemplate | CustomTemplate) => void;
  onClose: () => void;
}

export function FieldTemplates({
  onAddTemplate,
  onClose,
}: FieldTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    FieldTemplate["category"] | "all" | "custom"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setCustomTemplates(loadCustomTemplates());
  }, []);

  const categories = [
    { id: "all", name: "All Templates", icon: Clipboard },
    { id: "custom", name: "My Templates", icon: Save },
    { id: "contact", name: "Contact Info", icon: User },
    { id: "address", name: "Address", icon: MapPin },
    { id: "personal", name: "Personal", icon: IdCard },
    { id: "business", name: "Business", icon: Briefcase },
    { id: "event", name: "Event", icon: PartyPopper },
    { id: "feedback", name: "Feedback", icon: Star },
  ];

  const allTemplates = [...fieldTemplates, ...customTemplates];

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "custom" && template.isCustom) ||
      (!template.isCustom && template.category === selectedCategory);

    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeleteCustomTemplate = (
    templateId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (confirmDelete === templateId) {
      deleteCustomTemplate(templateId);
      setCustomTemplates(loadCustomTemplates());
      setConfirmDelete(null);
      toast.success("Template deleted successfully!");
    } else {
      setConfirmDelete(templateId);
      toast.warning("Click delete again to confirm", {
        autoClose: 3000,
      });
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold">Field Templates</h3>
            <p className="text-sm text-gray-600">
              Choose from pre-built or custom field collections
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Fixed, scrollable if categories overflow */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
              </div>

              <div className="space-y-1">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-sm flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? "bg-purple-100 text-purple-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {category.name}
                      {category.id === "custom" &&
                        customTemplates.length > 0 && (
                          <span className="ml-auto text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                            {customTemplates.length}
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {selectedCategory === "custom" &&
                customTemplates.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">💾</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      No Custom Templates
                    </h3>
                    <p>
                      Create your first custom template by saving a form you've
                      built.
                    </p>
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer relative group"
                    onClick={() => onAddTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <template.icon className="w-6 h-6 text-purple-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-800 mb-1 truncate pr-2">
                            {template.name}
                          </h4>
                          {template.isCustom && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) =>
                                  handleDeleteCustomTemplate(template.id, e)
                                }
                                className={`p-1 rounded transition-colors ${
                                  confirmDelete === template.id
                                    ? "text-white bg-red-500 hover:bg-red-600"
                                    : "text-red-500 hover:bg-red-50"
                                }`}
                                title={
                                  confirmDelete === template.id
                                    ? "Click again to confirm"
                                    : "Delete template"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {template.fields.length} field
                            {template.fields.length !== 1 ? "s" : ""}
                          </div>
                          {template.isCustom && (
                            <div className="text-xs text-purple-600 font-medium">
                              Custom
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.fields.slice(0, 3).map((field, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                            >
                              {field.label}
                            </span>
                          ))}
                          {template.fields.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                              +{template.fields.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 &&
                selectedCategory !== "custom" && (
                  <div className="text-center py-12 text-gray-500">
                    <p>No templates found matching your criteria.</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
