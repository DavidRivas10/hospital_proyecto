import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Para ver el stack en consola
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 18, marginBottom: 8 }}>⚠️ Ha ocurrido un error en la UI</h1>
          <pre style={{ whiteSpace: "pre-wrap", color: "#b91c1c" }}>
            {String(this.state.error?.message ?? this.state.error ?? "Unknown error")}
          </pre>
          <p style={{ marginTop: 8 }}>
            Abre la consola del navegador para más detalles. Prueba ir a{" "}
            <a href="/__ping" style={{ color: "#2563eb", textDecoration: "underline" }}>/__ping</a>.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

