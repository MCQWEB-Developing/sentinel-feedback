import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar Acción',
    message = '¿Estás seguro de realizar esta acción?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger' // 'danger' or 'info'
}) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 pointer-events-none">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl p-6 animate-scale-in overflow-hidden glass-panel pointer-events-auto">
                {/* Glow effect - ensure it doesn't block clicks */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${variant === 'danger' ? 'bg-red-500/20' : 'bg-brand-500/20'} blur-3xl pointer-events-none`} />

                <header className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-500/10' : 'bg-brand-500/10'}`}>
                            <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-400' : 'text-brand-400'}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </header>

                <p className="text-slate-300 mb-8 leading-relaxed">
                    {message}
                </p>

                <footer className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all transform hover:scale-105 shadow-lg ${variant === 'danger'
                            ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                            : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </footer>
            </div>
        </div>
    );
}
