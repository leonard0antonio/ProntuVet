import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    number: '01',
    title: 'Histórico em um só lugar',
    description:
      'Consulte os dados dos tutores, pacientes e atendimentos sem precisar procurar em fichas e arquivos separados.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
        <path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h7" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Rotina mais organizada',
    description:
      'Acompanhe atendimentos, consultas e informações importantes da clínica em um painel simples de entender.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
        <path d="M8 2.5v4M16 2.5v4M3.5 9.5h17M8 13h3M8 16.5h7" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Acesso protegido',
    description:
      'Entre com sua conta para acessar os dados da clínica e mantenha as informações organizadas em um ambiente dedicado.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3 19 6v5c0 4.7-2.9 8-7 10-4.1-2-7-5.3-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export const Landing: React.FC = () => (
  <div className="landing-page">
    <header className="landing-header">
      <nav className="landing-nav landing-container" aria-label="Navegação principal">
        <Link className="landing-brand" to="/" aria-label="ProntuVet — início">
          <span className="landing-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 3 4 9l12 6 12-6-12-6Z" />
              <path d="m4 16 12 6 12-6M4 23l12 6 12-6" />
            </svg>
          </span>
          <span>prontu<span>vet</span></span>
        </Link>

        <div className="landing-nav-links">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#sobre">Sobre o sistema</a>
        </div>

        <div className="landing-nav-actions">
          <Link className="landing-login-link" to="/login">Entrar</Link>
          <Link className="landing-button landing-button-small" to="/login?cadastro=1">
            Criar conta <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </nav>
    </header>

    <main>
      <section className="landing-hero" id="sobre">
        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow"><span /> Gestão veterinária, sem complicação</p>
            <h1>
              Mais tempo para cuidar.
              <span>Mais clareza para gerir.</span>
            </h1>
            <p className="landing-hero-description">
              Organize tutores, pacientes e atendimentos em um só lugar com o
              ProntuVet — feito para acompanhar o dia a dia da sua clínica.
            </p>
            <div className="landing-hero-actions">
              <Link className="landing-button" to="/login?cadastro=1">
                Conheça o ProntuVet <span aria-hidden="true">↗</span>
              </Link>
              <a className="landing-text-link" href="#funcionalidades">
                Ver funcionalidades <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="landing-note">
              <span className="landing-note-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="m5 10 3.2 3.2L15.5 6" />
                </svg>
              </span>
              Acesse de forma simples e segura com sua conta
            </div>
          </div>

          <div className="landing-preview-wrap" aria-label="Prévia ilustrativa do painel do ProntuVet">
            <div className="landing-orbit landing-orbit-one" />
            <div className="landing-orbit landing-orbit-two" />
            <div className="landing-preview">
              <div className="landing-preview-topbar">
                <div className="landing-preview-brand">
                  <span className="landing-preview-mark" aria-hidden="true">+</span>
                  <span>prontuvet</span>
                </div>
                <span className="landing-preview-avatar" aria-hidden="true">V</span>
              </div>
              <div className="landing-preview-body">
                <div className="landing-preview-greeting">
                  <span>PAINEL DA CLÍNICA</span>
                  <strong>Olá, doutora 👋</strong>
                  <small>Um resumo da sua rotina</small>
                </div>
                <div className="landing-preview-stats">
                  <div className="landing-preview-stat">
                    <span className="landing-stat-icon landing-stat-pets" aria-hidden="true">♡</span>
                    <span className="landing-stat-label">Pacientes</span>
                    <strong>Seus pacientes</strong>
                  </div>
                  <div className="landing-preview-stat">
                    <span className="landing-stat-icon landing-stat-visits" aria-hidden="true">✳</span>
                    <span className="landing-stat-label">Atendimentos</span>
                    <strong>Sua rotina</strong>
                  </div>
                </div>
                <div className="landing-preview-list">
                  <div className="landing-preview-list-head">
                    <strong>Atendimentos</strong>
                    <span>Exemplo</span>
                  </div>
                  <div className="landing-preview-row">
                    <span className="landing-pet-avatar landing-pet-one" aria-hidden="true">L</span>
                    <span className="landing-pet-details"><strong>Luna</strong><small>Consulta de rotina</small></span>
                    <span className="landing-appointment-time">09:30</span>
                  </div>
                  <div className="landing-preview-row">
                    <span className="landing-pet-avatar landing-pet-two" aria-hidden="true">T</span>
                    <span className="landing-pet-details"><strong>Tobias</strong><small>Retorno</small></span>
                    <span className="landing-appointment-time">10:15</span>
                  </div>
                </div>
              </div>
              <div className="landing-preview-caption">Uma visão simples da rotina da clínica</div>
            </div>
            <div className="landing-floating-card">
              <span className="landing-floating-icon" aria-hidden="true">✦</span>
              <span><strong>Tudo organizado</strong><small>em um só lugar</small></span>
            </div>
            <span className="landing-deco landing-deco-one" aria-hidden="true">✳</span>
            <span className="landing-deco landing-deco-two" aria-hidden="true">✦</span>
          </div>
        </div>
        <div className="landing-hero-bottom" aria-hidden="true">
          <span>PRONTUÁRIOS</span><i /><span>ATENDIMENTOS</span><i /><span>CUIDADO</span>
        </div>
      </section>

      <section className="landing-features" id="funcionalidades">
        <div className="landing-container">
          <div className="landing-section-heading">
            <p className="landing-eyebrow"><span /> Um sistema pensado para sua rotina</p>
            <h2>O essencial para cuidar<br />bem da sua clínica.</h2>
            <p>Menos tempo procurando informações. Mais foco em cada paciente.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(feature => (
              <article className="landing-feature-card" key={feature.number}>
                <div className="landing-feature-card-top">
                  <span className="landing-feature-icon">{feature.icon}</span>
                  <span className="landing-feature-number">{feature.number}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-container landing-cta-inner">
          <div>
            <p className="landing-eyebrow"><span /> Comece por aqui</p>
            <h2>Sua clínica merece<br />uma rotina mais leve.</h2>
          </div>
          <div className="landing-cta-action">
            <p>Entre na sua conta ou crie um cadastro para conhecer o sistema.</p>
            <Link className="landing-button landing-button-light" to="/login?cadastro=1">
              Começar agora <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>

    <footer className="landing-footer">
      <div className="landing-container landing-footer-inner">
        <Link className="landing-brand" to="/" aria-label="ProntuVet — início">
          <span className="landing-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 3 4 9l12 6 12-6-12-6Z" />
              <path d="m4 16 12 6 12-6M4 23l12 6 12-6" />
            </svg>
          </span>
          <span>prontu<span>vet</span></span>
        </Link>
        <p>ProntuVet · Gestão veterinária com mais cuidado.</p>
        <Link to="/login">Acessar sistema <span aria-hidden="true">↗</span></Link>
      </div>
    </footer>
  </div>
);
