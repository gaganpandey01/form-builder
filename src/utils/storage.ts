import type { Form, FormResponse } from "../types";
import { formsApi, formResponsesApi, handleApiError, type FormDto } from "../services";

// Configuration to switch between API and localStorage
export const USE_API = true;

// Local storage fallback functions
const loadFormsFromLocalStorage = (): Form[] => {
  const stored = window.localStorage.getItem("forms");
  return stored ? JSON.parse(stored) : [];
};

const saveFormsToLocalStorage = (forms: Form[]): void => {
  window.localStorage.setItem("forms", JSON.stringify(forms));
};

const loadResponsesFromLocalStorage = (): FormResponse[] => {
  const stored = window.localStorage.getItem("responses");
  return stored ? JSON.parse(stored) : [];
};

const saveResponsesToLocalStorage = (responses: FormResponse[]): void => {
  window.localStorage.setItem("responses", JSON.stringify(responses));
};

// Utility: detect GUID (for deciding POST vs PUT)
const isGuid = (value: string): boolean =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);

// API-based functions
export const loadForms = async (): Promise<Form[]> => {
  if (!USE_API) {
    return loadFormsFromLocalStorage();
  }

  try {
    const response = await formsApi.getForms({ pageSize: 1000 });
    if (response.success && response.data) {
      const forms = response.data.items as unknown as Form[];
      // ✅ Save to localStorage as backup
      saveFormsToLocalStorage(forms);
      return forms;
    } else {
      console.warn(
        "Failed to load forms from API, falling back to localStorage:",
        response.message
      );
      return loadFormsFromLocalStorage();
    }
  } catch (error) {
    console.error("Error loading forms from API:", error);
    return loadFormsFromLocalStorage();
  }
};

export const saveForms = async (forms: Form[]): Promise<boolean> => {
  // ✅ Always save to localStorage as backup
  saveFormsToLocalStorage(forms);

  if (!USE_API) {
    return true;
  }

  try {
    // Note: Individual form saving should be handled by saveForm function
    console.warn("saveForms called with API mode - use saveForm for individual forms");
    return true;
  } catch (error) {
    console.error("Error saving forms:", error);
    return false;
  }
};

export const saveForm = async (
  form: Form
): Promise<{ success: boolean; data?: Form; error?: string }> => {
  // ✅ ALWAYS save to localStorage first as backup (even with API enabled)
  const forms = loadFormsFromLocalStorage();
  const existingIndex = forms.findIndex(f => f.id === form.id);

  if (existingIndex >= 0) {
    forms[existingIndex] = form;
  } else {
    forms.push(form);
  }

  saveFormsToLocalStorage(forms);

  // ✅ If USE_API is false, return early with localStorage success
  if (!USE_API) {
    return { success: true, data: form };
  }

  // ✅ Continue with API call
  try {
    const isNew = !form.id || !isGuid(form.id);
    console.log("isNew", isNew, "form.id", form.id);

    let response;
    if (isNew) {
      // New form -> POST
      response = await formsApi.createForm(form);
    } else {
      // Existing form with backend GUID -> PUT
      response = await formsApi.updateForm(form.id, form);
    }

    if (response.success && response.data) {
      const savedForm = response.data as unknown as Form;
      console.log("Form saved to API:", savedForm);

      // ✅ Update localStorage with the API response (which includes the GUID)
      const updatedForms = forms.map(f => f.id === form.id ? savedForm : f);
      if (!forms.find(f => f.id === savedForm.id)) {
        updatedForms.push(savedForm);
      }
      saveFormsToLocalStorage(updatedForms);

      return { success: true, data: savedForm };
    } else {
      return {
        success: false,
        error: handleApiError(response as any),
      };
    }
  } catch (error) {
    console.error("Error saving form to API:", error);
    // ✅ API failed but localStorage succeeded
    return {
      success: false,
      error: `API error: ${(error as Error).message}. Form saved to localStorage as backup.`,
    };
  }
};

export const deleteForm = async (
  formId: string
): Promise<{ success: boolean; error?: string }> => {
  // ✅ Always delete from localStorage
  const forms = loadFormsFromLocalStorage();
  const updatedForms = forms.filter((f) => f.id !== formId);
  saveFormsToLocalStorage(updatedForms);

  if (!USE_API) {
    return { success: true };
  }

  try {
    const response = await formsApi.deleteForm(formId);
    if (response.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: handleApiError(response as any),
      };
    }
  } catch (error) {
    console.error("Error deleting form:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const loadResponses = async (): Promise<FormResponse[]> => {
  if (!USE_API) {
    return loadResponsesFromLocalStorage();
  }

  try {
    const response = await formResponsesApi.getResponses({ pageSize: 1000 });
    if (response.success && response.data) {
      const responses = response.data.items.map((dto) => ({
        id: dto.id,
        formId: dto.formId,
        responses: dto.responses,
        submittedAt: dto.submittedAt,
        userIdentifier: dto.userIdentifier,
      }));
      // ✅ Save to localStorage as backup
      saveResponsesToLocalStorage(responses);
      return responses;
    } else {
      console.warn(
        "Failed to load responses from API, falling back to localStorage:",
        response.message
      );
      return loadResponsesFromLocalStorage();
    }
  } catch (error) {
    console.error("Error loading responses from API:", error);
    return loadResponsesFromLocalStorage();
  }
};

export const saveResponses = async (responses: FormResponse[]): Promise<boolean> => {
  // ✅ Always save to localStorage
  saveResponsesToLocalStorage(responses);

  if (!USE_API) {
    return true;
  }

  try {
    console.warn(
      "saveResponses called with API mode - use saveResponse for individual responses"
    );
    return true;
  } catch (error) {
    console.error("Error saving responses:", error);
    return false;
  }
};

export const saveResponse = async (
  response: FormResponse
): Promise<{ success: boolean; data?: FormResponse; error?: string }> => {
  // ✅ Always save to localStorage first
  const responses = loadResponsesFromLocalStorage();
  responses.push(response);
  saveResponsesToLocalStorage(responses);

  if (!USE_API) {
    return { success: true, data: response };
  }

  try {
    const apiResponse = await formResponsesApi.submitResponse(response);
    if (apiResponse.success && apiResponse.data) {
      const savedResponse: FormResponse = {
        id: apiResponse.data.id,
        formId: apiResponse.data.formId,
        responses: apiResponse.data.responses,
        submittedAt: apiResponse.data.submittedAt,
        userIdentifier: apiResponse.data.userIdentifier,
      };
      return { success: true, data: savedResponse };
    } else {
      return {
        success: false,
        error: handleApiError(apiResponse as any),
      };
    }
  } catch (error) {
    console.error("Error saving response to API:", error);
    // ✅ API failed but localStorage succeeded
    return {
      success: false,
      error: `API error: ${(error as Error).message}. Response saved to localStorage as backup.`,
    };
  }
};
