import { LoaderCircle } from 'lucide-react';

export function Loader({ text = 'Cargando información...' }) {
  return <div className="state-box"><LoaderCircle className="spin" size={24} /><span>{text}</span></div>;
}
