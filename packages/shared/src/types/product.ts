export type SailProduct = {
  id: string;
  name: string;
  price: number | null;
  priceTaxExc: number | null;
  image: string | null;
  link: string | null;
  gamme: string | null;
  highlights: string[];
  attributes: string[];
  onSale: boolean;
};

export type ProductDetail = {
  name: string | null;
  price: number | null;
  priceTaxExc: number | null;
  currency: string | null;
  sku: string | null;
  weight: string | null;
  availability: string | null;
  images: string[];
  breadcrumbs: string[];
  shortDescription: string | null;
  fullDescription: string | null;
  configOptions: ProductConfigOption[];
};

export type ProductConfigOption = {
  label: string;
  type: 'select' | 'radio' | 'text' | 'number';
  options: string[];
};

export type ConfigField = {
  key: string;
  label: string;
  fieldType?: 'select' | 'radio' | 'text' | 'number';
  options: string[];
  priceModifiers?: Record<string, number>;
};

export type ProductConfig = {
  fields: ConfigField[];
};
