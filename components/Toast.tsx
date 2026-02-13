import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />
  };

  const borders = {
    success: 'border-emerald-500/50',
    error: 'border-rose-500/50',
    warning: 'border-amber-500/50',
    info: 'border-sky-500/50'
  };

  const backgrounds = {
    success: 'bg-emerald-950/40',
    error: 'bg-rose-950/40',
    warning: 'bg-amber-950/40',
    info: 'bg-sky-950/40'
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border ${borders[type]} ${backgrounds[type]} backdrop-blur-xl shadow-2xl animate-[slideInRight_0.4s_ease-out] transform transition-all`}>
      {icons[type]}
      <p className="text-sm font-medium text-white">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors ml-2">
        <X size={14} className="text-slate-400" />
      </button>
    </div>
  );
};

export default Toast;
