/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Clock, Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { Form, FormResponse, ValidationError } from "../../types";
import { generateId } from "../../utils/generators";
import { validateField, validateAllFields } from "../../utils/validation";
import { getVisibleFields } from "../../utils/conditionalLogic";
import { FormFieldInput } from "./FormFieldInput";

interface FormViewProps {
  form: Form;
  responses: FormResponse[];
  setResponses: (responses: FormResponse[]) => void;
}

export function FormView({ form, responses, setResponses }: FormViewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [currentStep, setCurrentStep] = useState(0);

  // Get visible fields based on conditional logic
  const visibleFields = getVisibleFields(form.fields, formData);
  // console.log("visible", form)
  // Calculate steps for multi-step forms
  const stepsPerPage = form.settings.stepsPerPage || 5;
  const totalSteps = form.settings.isMultiStep
    ? Math.ceil(visibleFields.length / stepsPerPage)
    : 1;

  const currentStepFields = form.settings.isMultiStep
    ? visibleFields.slice(
        currentStep * stepsPerPage,
        (currentStep + 1) * stepsPerPage
      )
    : visibleFields;

  // Real-time validation
  useEffect(() => {
    const errors = validateAllFields(visibleFields, formData);
    
  }, [formData, visibleFields]);

  const handleFieldChange = (fieldId: string, value: any) => {
// console.log("value", value)

    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);

    // Real-time validation for the changed field
    const field = form.fields.find((f) => f.id === fieldId);
    // console.log("field", field)
    if (field) {
      const fieldError = validateField(field, value);
      
      setValidationErrors((prev) => {
        const filtered = prev.filter((e) => e.fieldId !== fieldId);
        return fieldError ? [...filtered, fieldError] : filtered;
      });
    }
  };

  const getFieldError = (fieldId: string): string | undefined => {
    const error = validationErrors.find((e) => e.fieldId === fieldId);
    return error?.message;
  };

  const canGoToNextStep = (): boolean => {
    if (!form.settings.isMultiStep) return true;

    // Check if current step fields are valid
    const currentStepErrors = validationErrors.filter((error) =>
      currentStepFields.some((field) => field.id === error.fieldId)
    );

    return currentStepErrors.length === 0;
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1 && canGoToNextStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isFormClosed = () => {
    if (form.settings.isClosed) return true;

    if (form.settings.closeType === "datetime" && form.settings.closeDateTime) {
      return new Date() > new Date(form.settings.closeDateTime);
    }

    if (form.settings.closeType === "custom" && form.settings.customCloseTime) {
      const createdAt = new Date(form.settings.createdAt);
      const closeTime = new Date(
        createdAt.getTime() + form.settings.customCloseTime * 60 * 60 * 1000
      );
      return new Date() > closeTime;
    }

    return false;
  };

  const hasUserSubmitted = () => {
    if (form.settings.allowMultipleResponses) return false;
    const userIdentifier =
      localStorage.getItem(`form_${form.id}_user`) || generateId();
    return responses.some(
      (r) => r.formId === form.id && r.userIdentifier === userIdentifier
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isFormClosed()) {
      setError("This form is no longer accepting responses.");
      return;
    }

    if (hasUserSubmitted()) {
      setError("You have already submitted this form.");
      return;
    }

    // Validate all visible fields
    const errors = validateAllFields(visibleFields, formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError("Please fix the validation errors before submitting.");
      return;
    }

    let userIdentifier = localStorage.getItem(`form_${form.id}_user`);
    if (!userIdentifier) {
      userIdentifier = generateId();
      localStorage.setItem(`form_${form.id}_user`, userIdentifier);
    }

    const response: FormResponse = {
      id: generateId(),
      formId: form.id,
      responses: formData,
      submittedAt: new Date().toISOString(),
      userIdentifier,
    };

    setResponses([...responses, response]);
    setSubmitted(true);
    setFormData({});
    setFiles({});
  };

  if (isFormClosed()) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Form Closed</h2>
        <p className="text-gray-600">
          This form is no longer accepting responses.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Response Submitted!
        </h2>
        <p className="text-gray-600">Thank you for your response.</p>
        {form.settings.allowMultipleResponses && (
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Submit Another Response
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-800">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600 mt-3">{form.description}</p>
        )}

        {/* Progress Bar */}
        {form.settings.isMultiStep && form.settings.showProgressBar && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Form Fields */}
      {currentStepFields.map((field) => {
        const fieldError = getFieldError(field.id);

        return (
          <div
            key={field.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <label className="block mb-3">
              <span className="text-lg font-medium text-gray-800">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>

            <FormFieldInput
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              onFileChange={(file) => setFiles({ ...files, [field.id]: file })}
              error={fieldError}
            />

            {fieldError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">
                  !
                </span>
                {fieldError}
              </p>
            )}
          </div>
        );
      })}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <div>
          {form.settings.isMultiStep && currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setFormData({})}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Clear Form
          </button>

          {form.settings.isMultiStep && currentStep < totalSteps - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!canGoToNextStep()}
              className={`px-6 py-3 rounded-lg transition font-medium flex items-center gap-2 ${
                canGoToNextStep()
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={validationErrors.length > 0}
              className={`px-8 py-3 rounded-lg transition font-medium ${
                validationErrors.length === 0
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Submit Response
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
