export default function Footer() {
  return (
    <footer className="bg-white mt-12 border-t">
      <div className="container mx-auto py-6 px-4 text-center text-slate-500">
        <p className="font-bold text-slate-700">Maison Marvelous Casting</p>
        <p className="text-sm">Restaurant 5 Fourchettes, Bonamoussadi, Douala, Cameroun</p>
        <p className="text-xs text-slate-400 mt-1">À côté du restaurant "5 fourchettes"</p>
        <div className="mt-4">
          <p className="text-sm">
            Contact: <a href="tel:+237656656764" className="font-semibold text-blue-600 hover:underline">+237 6 56 65 67 64</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
