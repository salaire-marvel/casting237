import { useState, useEffect } from 'react';
import { supabase, Reservation, CastingDate } from './lib/supabase';
import Header from './components/Header';
import Footer from './components/Footer';
import TimeslotGrid from './components/TimeslotGrid';
import BookingModal from './components/BookingModal';
import SuccessMessage from './components/SuccessMessage';
import AdminView from './components/AdminView';
import AddDateModal from './components/AddDateModal';
import EditBookingModal from './components/EditBookingModal';

const MAX_CANDIDATES = 3;

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h < 20; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00 - ${h.toString().padStart(2, '0')}:30`);
    slots.push(`${h.toString().padStart(2, '0')}:30 - ${(h + 1).toString().padStart(2, '0')}:00`);
  }
  return slots;
}

function App() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [castingDates, setCastingDates] = useState<CastingDate[]>([]);
  const [currentDateId, setCurrentDateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDateModalOpen, setIsAddDateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    fetchCastingDates();
    fetchAllReservations();

    const reservationsChannel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => {
          fetchAllReservations();
        }
      )
      .subscribe();

    const datesChannel = supabase
      .channel('dates-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'casting_dates' },
        () => {
          fetchCastingDates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reservationsChannel);
      supabase.removeChannel(datesChannel);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (currentDateId) {
      const filtered = allReservations.filter((r) => r.casting_date_id === currentDateId);
      setReservations(filtered);
    }
  }, [currentDateId, allReservations]);

  const fetchCastingDates = async () => {
    try {
      const { data, error } = await supabase
        .from('casting_dates')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (error) throw error;
      setCastingDates(data || []);

      if (data && data.length > 0 && !currentDateId) {
        setCurrentDateId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching casting dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAllReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const reservationCounts = reservations.reduce((acc, res) => {
    acc[res.timeslot] = (acc[res.timeslot] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedReservation(null);
  };

  const handleUpdateReservation = async (data: { name: string; email: string; phone: string; timeslot: string }) => {
    if (!selectedReservation) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update(data)
        .eq('id', selectedReservation.id);

      if (error) throw error;

      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating reservation:', error);
      alert("La mise à jour de la réservation a échoué. Veuillez réessayer.");
    }
  };

  const handleBookingSubmit = async (data: { name: string; email: string; phone: string }) => {
    if (!selectedSlot || !currentDateId) return;

    const currentCount = reservationCounts[selectedSlot] || 0;
    if (currentCount >= MAX_CANDIDATES) {
      alert('Ce créneau est désormais complet.');
      handleCloseModal();
      return;
    }

    try {
      // Check for existing reservation with the same email or phone for the current date
      const { data: existingReservations, error: existingError } = await supabase
        .from('reservations')
        .select('id')
        .eq('casting_date_id', currentDateId)
        .or(`email.eq.${data.email},phone.eq.${data.phone}`);

      if (existingError) throw existingError;

      if (existingReservations && existingReservations.length > 0) {
        alert('Vous avez déjà réservé un créneau pour cette date de casting.');
        handleCloseModal();
        return;
      }

      const { error } = await supabase.from('reservations').insert([
        {
          timeslot: selectedSlot,
          name: data.name,
          email: data.email,
          phone: data.phone,
          casting_date_id: currentDateId,
        },
      ]);

      if (error) throw error;

      // Optimistically update the UI
      const newReservation: Reservation = {
        id: `temp-${Date.now()}`, // Temporary ID
        timeslot: selectedSlot,
        name: data.name,
        email: data.email,
        phone: data.phone,
        created_at: new Date().toISOString(),
        casting_date_id: currentDateId,
      };
      setAllReservations((prev) => [...prev, newReservation]);

      // Envoi de l'email de confirmation (non-bloquant)
      const currentCastingDate = castingDates.find((d) => d.id === currentDateId);
      if (currentCastingDate) {
        supabase.functions.invoke('send-confirmation-email', {
          body: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            timeslot: selectedSlot,
            castingDate: currentCastingDate.date,
            castingTitle: currentCastingDate.title,
          },
        }).catch((err) => {
          console.error('Email sending failed (non-critical):', err);
          // L'échec de l'email n'affecte pas la réservation
        });
      }

      handleCloseModal();
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('La réservation a échoué. Veuillez réessayer.');
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      const { error } = await supabase.from('reservations').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('La suppression a échoué. Veuillez réessayer.');
    }
  };

  const handleSwitchDate = (dateId: string) => {
    setCurrentDateId(dateId);
  };

  const handleAddDate = () => {
    setIsAddDateModalOpen(true);
  };

  const handleAddDateSubmit = async (data: { date: string; title: string }) => {
    try {
      const { error } = await supabase.from('casting_dates').insert([
        {
          date: data.date,
          title: data.title,
          is_active: true,
        },
      ]);

      if (error) throw error;

      setIsAddDateModalOpen(false);
    } catch (error) {
      console.error('Error adding date:', error);
      alert("L'ajout de la date a échoué. Veuillez réessayer.");
    }
  };

  const handleDeleteDate = async (id: string) => {
    try {
      const { error } = await supabase.from('casting_dates').delete().eq('id', id);

      if (error) throw error;

      if (currentDateId === id && castingDates.length > 1) {
        const remainingDates = castingDates.filter((d) => d.id !== id);
        if (remainingDates.length > 0) {
          setCurrentDateId(remainingDates[0].id);
        }
      }
    } catch (error) {
      console.error('Error deleting date:', error);
      alert('La suppression a échoué. Veuillez réessayer.');
    }
  };

  const currentDate = castingDates.find((d) => d.id === currentDateId);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto p-4 md:p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {isAdminView ? (
          <AdminView
            reservations={reservations}
            timeSlots={timeSlots}
            maxCandidates={MAX_CANDIDATES}
            castingDates={castingDates}
            currentDateId={currentDateId}
            onDeleteReservation={handleDeleteReservation}
            onSwitchDate={handleSwitchDate}
            onAddDate={handleAddDate}
            onDeleteDate={handleDeleteDate}
            onEditReservation={handleEditReservation}
          />
        ) : (
          <>
            {currentDate && (
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">{currentDate.title}</h3>
                <p className="text-slate-500 mt-1">
                  Choisissez un créneau de 30 minutes pour votre audition.
                </p>
                <p className="text-sm text-amber-800 bg-amber-100 p-3 rounded-lg mt-4 border border-amber-200">
                  Pour le respect de l'organisation et des autres candidats, merci de ne réserver
                  qu'un créneau que vous êtes certain(e) d'honorer.
                </p>
              </div>
            )}
            <TimeslotGrid
              timeSlots={timeSlots}
              reservationCounts={reservationCounts}
              maxCandidates={MAX_CANDIDATES}
              onSlotClick={handleSlotClick}
              selectedSlot={selectedSlot}
            />
          </>
        )}
      </main>
      <Footer />

      <BookingModal
        isOpen={isModalOpen}
        timeslot={selectedSlot || ''}
        onClose={handleCloseModal}
        onSubmit={handleBookingSubmit}
      />

      <AddDateModal
        isOpen={isAddDateModalOpen}
        onClose={() => setIsAddDateModalOpen(false)}
        onSubmit={handleAddDateSubmit}
      />

      <EditBookingModal
        isOpen={isEditModalOpen}
        reservation={selectedReservation}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateReservation}
        timeslots={timeSlots}
      />

      <SuccessMessage isVisible={showSuccess} onHide={() => setShowSuccess(false)} />
    </>
  );
}

export default App;
