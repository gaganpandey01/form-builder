import React, { useState } from "react";
import {
  Plus,
  X,
  Search,
  Clipboard,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Star,
} from "lucide-react";
import type { FieldTemplate } from "../../types";
import {
  fieldTemplates,
  getTemplatesByCategory,
} from "../../utils/fieldTemplates";

interface FieldTemplatesProps {
  onAddTemplate: (template: FieldTemplate) => void;
  onClose: () => void;
}

export function FieldTemplates({
  onAddTemplate,
  onClose,
}: FieldTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    FieldTemplate["category"] | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      id: "all",
      name: "All Templates",
      icon: <Clipboard className="w-4 h-4" />,
    },
    { id: "contact", name: "Contact Info", icon: <User className="w-4 h-4" /> },
    { id: "address", name: "Address", icon: <MapPin className="w-4 h-4" /> },
    { id: "personal", name: "Personal", icon: <User className="w-4 h-4" /> },
    {
      id: "business",
      name: "Business",
      icon: <Briefcase className="w-4 h-4" />,
    },
    { id: "event", name: "Event", icon: <Calendar className="w-4 h-4" /> },
    { id: "feedback", name: "Feedback", icon: <Star className="w-4 h-4" /> },
  ];
  const filteredTemplates = fieldTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                 {" "}
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        {/* Header */}               {" "}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                             {" "}
          <div>
                                   {" "}
            <h3 className="text-xl font-bold">Field Templates</h3>             
                     {" "}
            <p className="text-sm text-gray-600">
                                          Choose from pre-built field
              collections                        {" "}
            </p>
                               {" "}
          </div>
                             {" "}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
                                    <X className="w-5 h-5" />                   {" "}
          </button>
                         {" "}
        </div>
                       {" "}
        <div className="flex h-full">
                              {/* Sidebar */}                   {" "}
          <div className="w-64 border-r border-gray-200 bg-gray-50 o">
                                   {" "}
            <div className="p-4">
                                         {" "}
              <div className="relative mb-4">
                                               {" "}
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                               {" "}
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
                                           {" "}
              </div>
                                         {" "}
              <div className="space-y-1">
                                               {" "}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition text-sm flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                                                           {" "}
                    <span className="inline-flex items-center">
                                                                 {" "}
                      {category.icon}                                       {" "}
                    </span>
                                                            {category.name}     
                                                 {" "}
                  </button>
                ))}
                                           {" "}
              </div>
                                     {" "}
            </div>
                               {" "}
          </div>
                              {/* Content */}                   {" "}
          <div className="flex-1 min-h-0">
                                   {" "}
            <div className="p-6 overflow-auto">
                                         {" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                               {" "}
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => onAddTemplate(template)}
                  >
                                                           {" "}
                    <div className="flex items-start gap-3">
                                                                 {" "}
                      <template.icon></template.icon>           
                                                     {" "}
                      <div className="flex-1">
                                                                       {" "}
                        <h4 className="font-semibold text-gray-800 mb-1">
                                                                             {" "}
                          {template.name}                                       
                                 {" "}
                        </h4>
                                                                       {" "}
                        <p className="text-sm text-gray-600 mb-3">
                                                                             {" "}
                          {template.description}                               
                                         {" "}
                        </p>
                                                                       {" "}
                        <div className="text-xs text-gray-500">
                                                                             {" "}
                          {template.fields.length} field                        
                                                     {" "}
                          {template.fields.length !== 1 ? "s" : ""}             
                                                           {" "}
                        </div>
                                                                       {" "}
                        <div className="mt-2 flex flex-wrap gap-1">
                                                                             {" "}
                          {template.fields.slice(0, 3).map((field, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                            >
                                                                               
                                        {field.label}                           
                                                         {" "}
                            </span>
                          ))}
                                                                             {" "}
                          {template.fields.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                                                                               
                                        +{template.fields.length - 3} more      
                                                                               {" "}
                            </span>
                          )}
                                                                         {" "}
                        </div>
                                                                   {" "}
                      </div>
                                                                 {" "}
                      <Plus className="w-5 h-5 text-purple-600" />             
                                               {" "}
                    </div>
                                                       {" "}
                  </div>
                ))}
                                           {" "}
              </div>
                                         {" "}
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                                                     {" "}
                  <p>No templates found matching your criteria.</p>             
                                   {" "}
                </div>
              )}
                                     {" "}
            </div>
                               {" "}
          </div>
                         {" "}
        </div>
                   {" "}
      </div>
             {" "}
    </div>
  );
}
