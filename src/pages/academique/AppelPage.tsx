import React, { useState } from 'react';
import { eleves, absences as initialAbsences, classes } from '../../data/mockData';
import { Check, X, Clock, AlertTriangle, Save, Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import ExportDropdown from '../../components/ui/ExportDropdown';

export default function AppelPage() {
  const [selectedClasse, setSelectedClasse] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [appelData, setAppelData] = useState<Record<number, string>>({});
  const [absencesList, setAbsencesList] = useState(initialAbsences);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [newAbsence, setNewAbsence] = useState({
    eleveId: 0, type: 'Absent', motif: '', justifie: false, date: date
  });

  const classeEleves = eleves.filter(e => e.classeId === selectedClasse && e.statut === 'Actif');
  const classe = classes.find(c => c.id === selectedClasse);

  const todayAbsences = absencesList.filter(a => a.date === date);
  const nbAbsents = todayAbsences.filter(a => a.type === 'Absent').length;
  const nbRetards = todayAbsences.filter(a => a.type === 'Retard').length;

  // Calcul du taux : (total_eleves - absents) / total_eleves
  const totalElevesGlobal = eleves.filter(e => e.statut === 'Actif').length;
  const tauxPresence = totalElevesGlobal > 0 ? Math.round(((totalElevesGlobal - nbAbsents) / totalElevesGlobal) * 100) : 100;

  const setStatut = (eleveId: number, statut: string) => {
    setAppelData(prev => ({ ...prev, [eleveId]: statut }));
  };

  const handleSaveAppel = () => {
    showToast('L\'appel a été enregistré avec succès pour cette date.', 'success');
  };

  const handleDeleteAbsence = (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet enregistrement d'absence/retard ?")) {
      setAbsencesList(prev => prev.filter(a => a.id !== id));
      showToast('Enregistrement supprimé.', 'success');
    }
  };

  const handleCreateAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAbsence.eleveId || !newAbsence.motif) {
      showToast('Veuillez sélectionner un élève et indiquer un motif.', 'error');
      return;
    }

    const created = {
      id: Date.now(),
      eleveId: newAbsence.eleveId,
      date: newAbsence.date,
      type: newAbsence.type,
      motif: newAbsence.motif,
      justifie: newAbsence.justifie
    };

    setAbsencesList(prev => [created, ...prev]);
    setIsModalOpen(false);
    showToast(`Déclaration de ${newAbsence.type.toLowerCase()} ajoutée.`, 'success');
    setNewAbsence({ ...newAbsence, motif: '', justifie: false });
  };

  const exportAppelSheet = classeEleves.map(eleve => ({
    'Matricule': eleve.matricule,
    'Nom': eleve.nom,
    'Prénom': eleve.prenom,
    'Date': date,
    'Statut': appelData[eleve.id] === 'absent' ? 'Absent' : appelData[eleve.id] === 'retard' ? 'Retard' : 'Présent'
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Académique</span><span className="breadcrumb-sep">/</span><span>Appel</span></div>
          <h1 className="page-title">Appel & Absences</h1>
          <p className="page-subtitle">Gestion des présences en temps réel</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExportDropdown data={exportAppelSheet} filename={`Feuille_Appel_${classe?.nom?.replace(/ /g, '_')}_${date}`} elementId="appel-sheet" />
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Déclarer une absence</button>
          <button className="btn btn-primary" onClick={handleSaveAppel}><Save size={16} /> Enregistrer l'appel</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        <div className="stat-card">
          <div className="stat-card-label">Absences à cette date</div>
          <div className="stat-card-value" style={{ color: '#e74c3c' }}>{nbAbsents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Retards</div>
          <div className="stat-card-value" style={{ color: '#f39c12' }}>{nbRetards}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Taux de présence (Global)</div>
          <div className="stat-card-value" style={{ color: tauxPresence >= 90 ? '#27ae60' : '#e74c3c' }}>{tauxPresence}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Alertes absentéisme</div>
          <div className="stat-card-value" style={{ color: '#e74c3c' }}>3</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Appel */}
        <div className="card" id="appel-sheet">
          <div className="card-header">
            <div>
              <div className="card-title">📋 Feuille d'appel — {classe?.nom || ''}</div>
              <div className="card-subtitle">
                <input 
                  type="date" 
                  className="form-input" 
                  style={{ padding: '4px 8px', height: 'auto', fontSize: '13px', marginTop: '4px', width: 'auto' }} 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
              </div>
            </div>
            <select className="form-select" style={{ width: '150px' }} value={selectedClasse} onChange={e => setSelectedClasse(Number(e.target.value))}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: '500px', overflowY: 'auto' }}>
            {classeEleves.map(eleve => {
              const statut = appelData[eleve.id] || 'present';
              return (
                <div key={eleve.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderBottom: '1px solid #f0f4f8' }}>
                  <div className="avatar avatar-sm" style={{ background: eleve.sexe === 'M' ? '#dbeafe' : '#fce7f3', color: eleve.sexe === 'M' ? '#1e3a5f' : '#ec4899', fontSize: '10px' }}>
                    {eleve.prenom[0]}{eleve.nom[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{eleve.prenom} {eleve.nom}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{eleve.matricule}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className={`btn btn-sm ${statut === 'present' ? 'btn-success' : 'btn-ghost'}`} onClick={() => setStatut(eleve.id, 'present')} title="Présent"><Check size={14} /></button>
                    <button className={`btn btn-sm ${statut === 'absent' ? 'btn-danger' : 'btn-ghost'}`} onClick={() => setStatut(eleve.id, 'absent')} title="Absent"><X size={14} /></button>
                    <button className={`btn btn-sm ${statut === 'retard' ? 'btn-warning' : 'btn-ghost'}`} onClick={() => setStatut(eleve.id, 'retard')} title="Retard"><Clock size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historique */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Historique à cette date</div>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: '500px', overflowY: 'auto' }}>
            {todayAbsences.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Aucune absence ou retard signalé ce jour.</div>
            ) : (
              todayAbsences.map(a => {
                const eleve = eleves.find(e => e.id === a.eleveId);
                if (!eleve) return null;
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderBottom: '1px solid #f0f4f8' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.type === 'Absent' ? '#e74c3c' : '#f39c12', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{eleve.prenom} {eleve.nom}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{a.motif}</div>
                    </div>
                    <span className={`badge ${a.type === 'Absent' ? 'badge-danger' : 'badge-warning'}`}>{a.type}</span>
                    <span className={`badge ${a.justifie ? 'badge-success' : 'badge-secondary'}`}>{a.justifie ? 'Justifié' : 'Non justifié'}</span>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: '#e74c3c', marginLeft: '4px' }} onClick={() => handleDeleteAbsence(a.id)} title="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Déclarer une absence ou un retard" 
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" form="add-absence-form" className="btn btn-primary"><Plus size={16} /> Enregistrer la déclaration</button>
          </div>
        }
      >
        <form id="add-absence-form" onSubmit={handleCreateAbsence}>
          <div className="form-group">
            <label className="form-label">Élève *</label>
            <select className="form-select" value={newAbsence.eleveId} onChange={e => setNewAbsence({...newAbsence, eleveId: Number(e.target.value)})}>
              <option value={0}>Sélectionner un élève...</option>
              {eleves.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} — {classes.find(c => c.id === e.classeId)?.nom}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-select" value={newAbsence.type} onChange={e => setNewAbsence({...newAbsence, type: e.target.value})}>
                <option value="Absent">Absence</option>
                <option value="Retard">Retard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" required value={newAbsence.date} onChange={e => setNewAbsence({...newAbsence, date: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Motif *</label>
            <input type="text" className="form-input" required placeholder="Ex: Maladie, Problème de transport..." value={newAbsence.motif} onChange={e => setNewAbsence({...newAbsence, motif: e.target.value})} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <input type="checkbox" id="justifie" checked={newAbsence.justifie} onChange={e => setNewAbsence({...newAbsence, justifie: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
            <label htmlFor="justifie" style={{ fontSize: '14px', cursor: 'pointer' }}>Absence/Retard justifié(e) par un mot des parents ou certificat</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
