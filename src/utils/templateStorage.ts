import type { CustomTemplate } from "../types";

const CUSTOM_TEMPLATES_KEY = "custom_templates";

export const loadCustomTemplates = (): CustomTemplate[] => {
  try {
    const stored = window.localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading custom templates:", error);
    return [];
  }
};

export const saveCustomTemplates = (templates: CustomTemplate[]): void => {
  try {
    window.localStorage.setItem(
      CUSTOM_TEMPLATES_KEY,
      JSON.stringify(templates)
    );
  } catch (error) {
    console.error("Error saving custom templates:", error);
  }
};

export const addCustomTemplate = (template: CustomTemplate): void => {
  const templates = loadCustomTemplates();
  const updatedTemplates = [...templates, template];
  saveCustomTemplates(updatedTemplates);
};

export const deleteCustomTemplate = (templateId: string): void => {
  const templates = loadCustomTemplates();
  const updatedTemplates = templates.filter((t) => t.id !== templateId);
  saveCustomTemplates(updatedTemplates);
};

export const updateCustomTemplate = (
  templateId: string,
  updates: Partial<CustomTemplate>
): void => {
  const templates = loadCustomTemplates();
  const updatedTemplates = templates.map((t) =>
    t.id === templateId ? { ...t, ...updates } : t
  );
  saveCustomTemplates(updatedTemplates);
};
