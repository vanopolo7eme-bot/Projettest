import React, { useState, useMemo } from 'react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { admissions as initialAdmissions, etablissements, classes } from '../../data/mockData';
import { UserPlus, Eye, Check, X, Clock, FileText, Save, TrendingUp, Users, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import ExportDropdown from '../../components/ui/ExportDropdown';

const etapes = ['Compte créé', 'Vérifié', 'Profil complet', 'Dossier initié', 'Documents déposés', 'Vérification', 'Étude dossier', 'Décision', 'Confirmation', 'Converti'];

export default function AdmissionsPage() {
  const [admissionsList, setAdmissionsList] = useState(initialAdmissions);
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [newCandidat, setNewCandidat] = useState({
    candidat: '',
    dateNaissance: '',
    niveau: '6ème',
    etablissement: etablissements[0].nom,
    parent: '',
    email: '',
    telephone: ''
  });

  const stats = useMemo(() => {
    const total = admissionsList.length;
    const enCours = admissionsList.filter(a => !['Accepté', 'Refusé'].includes(a.statut)).length;
    const acceptes = admissionsList.filter(a => a.statut === 'Accepté').length;
    const conversion = total > 0 ? Math.round((acceptes / total) * 100) : 0;
    const capaciteTotale = etablissements.reduce((s, e) => s + e.capacite, 0);
    const effectifTotal = etablissements.reduce((s, e) => s + e.effectif, 0);
    const capaciteDisponible = capaciteTotale - effectifTotal;
    return { total, enCours, acceptes, conversion, capaciteDisponible };
  }, [admissionsList]);

  const capaciteParEtablissement = useMemo(() => {
    return etablissements.map(e => ({
      nom: e.nom,
      disponible: e.capacite - e.effectif,
      capacite: e.capacite,
      effectif: e.effectif,
      taux: Math.round((e.effectif / e.capacite) * 100),
    }));
  }, []);

  const handleCreateAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    const created: any = {
      ...newCandidat,
      id: Date.now(),
      dateDepot: new Date().toISOString().split('T')[0],
      etape: 1,
      statut: 'Nouveau'
    };

    setAdmissionsList(prev => [created, ...prev]);
    setIsModalOpen(false);
    showToast(`Dossier de ${newCandidat.candidat} créé avec succès.`, 'success');
  };

  const handleStatusChange = (dossierId: number, newStatut: string) => {
    setAdmissionsList(prev => prev.map(a => a.id === dossierId ? { ...a, statut: newStatut } : a));
    if (selectedDossier && selectedDossier.id === dossierId) {
      setSelectedDossier({ ...selectedDossier, statut: newStatut });
    }
    showToast(`Statut mis à jour : ${newStatut}`, 'info');
  };

  const setStep = (dossierId: number, stepNum: number) => {
    setAdmissionsList(prev => prev.map(a => a.id === dossierId ? { ...a, etape: stepNum } : a));
    if (selectedDossier && selectedDossier.id === dossierId) {
      setSelectedDossier({ ...selectedDossier, etape: stepNum });
    }
  };

  const columns = [
    { header: 'Candidat', render: r => <div><div style={{ fontWeight: 600 }}>{r.candidat}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Né(e) le {new Date(r.dateNaissance).toLocaleDateString('fr-FR')}</div></div> },
    { header: 'Niveau', render: r => <span className="badge badge-primary">{r.niveau}</span> },
    { header: 'Établissement', render: r => <span style={{ fontSize: '13px' }}>{r.etablissement}</span> },
    { header: 'Parent', accessor: 'parent' },
    { header: 'Date de dépôt', render: r => new Date(r.dateDepot).toLocaleDateString('fr-FR') },
    { header: 'Étape', render: r => <span style={{ fontSize: '12px', color: '#6b7280' }}>{r.etape}/10</span> },
    { header: 'Statut', render: r => {
      const cls = r.statut === 'Accepté' ? 'badge-success' : r.statut === 'Refusé' ? 'badge-danger' : r.statut === 'Incomplet' ? 'badge-warning' : 'badge-info';
      return <span className={`badge ${cls}`}>{r.statut}</span>;
    }},
    { header: '', sortable: false, render: r => (
      <div className="table-actions">
        <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); setSelectedDossier(r); }}><Eye size={16} /></button>
      </div>
    )},
  ];

  const exportData = admissionsList.map(a => ({
    'Candidat': a.candidat,
    'Date Naissance': a.dateNaissance,
    'Niveau': a.niveau,
    'Établissement': a.etablissement,
    'Parent': a.parent,
    'Email': a.email,
    'Date Dépôt': a.dateDepot,
    'Étape': `${a.etape}/10`,
    'Statut': a.statut
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Gestion</span><span className="breadcrumb-sep">/</span><span>Admissions</span></div>
          <h1 className="page-title">Gestion des Admissions</h1>
          <p className="page-subtitle">Workflow de préinscription et dossiers candidats</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExportDropdown data={exportData} filename="Reporting_Admissions_LeGuide" elementId="admissions-table" />
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><UserPlus size={16} /> Nouveau candidat</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a5f' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total dossiers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff3cd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f39c12' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#f39c12' }}>{stats.enCours}</div>
          <div className="stat-card-label">En cours</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#d4edda', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#27ae60' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#27ae60' }}>{stats.acceptes}</div>
          <div className="stat-card-label">Acceptes</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#3b82f6' }}>{stats.conversion}%</div>
          <div className="stat-card-label">Taux conversion</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#9333ea' }}>{stats.capaciteDisponible}</div>
          <div className="stat-card-label">Capacite disponible</div>
        </div>
      </div>

      {/* Capacite par etablissement */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title"><Building2 size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Capacite d'accueil par etablissement</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {capaciteParEtablissement.map((etab, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: i < capaciteParEtablissement.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{etab.nom}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {etab.effectif} inscrits / {etab.capacite} places — <strong style={{ color: etab.disponible < 50 ? '#ef4444' : '#16a34a' }}>{etab.disponible} places disponibles</strong>
                </div>
              </div>
              <div style={{ width: '120px' }}>
                <div className="progress" style={{ height: '8px', marginBottom: '4px' }}>
                  <div
                    className={`progress-bar ${etab.taux > 90 ? 'progress-danger' : etab.taux > 75 ? 'progress-warning' : 'progress-primary'}`}
                    style={{ width: `${etab.taux}%` }}
                  />
                </div>
                <div style={{ fontSize: '11px', textAlign: 'center', color: '#6b7280' }}>{etab.taux}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDossier && (
        <div className="card mb-24 fade-in">
          <div className="card-header">
            <div className="card-title">Suivi Admission — {selectedDossier.candidat}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDossier(null)}>✕ Fermer</button>
          </div>
          <div className="card-body">
            <div className="stepper mb-20">
              {etapes.map((etape, i) => {
                const stepIdx = i + 1;
                const isDone = stepIdx < selectedDossier.etape;
                const isActive = stepIdx === selectedDossier.etape;
                return (
                  <div 
                    key={i} 
                    className={`step ${isDone ? 'done' : isActive ? 'active' : ''}`}
                    onClick={() => setStep(selectedDossier.id, stepIdx)}
                    style={{ cursor: 'pointer' }}
                    title={`Marquer comme : ${etape}`}
                  >
                    <div className="step-circle">
                      {isDone ? <Check size={14} /> : stepIdx}
                    </div>
                    <div className="step-label">{etape}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="divider" style={{ margin: '24px 0' }} />

            <div className="grid-3 mb-20">
              <div className="form-group"><label className="form-label">Candidat</label><input className="form-control" value={selectedDossier.candidat} readOnly /></div>
              <div className="form-group"><label className="form-label">Date de naissance</label><input className="form-control" value={new Date(selectedDossier.dateNaissance).toLocaleDateString('fr-FR')} readOnly /></div>
              <div className="form-group"><label className="form-label">Niveau demandé</label><input className="form-control" value={selectedDossier.niveau} readOnly /></div>
            </div>
            <div className="grid-2 mb-20">
              <div className="form-group"><label className="form-label">Établissement</label><input className="form-control" value={selectedDossier.etablissement} readOnly /></div>
              <div className="form-group"><label className="form-label">Parent / Email</label><input className="form-control" value={`${selectedDossier.parent} (${selectedDossier.email})`} readOnly /></div>
            </div>

            {selectedDossier.statut !== 'Accepté' && selectedDossier.statut !== 'Refusé' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <button className="btn btn-success" onClick={() => handleStatusChange(selectedDossier.id, 'Accepté')}><Check size={16} /> Accepter le candidat</button>
                <button className="btn btn-danger" onClick={() => handleStatusChange(selectedDossier.id, 'Refusé')}><X size={16} /> Refuser</button>
                <button className="btn btn-secondary"><FileText size={16} /> Demander des pièces</button>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '12px' }}>
                  <AlertCircle size={14} /> Cliquer sur les étapes du stepper pour avancer le dossier
                </div>
              </div>
            )}
            
            {(selectedDossier.statut === 'Accepté' || selectedDossier.statut === 'Refusé') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', background: selectedDossier.statut === 'Accepté' ? '#d4edda' : '#f8d7da', padding: '12px 20px', borderRadius: '12px', color: selectedDossier.statut === 'Accepté' ? '#155724' : '#721c24' }}>
                {selectedDossier.statut === 'Accepté' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span style={{ fontWeight: 600 }}>Décision finale : Le dossier a été {selectedDossier.statut === 'Accepté' ? 'validé avec succès' : 'rejeté'}.</span>
                <button className="btn btn-link btn-sm" style={{ marginLeft: 'auto', color: 'inherit' }} onClick={() => handleStatusChange(selectedDossier.id, 'Nouveau')}>Réinitialiser</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card" id="admissions-table">
        <DataTable columns={columns} data={admissionsList} searchPlaceholder="Rechercher un dossier (nom, parent, niveau)..." onRowClick={r => setSelectedDossier(r)} />
      </div>

      {/* MODAL NOUVEAU CANDIDAT */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter une pré-inscription" 
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" form="new-candidat-form" className="btn btn-primary"><Save size={16} /> Enregistrer le dossier</button>
          </div>
        }
      >
        <form id="new-candidat-form" onSubmit={handleCreateAdmission}>
          <div className="form-group">
            <label className="form-label">Nom complet de l'enfant *</label>
            <input type="text" className="form-input" required value={newCandidat.candidat} onChange={e => setNewCandidat({...newCandidat, candidat: e.target.value})} placeholder="Prénom et Nom" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date de naissance *</label>
              <input type="date" className="form-input" required value={newCandidat.dateNaissance} onChange={e => setNewCandidat({...newCandidat, dateNaissance: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Niveau souhaité *</label>
              <select className="form-select" value={newCandidat.niveau} onChange={e => setNewCandidat({...newCandidat, niveau: e.target.value})}>
                <option value="TPS">TPS (Tout-Petite Section)</option>
                <option value="PS">Petite Section</option>
                <option value="MS">Moyenne Section</option>
                <option value="GS">Grande Section</option>
                {['CP', 'CE1', 'CE2', 'CM1', 'CM2'].map(n => <option key={n} value={n}>{n}</option>)}
                {['6ème', '5ème', '4ème', '3ème'].map(n => <option key={n} value={n}>{n}</option>)}
                {['2nde', '1ère', 'Terminale'].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Établissement cible *</label>
            <select className="form-select" value={newCandidat.etablissement} onChange={e => setNewCandidat({...newCandidat, etablissement: e.target.value})}>
              {etablissements.map(et => <option key={et.id} value={et.nom}>{et.nom}</option>)}
            </select>
          </div>
          <div className="divider" style={{ margin: '16px 0' }}>Informations Responsable</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nom du Parent *</label>
              <input type="text" className="form-input" required value={newCandidat.parent} onChange={e => setNewCandidat({...newCandidat, parent: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input type="tel" className="form-input" required value={newCandidat.telephone} onChange={e => setNewCandidat({...newCandidat, telephone: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email de contact *</label>
            <input type="email" className="form-input" required value={newCandidat.email} onChange={e => setNewCandidat({...newCandidat, email: e.target.value})} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
