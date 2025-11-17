import React from "react";
import { X } from "lucide-react";

interface QRPanelProps {
  formUrl: string;
  qrCodeSrc: string;
  onClose: () => void;
}

export const QRPanel: React.FC<QRPanelProps> = ({ formUrl, qrCodeSrc, onClose }) => (
  <div
    className="rounded-xl shadow-sm border p-4 sm:p-6"
    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>QR Code</h3>
      <button onClick={onClose} className="touch-manipulation">
        <X className="w-5 h-5" style={{ color: 'var(--icon-secondary)' }} />
      </button>
    </div>
    <div className="flex flex-col items-center">
      <img
        src={qrCodeSrc}
        alt="Form QR Code"
        className="rounded-lg max-w-full h-auto"
        style={{ border: '4px solid var(--border-light)' }}
      />
      <p
        className="mt-4 text-sm break-all text-center"
        style={{ color: 'var(--text-secondary)' }}
      >
        {formUrl}
      </p>
    </div>
  </div>
);
