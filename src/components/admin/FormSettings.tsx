import type { Form, FormSettings as FormSettingsType } from "../../types";

interface FormSettingsProps {
  form: Form;
  setForm: (form: Form) => void;
}

export function FormSettings({ form, setForm }: FormSettingsProps) {
  const updateSettings = (updates: Partial<FormSettingsType>) => {
    setForm({ ...form, settings: { ...form.settings, ...updates } });
  };

  return (
    <div
      className="rounded-xl shadow-sm border p-6"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
    >
      <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Form Settings</h3>

      <div className="space-y-6">
        {/* Multiple Responses */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.settings.allowMultipleResponses}
              onChange={(e) =>
                updateSettings({ allowMultipleResponses: e.target.checked })
              }
              className="w-5 h-5 rounded focus:ring-2 outline-none"
              style={{ accentColor: 'var(--primary-600)' }}
            />
            <div>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Allow multiple responses</span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Users can submit the form more than once
              </p>
            </div>
          </label>
        </div>

        {/* Multi-Step Form Settings */}
        <div className="border-t pt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
          <h4 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Multi-Step Form</h4>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.settings.isMultiStep || false}
                onChange={(e) =>
                  updateSettings({
                    isMultiStep: e.target.checked,
                    stepsPerPage: e.target.checked ? 5 : undefined,
                    showProgressBar: e.target.checked ? true : undefined,
                  })
                }
                className="w-5 h-5 rounded focus:ring-2 outline-none"
                style={{ accentColor: 'var(--primary-600)' }}
              />
              <div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Enable multi-step form</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Break form into multiple steps for better user experience
                </p>
              </div>
            </label>

            {form.settings.isMultiStep && (
              <div className="ml-8 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Fields per step:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.settings.stepsPerPage || 5}
                    onChange={(e) =>
                      updateSettings({ stepsPerPage: parseInt(e.target.value) })
                    }
                    className="w-20 px-3 py-2 rounded-lg outline-none text-sm"
                    style={{ border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.showProgressBar !== false}
                    onChange={(e) =>
                      updateSettings({ showProgressBar: e.target.checked })
                    }
                    className="w-4 h-4 rounded focus:ring-2 outline-none"
                    style={{ accentColor: 'var(--primary-600)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Show progress bar
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Close Type */}
        <div>
          <label className="block font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Form Closing Options</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={form.settings.closeType === "manual"}
                onChange={() => updateSettings({ closeType: "manual" })}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--primary-600)' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>Manual close only</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={form.settings.closeType === "datetime"}
                onChange={() => updateSettings({ closeType: "datetime" })}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--primary-600)' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>Close at specific date and time</span>
            </label>

            {form.settings.closeType === "datetime" && (
              <input
                type="datetime-local"
                value={form.settings.closeDateTime || ""}
                onChange={(e) =>
                  updateSettings({ closeDateTime: e.target.value })
                }
                className="ml-7 px-4 py-2 rounded-lg outline-none"
                style={{ border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={form.settings.closeType === "custom"}
                onChange={() => updateSettings({ closeType: "custom" })}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--primary-600)' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>Close after custom time</span>
            </label>

            {form.settings.closeType === "custom" && (
              <div className="ml-7 flex items-center gap-2">
                <input
                  type="number"
                  value={form.settings.customCloseTime || 24}
                  onChange={(e) =>
                    updateSettings({
                      customCloseTime: parseInt(e.target.value),
                    })
                  }
                  className="w-24 px-4 py-2 rounded-lg outline-none"
                  style={{ border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  min="1"
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>hours from now</span>
              </div>
            )}
          </div>
        </div>

        {/* Manual Close/Open */}
        <div>
          <button
            onClick={() =>
              updateSettings({ isClosed: !form.settings.isClosed })
            }
            className="px-6 py-3 rounded-lg font-medium transition"
            style={form.settings.isClosed
              ? { background: 'var(--success)', color: 'var(--text-inverse)' }
              : { background: 'var(--error)', color: 'var(--text-inverse)' }}
            onMouseOver={e => {
              if (form.settings.isClosed) e.currentTarget.style.background = 'var(--success-dark)';
              else e.currentTarget.style.background = 'var(--error-dark)';
            }}
            onMouseOut={e => {
              if (form.settings.isClosed) e.currentTarget.style.background = 'var(--success)';
              else e.currentTarget.style.background = 'var(--error)';
            }}
          >
            {form.settings.isClosed ? "Open Form" : "Close Form"}
          </button>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Current status: {" "}
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {form.settings.isClosed ? "Closed" : "Open"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
