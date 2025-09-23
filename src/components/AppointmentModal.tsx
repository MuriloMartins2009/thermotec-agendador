import React, { useState } from 'react';
import { X, Clock, User, Phone, MapPin, Wrench, AlertCircle, Trash2, Plus, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  appointments: Appointment[];
  onSaveAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onDeleteAppointment: (id: string) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  appointments,
  onSaveAppointment,
  onDeleteAppointment,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    address: '',
    cep: '',
    appliance: '',
    problem: '',
    shift: 'morning' as 'morning' | 'afternoon',
    time: '',
  });

  const appliances = [
    'Lavadora',
    'Secadora',
    'Lava e Seca',
    'Lava Louça',
    'Geladeira',
    'Freezer',
  ];

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            cep: cleanCep,
            address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    } else {
      setFormData(prev => ({ ...prev, cep: cleanCep }));
    }
  };

  const handlePhoneChange = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, phone: cleanPhone }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.phone || !formData.appliance || !formData.time) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSaveAppointment(formData);
    setFormData({
      clientName: '',
      phone: '',
      address: '',
      cep: '',
      appliance: '',
      problem: '',
      shift: 'morning',
      time: '',
    });
    
    toast({
      title: "Agendamento criado",
      description: "O atendimento foi agendado com sucesso!",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const morningAppointments = appointments.filter(apt => apt.shift === 'morning');
  const afternoonAppointments = appointments.filter(apt => apt.shift === 'afternoon');

  const handlePrint = (shift: 'morning' | 'afternoon') => {
    const appointmentsToPrint = shift === 'morning' ? morningAppointments : afternoonAppointments;
    const shiftName = shift === 'morning' ? 'Manhã' : 'Tarde';
    const dateStr = formatDate(selectedDate);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Agendamentos ${shiftName} - ${dateStr}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 28px;
            }
            .header h2 {
              color: #16a34a;
              margin: 5px 0 0 0;
              font-size: 20px;
            }
            .appointment {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 15px;
              page-break-inside: avoid;
            }
            .appointment-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .client-name {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
            }
            .appointment-time {
              background: #dbeafe;
              color: #1e40af;
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
            .appointment-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 10px;
            }
            .detail-item {
              margin-bottom: 8px;
            }
            .detail-label {
              font-weight: bold;
              color: #374151;
              display: block;
              margin-bottom: 2px;
            }
            .detail-value {
              color: #6b7280;
            }
            .problem-section {
              grid-column: 1 / -1;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #f1f5f9;
            }
            .no-appointments {
              text-align: center;
              color: #6b7280;
              font-style: italic;
              padding: 40px;
            }
            @media print {
              body { margin: 0; }
              .appointment { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Thermotec - Assistência Técnica</h1>
            <h2>Agendamentos do Turno da ${shiftName}</h2>
            <p style="margin: 10px 0 0 0; color: #6b7280;">${dateStr}</p>
          </div>
          
          ${appointmentsToPrint.length === 0 
            ? '<div class="no-appointments">Nenhum agendamento para este turno</div>'
            : appointmentsToPrint.map((apt, index) => `
              <div class="appointment">
                <div class="appointment-header">
                  <span class="client-name">${index + 1}. ${apt.clientName}</span>
                  <span class="appointment-time">${apt.time}</span>
                </div>
                <div class="appointment-details">
                  <div class="detail-item">
                    <span class="detail-label">Telefone:</span>
                    <span class="detail-value">${apt.phone}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Aparelho:</span>
                    <span class="detail-value">${apt.appliance}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">CEP:</span>
                    <span class="detail-value">${apt.cep}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Endereço:</span>
                    <span class="detail-value">${apt.address}</span>
                  </div>
                  <div class="problem-section">
                    <span class="detail-label">Problema Relatado:</span>
                    <div class="detail-value" style="margin-top: 5px; line-height: 1.5;">${apt.problem}</div>
                  </div>
                </div>
              </div>
            `).join('')}
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-strong">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Agendamentos</h2>
            <p className="text-muted-foreground capitalize">{formatDate(selectedDate)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePrint('morning')}
              variant="outline"
              size="sm"
              className="text-primary hover:text-primary-foreground"
              disabled={morningAppointments.length === 0}
            >
              <Printer className="h-4 w-4 mr-1" />
              Imprimir Manhã
            </Button>
            <Button
              onClick={() => handlePrint('afternoon')}
              variant="outline"
              size="sm"
              className="text-primary hover:text-primary-foreground"
              disabled={afternoonAppointments.length === 0}
            >
              <Printer className="h-4 w-4 mr-1" />
              Imprimir Tarde
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Novo Agendamento */}
          <Card className="p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Novo Agendamento
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Digite o nome do cliente"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Apenas números"
                  type="tel"
                />
              </div>

              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Endereço completo"
                />
              </div>

              <div>
                <Label htmlFor="appliance">Produto *</Label>
                <Select value={formData.appliance} onValueChange={(value) => setFormData(prev => ({ ...prev, appliance: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {appliances.map((appliance) => (
                      <SelectItem key={appliance} value={appliance}>
                        {appliance}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="shift">Turno</Label>
                <Select value={formData.shift} onValueChange={(value: 'morning' | 'afternoon') => setFormData(prev => ({ ...prev, shift: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="problem">Problema Apresentado</Label>
                <Textarea
                  id="problem"
                  value={formData.problem}
                  onChange={(e) => setFormData(prev => ({ ...prev, problem: e.target.value }))}
                  placeholder="Descreva o problema..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Agendar Atendimento
              </Button>
            </form>
          </Card>

          {/* Agendamentos da Manhã */}
          <Card className="p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Manhã ({morningAppointments.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {morningAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum agendamento para a manhã
                </p>
              ) : (
                morningAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-border rounded-lg p-3 space-y-2 bg-card/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{appointment.time}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteAppointment(appointment.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{appointment.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{appointment.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{appointment.appliance}</span>
                    </div>
                    {appointment.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">{appointment.address}</span>
                      </div>
                    )}
                    {appointment.problem && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <span className="text-xs text-muted-foreground">{appointment.problem}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Agendamentos da Tarde */}
          <Card className="p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Tarde ({afternoonAppointments.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {afternoonAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum agendamento para a tarde
                </p>
              ) : (
                afternoonAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-border rounded-lg p-3 space-y-2 bg-card/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{appointment.time}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteAppointment(appointment.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{appointment.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{appointment.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{appointment.appliance}</span>
                    </div>
                    {appointment.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">{appointment.address}</span>
                      </div>
                    )}
                    {appointment.problem && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <span className="text-xs text-muted-foreground">{appointment.problem}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;