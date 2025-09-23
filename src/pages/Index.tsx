import React, { useState } from 'react';
import { Wrench, Calendar as CalendarIcon, Building2 } from 'lucide-react';
import Calendar from '@/components/Calendar';
import AppointmentModal from '@/components/AppointmentModal';

interface Appointment {
  id: string;
  clientName: string;
  phone: string;
  address: string;
  cep: string;
  appliance: string;
  problem: string;
  shift: 'morning' | 'afternoon';
  time: string;
}

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Record<string, Appointment[]>>({});

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSaveAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    if (!selectedDate) return;

    const dateKey = getDateKey(selectedDate);
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
    };

    setAppointments(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newAppointment],
    }));
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (!selectedDate) return;

    const dateKey = getDateKey(selectedDate);
    setAppointments(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(apt => apt.id !== appointmentId),
    }));
  };

  const selectedDateAppointments = selectedDate 
    ? appointments[getDateKey(selectedDate)] || []
    : [];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card shadow-soft border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Building2 className="h-8 w-8" />
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Thermotec</h1>
              <p className="text-muted-foreground">Sistema de Agendamento de Assistência Técnica</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Calendário de Atendimentos</h2>
          </div>
          <p className="text-muted-foreground">
            Clique em qualquer dia para agendar ou visualizar atendimentos
          </p>
        </div>

        <Calendar 
          onDateSelect={handleDateSelect}
          appointments={appointments}
        />
      </main>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        selectedDate={selectedDate || new Date()}
        appointments={selectedDateAppointments}
        onSaveAppointment={handleSaveAppointment}
        onDeleteAppointment={handleDeleteAppointment}
      />
    </div>
  );
};

export default Index;
