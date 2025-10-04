interface TimeslotGridProps {
  timeSlots: string[];
  reservationCounts: Record<string, number>;
  maxCandidates: number;
  onSlotClick: (slot: string) => void;
  selectedSlot: string | null;
}

export default function TimeslotGrid({
  timeSlots,
  reservationCounts,
  maxCandidates,
  onSlotClick,
  selectedSlot,
}: TimeslotGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {timeSlots.map((slot) => {
          const reservedCount = reservationCounts[slot] || 0;
          const remaining = maxCandidates - reservedCount;
          const isFull = remaining <= 0;
          const isAlmostFull = remaining === 1;

          let bgColor = 'bg-emerald-100 hover:bg-emerald-200';
          let textColor = 'text-emerald-800';
          let borderColor = 'border-emerald-200';

          if (isAlmostFull) {
            bgColor = 'bg-orange-100 hover:bg-orange-200';
            textColor = 'text-orange-800';
            borderColor = 'border-orange-200';
          }
          if (isFull) {
            bgColor = 'bg-rose-200 cursor-not-allowed';
            textColor = 'text-rose-500';
            borderColor = 'border-rose-300';
          }

          const isSelected = selectedSlot === slot;

          return (
            <button
              key={slot}
              onClick={() => !isFull && onSlotClick(slot)}
              disabled={isFull}
              className={`p-3 rounded-lg border text-center transition-all duration-200 transform hover:scale-105 shadow-sm ${bgColor} ${textColor} ${borderColor} ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className="font-bold">{slot}</div>
              <div className="text-sm mt-1">
                {isFull ? 'Complet' : `${remaining} places restantes`}
              </div>
            </button>
          );
        })}
    </div>
  );
}
