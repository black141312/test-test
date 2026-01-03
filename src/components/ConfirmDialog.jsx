import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger' // 'danger' | 'warning' | 'info'
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'text-red-500 bg-red-100',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
        },
        warning: {
            icon: 'text-yellow-500 bg-yellow-100',
            button: 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20'
        },
        info: {
            icon: 'text-blue-500 bg-blue-100',
            button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
        }
    };

    const styles = variantStyles[variant] || variantStyles.danger;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm modal-overlay"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 modal-content">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-5">
                    <div className={`p-4 rounded-full ${styles.icon}`}>
                        <AlertTriangle size={28} />
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-3 text-white rounded-xl font-medium shadow-lg active:scale-[0.98] transition-all ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;


