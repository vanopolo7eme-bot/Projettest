import React, { useState, useMemo } from 'react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { enseignants, classes, etablissements, matieres } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';
import {
  Plus, Eye, Users, Briefcase, UserCheck, UserMinus, CalendarX,
  User, BookOpen, FileText, Clock, Mail, Phone, Award, Edit,
  GraduationCap, Building, ChevronRight,
} from 'lucide-react';

// ---- Types ----
type Enseignant = (typeof enseignants)[number];
type MainTab = 'liste' | 'dossier' | 'absences';
type DossierTab = 'identite' | 'affectations' | 'contrat' | 'historique';

// ---- Mock data for absences enseignants ----
const absencesEnseignants = [
  { id: 1, enseignantId: 1, enseignantNom: 'Marie Essono', dateDebut: '2026-03-10', dateFin: '2026-03-14', motif: 'Maladie', remplacantId: 4, remplacantNom: 'Roger Ondo', statut: 'Remplacé' },
  { id: 2, enseignantId: 5, enseignantNom: 'François Boussougou', dateDebut: '2026-03-17', dateFin: '2026-03-19', motif: 'Formation continue', remplacantId: 8, remplacantNom: 'Patrick Nziengui', statut: 'Remplacé' },
  { id: 3, enseignantId: 7, enseignantNom: 'Pierre Mboumba', dateDebut: '2026-03-20', dateFin: '2026-03-21', motif: 'Raison personnelle', remplacantId: null, remplacantNom: null, statut: 'Non remplacé' },
  { id: 4, enseignantId: 9, enseignantNom: 'Béatrice Ayo', dateDebut: '2026-03-24', dateFin: '2026-03-28', motif: 'Congé maternité', remplacantId: null, remplacantNom: null, statut: 'Non remplacé' },
  { id: 5, enseignantId: 3, enseignantNom: 'Sylvie Biyoghe', dateDebut: '2026-03-03', dateFin: '2026-03-04', motif: 'Maladie', remplacantId: 10, remplacantNom: 'Cédric Lendoye', statut: 'Remplacé' },
];

// ---- Mock data for historique affectations ----
const historiqueAffectations = [
  { annee: '2024-2025', classes: ['CE1-B', 'CE2-A'], etablissement: 'Les Palmiers' },
  { annee: '2023-2024', classes: ['CP-A', 'CP-B'], etablissement: 'Les Palmiers' },
  { annee: '2022-2023', classes: ['CM1-A'], etablissement: 'Les Cocotiers' },
];

// ---- Helpers ----
function getEnseignantClasses(enseignant: Enseignant) {
  // Simulate class assignments based on etablissement
  return classes.filter(c => c.etablissementId === enseignant.etablissementId).slice(0, 2);
}

function getEnseignantMatieres(enseignant: Enseignant) {
  return enseignant.matieres.map(mId => matieres.find(m => m.id === mId)).filter(Boolean) as (typeof matieres)[number][];
}

function getDaysCount(debut: string, fin: string): number {
  const d1 = new Date(debut);
  const d2 = new Date(fin);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// ---- Component ----
export default function PersonnelPage() {
  const { showToast } = useToast();

  // Main tabs
  const [activeTab, setActiveTab] = useState<MainTab>('liste');

  // Filters
  const [filterEtab, setFilterEtab] = useState<number | ''>('');
  const [filterContrat, setFilterContrat] = useState<string>('');

  // Modal states
  const [selectedEnseignant, setSelectedEnseignant] = useState<Enseignant | null>(null);
  const [dossierTab, setDossierTab] = useState<DossierTab>('identite');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemplacantModal, setShowRemplacantModal] = useState<number | null>(null);

  // Add form
  const [addForm, setAddForm] = useState({
    prenom: '', nom: '', email: '', telephone: '', specialite: '',
    etablissementId: '', contrat: 'Titulaire', matieres: [] as number[],
  });

  // Stats
  const totalPersonnel = enseignants.length;
  const titulaires = enseignants.filter(e => e.contrat === 'Titulaire').length;
  const contractuels = enseignants.filter(e => e.contrat === 'Contractuel').length;
  const absencesCeMois = absencesEnseignants.filter(a => a.dateDebut.startsWith('2026-03')).length;

  // Filtered list
  const filteredEnseignants = useMemo(() => {
    return enseignants.filter(e => {
      if (filterEtab !== '' && e.etablissementId !== filterEtab) return false;
      if (filterContrat && e.contrat !== filterContrat) return false;
      return true;
    });
  }, [filterEtab, filterContrat]);

  // Total jours absence ce trimestre
  const joursAbsenceTrimestre = absencesEnseignants.reduce((acc, a) => acc + getDaysCount(a.dateDebut, a.dateFin), 0);

  // ---- Table columns ----
  const columns = [
    {
      header: 'Enseignant',
      accessor: (r: Enseignant) => `${r.prenom} ${r.nom}`,
      render: (r: Enseignant) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar avatar-sm" style={{ background: '#e8f0fe', color: '#1e3a5f', fontSize: '11px' }}>
            {r.prenom[0]}{r.nom[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{r.prenom} {r.nom}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    { header: 'Specialite', accessor: 'specialite' as const },
    {
      header: 'Etablissement',
      accessor: (r: Enseignant) => etablissements.find(e => e.id === r.etablissementId)?.nom || '',
      render: (r: Enseignant) => {
        const etab = etablissements.find(e => e.id === r.etablissementId);
        return <span style={{ fontSize: '13px' }}>{etab?.nom?.replace('Ecole Primaire ', '').replace("Lycee d'Excellence ", '') || '-'}</span>;
      },
    },
    {
      header: 'Contrat',
      accessor: (r: Enseignant) => r.contrat,
      render: (r: Enseignant) => (
        <span className={`badge ${r.contrat === 'Titulaire' ? 'badge-success' : 'badge-warning'}`}>{r.contrat}</span>
      ),
    },
    {
      header: 'Matieres',
      sortable: false,
      render: (r: Enseignant) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {getEnseignantMatieres(r).map(m => (
            <span key={m.id} className="badge" style={{ background: `${m.couleur}20`, color: m.couleur, fontSize: '11px' }}>{m.abr}</span>
          ))}
        </div>
      ),
    },
    {
      header: 'Classes',
      sortable: false,
      render: (r: Enseignant) => {
        const cls = getEnseignantClasses(r);
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {cls.map(c => (
              <span key={c.id} className="badge badge-secondary" style={{ fontSize: '11px' }}>{c.nom}</span>
            ))}
          </div>
        );
      },
    },
    {
      header: '',
      sortable: false,
      render: (r: Enseignant) => (
        <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); openDossier(r); }}>
          <Eye size={16} />
        </button>
      ),
    },
  ];

  // ---- Handlers ----
  function openDossier(ens: Enseignant) {
    setSelectedEnseignant(ens);
    setDossierTab('identite');
  }

  function handleAddSubmit() {
    if (!addForm.prenom || !addForm.nom || !addForm.email) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    showToast(`Enseignant ${addForm.prenom} ${addForm.nom} ajoute avec succes`, 'success');
    setShowAddModal(false);
    setAddForm({ prenom: '', nom: '', email: '', telephone: '', specialite: '', etablissementId: '', contrat: 'Titulaire', matieres: [] });
  }

  function handleAssignRemplacant(absenceId: number) {
    setShowRemplacantModal(absenceId);
  }

  function confirmRemplacant() {
    showToast('Remplacant assigne avec succes', 'success');
    setShowRemplacantModal(null);
  }

  // ---- Render: Dossier tabs ----
  function renderDossierIdentite(ens: Enseignant) {
    const etab = etablissements.find(e => e.id === ens.etablissementId);
    return (
      <div>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
          <div className="avatar avatar-xl" style={{ background: '#e8f0fe', color: '#1e3a5f', flexShrink: 0 }}>
            {ens.prenom[0]}{ens.nom[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{ens.prenom} {ens.nom}</h2>
            <p style={{ color: '#6b7280', margin: '4px 0 8px' }}>{ens.specialite}</p>
            <span className={`badge ${ens.contrat === 'Titulaire' ? 'badge-success' : 'badge-warning'}`}>{ens.contrat}</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prenom</label>
            <input className="form-control" value={ens.prenom} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input className="form-control" value={ens.nom} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" value={ens.email} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Telephone</label>
            <input className="form-control" value={ens.telephone} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Specialite</label>
            <input className="form-control" value={ens.specialite} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Etablissement</label>
            <input className="form-control" value={etab?.nom || '-'} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Diplomes</label>
            <input className="form-control" value="Licence en Sciences de l'Education, CAPES" readOnly />
          </div>
        </div>
      </div>
    );
  }

  function renderDossierAffectations(ens: Enseignant) {
    const cls = getEnseignantClasses(ens);
    const matList = getEnseignantMatieres(ens);
    const heuresParSemaine = [6, 4, 3, 5, 4, 2]; // mock

    return (
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Affectations actuelles</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Classe</th>
                <th>Matiere</th>
                <th>Coefficient</th>
                <th>Heures/semaine</th>
              </tr>
            </thead>
            <tbody>
              {cls.map((c, i) => matList.map((m, j) => (
                <tr key={`${c.id}-${m.id}`}>
                  <td><span className="badge badge-secondary">{c.nom}</span></td>
                  <td>
                    <span className="badge" style={{ background: `${m.couleur}20`, color: m.couleur }}>{m.nom}</span>
                  </td>
                  <td>{m.coefficient}</td>
                  <td>{heuresParSemaine[(i * matList.length + j) % heuresParSemaine.length]}h</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#6b7280' }}>Total heures/semaine</span>
            <strong>{cls.length * matList.length * 4}h</strong>
          </div>
        </div>
      </div>
    );
  }

  function renderDossierContrat(ens: Enseignant) {
    return (
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Informations contractuelles</h3>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type de contrat</label>
            <input className="form-control" value={ens.contrat} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Statut</label>
            <div><span className={`badge ${ens.contrat === 'Titulaire' ? 'badge-success' : 'badge-warning'}`}>Actif</span></div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date de debut</label>
            <input className="form-control" value={ens.contrat === 'Titulaire' ? '01/09/2018' : '01/09/2023'} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Date de fin</label>
            <input className="form-control" value={ens.contrat === 'Titulaire' ? 'Indeterminee (CDI)' : '30/06/2026'} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Anciennete</label>
            <input className="form-control" value={ens.contrat === 'Titulaire' ? '8 ans' : '3 ans'} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Indice salarial</label>
            <input className="form-control" value={ens.contrat === 'Titulaire' ? 'Echelon 5' : 'Echelon 2'} readOnly />
          </div>
        </div>

        {ens.contrat === 'Contractuel' && (
          <div className="alert alert-warning mt-16" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} /> Contrat a renouveler avant le 30/06/2026
          </div>
        )}
      </div>
    );
  }

  function renderDossierHistorique() {
    return (
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Historique des affectations</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Annee scolaire</th>
                <th>Etablissement</th>
                <th>Classes</th>
              </tr>
            </thead>
            <tbody>
              {historiqueAffectations.map((h, i) => (
                <tr key={i}>
                  <td><strong>{h.annee}</strong></td>
                  <td>{h.etablissement}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {h.classes.map(c => (
                        <span key={c} className="badge badge-secondary">{c}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ---- Render: Absences tab ----
  function renderAbsencesTab() {
    return (
      <div>
        <div className="grid-3 mb-24">
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Absences ce trimestre</div>
                <div className="stat-card-value">{absencesEnseignants.length}</div>
              </div>
              <div className="stat-card-icon" style={{ background: '#fee2e215', color: '#ef4444' }}>
                <CalendarX size={20} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Jours d'absence total</div>
                <div className="stat-card-value">{joursAbsenceTrimestre}</div>
              </div>
              <div className="stat-card-icon" style={{ background: '#fef3c715', color: '#f59e0b' }}>
                <Clock size={20} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div>
                <div className="stat-card-label">Non remplaces</div>
                <div className="stat-card-value" style={{ color: '#ef4444' }}>
                  {absencesEnseignants.filter(a => a.statut === 'Non remplace').length}
                </div>
              </div>
              <div className="stat-card-icon" style={{ background: '#ef444415', color: '#ef4444' }}>
                <UserMinus size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Enseignant absent</th>
                <th>Dates</th>
                <th>Duree</th>
                <th>Motif</th>
                <th>Remplacant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {absencesEnseignants.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.enseignantNom}</strong></td>
                  <td style={{ fontSize: '13px' }}>
                    {new Date(a.dateDebut).toLocaleDateString('fr-FR')} - {new Date(a.dateFin).toLocaleDateString('fr-FR')}
                  </td>
                  <td>{getDaysCount(a.dateDebut, a.dateFin)} jour(s)</td>
                  <td><span className="badge badge-secondary">{a.motif}</span></td>
                  <td>
                    {a.remplacantNom ? (
                      <span style={{ color: '#27ae60', fontWeight: 600, fontSize: '13px' }}>{a.remplacantNom}</span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>--</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${a.statut === 'Remplace' ? 'badge-success' : 'badge-danger'}`}>
                      {a.statut}
                    </span>
                  </td>
                  <td>
                    {!a.remplacantId && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleAssignRemplacant(a.id)}>
                        Assigner
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <span>ERP</span><span className="breadcrumb-sep">/</span><span>Personnel</span>
          </div>
          <h1 className="page-title">Gestion du Personnel</h1>
          <p className="page-subtitle">Enseignants et personnel administratif</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Ajouter un enseignant
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        <StatCard label="Total personnel" value={totalPersonnel} icon={<Users size={20} />} color="#1e3a5f" />
        <StatCard label="Titulaires" value={titulaires} icon={<UserCheck size={20} />} color="#27ae60" />
        <StatCard label="Contractuels" value={contractuels} icon={<Briefcase size={20} />} color="#f39c12" />
        <StatCard label="Absences ce mois" value={absencesCeMois} icon={<CalendarX size={20} />} color="#ef4444" />
      </div>

      {/* Main tabs */}
      <div className="tab-bar mb-24">
        <button className={`tab-btn ${activeTab === 'liste' ? 'active' : ''}`} onClick={() => setActiveTab('liste')}>
          <Users size={14} /> Liste
        </button>
        <button className={`tab-btn ${activeTab === 'dossier' ? 'active' : ''}`} onClick={() => setActiveTab('dossier')}>
          <FileText size={14} /> Dossier
        </button>
        <button className={`tab-btn ${activeTab === 'absences' ? 'active' : ''}`} onClick={() => setActiveTab('absences')}>
          <CalendarX size={14} /> Absences & Remplacements
        </button>
      </div>

      {/* Tab content: Liste */}
      {activeTab === 'liste' && (
        <div>
          <DataTable
            columns={columns}
            data={filteredEnseignants}
            searchPlaceholder="Rechercher un enseignant..."
            onRowClick={(row: Enseignant) => openDossier(row)}
            actions={
              <>
                <select
                  className="form-control"
                  style={{ width: '200px', height: '36px', fontSize: '13px' }}
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
                  value={filterContrat}
                  onChange={e => setFilterContrat(e.target.value)}
                >
                  <option value="">Tous les contrats</option>
                  <option value="Titulaire">Titulaire</option>
                  <option value="Contractuel">Contractuel</option>
                </select>
              </>
            }
          />
        </div>
      )}

      {/* Tab content: Dossier (standalone view) */}
      {activeTab === 'dossier' && (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
            <FileText size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>Selectionnez un enseignant dans l'onglet <strong>Liste</strong> pour consulter son dossier.</p>
          </div>
        </div>
      )}

      {/* Tab content: Absences & Remplacements */}
      {activeTab === 'absences' && renderAbsencesTab()}

      {/* Modal: Dossier enseignant */}
      <Modal
        isOpen={!!selectedEnseignant}
        onClose={() => setSelectedEnseignant(null)}
        title={selectedEnseignant ? `${selectedEnseignant.prenom} ${selectedEnseignant.nom}` : ''}
        size="lg"
        footer={null}
      >
        {selectedEnseignant && (
          <div>
            <div className="tab-bar mb-24">
              <button className={`tab-btn ${dossierTab === 'identite' ? 'active' : ''}`} onClick={() => setDossierTab('identite')}>
                <User size={14} /> Identite
              </button>
              <button className={`tab-btn ${dossierTab === 'affectations' ? 'active' : ''}`} onClick={() => setDossierTab('affectations')}>
                <BookOpen size={14} /> Affectations
              </button>
              <button className={`tab-btn ${dossierTab === 'contrat' ? 'active' : ''}`} onClick={() => setDossierTab('contrat')}>
                <Briefcase size={14} /> Contrat
              </button>
              <button className={`tab-btn ${dossierTab === 'historique' ? 'active' : ''}`} onClick={() => setDossierTab('historique')}>
                <Clock size={14} /> Historique
              </button>
            </div>

            {dossierTab === 'identite' && renderDossierIdentite(selectedEnseignant)}
            {dossierTab === 'affectations' && renderDossierAffectations(selectedEnseignant)}
            {dossierTab === 'contrat' && renderDossierContrat(selectedEnseignant)}
            {dossierTab === 'historique' && renderDossierHistorique()}
          </div>
        )}
      </Modal>

      {/* Modal: Ajouter un enseignant */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un enseignant"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>Enregistrer</button>
          </div>
        }
      >
        <div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prenom *</label>
              <input className="form-control" value={addForm.prenom} onChange={e => setAddForm({ ...addForm, prenom: e.target.value })} placeholder="Prenom" />
            </div>
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input className="form-control" value={addForm.nom} onChange={e => setAddForm({ ...addForm, nom: e.target.value })} placeholder="Nom" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-control" type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} placeholder="email@leguide.ga" />
            </div>
            <div className="form-group">
              <label className="form-label">Telephone</label>
              <input className="form-control" value={addForm.telephone} onChange={e => setAddForm({ ...addForm, telephone: e.target.value })} placeholder="+241 07 XX XX XX" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Specialite</label>
              <input className="form-control" value={addForm.specialite} onChange={e => setAddForm({ ...addForm, specialite: e.target.value })} placeholder="Mathematiques, Francais..." />
            </div>
            <div className="form-group">
              <label className="form-label">Etablissement</label>
              <select className="form-control" value={addForm.etablissementId} onChange={e => setAddForm({ ...addForm, etablissementId: e.target.value })}>
                <option value="">Selectionnez...</option>
                {etablissements.map(et => (
                  <option key={et.id} value={et.id}>{et.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type de contrat</label>
              <select className="form-control" value={addForm.contrat} onChange={e => setAddForm({ ...addForm, contrat: e.target.value })}>
                <option value="Titulaire">Titulaire</option>
                <option value="Contractuel">Contractuel</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Matieres enseignees</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {matieres.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={addForm.matieres.includes(m.id)}
                      onChange={e => {
                        setAddForm({
                          ...addForm,
                          matieres: e.target.checked
                            ? [...addForm.matieres, m.id]
                            : addForm.matieres.filter(id => id !== m.id),
                        });
                      }}
                    />
                    <span style={{ color: m.couleur }}>{m.abr}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Assigner un remplacant */}
      <Modal
        isOpen={showRemplacantModal !== null}
        onClose={() => setShowRemplacantModal(null)}
        title="Assigner un remplacant"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowRemplacantModal(null)}>Annuler</button>
            <button className="btn btn-primary" onClick={confirmRemplacant}>Confirmer</button>
          </div>
        }
      >
        <div>
          <div className="form-group">
            <label className="form-label">Enseignant remplacant</label>
            <select className="form-control">
              <option value="">Selectionnez un enseignant...</option>
              {enseignants.map(e => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom} ({e.specialite})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Commentaire</label>
            <textarea className="form-control" rows={3} placeholder="Raison du remplacement..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}
