import React, { useState, useEffect } from "react";
import { toast } from "../../utils/toast";
import { Plus, X, Search, Trash2 } from "lucide-react";
import type { FieldTemplate, CustomTemplate } from "../../types";
import {
  fieldTemplates,
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col" style={{ background: 'var(--bg-primary)' }}>
        {/* Header - Fixed */}
        <div className="border-b px-6 py-4 flex justify-between items-center flex-shrink-0" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
          <div>
            <h3 className="text-xl font-bold">Field Templates</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Choose from pre-built or custom field collections
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Fixed, scrollable if categories overflow */}
          <div className="w-64 border-r overflow-y-auto flex-shrink-0" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-disabled)' }} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none text-sm"
                  style={{ borderColor: 'var(--border-light)' }}
                />
              </div>

              <div className="space-y-1">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-sm flex items-center gap-2 ${selectedCategory === category.id ? 'font-medium' : ''}`}
                      style={selectedCategory === category.id
                        ? { background: 'var(--accent-teal-50)', color: 'var(--accent-teal-700)' }
                        : { color: 'var(--text-primary)' }}
                    >
                      <IconComponent className="w-4 h-4" />
                      {category.name}
                      {category.id === "custom" &&
                        customTemplates.length > 0 && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-teal-100)', color: 'var(--accent-teal-700)' }}>
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
                  <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                    <div className="text-4xl mb-4">💾</div>
                    <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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
                    className="border rounded-lg p-4 transition-all cursor-pointer relative group"
                    style={{ borderColor: 'var(--border-light)' }}
                    onClick={() => onAddTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <template.icon className="w-6 h-6" style={{ color: 'var(--primary-500)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold mb-1 truncate pr-2" style={{ color: 'var(--text-primary)' }}>
                            {template.name}
                          </h4>
                          {template.isCustom && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleDeleteCustomTemplate(template.id, e)}
                                className="p-1 rounded transition-colors"
                                style={confirmDelete === template.id
                                  ? { color: 'var(--text-inverse)', background: 'var(--error)' }
                                  : { color: 'var(--error)', background: 'var(--bg-tertiary)' }}
                                title={confirmDelete === template.id ? 'Click again to confirm' : 'Delete template'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {template.fields.length} field
                            {template.fields.length !== 1 ? "s" : ""}
                          </div>
                          {template.isCustom && (
                            <div className="text-xs font-medium" style={{ color: 'var(--primary-500)' }}>
                              Custom
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.fields.slice(0, 3).map((field, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs rounded"
                              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                            >
                              {field.label}
                            </span>
                          ))}
                          {template.fields.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                              +{template.fields.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <Plus className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary-500)' }} />
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 &&
                selectedCategory !== "custom" && (
                  <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
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
