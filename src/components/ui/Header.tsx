import React, { useState, useRef, useEffect } from "react";
import { Plus, Eye, Settings, Users, ChevronDown, Check, Menu, X } from "lucide-react";
import type { Form, ViewType } from "../../types";

interface HeaderProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  onCreateNew: () => void;
  forms: Form[];
  setSelectedFormId: (id: string) => void;
  setCurrentForm: (form: Form) => void;
  currentForm: Form | null;
}

export function Header({
  view,
  setView,
  onCreateNew,
  forms,
  setSelectedFormId,
  setCurrentForm,
  currentForm,
}: HeaderProps) {
  const [showFormList, setShowFormList] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFormList(false);
      }
    };

    if (showFormList) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFormList]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  return (
    <>
      <header
        style={{
          background: 'var(--bg-primary)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          borderBottom: '1px solid var(--border-light)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 max-w-7xl">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Section: Logo & Form Selector */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              {/* Professional Logo */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)',
                    boxShadow: '0 2px 4px rgba(62, 140, 191, 0.2)'
                  }}
                >
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h1
                  className="text-base sm:text-lg lg:text-xl font-semibold truncate"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    letterSpacing: '-0.01em'
                  }}
                >
                  FormBuilder
                </h1>
              </div>

              {/* Form Selector - Hidden on very small screens */}
              <div className="relative flex-1 max-w-[200px] sm:max-w-xs hidden xs:block" ref={dropdownRef}>
                <button
                  onClick={() => setShowFormList(!showFormList)}
                  className="w-full flex items-center justify-between gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg transition-all"
                  style={{
                    borderColor: showFormList ? 'var(--primary-400)' : 'var(--border-medium)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: 500,
                    boxShadow: showFormList ? '0 0 0 3px rgba(62, 140, 191, 0.1)' : 'none'
                  }}
                >
                  <span className="truncate text-left flex-1">
                    {currentForm?.title || "Select"}
                  </span>
                  <ChevronDown
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-transform"
                    style={{ transform: showFormList ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {/* Dropdown */}
                {showFormList && (
                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      marginTop: '8px'
                    }}
                    className="absolute top-full left-0 right-0 max-h-64 sm:max-h-80 overflow-auto z-50"
                  >
                    {forms.length === 0 ? (
                      <div
                        className="px-3 py-6 text-center"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <p className="text-xs sm:text-sm">No forms yet</p>
                      </div>
                    ) : (
                      forms.map((form, index) => (
                        <button
                          key={form.id}
                          onClick={() => {
                            setSelectedFormId(form.id);
                            setCurrentForm(form);
                            setShowFormList(false);
                          }}
                          className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 transition-colors"
                          style={{
                            background: currentForm?.id === form.id ? 'var(--primary-50)' : 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            borderBottom: index < forms.length - 1 ? '1px solid var(--border-light)' : 'none'
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-medium truncate text-xs sm:text-sm"
                              style={{
                                color: currentForm?.id === form.id ? 'var(--primary-700)' : 'var(--text-primary)'
                              }}
                            >
                              {form.title}
                            </div>
                            <div
                              className="text-[10px] sm:text-xs mt-0.5"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          {currentForm?.id === form.id && (
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--primary-600)' }} />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop View Toggle */}
              <div
                className="hidden md:flex items-center gap-1 p-1 rounded-lg"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <button
                  onClick={() => setView("admin")}
                  className="px-2.5 py-1.5 rounded-md transition-all text-[15px]"
                  style={{
                    background: view === "admin" ? 'var(--bg-primary)' : 'transparent',
                    color: view === "admin" ? 'var(--primary-700)' : 'var(--text-secondary)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: view === "admin" ? 600 : 500,
                    boxShadow: view === "admin" ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Settings className="w-3 h-3 inline mr-1" />
                  Builder
                </button>

                <button
                  onClick={() => {
                    if (currentForm) setSelectedFormId(currentForm.id);
                    setView("form");
                  }}
                  className="px-2.5 py-1.5 rounded-md transition-all text-[15px]"
                  style={{
                    background: view === "form" ? 'var(--bg-primary)' : 'transparent',
                    color: view === "form" ? 'var(--primary-700)' : 'var(--text-secondary)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: view === "form" ? 600 : 500,
                    boxShadow: view === "form" ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Preview
                </button>

                <button
                  onClick={() => {
                    if (currentForm) setSelectedFormId(currentForm.id);
                    setView("responses");
                  }}
                  className="px-2.5 py-1.5 rounded-md transition-all text-[15px]"
                  style={{
                    background: view === "responses" ? 'var(--bg-primary)' : 'transparent',
                    color: view === "responses" ? 'var(--primary-700)' : 'var(--text-secondary)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: view === "responses" ? 600 : 500,
                    boxShadow: view === "responses" ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Users className="w-3 h-3 inline mr-1" />
                  Responses
                </button>
              </div>

              {/* New Form Button */}
              <button
                onClick={onCreateNew}
                className="px-3 py-1 mb-1 mt-1  sm:px-4 sm:py-2 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap"
                style={{
                  background: 'var(--primary-600)',
                  color: 'var(--text-inverse)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 600,
                  boxShadow: '0 1px 3px rgba(62, 140, 191, 0.3)'
                }}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5" />
                <span className="hidden sm:inline">New Form</span>
                <span className="sm:hidden">New</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg transition-colors"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[110] md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Mobile Menu Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 w-64 z-[120] md:hidden"
            style={{
              background: 'var(--bg-primary)',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}
          >
            {/* Mobile Menu Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <h3
                className="font-semibold text-base"
                style={{ color: 'var(--text-primary)' }}
              >
                Navigation
              </h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className="p-3 space-y-1">
              <button
                onClick={() => {
                  setView("admin");
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg transition-all"
                style={{
                  background: view === "admin" ? 'var(--primary-50)' : 'transparent',
                  color: view === "admin" ? 'var(--primary-700)' : 'var(--text-primary)',
                  fontWeight: view === "admin" ? 600 : 500
                }}
              >
                <Settings className="w-4 h-4 inline mr-3" />
                Builder
              </button>

              <button
                onClick={() => {
                  if (currentForm) setSelectedFormId(currentForm.id);
                  setView("form");
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg transition-all"
                style={{
                  background: view === "form" ? 'var(--primary-50)' : 'transparent',
                  color: view === "form" ? 'var(--primary-700)' : 'var(--text-primary)',
                  fontWeight: view === "form" ? 600 : 500
                }}
              >
                <Eye className="w-4 h-4 inline mr-3" />
                Preview
              </button>

              <button
                onClick={() => {
                  if (currentForm) setSelectedFormId(currentForm.id);
                  setView("responses");
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg transition-all"
                style={{
                  background: view === "responses" ? 'var(--primary-50)' : 'transparent',
                  color: view === "responses" ? 'var(--primary-700)' : 'var(--text-primary)',
                  fontWeight: view === "responses" ? 600 : 500
                }}
              >
                <Users className="w-4 h-4 inline mr-3" />
                Responses
              </button>
            </div>

            {/* Form List in Mobile Menu */}
            <div
              className="border-t mt-3 pt-3 px-3"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <h4
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                Forms
              </h4>
              <div className="space-y-1 max-h-64 overflow-auto">
                {forms.map((form) => (
                  <button
                    key={form.id}
                    onClick={() => {
                      setSelectedFormId(form.id);
                      setCurrentForm(form);
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-lg transition-all"
                    style={{
                      background: currentForm?.id === form.id ? 'var(--primary-50)' : 'transparent',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div
                      className="font-medium text-sm truncate"
                      style={{
                        color: currentForm?.id === form.id ? 'var(--primary-700)' : 'var(--text-primary)'
                      }}
                    >
                      {form.title}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
