export type TenantPlan = 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';
export type MemberRole = 'owner' | 'admin' | 'viewer';

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  logoUrl: string | null;
  theme: TenantTheme;
  locale: string;
  currency: string;
  plan: TenantPlan;
  subscriptionStatus: SubscriptionStatus;
  allowedOrigins: string[];
  webhookUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TenantTheme = {
  accent: string;
  accentDim: string;
  navy: string;
  text: string;
  fontDisplay: string;
  fontBody: string;
};

export type TenantMember = {
  id: string;
  tenantId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
};
