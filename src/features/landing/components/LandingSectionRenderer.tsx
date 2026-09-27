import React from "react";
import { LandingSectionPublicDTO } from "../types";
import { sectionRegistry } from "../registry/sectionRegistry";

interface SectionErrorBoundaryProps {
  sectionKey: string;
  children: React.ReactNode;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(
      `[LandingSectionRenderer] Error rendering section '${this.props.sectionKey}':`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      // In development, render subtle fallback; in production render nothing to avoid visual glitch
      if (process.env.NODE_ENV !== "production") {
        return (
          <div className="p-4 m-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs rounded-xl text-center">
            خطا در نمایش بخش: {this.props.sectionKey}
          </div>
        );
      }
      return null;
    }
    return this.props.children;
  }
}

export interface LandingSectionRendererProps {
  section: LandingSectionPublicDTO;
}

export const LandingSectionRenderer: React.FC<LandingSectionRendererProps> = ({ section }) => {
  if (!section || !section.type) {
    return null;
  }

  const definition = sectionRegistry.get(section.type);

  if (!definition) {
    // Unknown section type: fail safely without crashing
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[LandingSectionRenderer] Unknown section type '${section.type}' for key '${section.key}'. Skipped safely.`
      );
    }
    return null;
  }

  const Component = definition.component;

  return (
    <SectionErrorBoundary sectionKey={section.key || section.id}>
      <Component
        id={section.id}
        sectionKey={section.key}
        type={section.type}
        title={section.title}
        subtitle={section.subtitle}
        badge={section.badge}
        content={section.content ?? {}}
        settings={section.settings ?? {}}
        sortOrder={section.sortOrder}
      />
    </SectionErrorBoundary>
  );
};
