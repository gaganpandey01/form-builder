/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Clock, Check, ChevronLeft, ChevronRight } from "lucide-react";
import type { Form, FormResponse, ValidationError } from "../../types";
import { generateId } from "../../utils/generators";
import { validateField, validateAllFields } from "../../utils/validation";
import { getVisibleFields } from "../../utils/conditionalLogic";
import { FormFieldInput } from "./FormFieldInput";
import { saveResponse as apiSaveResponse } from "../../utils/storage";
import { toast } from "../../utils/toast";


interface FormViewProps {
  form: Form;
  responses: FormResponse[];
  setResponses: (responses: FormResponse[]) => void;
}


export function FormView({ form, responses, setResponses }: FormViewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [currentStep, setCurrentStep] = useState(0);


  // Get visible fields based on conditional logic
  const visibleFields = getVisibleFields(form?.fields || [], formData);


  // Calculate steps for multi-step forms
  const stepsPerPage = form?.settings?.stepsPerPage || 5;
  const totalSteps = form?.settings?.isMultiStep
    ? Math.ceil((visibleFields?.length || 0) / stepsPerPage)
    : 1;


  const currentStepFields = form?.settings?.isMultiStep
    ? visibleFields?.slice(
      currentStep * stepsPerPage,
      (currentStep + 1) * stepsPerPage
    ) || []
    : visibleFields || [];


  // Real-time validation
  useEffect(() => {


  }, [formData, visibleFields]);


  const handleFieldChange = (fieldId: string, value: any) => {
    // console.log("value", value)


    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);


    // Real-time validation for the changed field
    const field = form?.fields?.find((f) => f.id === fieldId);
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
    if (!form?.settings?.isMultiStep) return true;


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
    if (form?.settings?.isClosed) return true;


    if (form?.settings?.closeType === "datetime" && form.settings.closeDateTime) {
      return new Date() > new Date(form.settings.closeDateTime);
    }


    if (form?.settings?.closeType === "custom" && form.settings.customCloseTime) {
      const createdAt = new Date(form.settings.createdAt);
      const closeTime = new Date(
        createdAt.getTime() + form.settings.customCloseTime * 60 * 60 * 1000
      );
      return new Date() > closeTime;
    }


    return false;
  };


  const hasUserSubmitted = () => {
    if (form?.settings?.allowMultipleResponses) return false;
    const userIdentifier =
      localStorage.getItem(`form_${form?.id}_user`) || generateId();
    return responses.some(
      (r) => r.formId === form?.id && r.userIdentifier === userIdentifier
    );
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors([]);


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


    setSubmitting(true);


    try {
      let userIdentifier = localStorage.getItem(`form_${form?.id}_user`);
      if (!userIdentifier) {
        userIdentifier = generateId();
        localStorage.setItem(`form_${form?.id}_user`, userIdentifier);
      }


      const response: FormResponse = {
        id: generateId(),
        formId: form.id,
        responses: formData,
        submittedAt: new Date().toISOString(),
        userIdentifier,
      };


      // Save to backend API
      const result = await apiSaveResponse(response);


      if (result.success && result.data) {
        // Update local state with saved response
        setResponses([...responses, result.data]);
        setSubmitted(true);
        setFormData({});
        setFiles({});
        toast.success("Form submitted successfully!");
      } else {
        setError(result.error || "Failed to submit form. Please try again.");
        toast.error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to submit form. Please try again.");
      toast.error("Network error occurred");
    } finally {
      setSubmitting(false);
    }
  };


  if (isFormClosed()) {
    return (
      <div className="rounded-xl shadow-sm border p-12 text-center" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
        <Clock className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Form Closed</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          This form is no longer accepting responses.
        </p>
      </div>
    );
  }


  if (submitted) {
    return (
      <div className="rounded-xl shadow-sm border p-12 text-center" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--accent-green-100)' }}>
          <Check className="w-8 h-8" style={{ color: 'var(--accent-green-500)' }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Response Submitted!
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Thank you for your response.</p>
        {form?.settings?.allowMultipleResponses && (
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 px-6 py-3 rounded-lg transition"
            style={{ background: 'var(--primary-700)', color: 'var(--text-inverse)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-800)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--primary-700)')}
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
      <div className="rounded-xl shadow-sm border p-8" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {!form?.title || form.title.length === 0 ? "Untitled Form" : form.title}
        </h1>
        {form?.description && (
          <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>{form.description}</p>
        )}


        {/* Progress Bar */}
        {form?.settings?.isMultiStep && form.settings.showProgressBar && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-disabled)' }}>
                {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--border-light)' }}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%`, background: 'linear-gradient(90deg, var(--primary-700), var(--primary-500))' }}
              />
            </div>
          </div>
        )}
      </div>


      {error && (
        <div className="px-6 py-4 rounded-xl" style={{ background: 'var(--error)', color: 'var(--text-inverse)', borderColor: 'var(--error)' }}>
          {error}
        </div>
      )}


      {/* Form Fields */}
      {currentStepFields.map((field) => {
        const fieldError = getFieldError(field.id);


        return (
          <div
            key={field.id}
            className="rounded-xl shadow-sm border p-6"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
          >
            <label className="block mb-3">
              <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                {field.label}
                {field.required && <span className="ml-1" style={{ color: 'var(--error)' }}>*</span>}
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
              <p className="mt-2 text-sm flex items-center gap-1" style={{ color: 'var(--error)' }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--error)', color: 'var(--text-inverse)' }}>
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
          {form?.settings?.isMultiStep && currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 rounded-lg transition font-medium flex items-center gap-2"
              style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--border-medium)')}
              onMouseOut={e => (e.currentTarget.style.background = 'var(--border-light)')}
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
            className="px-6 py-3 rounded-lg transition font-medium"
            style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--border-medium)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--border-light)')}
          >
            Clear Form
          </button>


          {form?.settings?.isMultiStep && currentStep < totalSteps - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!canGoToNextStep()}
              className={`px-6 py-3 rounded-lg transition font-medium flex items-center gap-2 ${!canGoToNextStep() ? 'cursor-not-allowed' : ''}`}
              style={canGoToNextStep()
                ? { background: 'linear-gradient(90deg, var(--primary-700), var(--primary-500))', color: 'var(--text-inverse)' }
                : { background: 'var(--border-light)', color: 'var(--text-disabled)' }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={validationErrors.length > 0 || submitting}
              className={`px-8 py-3 rounded-lg transition font-medium ${validationErrors.length > 0 || submitting ? 'cursor-not-allowed' : ''}`}
              style={validationErrors.length === 0 && !submitting
                ? { background: 'linear-gradient(90deg, var(--primary-700), var(--primary-500))', color: 'var(--text-inverse)' }
                : { background: 'var(--border-light)', color: 'var(--text-disabled)' }}
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
