"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Something went wrong</CardTitle>
        </div>
        <CardDescription>
          An error occurred while loading this part of the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {process.env.NODE_ENV === "development" && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <strong>Error:</strong> {error.message}
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            size="sm"
          >
            Reload page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// State Management Error Boundary specifically for context providers
export function StateErrorBoundary({ children }: { children: React.ReactNode }) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log state management errors
    console.error("State management error:", error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    // errorReporting.captureException(error, { extra: errorInfo });
  };

  return (
    <ErrorBoundary onError={handleError} fallback={StateErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

function StateErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Application State Error</CardTitle>
        </div>
        <CardDescription>
          There was an error with the application state. This might be due to a temporary
          issue or a problem with your session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Try refreshing the page or signing out and back in if the problem persists.
        </div>
        <div className="flex gap-2">
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            size="sm"
          >
            Reload page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ErrorBoundary;