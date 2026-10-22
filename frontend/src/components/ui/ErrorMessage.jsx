import { AlertTriangle } from 'lucide-react';

export function ErrorMessage({ message }) {
  return message ? <div className="error-message" role="alert"><AlertTriangle size={17} />{message}</div> : null;
}
