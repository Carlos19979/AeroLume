export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: ApiError;
};

export type ApiError = {
  code: string;
  message: string;
  status: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export type Quote = {
  id: string;
  tenantId: string;
  boatId: string | null;
  boatModel: string;
  boatLength: number | null;
  status: QuoteStatus;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerNotes: string | null;
  totalPrice: number | null;
  currency: string;
  items: QuoteItem[];
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuoteItem = {
  id: string;
  quoteId: string;
  productId: string | null;
  sailType: string;
  productName: string;
  sailArea: number | null;
  quantity: number;
  unitPrice: number | null;
  configuration: Record<string, string>;
  sortOrder: number;
};
