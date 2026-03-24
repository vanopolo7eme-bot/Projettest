import React, { useState } from 'react';
import { classes, eleves, matieres, notes, etablissements, enseignants } from '../../data/mockData';
import { ClipboardList, Users, Check, Clock, FileText, Download, Printer, ChevronRight, Award, AlertTriangle, TrendingUp, Calendar, Plus, Save } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToPDF } from '../../utils/exportUtils';

const initialConseilsData = [
  { id: 1, classeId: 1, trimestre: 1, date: '2025-12-18', heure: '14:00', statut: 'Terminé', president: 'Marie Koumba', secretaire: 'Mme Essono' },
  { id: 2, classeId: 5, trimestre: 1, date: '2025-12-19', heure: '09:00', statut: 'Terminé', president: 'Dr. François Obiang', secretaire: 'M. Boussougou' },
  { id: 3, classeId: 8, trimestre: 1, date: '2025-12-19', heure: '14:00', statut: 'Terminé', president: 'Dr. François Obiang', secretaire: 'Dr. Nziengui' },
  { id: 4, classeId: 1, trimestre: 2, date: '2026-03-20', heure: '14:00', statut: 'Planifié', president: 'Marie Koumba', secretaire: 'Mme Essono' },
  { id: 5, classeId: 5, trimestre: 2, date: '2026-03-21', heure: '09:00', statut: 'Planifié', president: 'Dr. François Obiang', secretaire: 'M. Boussougou' },
  { id: 6, classeId: 7, trimestre: 2, date: '2026-03-21', heure: '14:00', statut: 'Planifié', president: 'Dr. François Obiang', secretaire: 'M. Mboumba' },
  { id: 7, classeId: 8, trimestre: 2, date: '2026-03-22', heure: '09:00', statut: 'Convoqué', president: 'Dr. François Obiang', secretaire: 'Dr. Nziengui' },
  { id: 8, classeId: 10, trimestre: 2, date: '2026-03-22', heure: '14:00', statut: 'Planifié', president: 'Dr. François Obiang', secretaire: 'M. Lendoye' },
];

const etapesWorkflow = ['Préparation', 'Convocation', 'Séance', 'PV Rédigé'];

function getDecision(moyenne: number) {
  if (moyenne >= 16) return { label: 'Félicitations', color: '#27ae60', icon: '🏆' };
  if (moyenne >= 14) return { label: 'Encouragements', color: '#3498db', icon: '👏' };
  if (moyenne >= 12) return { label: 'Tableau d\'honneur', color: '#f4a623', icon: '⭐' };
  if (moyenne >= 10) return { label: 'Passable', color: '#6b7280', icon: '—' };
  if (moyenne >= 8) return { label: 'Avertissement travail', color: '#f39c12', icon: '⚠️' };
  return { label: 'Blâme', color: '#e74c3c', icon: '🔴' };
}

export default function ConseilsClassePage() {
  const [conseilsList, setConseilsList] = useState(initialConseilsData);
  const [selectedConseil, setSelectedConseil] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('liste');
  const [filterTrimestre, setFilterTrimestre] = useState(2);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [newConseil, setNewConseil] = useState({
    classeId: classes[0].id,
    trimestre: 2,
    date: new Date().toISOString().split('T')[0],
    heure: '14:00',
    president: 'Dr. François Obiang',
    secretaire: ''
  });

  const filtered = conseilsList.filter(c => filterTrimestre ? c.trimestre === filterTrimestre : true);

  const getMoyenneEleve = (eleveId: number) => {
    let total = 0, coefTotal = 0;
    matieres.slice(0, 5).forEach(m => {
      const eleveNotes = notes.filter(n => n.eleveId === eleveId && n.matiereId === m.id);
      if (eleveNotes.length > 0) {
        const moy = eleveNotes.reduce((s, n) => s + n.note, 0) / eleveNotes.length;
        total += moy * m.coefficient;
        coefTotal += m.coefficient;
      }
    });
    return coefTotal > 0 ? total / coefTotal : 0;
  };

  const getWorkflowStep = (statut: string) => {
    switch (statut) {
      case 'Planifié': return 1;
      case 'Convoqué': return 2;
      case 'En séance': return 3;
      case 'Terminé': return 4;
      default: return 0;
    }
  };

  const setWorkflowStep = (conseilId: number, stepIndex: number) => {
    let newStatut = 'Planifié';
    if (stepIndex === 2) newStatut = 'Convoqué';
    if (stepIndex === 3) newStatut = 'En séance';
    if (stepIndex === 4) newStatut = 'Terminé';

    setConseilsList(prev => prev.map(c => c.id === conseilId ? { ...c, statut: newStatut } : c));
    if (selectedConseil && selectedConseil.id === conseilId) {
      setSelectedConseil({ ...selectedConseil, statut: newStatut });
    }
    showToast(`Statut mis à jour : ${newStatut}.`, 'success');
  };

  const handlePlanify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConseil.president || !newConseil.secretaire) {
      showToast('Veuillez renseigner le président et le secrétaire.', 'error');
      return;
    }

    const created = {
      id: Date.now(),
      ...newConseil,
      statut: 'Planifié'
    };

    setConseilsList(prev => [created, ...prev]);
    setIsModalOpen(false);
    showToast('Le conseil de classe a été planifié avec succès.', 'success');
    setNewConseil({ ...newConseil, secretaire: '' }); // reset some fields
  };

  const exportConseilsData = filtered.map(c => {
    const cl = classes.find(cls => cls.id === c.classeId);
    return {
      'Classe': cl?.nom || 'Inconnue',
      'Trimestre': c.trimestre,
      'Date': c.date,
      'Heure': c.heure,
      'Président': c.president,
      'Secrétaire': c.secretaire,
      'Statut': c.statut
    };
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Académique</span><span className="breadcrumb-sep">/</span><span>Conseils de classe</span></div>
          <h1 className="page-title">Conseils de Classe</h1>
          <p className="page-subtitle">Planification, séances et procès-verbaux automatisés</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExportDropdown data={exportConseilsData} filename={`Conseils_Classe_T${filterTrimestre || 'Tous'}`} />
          <select className="form-select" style={{ width: '160px' }} value={filterTrimestre} onChange={e => setFilterTrimestre(Number(e.target.value))}>
            <option value={0}>Tous les trimestres</option>
            <option value={1}>1er Trimestre</option>
            <option value={2}>2ème Trimestre</option>
            <option value={3}>3ème Trimestre</option>
          </select>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Calendar size={16} /> Planifier un conseil</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        <div className="stat-card">
          <div className="stat-card-header">
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a5f' }}>
              <ClipboardList size={22} />
            </div>
          </div>
          <div className="stat-card-value">{conseilsList.length}</div>
          <div className="stat-card-label">Conseils planifiés</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#d4edda', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#27ae60' }}>
              <Check size={22} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#27ae60' }}>{conseilsList.filter(c => c.statut === 'Terminé').length}</div>
          <div className="stat-card-label">Terminés</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fff3cd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f39c12' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#f39c12' }}>{conseilsList.filter(c => c.statut === 'Planifié' || c.statut === 'Convoqué').length}</div>
          <div className="stat-card-label">À venir</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3498db' }}>
              <FileText size={22} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#3498db' }}>{conseilsList.filter(c => c.statut === 'Terminé').length}</div>
          <div className="stat-card-label">PV générés</div>
        </div>
      </div>

      {/* Conseil Detail */}
      {selectedConseil && (() => {
        const classe = classes.find(c => c.id === selectedConseil.classeId);
        const classeEleves = eleves.filter(e => e.classeId === selectedConseil.classeId && e.statut === 'Actif').slice(0, 10);
        const moyennes = classeEleves.map(el => ({ ...el, moyenne: getMoyenneEleve(el.id) }))
          .sort((a, b) => b.moyenne - a.moyenne);
        const moyenneClasse = moyennes.length > 0 ? moyennes.reduce((s, e) => s + e.moyenne, 0) / moyennes.length : 0;

        return (
          <div className="card mb-24 fade-in">
            <div className="card-header">
              <div>
                <div className="card-title">Conseil de Classe — {classe?.nom}</div>
                <div className="card-subtitle">Trimestre {selectedConseil.trimestre} • {new Date(selectedConseil.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à {selectedConseil.heure}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedConseil.statut === 'Terminé' && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={exportToPDF}><Download size={14} /> Télécharger PV</button>
                    <button className="btn btn-secondary btn-sm" onClick={exportToPDF}><Printer size={14} /> Imprimer</button>
                  </>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedConseil(null)}>✕ Fermer</button>
              </div>
            </div>
            <div className="card-body">
              {/* Workflow Stepper */}
              <div className="stepper" style={{ marginBottom: '28px' }}>
                {etapesWorkflow.map((etape, i) => {
                  const stepNum = i + 1;
                  const currentStep = getWorkflowStep(selectedConseil.statut);
                  const isDone = stepNum < currentStep;
                  const isActive = stepNum === currentStep;
                  return (
                    <div 
                      key={i} 
                      className={`step ${isDone ? 'done' : isActive ? 'active' : ''}`}
                      onClick={() => setWorkflowStep(selectedConseil.id, stepNum)}
                      style={{ cursor: 'pointer' }}
                      title={`Passer à l'étape : ${etape}`}
                    >
                      <div className="step-circle" style={{ transition: 'all 0.3s' }}>
                        {isDone ? <Check size={14} /> : stepNum}
                      </div>
                      <div className="step-label">{etape}</div>
                    </div>
                  );
                })}
              </div>

              <div className="divider" />

              {/* Info du conseil */}
              <div className="form-row mb-20">
                <div className="form-group"><label className="form-label">Président du conseil</label><input className="form-control" value={selectedConseil.president} readOnly /></div>
                <div className="form-group"><label className="form-label">Secrétaire</label><input className="form-control" value={selectedConseil.secretaire} readOnly /></div>
              </div>
              <div className="form-row mb-20">
                <div className="form-group"><label className="form-label">Établissement</label><input className="form-control" value={etablissements.find(e => e.id === classe?.etablissementId)?.nom || ''} readOnly /></div>
                <div className="form-group"><label className="form-label">Effectif</label><input className="form-control" value={`${moyennes.length} élèves`} readOnly /></div>
              </div>

              {/* Synthèse */}
              <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#f5f7fa', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Moyenne classe</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: moyenneClasse >= 10 ? '#27ae60' : '#e74c3c' }}>{moyenneClasse.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Plus haute</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#27ae60' }}>{moyennes.length > 0 ? moyennes[0].moyenne.toFixed(2) : '—'}</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Plus basse</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#e74c3c' }}>{moyennes.length > 0 ? moyennes[moyennes.length - 1].moyenne.toFixed(2) : '—'}</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>≥ 10/20</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#3498db' }}>{moyennes.filter(m => m.moyenne >= 10).length}/{moyennes.length}</div>
                </div>
              </div>

              {/* Tableau des décisions */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Rang</th>
                      <th>Élève</th>
                      <th style={{ textAlign: 'center' }}>Moyenne</th>
                      <th>Décision du Conseil</th>
                      <th>Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moyennes.map((el, idx) => {
                      const decision = getDecision(el.moyenne);
                      return (
                        <tr key={el.id}>
                          <td><span className="badge badge-primary">{idx + 1}<sup>e</sup></span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="avatar avatar-xs" style={{ background: el.sexe === 'M' ? '#dbeafe' : '#fce7f3', color: el.sexe === 'M' ? '#1e3a5f' : '#ec4899', fontSize: '9px' }}>
                                {el.prenom[0]}{el.nom[0]}
                              </div>
                              <span style={{ fontWeight: 600 }}>{el.prenom} {el.nom}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: el.moyenne >= 10 ? '#27ae60' : '#e74c3c' }}>
                            {el.moyenne.toFixed(2)}
                          </td>
                          <td>
                            <span className="badge" style={{ background: `${decision.color}18`, color: decision.color, border: `1px solid ${decision.color}30` }}>
                              {decision.icon} {decision.label}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: '#6b7280' }}>
                            {el.moyenne >= 16 ? 'Excellent travail. Continue ainsi.' :
                             el.moyenne >= 14 ? 'Très bon travail. Reste constant.' :
                             el.moyenne >= 10 ? 'Peut mieux faire. Efforts à poursuivre.' :
                             'Résultats insuffisants. Doit redoubler d\'efforts.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Liste des conseils */}
      <div className="card fade-in">
        <div className="card-header">
          <div className="card-title">📋 Conseils de classe — Trimestre {filterTrimestre || 'Tous'}</div>
          <span className="badge badge-secondary" style={{ padding: '6px 12px' }}>{filtered.length} conseil{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Établissement</th>
                  <th>Date & Heure</th>
                  <th>Trimestre</th>
                  <th>Président</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(conseil => {
                  const classe = classes.find(c => c.id === conseil.classeId);
                  const etab = etablissements.find(e => e.id === classe?.etablissementId);
                  return (
                    <tr key={conseil.id} onClick={() => setSelectedConseil(conseil)} style={{ cursor: 'pointer', background: selectedConseil?.id === conseil.id ? '#f8fafc' : undefined }}>
                      <td><span style={{ fontWeight: 600 }}>{classe?.nom}</span><div style={{ fontSize: '11px', color: '#9ca3af' }}>{classe?.effectif} élèves</div></td>
                      <td style={{ fontSize: '13px' }}>{etab?.nom?.replace('École Primaire ', '').replace("Lycée d'Excellence ", '')}</td>
                      <td><div style={{ fontWeight: 500 }}>{new Date(conseil.date).toLocaleDateString('fr-FR')}</div><div style={{ fontSize: '11px', color: '#6b7280' }}>{conseil.heure}</div></td>
                      <td><span className="badge badge-info">T{conseil.trimestre}</span></td>
                      <td style={{ fontSize: '13px' }}>{conseil.president}</td>
                      <td>
                        <span className={`badge ${conseil.statut === 'Terminé' ? 'badge-success' : conseil.statut === 'Convoqué' ? 'badge-warning' : conseil.statut === 'En séance' ? 'badge-primary' : 'badge-secondary'}`}>
                          {conseil.statut}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-icon btn-sm" title="Voir"><ClipboardList size={16} /></button>
                          {conseil.statut === 'Terminé' && <button className="btn btn-ghost btn-icon btn-sm" title="PV"><FileText size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALE DE PLANIFICATION */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Planifier un Conseil de Classe" 
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" form="plan-conseil-form" className="btn btn-primary"><Save size={16} /> Planifier</button>
          </div>
        }
      >
        <form id="plan-conseil-form" onSubmit={handlePlanify}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Classe *</label>
              <select className="form-select" value={newConseil.classeId} onChange={e => setNewConseil({...newConseil, classeId: Number(e.target.value)})}>
                {classes.map(c => <option key={c.id} value={c.id}>{c.nom} — {c.effectif} élèves</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Trimestre *</label>
              <select className="form-select" value={newConseil.trimestre} onChange={e => setNewConseil({...newConseil, trimestre: Number(e.target.value)})}>
                <option value={1}>1er Trimestre</option>
                <option value={2}>2ème Trimestre</option>
                <option value={3}>3ème Trimestre</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date prévue *</label>
              <input type="date" className="form-input" required value={newConseil.date} onChange={e => setNewConseil({...newConseil, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Heure *</label>
              <input type="time" className="form-input" required value={newConseil.heure} onChange={e => setNewConseil({...newConseil, heure: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Président (e.g. Proviseur ou Censeur) *</label>
              <input type="text" className="form-input" required value={newConseil.president} onChange={e => setNewConseil({...newConseil, president: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Professeur Principal (Secrétaire) *</label>
              <select className="form-select" value={newConseil.secretaire} onChange={e => setNewConseil({...newConseil, secretaire: e.target.value})} required>
                <option value="">Sélectionner...</option>
                {enseignants.map(en => <option key={en.id} value={`${en.prenom} ${en.nom}`}>{en.prenom} {en.nom}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
