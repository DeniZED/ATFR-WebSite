import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  type: 'error' | 'warning' | 'info';
  onClose: () => void;
}

export default function ErrorMessage({ message, type, onClose }: ErrorMessageProps) {
  const styles = {
    error: 'bg-red-900/30 text-red-400 border-red-500/30',
    warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-900/30 text-blue-400 border-blue-500/30'
  };

  return (
    <div className={`p-4 rounded-lg flex items-center gap-3 border ${styles[type]}`}>
      <AlertCircle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
      <p className="flex-1">{message}</p>
      <button 
        onClick={onClose}
        className="text-current hover:opacity-80"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}