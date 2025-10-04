import { useState, useEffect } from 'react';
import { Reservation } from '../lib/supabase';

interface EditBookingModalProps {
  isOpen: boolean;
  reservation: Reservation | null;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string; timeslot: string }) => Promise<void>;
  timeslots: string[];
}

export default function EditBookingModal({
  isOpen,
  reservation,
  onClose,
  onSubmit,
  timeslots,
}: EditBookingModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [timeslot, setTimeslot] = useState('');

  useEffect(() => {
    if (reservation) {
      setName(reservation.name);
      setEmail(reservation.email);
      setPhone(reservation.phone);
      setTimeslot(reservation.timeslot);
    }
  }, [reservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, email, phone, timeslot });
  };

  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Modifier la réservation</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="timeslot" className="block text-slate-700 font-semibold mb-2">Créneau</label>
            <select
              id="timeslot"
              value={timeslot}
              onChange={(e) => setTimeslot(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {timeslots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-slate-700 font-semibold mb-2">Nom</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-slate-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="phone" className="block text-slate-700 font-semibold mb-2">Téléphone</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}