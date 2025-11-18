import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { FormList } from './components/FormList/FormList';
import { FormBuilder } from './components/FormBuilder/FormBuilder';
import { FormRenderer } from './components/FormRender/FormRenderer';
import { ResponseList } from './components/ResponseViewer/ResponseList';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="app-nav">
          <Link to="/" className="app-logo">
            📝 FormBuilder
          </Link>
          <Link to="/builder" className="btn-primary">
            + Create Form
          </Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <FormList
                onEdit={(id) => window.location.href = `/builder/${id}`}
                onView={(id) => window.location.href = `/form/${id}`}
              />
            }
          />
          <Route path="/builder" element={<FormBuilder />} />
          <Route path="/builder/:id" element={<FormBuilder />} />
          <Route path="/form/:id" element={<FormRenderer />} />
          <Route path="/responses/:formId" element={<ResponseList />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
