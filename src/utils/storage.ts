import type { Form, FormResponse } from "../types";

export const loadForms = (): Form[] => {
  const stored = window.localStorage.getItem("forms");
  return stored ? JSON.parse(stored) : [];
};

export const saveForms = (forms: Form[]): void => {
  window.localStorage.setItem("forms", JSON.stringify(forms));
};

export const loadResponses = (): FormResponse[] => {
  const stored = window.localStorage.getItem("responses");
  return stored ? JSON.parse(stored) : [];
};

export const saveResponses = (responses: FormResponse[]): void => {
  window.localStorage.setItem("responses", JSON.stringify(responses));
};
