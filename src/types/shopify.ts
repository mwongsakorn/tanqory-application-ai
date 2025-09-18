export type DemoActionVariant = 'primary' | 'secondary' | 'ghost';

export interface DemoAction {
  label: string;
  message: string;
  variant?: DemoActionVariant;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  actions?: DemoAction[];
  tags?: string[];
}

export interface ShopifySection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  highlight: string;
  tips?: string[];
  features: Feature[];
}
