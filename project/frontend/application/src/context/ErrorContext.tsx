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
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setError(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{error.title}</h2>
              <button className="modal-close" onClick={() => setError(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="error-content">
                <div className="error-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="error-message">{error.message}</p>
              </div>
              <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
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
