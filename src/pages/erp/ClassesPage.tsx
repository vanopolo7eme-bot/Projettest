import React, { useState, useMemo } from 'react';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { classes, eleves, enseignants, etablissements, matieres, notes } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';
import {
  Plus, School, Users, BookOpen, Eye, UserPlus,
  GraduationCap, Award, BarChart3, AlertTriangle,
  User, Building, CheckSquare,
} from 'lucide-react';

// ---- Types ----
type Classe = (typeof classes)[number];
type Eleve = (typeof eleves)[number];
type DetailTab = 'eleves' | 'enseignants' | 'matieres';

// ---- Helpers ----
function getClasseEleves(classeId: number) {
  return eleves.filter(e => e.classeId === classeId && e.statut === 'Actif');
}

function getClasseEnseignants(classe: Classe) {
  return enseignants.filter(e => e.etablissementId === classe.etablissementId);
}

function getEleveMoyenne(eleveId: number): number | null {
  const eleveNotes = notes.filter(n => n.eleveId === eleveId);
  if (eleveNotes.length === 0) return null;
  const sum = eleveNotes.reduce((acc, n) => acc + n.note, 0);
  return Math.round((sum / eleveNotes.length) * 100) / 100;
}

function getClasseMatieres(classe: Classe) {
  // Return matieres relevant to the classe based on teachers assigned
  const classEnseignants = getClasseEnseignants(classe);
  const matiereIds = new Set<number>();
  classEnseignants.forEach(e => e.matieres.forEach(mId => matiereIds.add(mId)));
  return matieres.filter(m => matiereIds.has(m.id));
}

// Niveaux for filter
const allNiveaux = Array.from(new Set(classes.map(c => c.niveau)));

// ---- Component ----
export default function ClassesPage() {
  const { showToast } = useToast();

  // Filters
  const [filterEtab, setFilterEtab] = useState<number | ''>('');
  const [filterNiveau, setFilterNiveau] = useState<string>('');

  // Modal states
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('eleves');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAffectModal, setShowAffectModal] = useState(false);
  const [selectedEleves, setSelectedEleves] = useState<number[]>([]);

  // Add form
  const [addForm, setAddForm] = useState({
    nom: '', niveau: '', etablissementId: '', salle: '', professeurPrincipal: '',
  });

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      if (filterEtab !== '' && c.etablissementId !== filterEtab) return false;
      if (filterNiveau && c.niveau !== filterNiveau) return false;
      return true;
    });
  }, [filterEtab, filterNiveau]);

  // Stats
  const totalClasses = classes.length;
  const totalEleves = eleves.filter(e => e.statut === 'Actif').length;
  const moyenneElevesParClasse = totalClasses > 0 ? Math.round(totalEleves / totalClasses) : 0;
  const classesIncompletes = classes.filter(c => {
    const nb = eleves.filter(e => e.classeId === c.id && e.statut === 'Actif').length;
    return nb < c.effectif * 0.8;
  }).length;

  // Capacity for progress bar
  const CAPACITE_MAX = 40; // default max capacity for a class

  // ---- Handlers ----
  function openDetail(classe: Classe) {
    setSelectedClasse(classe);
    setDetailTab('eleves');
  }

  function handleAddSubmit() {
    if (!addForm.nom || !addForm.niveau || !addForm.etablissementId) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    showToast(`Classe ${addForm.nom} creee avec succes`, 'success');
    setShowAddModal(false);
    setAddForm({ nom: '', niveau: '', etablissementId: '', salle: '', professeurPrincipal: '' });
  }

  function openAffectEleves() {
    setSelectedEleves([]);
    setShowAffectModal(true);
  }

  function handleAffectSubmit() {
    if (selectedEleves.length === 0) {
      showToast('Selectionnez au moins un eleve', 'error');
      return;
    }
    showToast(`${selectedEleves.length} eleve(s) affecte(s) avec succes`, 'success');
    setShowAffectModal(false);
    setSelectedEleves([]);
  }

  function toggleEleve(eleveId: number) {
    setSelectedEleves(prev =>
      prev.includes(eleveId) ? prev.filter(id => id !== eleveId) : [...prev, eleveId]
    );
  }

  // ---- Render: Detail tabs ----
  function renderDetailEleves(classe: Classe) {
    const classeEleves = getClasseEleves(classe.id);
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{classeEleves.length} eleve(s) actif(s)</span>
          <button className="btn btn-sm btn-primary" onClick={openAffectEleves}>
            <UserPlus size={14} /> Affecter des eleves
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>Matricule</th>
                <th>Sexe</th>
                <th>Moyenne</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {classeEleves.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                    Aucun eleve dans cette classe
                  </td>
                </tr>
              ) : classeEleves.map(eleve => {
                const moy = getEleveMoyenne(eleve.id);
                return (
                  <tr key={eleve.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="avatar avatar-sm" style={{
                          background: eleve.sexe === 'M' ? '#dbeafe' : '#fce7f3',
                          color: eleve.sexe === 'M' ? '#1e3a5f' : '#ec4899',
                          fontSize: '11px',
                        }}>
                          {eleve.prenom[0]}{eleve.nom[0]}
                        </div>
                        <strong>{eleve.prenom} {eleve.nom}</strong>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', fontFamily: 'monospace' }}>{eleve.matricule}</td>
                    <td>
                      <span className={`badge ${eleve.sexe === 'M' ? 'badge-info' : 'badge-primary'}`}>
                        {eleve.sexe === 'M' ? 'M' : 'F'}
                      </span>
                    </td>
                    <td>
                      {moy !== null ? (
                        <span style={{
                          fontWeight: 700,
                          color: moy >= 14 ? '#27ae60' : moy >= 10 ? '#f39c12' : '#ef4444',
                        }}>
                          {moy.toFixed(2)}/20
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>--</span>
                      )}
                    </td>
                    <td><span className="badge badge-success">{eleve.statut}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderDetailEnseignants(classe: Classe) {
    const classEnseignants = getClasseEnseignants(classe);
    return (
      <div>
        <div style={{ marginBottom: '16px', fontSize: '13px', color: '#6b7280' }}>
          {classEnseignants.length} enseignant(s) affecte(s)
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Enseignant</th>
                <th>Specialite</th>
                <th>Matiere(s)</th>
                <th>Contrat</th>
              </tr>
            </thead>
            <tbody>
              {classEnseignants.map(ens => (
                <tr key={ens.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="avatar avatar-sm" style={{ background: '#e8f0fe', color: '#1e3a5f', fontSize: '11px' }}>
                        {ens.prenom[0]}{ens.nom[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{ens.prenom} {ens.nom}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{ens.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{ens.specialite}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {ens.matieres.map(mId => {
                        const m = matieres.find(x => x.id === mId);
                        return m ? (
                          <span key={m.id} className="badge" style={{ background: `${m.couleur}20`, color: m.couleur, fontSize: '11px' }}>
                            {m.abr}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${ens.contrat === 'Titulaire' ? 'badge-success' : 'badge-warning'}`}>
                      {ens.contrat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderDetailMatieres(classe: Classe) {
    const matList = getClasseMatieres(classe);
    const heuresParSemaine = [6, 5, 4, 3, 3, 2, 2, 4, 4, 3]; // mock hours
    return (
      <div>
        <div style={{ marginBottom: '16px', fontSize: '13px', color: '#6b7280' }}>
          {matList.length} matiere(s) enseignee(s)
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Matiere</th>
                <th>Abreviation</th>
                <th>Coefficient</th>
                <th>Heures/semaine</th>
              </tr>
            </thead>
            <tbody>
              {matList.map((m, i) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.couleur }} />
                      <strong>{m.nom}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: `${m.couleur}20`, color: m.couleur }}>{m.abr}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{m.coefficient}</td>
                  <td>{heuresParSemaine[i % heuresParSemaine.length]}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#6b7280' }}>Total coefficients</span>
            <strong>{matList.reduce((acc, m) => acc + m.coefficient, 0)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px' }}>
            <span style={{ color: '#6b7280' }}>Total heures/semaine</span>
            <strong>{matList.reduce((acc, _, i) => acc + heuresParSemaine[i % heuresParSemaine.length], 0)}h</strong>
          </div>
        </div>
      </div>
    );
  }

  // ---- Main render ----
  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>ERP</span><span className="breadcrumb-sep">/</span><span>Classes</span>
          </div>
          <h1 className="page-title">Gestion des Classes</h1>
          <p className="page-subtitle">Organisation pedagogique par etablissement</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Nouvelle classe
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        <StatCard label="Total classes" value={totalClasses} icon={<School size={20} />} color="#1e3a5f" />
        <StatCard label="Total eleves" value={totalEleves} icon={<Users size={20} />} color="#3498db" />
        <StatCard label="Moyenne eleves/classe" value={moyenneElevesParClasse} icon={<BarChart3 size={20} />} color="#27ae60" />
        <StatCard label="Classes incompletes" value={classesIncompletes} icon={<AlertTriangle size={20} />} color="#f39c12" />
      </div>

      {/* Filters */}
      <div className="filter-bar mb-24">
        <select
          className="form-control"
          style={{ width: '220px', height: '36px', fontSize: '13px' }}
          value={filterEtab}
          onChange={e => setFilterEtab(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Tous les etablissements</option>
          {etablissements.map(et => (
            <option key={et.id} value={et.id}>{et.nom}</option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ width: '160px', height: '36px', fontSize: '13px' }}
          value={filterNiveau}
          onChange={e => setFilterNiveau(e.target.value)}
        >
          <option value="">Tous les niveaux</option>
          {allNiveaux.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#6b7280' }}>
          {filteredClasses.length} classe(s)
        </span>
      </div>

      {/* Classes grid */}
      <div className="grid-3">
        {filteredClasses.map(classe => {
          const nbEleves = eleves.filter(e => e.classeId === classe.id && e.statut === 'Actif').length;
          const pctFill = Math.min(100, Math.round((nbEleves / CAPACITE_MAX) * 100));
          const fillColor = pctFill >= 90 ? '#ef4444' : pctFill >= 70 ? '#f39c12' : '#27ae60';

          return (
            <div key={classe.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openDetail(classe)}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a5f' }}>{classe.nom}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Niveau {classe.niveau}</div>
                  </div>
                  <div className="badge badge-primary">{classe.salle}</div>
                </div>

                {/* Progress bar: effectif / capacity */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#6b7280' }}>Effectif</span>
                    <span style={{ fontWeight: 600 }}>{nbEleves}/{CAPACITE_MAX}</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${pctFill}%`, background: fillColor }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Users size={14} color="#6b7280" /> <strong>{nbEleves}</strong> eleves
                  </div>
                </div>

                <div className="divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={14} /> Prof. principal : <strong style={{ color: '#2c3e50' }}>{classe.professeurPrincipal}</strong>
                  </div>
                  <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); openDetail(classe); }}>
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
          <School size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>Aucune classe ne correspond aux filtres selectionnes.</p>
        </div>
      )}

      {/* Modal: Detail classe */}
      <Modal
        isOpen={!!selectedClasse}
        onClose={() => setSelectedClasse(null)}
        title={selectedClasse ? `${selectedClasse.nom} - ${etablissements.find(e => e.id === selectedClasse.etablissementId)?.nom || ''}` : ''}
        size="lg"
        footer={null}
      >
        {selectedClasse && (
          <div>
            {/* Classe summary */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div className="badge badge-primary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                <School size={14} /> Niveau: {selectedClasse.niveau}
              </div>
              <div className="badge badge-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                Salle: {selectedClasse.salle}
              </div>
              <div className="badge badge-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                <Users size={14} /> Effectif: {getClasseEleves(selectedClasse.id).length}
              </div>
              <div className="badge badge-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                <User size={14} /> Prof: {selectedClasse.professeurPrincipal}
              </div>
            </div>

            {/* Tabs */}
            <div className="tab-bar mb-24">
              <button className={`tab-btn ${detailTab === 'eleves' ? 'active' : ''}`} onClick={() => setDetailTab('eleves')}>
                <GraduationCap size={14} /> Eleves
              </button>
              <button className={`tab-btn ${detailTab === 'enseignants' ? 'active' : ''}`} onClick={() => setDetailTab('enseignants')}>
                <User size={14} /> Enseignants
              </button>
              <button className={`tab-btn ${detailTab === 'matieres' ? 'active' : ''}`} onClick={() => setDetailTab('matieres')}>
                <BookOpen size={14} /> Matieres
              </button>
            </div>

            {detailTab === 'eleves' && renderDetailEleves(selectedClasse)}
            {detailTab === 'enseignants' && renderDetailEnseignants(selectedClasse)}
            {detailTab === 'matieres' && renderDetailMatieres(selectedClasse)}
          </div>
        )}
      </Modal>

      {/* Modal: Nouvelle classe */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nouvelle classe"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Creer la classe</button>
          </div>
        }
      >
        <div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom de la classe *</label>
              <input className="form-control" value={addForm.nom} onChange={e => setAddForm({ ...addForm, nom: e.target.value })} placeholder="Ex: 6eme-C" />
            </div>
            <div className="form-group">
              <label className="form-label">Niveau *</label>
              <select className="form-control" value={addForm.niveau} onChange={e => setAddForm({ ...addForm, niveau: e.target.value })}>
                <option value="">Selectionnez...</option>
                {['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Terminale'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Etablissement *</label>
              <select className="form-control" value={addForm.etablissementId} onChange={e => setAddForm({ ...addForm, etablissementId: e.target.value })}>
                <option value="">Selectionnez...</option>
                {etablissements.map(et => (
                  <option key={et.id} value={et.id}>{et.nom}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Salle</label>
              <input className="form-control" value={addForm.salle} onChange={e => setAddForm({ ...addForm, salle: e.target.value })} placeholder="Ex: Salle B3" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Professeur principal</label>
            <select className="form-control" value={addForm.professeurPrincipal} onChange={e => setAddForm({ ...addForm, professeurPrincipal: e.target.value })}>
              <option value="">Selectionnez...</option>
              {enseignants.map(e => (
                <option key={e.id} value={`${e.prenom} ${e.nom}`}>{e.prenom} {e.nom} ({e.specialite})</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal: Affecter des eleves */}
      <Modal
        isOpen={showAffectModal}
        onClose={() => setShowAffectModal(false)}
        title={`Affecter des eleves - ${selectedClasse?.nom || ''}`}
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <span style={{ marginRight: 'auto', fontSize: '13px', color: '#6b7280' }}>
              {selectedEleves.length} eleve(s) selectionne(s)
            </span>
            <button className="btn btn-secondary" onClick={() => setShowAffectModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleAffectSubmit}>
              <CheckSquare size={14} /> Affecter
            </button>
          </div>
        }
      >
        <div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
            Selectionnez les eleves a affecter a la classe <strong>{selectedClasse?.nom}</strong>.
          </p>
          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Nom</th>
                  <th>Matricule</th>
                  <th>Classe actuelle</th>
                </tr>
              </thead>
              <tbody>
                {eleves.filter(e => e.statut === 'Actif').map(eleve => (
                  <tr
                    key={eleve.id}
                    style={{ cursor: 'pointer', background: selectedEleves.includes(eleve.id) ? '#e8f0fe' : undefined }}
                    onClick={() => toggleEleve(eleve.id)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEleves.includes(eleve.id)}
                        onChange={() => toggleEleve(eleve.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td><strong>{eleve.prenom} {eleve.nom}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{eleve.matricule}</td>
                    <td>
                      <span className="badge badge-secondary">{eleve.classe || '--'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
