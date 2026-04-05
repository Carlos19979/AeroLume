import { BoatsClient } from './client';
import { PageHeader } from '@/components/ui/PageHeader';

export default function BoatsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Barcos" description="Base de datos de barcos disponibles en tu configurador." />
      <BoatsClient />
    </div>
  );
}
