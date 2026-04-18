import { notFound } from 'next/navigation';
import { SailPreview } from '@/app/embed/sail-preview';

// Dev-only harness — returns 404 in production builds.
// Used by Playwright visual regression tests to mount SailPreview
// in isolation without driving the multi-step configurator flow.
//
// Usage: /sail-preview-harness?sailType=gvstd&variant=cruising&reefs=2&accent=%23ff0055

interface PageProps {
  searchParams: Promise<{ sailType?: string; variant?: string; reefs?: string; accent?: string }>;
}

export default async function SailPreviewHarnessPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const params = await searchParams;
  const sailType = params.sailType ?? 'gvstd';
  const variant = (params.variant ?? 'cruising') as 'cruising' | 'cruising_plus' | 'cruising_racing' | null;
  const reefs = params.reefs != null ? Number(params.reefs) : undefined;
  const accent = params.accent ?? '#b45309';

  return (
    <html>
      <body style={{ margin: 0, padding: 0, background: '#ffffff' }}>
        {/* Fixed 400×500 container — matches snapshot dimensions */}
        <div
          data-testid="sail-preview-harness"
          style={{ width: 400, height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <SailPreview
            sailType={sailType}
            variant={variant}
            reefs={reefs}
            accent={accent}
          />
        </div>
      </body>
    </html>
  );
}
