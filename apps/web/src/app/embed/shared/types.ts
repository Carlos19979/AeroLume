import type { TemplateTenant, TemplateStep, ThemeTemplate } from '../templates/types';

export type Tenant = TemplateTenant;
export type Step = TemplateStep;
export type { ThemeTemplate };

export type Boat = {
  id: string;
  model: string;
  boatModel: string | null;
  length: string | null;
  [key: string]: unknown;
};

export type ConfigField = {
  id: string;
  key: string;
  label: string;
  fieldType: string | null;
  options: string[];
  sortOrder: number | null;
  required: boolean | null;
  msrpModifiers: Record<string, number> | null;
  percentModifiers: Record<string, number> | null;
};

export type PricingTier = {
  id: string;
  minSqm: string;
  maxSqm: string;
  msrpPerSqm: string;
  sortOrder: number | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sailType: string;
  variant: 'cruising' | 'cruising_plus' | 'cruising_racing' | null;
  basePrice: string | null;
  currency: string | null;
  descriptionShort: string | null;
  features: string[] | null;
  configFields: ConfigField[];
  pricingTiers: PricingTier[];
};

export type SailGroup = 'main' | 'head' | 'spi';

export type Pricing = {
  base: number;
  pricePerSqm: number;
  extras: { label: string; amount: number }[];
  total: number;
};
