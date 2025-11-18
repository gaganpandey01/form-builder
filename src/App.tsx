import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Form, FormResponse, ViewType } from "./types";
import { generateId } from "./utils/generators";
import {
  loadForms,
  loadResponses,
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
    // Load from storage (now async)
    const loadData = async () => {
      try {
        const [loadedForms, loadedResponses] = await Promise.all([
          loadForms(),
          loadResponses()
        ]);
        setForms(loadedForms);
        setResponses(loadedResponses);
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to empty arrays if loading fails
        setForms([]);
        setResponses([]);
      }
    };
    loadData();
  }, []);

  // Note: Individual saves are now handled by components using API calls
  // No need for automatic saving on state changes

  const createNewForm = () => {
    const newForm: Form = {
      id: "new_" + generateId(),
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

        {/* Use currentForm.id for preview instead of selectedFormId */}
        {view === "form" && currentForm && (
          <FormView
            form={currentForm}
            responses={responses}
            setResponses={setResponses}
          />
        )}

        {view === "responses" && currentForm && (
          <ResponsesView
            form={currentForm}
            responses={responses.filter((r) => r.formId === currentForm.id)}
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
