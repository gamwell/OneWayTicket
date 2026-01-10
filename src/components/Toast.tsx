// src/components/Toast.tsx
import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast = ({ message, isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Disparaît après 3 secondes
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/10 flex items-center gap-4 min-w-[300px]">
        <div className="bg-emerald-500/20 p-2 rounded-xl">
          <CheckCircle2 className="text-emerald-400" size={20} />
        </div>
        <p className="text-white font-bold text-sm flex-grow uppercase tracking-tighter">
          {message}
        </p>
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;