import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve?: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (opts: { title?: string; message: string; confirmText?: string; cancelText?: string }) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export const useConfirm = (): ConfirmContextValue => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmState>({ open: false, title: '', message: '' });

  const confirm = useCallback(({ title, message, confirmText, cancelText }: { title?: string; message: string; confirmText?: string; cancelText?: string; }) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, title: title || 'Confirm action', message, confirmText, cancelText, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    const resolver = state.resolve;
    setState({ open: false, title: '', message: '' });
    resolver?.(result);
  };

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {state.open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="modal">
            <h4 id="confirm-title" className="modal-title">{state.title}</h4>
            <p className="modal-message">{state.message}</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => handleClose(false)}>{state.cancelText || 'Cancel'}</button>
              <button className="btn-save" onClick={() => handleClose(true)}>{state.confirmText || 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};


