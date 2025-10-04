import { Download, Trash2, Calendar, Plus, Pencil } from 'lucide-react';
import { Reservation, CastingDate } from '../lib/supabase';

interface AdminViewProps {
  reservations: Reservation[];
  timeSlots: string[];
  maxCandidates: number;
  castingDates: CastingDate[];
  currentDateId: string | null;
  onDeleteReservation: (id: string) => Promise<void>;
  onSwitchDate: (dateId: string) => void;
  onAddDate: () => void;
  onDeleteDate: (id: string) => Promise<void>;
  onEditReservation: (reservation: Reservation) => void;
}

export default function AdminView({
  reservations,
  timeSlots,
  maxCandidates,
  castingDates,
  currentDateId,
  onDeleteReservation,
  onSwitchDate,
  onAddDate,
  onDeleteDate,
  onEditReservation,
}: AdminViewProps) {
  const groupedReservations = reservations.reduce((acc, res) => {
    if (!acc[res.timeslot]) {
      acc[res.timeslot] = [];
    }
    acc[res.timeslot].push(res);
    return acc;
  }, {} as Record<string, Reservation[]>);

  const handleExportCSV = () => {
    const currentDate = castingDates.find((d) => d.id === currentDateId);
    let csvContent = 'Créneau,Nom,Email,Téléphone\n';

    const sortedReservations = [...reservations].sort((a, b) => {
      const timeCompare = a.timeslot.localeCompare(b.timeslot);
      return timeCompare !== 0 ? timeCompare : a.name.localeCompare(b.name);
    });

    sortedReservations.forEach((res) => {
      const row = [res.timeslot, `"${res.name}"`, res.email, res.phone].join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = currentDate
      ? `casting_${currentDate.date}.csv`
      : 'casting_reservations.csv';
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTXT = () => {
    const currentDate = castingDates.find((d) => d.id === currentDateId);
    let txtContent = `Liste des réservations pour le casting "${currentDate?.title || 'Date non spécifiée'}"\n`;
    txtContent += `Date: ${currentDate?.date || 'N/A'}\n\n`;
    txtContent += '==================================================\n\n';

    const sortedReservations = [...reservations].sort((a, b) => {
      const timeCompare = a.timeslot.localeCompare(b.timeslot);
      return timeCompare !== 0 ? timeCompare : a.name.localeCompare(b.name);
    });

    let currentTimeslot = '';
    sortedReservations.forEach((res) => {
      if (res.timeslot !== currentTimeslot) {
        currentTimeslot = res.timeslot;
        txtContent += `\n--- Créneau : ${currentTimeslot} ---\n`;
      }
      txtContent += `  - Nom      : ${res.name}\n`;
      txtContent += `    Email    : ${res.email}\n`;
      txtContent += `    Téléphone: ${res.phone}\n\n`;
    });

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = currentDate
      ? `casting_${currentDate.date}.txt`
      : 'casting_reservations.txt';
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteReservation = async (id: string, candidateName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la réservation de ${candidateName} ?`)) {
      await onDeleteReservation(id);
    }
  };

  const handleDeleteDate = async (id: string, dateTitle: string) => {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer la date "${dateTitle}" ? Toutes les réservations associées seront également supprimées.`
      )
    ) {
      await onDeleteDate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold">Gestion des Dates</h2>
          <button
            onClick={onAddDate}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Ajouter une date
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {castingDates.map((date) => (
            <div
              key={date.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                currentDateId === date.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => onSwitchDate(date.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Calendar
                    size={20}
                    className={currentDateId === date.id ? 'text-blue-600' : 'text-slate-400'}
                  />
                  <div>
                    <p className="font-bold text-slate-800">{date.title}</p>
                    <p className="text-sm text-slate-500">
                      {reservations.filter((r) => r.casting_date_id === date.id).length}{' '}
                      réservations
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDate(date.id, date.title);
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold">Réservations</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Exporter en CSV
            </button>
            <button
              onClick={handleExportTXT}
              className="w-full sm:w-auto px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Exporter en TXT
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {timeSlots.map((slot) => {
            const slotReservations = groupedReservations[slot] || [];
            if (slotReservations.length === 0) return null;

            return (
              <div key={slot} className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg text-blue-700 mb-3">
                  {slot} ({slotReservations.length}/{maxCandidates})
                </h3>
                <ul className="divide-y divide-slate-200">
                  {slotReservations.map((res) => (
                    <li key={res.id} className="py-2 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-800">{res.name}</p>
                        <p className="text-sm text-slate-500">
                          {res.email || 'N/A'} | {res.phone || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditReservation(res)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Modifier la réservation"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteReservation(res.id, res.name)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Supprimer la réservation"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {reservations.length === 0 && (
            <p className="text-slate-500">Aucune réservation pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}