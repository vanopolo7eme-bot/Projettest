import React, { useState, useMemo } from 'react';
import { emploiDuTemps, classes, matieres, enseignants, etablissements } from '../../data/mockData';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, Users, User, DoorOpen, Calendar } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import ExportDropdown from '../../components/ui/ExportDropdown';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HEURES = ['08:00', '10:00', '12:00', '14:00', '16:00'];

const typeMap: Record<string, string> = {
  'Mathématiques': 'maths',
  'Français': 'francais',
  'Physique-Chimie': 'sciences',
  'SVT': 'sciences',
  'Histoire-Géo': 'histoire',
  'Histoire-Géographie': 'histoire',
  'Anglais': 'anglais',
  'EPS': 'eps',
  'Arts Plastiques': 'eps',
  'Philosophie': 'francais',
  'Sciences': 'sciences',
};

type VueType = 'classe' | 'enseignant' | 'salle' | 'jour';

// Collect all unique rooms from the schedule
function getAllSalles(schedule: typeof emploiDuTemps) {
  const salles = new Set<string>();
  schedule.forEach(e => { if (e.salle) salles.add(e.salle); });
  return Array.from(salles).sort();
}

export default function EmploiDuTempsPage() {
  const [vue, setVue] = useState<VueType>('classe');
  const [selectedClasse, setSelectedClasse] = useState(1);
  const [selectedEnseignant, setSelectedEnseignant] = useState(enseignants[0]?.id ?? 1);
  const [selectedSalle, setSelectedSalle] = useState('G1');
  const [selectedJour, setSelectedJour] = useState('Lundi');

  const [schedule, setSchedule] = useState(() =>
    emploiDuTemps.map((e, index) => ({ ...e, id: `event-${index}`, classeId: 1 }))
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();
  const isParent = user?.role === 'Parent';

  const [newEvent, setNewEvent] = useState({
    jour: 'Lundi', heure: '08:00', matiereId: matieres[0].id, enseignantId: enseignants[0].id, salle: ''
  });

  const classe = classes.find(c => c.id === selectedClasse);
  const classSchedule = schedule.filter(e => e.classeId === selectedClasse);
  const allSalles = useMemo(() => getAllSalles(schedule), [schedule]);

  const getEvent = (jour: string, heure: string, source?: typeof classSchedule) =>
    (source || classSchedule).find(e => e.jour === jour && e.heure === heure);

  // Filtered schedules for different views
  const enseignantObj = enseignants.find(en => en.id === selectedEnseignant);
  const enseignantSchedule = useMemo(() => {
    if (!enseignantObj) return [];
    const fullName = `${enseignantObj.prenom} ${enseignantObj.nom}`;
    // Also match partial names: "Dr. Nziengui", "Mme Moussavou", etc.
    return schedule.filter(e =>
      e.enseignant === fullName ||
      e.enseignant.includes(enseignantObj.nom)
    );
  }, [schedule, enseignantObj]);

  const salleSchedule = useMemo(() =>
    schedule.filter(e => e.salle === selectedSalle),
    [schedule, selectedSalle]
  );

  const jourSchedule = useMemo(() =>
    classSchedule.filter(e => e.jour === selectedJour),
    [classSchedule, selectedJour]
  );

  const handleDelete = (id: string, matiereName: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le cours de ${matiereName} ?`)) {
      setSchedule(prev => prev.filter(e => e.id !== id));
      showToast(`Cours de ${matiereName} supprime.`, 'success');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.salle) {
      showToast('Veuillez indiquer une salle.', 'error');
      return;
    }

    const existing = classSchedule.find(ev => ev.jour === newEvent.jour && ev.heure === newEvent.heure);
    if (existing) {
      showToast(`Ce creneau est deja occupe par un cours de ${existing.matiere}.`, 'warning');
      return;
    }

    const mat = matieres.find(m => m.id === newEvent.matiereId);
    const ens = enseignants.find(en => en.id === newEvent.enseignantId);
    if (!mat || !ens) return;

    const created = {
      id: `event-${Date.now()}`,
      classeId: selectedClasse,
      jour: newEvent.jour,
      heure: newEvent.heure,
      matiere: mat.nom,
      enseignant: `${ens.prenom} ${ens.nom}`,
      salle: newEvent.salle,
      type: typeMap[mat.nom] || 'eps',
      duree: 2
    };

    setSchedule(prev => [...prev, created]);
    setIsModalOpen(false);
    showToast(`Cours de ${mat.nom} planifie avec succes.`, 'success');
    setNewEvent({ ...newEvent, salle: '' });
  };

  // Stats
  const totalHours = classSchedule.length * 2;
  const totalMatieres = new Set(classSchedule.map(e => e.matiere)).size;
  const totalProfs = new Set(classSchedule.map(e => e.enseignant)).size;

  // Renders a full week grid for a given schedule source
  const renderWeekGrid = (source: typeof classSchedule, label: string) => (
    <div className="timetable-grid" id="timetable-export">
      <div className="timetable-header"></div>
      {JOURS.map(j => <div key={j} className="timetable-header">{j}</div>)}

      {HEURES.map(h => (
        <React.Fragment key={h}>
          <div className="timetable-time">{h}</div>
          {JOURS.map(j => {
            const ev = getEvent(j, h, source);
            return (
              <div key={`${j}-${h}`} className="timetable-cell" style={{ position: 'relative' }}>
                {ev && (
                  <div className={`timetable-event ${ev.type}`} style={{ position: 'relative' }}>
                    {!isParent && vue === 'classe' && (
                      <button
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6, padding: '2px' }}
                        onClick={() => handleDelete(ev.id, ev.matiere)}
                        title="Supprimer ce cours"
                      >
                        <Trash2 size={12} color="#000" />
                      </button>
                    )}
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>{ev.matiere}</div>
                    <div style={{ opacity: 0.7 }}>{ev.enseignant}</div>
                    <div style={{ opacity: 0.6 }}>{ev.salle}</div>
                    {vue !== 'classe' && (ev as any).classeId && (
                      <div style={{ opacity: 0.5, fontSize: '11px', marginTop: '2px' }}>
                        {classes.find(c => c.id === (ev as any).classeId)?.nom}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  // Render jour view (single day for class)
  const renderJourView = () => (
    <div style={{ padding: '24px' }}>
      {jourSchedule.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
          <Calendar size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ fontSize: '15px' }}>Aucun cours prevu le {selectedJour} pour {classe?.nom}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jourSchedule
            .sort((a, b) => a.heure.localeCompare(b.heure))
            .map(ev => (
            <div key={ev.id} style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
              <div style={{ width: '80px', textAlign: 'center', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a5f' }}>{ev.heure}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{ev.duree}h</div>
              </div>
              <div style={{ width: '4px', borderRadius: '4px', background: typeMap[ev.matiere] === 'maths' ? '#3498db' : typeMap[ev.matiere] === 'francais' ? '#e74c3c' : typeMap[ev.matiere] === 'sciences' ? '#27ae60' : typeMap[ev.matiere] === 'histoire' ? '#f39c12' : typeMap[ev.matiere] === 'anglais' ? '#f4a623' : '#7c3aed', flexShrink: 0 }} />
              <div className={`timetable-event ${ev.type}`} style={{ flex: 1, margin: 0, borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{ev.matiere}</div>
                <div style={{ opacity: 0.7, fontSize: '13px' }}>
                  <User size={12} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  {ev.enseignant}
                </div>
                <div style={{ opacity: 0.6, fontSize: '13px', marginTop: '2px' }}>
                  <DoorOpen size={12} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  {ev.salle}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Secondary selector based on view
  const renderSecondarySelector = () => {
    switch (vue) {
      case 'classe':
        return (
          <select className="form-select" style={{ width: '200px' }} value={selectedClasse} onChange={e => setSelectedClasse(Number(e.target.value))}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        );
      case 'enseignant':
        return (
          <select className="form-select" style={{ width: '240px' }} value={selectedEnseignant} onChange={e => setSelectedEnseignant(Number(e.target.value))}>
            {enseignants.map(en => <option key={en.id} value={en.id}>{en.prenom} {en.nom} -- {en.specialite}</option>)}
          </select>
        );
      case 'salle':
        return (
          <select className="form-select" style={{ width: '200px' }} value={selectedSalle} onChange={e => setSelectedSalle(e.target.value)}>
            {allSalles.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        );
      case 'jour':
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select className="form-select" style={{ width: '200px' }} value={selectedClasse} onChange={e => setSelectedClasse(Number(e.target.value))}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <select className="form-select" style={{ width: '160px' }} value={selectedJour} onChange={e => setSelectedJour(e.target.value)}>
              {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const getViewTitle = () => {
    switch (vue) {
      case 'classe': return `Semaine en cours -- ${classe?.nom}`;
      case 'enseignant': return `Emploi du temps -- ${enseignantObj ? `${enseignantObj.prenom} ${enseignantObj.nom}` : ''}`;
      case 'salle': return `Occupation -- Salle ${selectedSalle}`;
      case 'jour': return `${selectedJour} -- ${classe?.nom}`;
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Academique</span><span className="breadcrumb-sep">/</span><span>Emploi du temps</span></div>
          <h1 className="page-title">Emploi du Temps</h1>
          <p className="page-subtitle">Gestion des plannings hebdomadaires des classes</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExportDropdown data={classSchedule} filename={`Emploi_du_temps_${classe?.nom?.replace(/ /g, '_') || 'Classe'}`} elementId="timetable-export" />
          {renderSecondarySelector()}
          {!isParent && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Nouveau cours
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{totalHours}h</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Heures / semaine</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#3498db' }}>{totalMatieres}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Matieres</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#27ae60' }}>{totalProfs}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Enseignants</div>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-ghost btn-icon"><ChevronLeft size={18} /></button>
            <span style={{ fontWeight: 700 }}>
              <CalendarDays size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
              {getViewTitle()}
            </span>
            <button className="btn btn-ghost btn-icon"><ChevronRight size={18} /></button>
          </div>
          <div className="tab-bar" style={{ border: 'none', marginBottom: 0 }}>
            <div className={`tab-item ${vue === 'classe' ? 'active' : ''}`} onClick={() => setVue('classe')}>
              <Users size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
              Par Classe
            </div>
            <div className={`tab-item ${vue === 'enseignant' ? 'active' : ''}`} onClick={() => setVue('enseignant')}>
              <User size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
              Par Enseignant
            </div>
            <div className={`tab-item ${vue === 'salle' ? 'active' : ''}`} onClick={() => setVue('salle')}>
              <DoorOpen size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
              Par Salle
            </div>
            <div className={`tab-item ${vue === 'jour' ? 'active' : ''}`} onClick={() => setVue('jour')}>
              <Calendar size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
              Vue Jour
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: vue === 'jour' ? '0' : '0' }}>
          {vue === 'classe' && renderWeekGrid(classSchedule, classe?.nom || '')}
          {vue === 'enseignant' && renderWeekGrid(enseignantSchedule, enseignantObj ? `${enseignantObj.prenom} ${enseignantObj.nom}` : '')}
          {vue === 'salle' && renderWeekGrid(salleSchedule, `Salle ${selectedSalle}`)}
          {vue === 'jour' && renderJourView()}
        </div>
      </div>

      {/* Modal add course */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Planifier un cours -- ${classe?.nom}`}
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" form="add-course-form" className="btn btn-primary"><Plus size={16} /> Enregistrer</button>
          </div>
        }
      >
        <form id="add-course-form" onSubmit={handleCreate}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Jour</label>
              <select className="form-select" value={newEvent.jour} onChange={e => setNewEvent({ ...newEvent, jour: e.target.value })}>
                {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Heure de debut</label>
              <select className="form-select" value={newEvent.heure} onChange={e => setNewEvent({ ...newEvent, heure: e.target.value })}>
                {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Classe</label>
            <select className="form-select" value={selectedClasse} onChange={e => setSelectedClasse(Number(e.target.value))}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Matiere</label>
            <select className="form-select" value={newEvent.matiereId} onChange={e => setNewEvent({ ...newEvent, matiereId: Number(e.target.value) })}>
              {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Enseignant</label>
            <select className="form-select" value={newEvent.enseignantId} onChange={e => setNewEvent({ ...newEvent, enseignantId: Number(e.target.value) })}>
              {enseignants.map(en => <option key={en.id} value={en.id}>{en.prenom} {en.nom} -- {en.specialite}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Salle</label>
            <input type="text" className="form-input" required value={newEvent.salle} onChange={e => setNewEvent({ ...newEvent, salle: e.target.value })} placeholder="Ex: Salle A1, Labo 3..." />
          </div>
        </form>
      </Modal>
    </div>
  );
}
