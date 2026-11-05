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

const typeLabels: Record<Appointment['type'], string> = {
  consulta: 'Consulta',
  vacina: 'Vacina',
  cirurgia: 'Cirurgia',
  retorno: 'Retorno',
};

const statusLabels: Record<Appointment['status'], string> = {
  agendado: 'Agendado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const statusBadgeClass: Record<Appointment['status'], string> = {
  agendado: 'badge-info',
  em_andamento: 'badge-warning',
  concluido: 'badge-success',
  cancelado: 'badge-danger',
};

const alertTypeConfig: Record<Alert['type'], { bg: string; border: string; color: string; icon: React.ReactNode }> = {
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    color: '#1e40af',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#92400e',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  danger: {
    bg: '#fef2f2',
    border: '#fecaca',
    color: '#991b1b',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

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
      <div>
        <div className="app-page-header">
          <h1 className="app-page-title">Dashboard</h1>
          <p className="app-page-subtitle">Visão geral da clínica</p>
        </div>
        <div className="dashboard-grid">
          <Skeleton count={3} height={180} />
          <Skeleton count={2} height={180} />
          <Skeleton count={3} height={180} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1 className="app-page-title">Dashboard</h1>
          <p className="app-page-subtitle">Visão geral da clínica - {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-card-value">{appointments.length}</div>
          <div className="stat-card-label">Agendamentos hoje</div>
          <div className="stat-card-trend positive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="23 6 13.5 15.5 8.5 10.5" />
              <line x1="17" y1="6" x2="17" y2="18" />
              <line x1="7" y1="6" x2="7" y2="18" />
            </svg>
            <span>+2 vs ontem</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-card-value">{appointments.filter(a => a.status === 'concluido').length}</div>
          <div className="stat-card-label">Concluídos</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="stat-card-value">{hospitalizedPets.length}</div>
          <div className="stat-card-label">Internados</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="stat-card-value">{alerts.filter(a => a.type === 'danger').length}</div>
          <div className="stat-card-label">Alertas críticos</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <header className="dashboard-section-header">
            <h2 className="dashboard-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Agenda do Dia
            </h2>
          </header>
          <div className="dashboard-section-body">
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.5 }} aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>Nenhum agendamento para hoje</p>
              </div>
            ) : (
              <div className="dashboard-list">
                {appointments.map(apt => (
                  <div key={apt.id} className="dashboard-list-item">
                    <div className="dashboard-list-item-content">
                      <div className="dashboard-list-item-title">
                        <strong>{apt.time}</strong> - {apt.petName} ({apt.tutorName})
                      </div>
                      <div className="dashboard-list-item-meta">
                        <span>{typeLabels[apt.type]}</span>
                        <span className={statusBadgeClass[apt.status]}>{statusLabels[apt.status]}</span>
                      </div>
                    </div>
                    <div className="dashboard-list-item-actions">
                      <button className="btn btn-ghost btn-sm" aria-label={`Ver detalhes de ${apt.petName}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <header className="dashboard-section-header">
            <h2 className="dashboard-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Pacientes Internados
            </h2>
          </header>
          <div className="dashboard-section-body">
            {hospitalizedPets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.5 }} aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p>Nenhum paciente internado</p>
              </div>
            ) : (
              <div className="dashboard-list">
                {hospitalizedPets.map(pet => (
                  <div key={pet.id} className="dashboard-list-item">
                    <div className="dashboard-list-item-content">
                      <div className="dashboard-list-item-title">
                        <strong>{pet.petName}</strong> ({pet.species}) - {pet.tutorName}
                      </div>
                      <div className="dashboard-list-item-meta">
                        <span>Internado desde: {pet.admissionDate}</span>
                        <span>{pet.condition}</span>
                      </div>
                    </div>
                    <div className="dashboard-list-item-actions">
                      <button className="btn btn-ghost btn-sm" aria-label={`Ver detalhes de ${pet.petName}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <header className="dashboard-section-header">
            <h2 className="dashboard-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Alertas Rápidos
            </h2>
          </header>
          <div className="dashboard-section-body">
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.5 }} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p>Nenhum alerta</p>
              </div>
            ) : (
              <div className="dashboard-list">
                {alerts.map(alert => {
                  const config = alertTypeConfig[alert.type];
                  return (
                    <div key={alert.id} className="dashboard-list-item" style={{ borderLeft: `4px solid ${config.border}`, background: config.bg }}>
                      <div className="dashboard-list-item-content" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <div style={{ flexShrink: 0, color: config.color }}>{config.icon}</div>
                          <div>
                            <div className="dashboard-list-item-title" style={{ color: config.color }}>{alert.message}</div>
                            <div className="dashboard-list-item-meta" style={{ color: config.color }}>
                              <span>{alert.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};