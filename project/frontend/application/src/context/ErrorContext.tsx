import { createContext, useContext, useState, type ReactNode } from 'react';

interface ErrorInfo {
  title: string;
  message: string;
}

interface ErrorContextType {
  showError: (title: string, message: string) => void;
}

const ErrorContext = createContext<ErrorContextType>({
  showError: () => {},
});

export function useError() {
  return useContext(ErrorContext);
}

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const showError = (title: string, message: string) => {
    setError({ title, message });
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {error && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center z-[1100] bg-black/50" onClick={() => setError(null)}>
          <div className="modal w-[70%] max-w-[700px] max-h-[90vh] overflow-y-auto bg-task-gradient border border-border rounded-2xl shadow-task-box-shadow backdrop-blur-[18px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center gap-4 p-4 border-b border-border">
              <h2>{error.title}</h2>
              <button className="modal-close" onClick={() => setError(null)}>&times;</button>
            </div>
            <div className="modal-body p-5">
              <div className="error-content text-center p-4">
                <div className="error-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="error-message">{error.message}</p>
              </div>
              <div className="modal-actions flex justify-center gap-3 mt-4">
                <button className="btn btn-primary" onClick={() => setError(null)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </ErrorContext.Provider>
  );
}
