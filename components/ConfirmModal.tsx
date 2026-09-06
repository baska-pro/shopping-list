import React, { useEffect } from 'react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  submessage?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  icon?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  submessage,
  confirmText = 'Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  icon,
  showCancel = true,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100 text-red-600',
          defaultIcon: '🗑️',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md shadow-red-200',
          badge: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100 text-amber-700',
          defaultIcon: '⚠️',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-md shadow-amber-200',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-100 text-emerald-700',
          defaultIcon: '✅',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-md shadow-emerald-200',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-rose-100 text-rose-700',
          defaultIcon: 'ℹ️',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-md shadow-rose-200',
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all duration-200 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl ${styles.iconBg}`}>
              {icon || styles.defaultIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                {message}
              </p>
              {submessage && (
                <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${styles.badge}`}>
                  {submessage}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
