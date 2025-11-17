import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Form, FormResponse, ViewType } from "./types";
import { generateId } from "./utils/generators";
import {
  loadForms,
  saveForms,
  loadResponses,
  saveResponses,
} from "./utils/storage";
import {
  Header,
  EmptyState,
  AdminPanel,
  FormView,
  ResponsesView,
} from "./components";

export default function GoogleFormsClone() {
  const [view, setView] = useState<ViewType>("admin");
  const [forms, setForms] = useState<Form[]>([]);
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");

  useEffect(() => {
    // Load from storage
    setForms(loadForms());
    setResponses(loadResponses());
  }, []);

  useEffect(() => {
    // Save to storage
    saveForms(forms);
  }, [forms]);

  useEffect(() => {
    saveResponses(responses);
  }, [responses]);

  const createNewForm = () => {
    const newForm: Form = {
      id: generateId(),
      title: "",
      description: "",
      fields: [],
      settings: {
        allowMultipleResponses: true,
        closeType: "manual",
        isClosed: false,
        createdAt: new Date().toISOString(),
        isMultiStep: false,
        stepsPerPage: 0,
        showProgressBar: false,
      },
    };
    setForms([...forms, newForm]);
    setCurrentForm(newForm);
    setView("admin");
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app-gradient, linear-gradient(135deg, var(--primary-50), var(--info-50)))' }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      // theme is now controlled by CSS variables only
      />
      <Header
        view={view}
        setView={setView}
        onCreateNew={createNewForm}
        forms={forms}
        setSelectedFormId={setSelectedFormId}
        setCurrentForm={setCurrentForm}
        currentForm={currentForm}
      />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {view === "admin" && currentForm && (
          <AdminPanel
            form={currentForm}
            setForm={setCurrentForm}
            forms={forms}
            setForms={setForms}
          />
        )}

        {view === "form" && selectedFormId && (
          <FormView
            form={forms.find((f) => f.id === selectedFormId)!}
            responses={responses}
            setResponses={setResponses}
          />
        )}

        {view === "responses" && selectedFormId && (
          <ResponsesView
            form={forms.find((f) => f.id === selectedFormId)!}
            responses={responses.filter((r) => r.formId === selectedFormId)}
          />
        )}

        {!currentForm && view === "admin" && (
          <EmptyState onCreateNew={createNewForm} />
        )}
      </main>
    </div>
  );
}
