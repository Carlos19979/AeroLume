/** @deprecated Used only by legacy Sailonet scraping routes */
export type SailonetProduct = {
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

/** @deprecated Used only by legacy Sailonet scraping routes */
export type SailonetProductDetail = {
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

/** Product as stored in the database */
export type Product = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  sailType: string;
  gamme: string | null;
  basePrice: number | null;
  currency: string;
  descriptionShort: string | null;
  descriptionFull: string | null;
  images: string[];
  sku: string | null;
  weight: string | null;
  availability: string | null;
  minBoatLength: number | null;
  maxBoatLength: number | null;
  minSailArea: number | null;
  maxSailArea: number | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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
