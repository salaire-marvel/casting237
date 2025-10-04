import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  isVisible: boolean;
  onHide: () => void;
}

export default function SuccessMessage({ isVisible, onHide }: SuccessMessageProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-5 right-5 bg-emerald-500 text-white py-3 px-5 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in z-50">
      <CheckCircle size={20} />
      Réservation confirmée avec succès !
    </div>
  );
}
