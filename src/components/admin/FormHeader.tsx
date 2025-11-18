import React from "react";
import { Settings, QrCode, Copy, Check } from "lucide-react";

interface FormHeaderProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
  formDescription?: string;
  setFormDescription: (desc: string) => void;
  onSave: () => void;
  onSaveTemplate: () => void;
  onSettings: () => void;
  onShowQR: () => void;
  onCopy: () => void;
  copied: boolean;
  fieldsLength: number;
  showSettings: boolean;
  showQR: boolean;
  saveStatus?: "saved" | "saving" | "unsaved";
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  onSave: _onSave,
  onSaveTemplate: _onSaveTemplate,
  onSettings,
  onShowQR,
  onCopy,
  copied,
  fieldsLength: _fieldsLength,
  showSettings: _showSettings,
  showQR: _showQR,
  saveStatus = "saved",
}) => (
  <div className="rounded-xl shadow-sm border p-4 sm:p-6" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
    <input
      type="text"
      value={formTitle || ""} // ✅ Ensure it's always a string
      onChange={(e) => setFormTitle(e.target.value)}
      className="text-2xl sm:text-3xl font-bold w-full border-none outline-none focus:ring-2 rounded px-2 min-h-[44px]"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      placeholder="Form Title"
    />

    <textarea
      value={formDescription || ""} // ✅ Always provide a string value
      onChange={(e) => setFormDescription(e.target.value)}
      className="w-full mt-4 border-none outline-none focus:ring-2 rounded px-2 min-h-[80px] resize-y"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
      placeholder="Form Description"
      rows={2}
    />


    {/* Save Status Indicator */}
    <div className="flex items-center justify-between mt-4 mb-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${saveStatus === "saved" ? "bg-green-400" :
            saveStatus === "saving" ? "bg-yellow-400" : "bg-red-400"
            }`}
        />
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {saveStatus === "saved" && "All changes saved"}
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "unsaved" && "Unsaved changes"}
        </span>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 mt-6">

      <button
        onClick={onSettings}
        className="flex-1 sm:flex-none px-4 py-3 rounded-lg transition touch-manipulation"
        style={{ background: 'var(--secondary-700)', color: 'var(--text-inverse)' }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--secondary-800)')}
        onMouseOut={e => (e.currentTarget.style.background = 'var(--secondary-700)')}
      >
        <Settings className="w-4 h-4 inline mr-2" />
        Settings
      </button>
      <button
        onClick={onShowQR}
        className="flex-1 sm:flex-none px-4 py-3 rounded-lg transition touch-manipulation"
        style={{ background: 'var(--primary-500)', color: 'var(--text-inverse)' }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-600)')}
        onMouseOut={e => (e.currentTarget.style.background = 'var(--primary-500)')}
      >
        <QrCode className="w-4 h-4 inline mr-2" />
        QR Code
      </button>
      <button
        onClick={onCopy}
        className="flex-1 sm:flex-none px-4 py-3 rounded-lg transition touch-manipulation"
        style={{ background: 'var(--primary-700)', color: 'var(--text-inverse)' }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-800)')}
        onMouseOut={e => (e.currentTarget.style.background = 'var(--primary-700)')}
      >
        {copied ? (
          <Check className="w-4 h-4 inline mr-2" />
        ) : (
          <Copy className="w-4 h-4 inline mr-2" />
        )}
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  </div>
);
