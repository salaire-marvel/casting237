import { Users } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="h-10 w-10 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Maison Marvelous Casting
          </h1>
        </div>
      </div>
    </header>
  );
}
