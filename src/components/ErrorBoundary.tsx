import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Loguear el error para diagnóstico
    console.error("ErrorBoundary atrapó un error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full border rounded-lg bg-card shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Ocurrió un problema</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Se produjo un error inesperado. Puedes intentar recargar o volver a intentar.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => window.location.reload()} className="px-3 py-2 text-sm rounded-md border">
                Recargar página
              </button>
              <button onClick={this.handleRetry} className="px-3 py-2 text-sm rounded-md border">
                Reintentar
              </button>
            </div>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="mt-4 p-3 text-xs bg-muted rounded overflow-auto">
                {String(this.state.error?.message)}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactNode;
  }
}
