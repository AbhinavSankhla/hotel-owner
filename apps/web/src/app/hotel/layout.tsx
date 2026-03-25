'use client';

/**
 * Hotel Tenant Layout
 * Wraps all hotel-specific pages with tenant context, themed header/footer.
 * In production, the middleware resolves the hotel domain and injects headers.
 * In dev, we use the "radhika-resort" slug as default.
 */

import { useSearchParams } from 'next/navigation';
import { TenantProvider, useTenant } from '@/lib/tenant/tenant-context';
import { TenantHeader } from '@/components/tenant/tenant-header';
import { TenantFooter } from '@/components/tenant/tenant-footer';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { hotel } = useTenant();
  
  const themeClass = hotel?.template 
    ? `theme-${hotel.template.toLowerCase().replace(/_/g, '-')}`
    : 'theme-modern-minimal';

  return (
    <div className={`min-h-screen ${themeClass}`}>
      <TenantHeader />
      <main className="min-h-screen">{children}</main>
      <TenantFooter />
    </div>
  );
}

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const slug = searchParams.get('hotel') || undefined; // ?hotel=radhika-resort for dev

  return (
    <TenantProvider slug={slug}>
      <ThemeWrapper>
        {children}
      </ThemeWrapper>
    </TenantProvider>
  );
}
