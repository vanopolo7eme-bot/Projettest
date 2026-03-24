import React, { useState } from 'react';
import { CalendarDays, Filter, Flag, BookOpen, GraduationCap, PartyPopper, Clock } from 'lucide-react';

const evenementsScolaires = [
  { id: 1, titre: 'Rentrée scolaire', date: '2025-09-08', dateFin: '2025-09-08', type: 'Événement', description: 'Accueil des élèves et des parents dans tous les établissements du groupe.' },
  { id: 2, titre: 'Réunion parents-professeurs T1', date: '2025-10-18', dateFin: '2025-10-18', type: 'Réunion', description: 'Rencontre avec les enseignants pour faire le point sur le début d\'année.' },
  { id: 3, titre: 'Vacances de la Toussaint', date: '2025-10-25', dateFin: '2025-11-03', type: 'Vacances', description: 'Pause pédagogique d\'automne — reprise le 4 novembre.' },
  { id: 4, titre: 'Examens mi-trimestre T1', date: '2025-11-17', dateFin: '2025-11-21', type: 'Examen', description: 'Évaluations de mi-trimestre pour toutes les classes.' },
  { id: 5, titre: 'Conseils de classe T1', date: '2025-12-08', dateFin: '2025-12-12', type: 'Réunion', description: 'Conseils de classe du premier trimestre.' },
  { id: 6, titre: 'Vacances de Noël', date: '2025-12-20', dateFin: '2026-01-05', type: 'Vacances', description: 'Vacances de fin d\'année — reprise le 6 janvier.' },
  { id: 7, titre: 'Journée portes ouvertes', date: '2026-01-25', dateFin: '2026-01-25', type: 'Événement', description: 'Accueil des familles candidates pour découvrir nos établissements.' },
  { id: 8, titre: 'Examens T2', date: '2026-03-02', dateFin: '2026-03-06', type: 'Examen', description: 'Examens de fin de deuxième trimestre.' },
  { id: 9, titre: 'Vacances de février', date: '2026-02-14', dateFin: '2026-02-23', type: 'Vacances', description: 'Pause pédagogique de février.' },
  { id: 10, titre: 'Semaine culturelle', date: '2026-03-23', dateFin: '2026-03-27', type: 'Événement', description: 'Activités artistiques, théâtre, musique et expositions dans tous les établissements.' },
  { id: 11, titre: 'Vacances de Pâques', date: '2026-04-04', dateFin: '2026-04-19', type: 'Vacances', description: 'Vacances de printemps — reprise le 20 avril.' },
  { id: 12, titre: 'BEPC Blanc', date: '2026-04-27', dateFin: '2026-04-30', type: 'Examen', description: 'Examen blanc du BEPC pour les classes de 3ème.' },
  { id: 13, titre: 'Baccalauréat Blanc', date: '2026-05-04', dateFin: '2026-05-08', type: 'Examen', description: 'Baccalauréat blanc pour les classes de Terminale.' },
  { id: 14, titre: 'Fête de l\'école', date: '2026-06-06', dateFin: '2026-06-06', type: 'Événement', description: 'Fête annuelle avec spectacles, remise de prix et activités pour les familles.' },
  { id: 15, titre: 'Examens finaux T3', date: '2026-06-08', dateFin: '2026-06-19', type: 'Examen', description: 'Examens de fin d\'année pour toutes les classes.' },
  { id: 16, titre: 'Fin de l\'année scolaire', date: '2026-06-30', dateFin: '2026-06-30', type: 'Événement', description: 'Clôture officielle de l\'année scolaire 2025-2026.' },
];

const typeConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Vacances: { color: '#10b981', bg: '#d1fae5', icon: <PartyPopper size={16} /> },
  Examen: { color: '#ef4444', bg: '#fee2e2', icon: <BookOpen size={16} /> },
  Réunion: { color: '#3b82f6', bg: '#dbeafe', icon: <GraduationCap size={16} /> },
  Événement: { color: '#f4a623', bg: '#fef3c7', icon: <Flag size={16} /> },
};

export default function CalendrierScolairePage() {
  const [filterType, setFilterType] = useState('');
  const types = ['', 'Vacances', 'Examen', 'Réunion', 'Événement'];

  const filtered = filterType ? evenementsScolaires.filter(e => e.type === filterType) : evenementsScolaires;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const getMonthYear = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  // Group by month
  const grouped: Record<string, typeof evenementsScolaires> = {};
  filtered.forEach(e => {
    const key = getMonthYear(e.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Académique</span><span className="breadcrumb-sep">/</span><span>Calendrier Scolaire</span></div>
          <h1 className="page-title">Calendrier Scolaire</h1>
          <p className="page-subtitle">Année scolaire 2025-2026 — Événements, vacances et examens</p>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', gap: '6px' }}>
            {types.map(t => (
              <button key={t} className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterType(t)}>
                {t || 'Tous'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {Object.entries(typeConfig).map(([type, cfg]) => (
          <div key={type} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setFilterType(type === filterType ? '' : type)}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', background: cfg.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
                {cfg.icon}
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: cfg.color }}>{evenementsScolaires.filter(e => e.type === type).length}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{type}s</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><CalendarDays size={18} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Timeline de l'année</div>
        </div>
        <div className="card-body">
          {Object.entries(grouped).map(([month, events]) => (
            <div key={month} style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a5f', textTransform: 'capitalize', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e3a5f' }} />
                {month}
              </div>
              <div className="timeline">
                {events.map(event => {
                  const cfg = typeConfig[event.type];
                  const isRange = event.date !== event.dateFin;
                  return (
                    <div key={event.id} className="timeline-item">
                      <div className="timeline-dot" style={{ background: cfg.color, boxShadow: `0 0 0 4px ${cfg.bg}` }} />
                      <div className="timeline-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon} {event.type}</span>
                          <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {formatDate(event.date)}{isRange ? ` → ${formatDate(event.dateFin)}` : ''}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{event.titre}</h4>
                        <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>{event.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
