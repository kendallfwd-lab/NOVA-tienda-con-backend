import { PackageOpen } from 'lucide-react';

export function EmptyState({ title = 'Sin resultados', subtitle = 'No encontramos información para mostrar.' }) {
  return <div className="state-box"><PackageOpen size={26} /><strong>{title}</strong><span>{subtitle}</span></div>;
}
