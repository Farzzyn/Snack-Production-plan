import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon = toast.type === 'success' ? CheckCircle2
          : toast.type === 'error' ? AlertCircle
          : toast.type === 'warning' ? AlertTriangle
          : Info;

        return (
          <div key={toast.id} className={`toast toast-${toast.type || 'info'}`}>
            <Icon size={18} />
            <div style={{ flex: 1 }}>
              {toast.title && <div style={{ fontWeight: 600, fontSize: '13px' }}>{toast.title}</div>}
              <div style={{ fontSize: '12px', opacity: 0.9 }}>{toast.message}</div>
            </div>
            <button 
              onClick={() => onDismiss(toast.id)}
              style={{ background: 'transparent', border: 'none', color: 'white', opacity: 0.7, cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
