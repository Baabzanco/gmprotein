import React from "react";
import { AdminModal } from "./AdminModal";
import { AdminButton } from "./AdminButton";
import { AlertTriangle, Info } from "lucide-react";

export interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const AdminConfirmDialog: React.FC<AdminConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  isDanger = false,
  isLoading = false,
}) => {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {isDanger ? (
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          ) : (
            <Info className="w-5 h-5 text-sky-500" />
          )}
          <span>{title}</span>
        </div>
      }
      maxWidth="md"
      footer={
        <>
          <AdminButton variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </AdminButton>
          <AdminButton
            variant={isDanger ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </AdminButton>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {message}
      </p>
    </AdminModal>
  );
};
