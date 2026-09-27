import { LandingSectionPublicDTO } from "../../../../shared/types";

export interface SectionComponentProps<TContent = any, TSettings = any> {
  id: string;
  sectionKey: string;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
  content: TContent;
  settings: TSettings;
  sortOrder: number;
}

export interface SectionDefinition<TContent = any, TSettings = any> {
  type: string;
  label: string;
  description?: string;
  component: React.ComponentType<SectionComponentProps<TContent, TSettings>>;
  validate?: (content: unknown, settings: unknown) => boolean;
  defaults?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    content?: TContent;
    settings?: TSettings;
  };
}

export type { LandingSectionPublicDTO };
