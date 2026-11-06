import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from './Skeleton';
import {
  useDashboardAppointments,
  useDashboardAlerts,
  useDashboardStats,
  useDashboardTutorsAtendimento,
  useDashboardPetsAtendimento,
} from '../../hooks/useApi';
import { useToast } from '../../components/Toast';

interface Appointment {
  id: string;
  time: string;
  petName: string;
  tutorName: string;
  type: 'consulta' | 'vacina' | 'cirurgia' | 'retorno';
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
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
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState<'tutores' | 'pets'>('tutores');

  const { data: appointments, isLoading: appointmentsLoading, error: appointmentsError } = useDashboardAppointments();
  const { data: alerts, isLoading: alertsLoading, error: alertsError } = useDashboardAlerts();
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: tutorsAtendimento, isLoading: tutorsLoading, error: tutorsError } = useDashboardTutorsAtendimento();
  const { data: petsAtendimento, isLoading: petsLoading, error: petsError } = useDashboardPetsAtendimento();

  const isLoading = appointmentsLoading || alertsLoading || statsLoading || tutorsLoading || petsLoading;
  const hasError = appointmentsError || alertsError || statsError || tutorsError || petsError;

  const appointmentList = appointments ?? [];
  const tutorList = tutorsAtendimento ?? [];
  const petList = petsAtendimento ?? [];

  React.useEffect(() => {
    if (hasError) {
      showError('Erro ao carregar dashboard', 'Não foi possível sincronizar todos os dados do banco.');
    }
  }, [hasError, showError]);

  if (isLoading) {
    return (
      <div>
        <div className="app-page-header">
          <h1 className="app-page-title">Dashboard</h1>
          <p className="app-page-subtitle">Carregando métricas e dados de segurança...</p>
        </div>
        <div className="dashboard-grid">
          <Skeleton count={4} height={120} />
          <Skeleton count={2} height={260} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="app-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="app-page-title">Painel Clínico & Atendimento</h1>
          <p className="app-page-subtitle">
            Visão Geral - {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/prontuarios" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }} aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Prontuário
          </Link>
          <Link to="/tutores" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }} aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Cadastrar Tutor
          </Link>
        </div>
      </div>

      {/* Banner de Segurança & LGPD */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          borderRadius: 'var(--radius-md, 8px)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <div style={{ color: '#059669', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }} aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div style={{ flex: 1, fontSize: '0.875rem', lineHeight: '1.4' }}>
          <strong style={{ color: '#065f46', display: 'block', marginBottom: '0.15rem' }}>
            Proteção de Dados & Menor Privilégio Ativos no Banco de Dados
          </strong>
          <span style={{ color: '#047857' }}>
            Os dados de atendimento abaixo são fornecidos diretamente pelas Views estruturais{' '}
            <code style={{ background: 'rgba(255,255,255,0.7)', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>vw_tutors_atendimento</code> e{' '}
            <code style={{ background: 'rgba(255,255,255,0.7)', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>vw_pets_atendimento</code>.
            CPFs são mascarados e prontuários confidenciais são preservados fora do alcance da recepção.
          </span>
        </div>
      </div>

      {/* Grade de Estatísticas Reais */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            </svg>
          </div>
          <div className="stat-card-value">{stats?.totalPatients ?? petList.length}</div>
          <div className="stat-card-label">Pacientes (vw_pets)</div>
          <div className="stat-card-trend positive">
            <span>Animais cadastrados</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-card-value">{stats?.totalTutors ?? tutorList.length}</div>
          <div className="stat-card-label">Tutores (vw_tutors)</div>
          <div className="stat-card-trend positive">
            <span>Protegido por LGPD</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="stat-card-value">{stats?.totalRecords ?? appointmentList.length}</div>
          <div className="stat-card-label">Prontuários Gravados</div>
          <div className="stat-card-trend positive">
            <span>Histórico clínico</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-card-value">{stats?.todayRecords ?? 0}</div>
          <div className="stat-card-label">Atendimentos Hoje</div>
          <div className="stat-card-trend positive">
            <span>Registrados no dia</span>
          </div>
        </div>
      </div>

      {/* Seção Principal: Central de Atendimento & Recepção baseada nas Views Seguras */}
      <section className="dashboard-section" style={{ marginBottom: '2rem' }}>
        <header className="dashboard-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 className="dashboard-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }} aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Recepção e Contato Seguro
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('tutores')}
              className={`btn btn-sm ${activeTab === 'tutores' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontWeight: 600 }}
            >
              Tutores (vw_tutors_atendimento)
            </button>
            <button
              onClick={() => setActiveTab('pets')}
              className={`btn btn-sm ${activeTab === 'pets' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontWeight: 600 }}
            >
              Pacientes (vw_pets_atendimento)
            </button>
          </div>
        </header>

        <div className="dashboard-section-body" style={{ padding: '0.75rem' }}>
          {activeTab === 'tutores' ? (
            tutorList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <p>Nenhum tutor localizado na view de atendimento.</p>
                <Link to="/tutores" className="btn btn-sm btn-outline" style={{ marginTop: '0.5rem' }}>Cadastrar primeiro tutor</Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nome do Tutor</th>
                      <th>Telefone / Contato</th>
                      <th>E-mail</th>
                      <th>CPF (Proteção LGPD)</th>
                      <th>Cadastrado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutorList.map(tutor => (
                      <tr key={tutor.id}>
                        <td>
                          <strong>{tutor.fullName}</strong>
                        </td>
                        <td>
                          {tutor.phone ? (
                            <a href={`tel:${tutor.phone}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                              {tutor.phone}
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Não informado</span>
                          )}
                        </td>
                        <td>{tutor.email || <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#334155',
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            {tutor.cpfMascarado}
                          </span>
                        </td>
                        <td>{new Date(tutor.createdAt).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            petList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <p>Nenhum paciente localizado na view de atendimento.</p>
                <Link to="/prontuarios" className="btn btn-sm btn-outline" style={{ marginTop: '0.5rem' }}>Registrar paciente e atendimento</Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nome do Pet</th>
                      <th>Espécie</th>
                      <th>Raça</th>
                      <th>Peso</th>
                      <th>Nascimento</th>
                      <th>Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {petList.map(pet => (
                      <tr key={pet.id}>
                        <td>
                          <strong>{pet.name}</strong>
                        </td>
                        <td>
                          <span className="badge-info" style={{ textTransform: 'capitalize' }}>
                            {pet.species}
                          </span>
                        </td>
                        <td>{pet.breed || 'SRD'}</td>
                        <td>{pet.weightKg ? `${pet.weightKg} kg` : '-'}</td>
                        <td>{pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('pt-BR') : '-'}</td>
                        <td>{new Date(pet.createdAt).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </section>

      {/* Grid Inferior: Atendimentos Recentes & Alertas do Sistema */}
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
              Últimos Atendimentos / Prontuários
            </h2>
          </header>
          <div className="dashboard-section-body">
            {appointmentList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.5 }} aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>Nenhum atendimento recente registrado</p>
                <Link to="/prontuarios" className="btn btn-sm btn-primary" style={{ marginTop: '0.75rem' }}>
                  Registrar Consulta
                </Link>
              </div>
            ) : (
              <div className="dashboard-list">
                {appointmentList.map(apt => (
                  <div key={apt.id} className="dashboard-list-item">
                    <div className="dashboard-list-item-content">
                      <div className="dashboard-list-item-title">
                        <strong>{apt.time}</strong> - {apt.petName} ({apt.tutorName})
                      </div>
                      <div className="dashboard-list-item-meta">
                        <span>{typeLabels[apt.type] ?? 'Consulta'}</span>
                        <span className={statusBadgeClass[apt.status] ?? 'badge-success'}>{statusLabels[apt.status] ?? 'Concluído'}</span>
                      </div>
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
              Alertas de Segurança & Sistema
            </h2>
          </header>
          <div className="dashboard-section-body">
            {alerts?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p>Nenhum alerta ativo</p>
              </div>
            ) : (
              <div className="dashboard-list">
                {alerts?.map(alert => {
                  const config = alertTypeConfig[alert.type] ?? alertTypeConfig.info;
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
