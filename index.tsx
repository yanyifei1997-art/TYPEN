
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Immediately hide the boot loader as soon as index.tsx execution begins
if (typeof (window as any).hideLoader === 'function') {
  (window as any).hideLoader();
}

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fixed ErrorBoundary by ensuring inheritance from Component correctly uses Props and State generics
class ErrorBoundary extends Component<Props, State> {
  // Explicitly declare state property to resolve TypeScript "property does not exist" errors
  public state: State;

  constructor(props: Props) {
    super(props);
    // Initialize state within the constructor as per React class component standards
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Correctly accessing state and props which are now properly typed via generics
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl text-center border border-red-100">
            <h1 className="text-2xl font-black text-slate-900 mb-4">Application Error</h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred during initialization."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all"
            >
              RELOAD APP
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
