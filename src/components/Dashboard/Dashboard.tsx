import React, { useState, useEffect } from 'react';
import { Skeleton } from './Skeleton';

interface Appointment {
  id: string;
  time: string;
  petName: string;
  tutorName: string;
  type: 'consulta' | 'vacina' | 'cirurgia' | 'retorno';
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
}

interface HospitalizedPet {
  id: string;
  petName: string;
  species: string;
  tutorName: string;
  admissionDate: string;
  condition: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: string;
}

export const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hospitalizedPets, setHospitalizedPets] = useState<HospitalizedPet[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments([
        { id: '1', time: '08:00', petName: 'Rex', tutorName: 'João Silva', type: 'consulta', status: 'agendado' },
        { id: '2', time: '09:30', petName: 'Mimi', tutorName: 'Maria Santos', type: 'vacina', status: 'agendado' },
        { id: '3', time: '11:00', petName: 'Thor', tutorName: 'Pedro Oliveira', type: 'cirurgia', status: 'em_andamento' },
        { id: '4', time: '14:00', petName: 'Luna', tutorName: 'Ana Costa', type: 'retorno', status: 'agendado' },
      ]);
      setHospitalizedPets([
        { id: '1', petName: 'Bolt', species: 'Cachorro', tutorName: 'Carlos Lima', admissionDate: '2024-01-15', condition: 'Pós-operatório' },
        { id: '2', petName: 'Nina', species: 'Gato', tutorName: 'Fernanda Alves', admissionDate: '2024-01-14', condition: 'Desidratação' },
      ]);
      setAlerts([
        { id: '1', type: 'warning', message: 'Vacina V10 vencendo em 3 dias para o pet Rex', timestamp: '2024-01-15 08:00' },
        { id: '2', type: 'info', message: 'Nova atualização do sistema disponível', timestamp: '2024-01-15 07:30' },
        { id: '3', type: 'danger', message: 'Pet Thor em cirurgia de emergência', timestamp: '2024-01-15 11:00' },
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <Skeleton count={3} />
          <Skeleton count={2} />
          <Skeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard - Visão Geral</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
          <h3>Agenda do Dia</h3>
          {appointments.length === 0 ? (
            <p>Nenhum agendamento para hoje</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {appointments.map(apt => (
                <li key={apt.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{apt.time}</strong> - {apt.petName} ({apt.tutorName})
                    <br />
                    <small>{apt.type} - <span style={{ textTransform: 'capitalize' }}>{apt.status.replace('_', ' ')}</span></small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
          <h3>Pacientes Internados</h3>
          {hospitalizedPets.length === 0 ? (
            <p>Nenhum paciente internado</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {hospitalizedPets.map(pet => (
                <li key={pet.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <strong>{pet.petName}</strong> ({pet.species}) - {pet.tutorName}
                  <br />
                  <small>Internado desde: {pet.admissionDate} - {pet.condition}</small>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
          <h3>Alertas Rápidos</h3>
          {alerts.length === 0 ? (
            <p>Nenhum alerta</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {alerts.map(alert => (
                <li key={alert.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', borderLeft: `4px solid ${alert.type === 'danger' ? '#dc3545' : alert.type === 'warning' ? '#ffc107' : '#17a2b8'}`, paddingLeft: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{alert.message}</span>
                    <small>{alert.timestamp}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};