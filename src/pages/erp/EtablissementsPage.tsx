import React, { useState } from 'react';
import { etablissements, classes, eleves } from '../../data/mockData';
import { Building2, Users, MapPin, Phone, Mail, Edit, Settings, Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import ExportDropdown from '../../components/ui/ExportDropdown';

export default function EtablissementsPage() {
  const [etabsList, setEtabsList] = useState(etablissements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [newEtab, setNewEtab] = useState({
    nom: '', type: 'Maternelle - Primaire - Collège - Lycée', adresse: '',
    telephone: '', email: '', directeur: '', effectif: 0, capacite: 0, niveaux: [] as string[]
  });

  const handleDelete = (id: number, nom: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'établissement "${nom}" ?`)) {
      setEtabsList(prev => prev.filter(e => e.id !== id));
      showToast(`Établissement "${nom}" supprimé avec succès.`, 'success');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEtab.nom || !newEtab.directeur) {
      showToast('Veuillez remplir les champs obligatoires.', 'error');
      return;
    }
    const createdEtab = {
      ...newEtab,
      id: Date.now(),
      statut: 'Actif',
      niveaux: newEtab.type.split(' - ')
    };
    setEtabsList(prev => [...prev, createdEtab]);
    setIsModalOpen(false);
    showToast(`Établissement "${newEtab.nom}" ajouté avec succès.`, 'success');
    setNewEtab({ nom: '', type: 'Maternelle - Primaire - Collège - Lycée', adresse: '', telephone: '', email: '', directeur: '', effectif: 0, capacite: 0, niveaux: [] });
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>ERP</span><span className="breadcrumb-sep">/</span><span>Établissements</span></div>
          <h1 className="page-title">Gestion des Établissements</h1>
          <p className="page-subtitle">Configuration et supervision des établissements du Groupe</p>
        </div>
        <div className="page-actions">
          <ExportDropdown data={etabsList} filename="Liste_Etablissements_LeGuide" elementId="etablissements-list" />
          <button className="btn btn-secondary"><Settings size={16} /> Configuration globale</button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Nouvel établissement</button>
        </div>
      </div>

      <div className="grid-2 mb-24" id="etablissements-list">
        {etabsList.map(etab => {
          const nbClasses = classes.filter(c => c.etablissementId === etab.id).length;
          const nbEleves = eleves.filter(e => e.etablissementId === etab.id && e.statut === 'Actif').length;
          const taux = etab.capacite > 0 ? Math.round((etab.effectif / etab.capacite) * 100) : 0;

          return (
            <div key={etab.id} className="card" style={{ transition: 'all 0.2s ease' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-light) 100%)', color: 'white', borderRadius: '16px 16px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{etab.nom}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{etab.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-icon" style={{ color: 'white' }}><Edit size={16} /></button>
                  <button className="btn btn-ghost btn-icon" style={{ color: '#ff8787' }} onClick={() => handleDelete(etab.id, etab.nom)}><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="card-body">
                <div className="grid-3" style={{ marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f5f7fa', borderRadius: '10px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>{etab.effectif}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Élèves</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f5f7fa', borderRadius: '10px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#3498db' }}>{nbClasses}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Classes</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f5f7fa', borderRadius: '10px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: taux > 90 ? '#e74c3c' : '#27ae60' }}>{taux}%</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Capacité</div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                    <span>Taux d'occupation</span>
                    <span>{taux}%</span>
                  </div>
                  <div className="progress">
                    <div className={`progress-bar ${taux > 90 ? 'progress-warning' : 'progress-primary'}`} style={{ width: `${Math.min(taux, 100)}%` }} />
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><Users size={14} /> Directeur : <strong style={{ color: '#2c3e50' }}>{etab.directeur}</strong></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><MapPin size={14} /> {etab.adresse}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><Phone size={14} /> {etab.telephone}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {etab.email}</div>
                </div>

                <div className="divider" />
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Niveaux : {etab.niveaux?.map(n => <span key={n} className="badge badge-secondary" style={{ marginRight: '4px', marginBottom: '4px' }}>{n}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter un établissement" 
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" form="add-etab-form" className="btn btn-primary"><Plus size={16} /> Ajouter</button>
          </div>
        }
      >
        <form id="add-etab-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Nom de l'établissement *</label>
            <input type="text" className="form-input" required value={newEtab.nom} onChange={e => setNewEtab({ ...newEtab, nom: e.target.value })} placeholder="Ex: École Les Frangipaniers" />
          </div>
          <div className="form-group">
            <label className="form-label">Directeur/Directrice *</label>
            <input type="text" className="form-input" required value={newEtab.directeur} onChange={e => setNewEtab({ ...newEtab, directeur: e.target.value })} placeholder="Nom du directeur" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Effectif actuel</label>
              <input type="number" className="form-input" value={newEtab.effectif} onChange={e => setNewEtab({ ...newEtab, effectif: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Capacité maximale</label>
              <input type="number" className="form-input" value={newEtab.capacite} onChange={e => setNewEtab({ ...newEtab, capacite: Number(e.target.value) })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Type & Niveaux</label>
            <select className="form-select" value={newEtab.type} onChange={e => setNewEtab({ ...newEtab, type: e.target.value })}>
              <option value="Maternelle - Primaire - Collège - Lycée">Maternelle - Primaire - Collège - Lycée</option>
              <option value="Maternelle - Primaire">Maternelle - Primaire</option>
              <option value="Collège - Lycée">Collège - Lycée</option>
              <option value="Supérieur">Supérieur</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input type="text" className="form-input" value={newEtab.adresse} onChange={e => setNewEtab({ ...newEtab, adresse: e.target.value })} placeholder="Adresse complète" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input type="text" className="form-input" value={newEtab.telephone} onChange={e => setNewEtab({ ...newEtab, telephone: e.target.value })} placeholder="+241 ..." />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={newEtab.email} onChange={e => setNewEtab({ ...newEtab, email: e.target.value })} placeholder="contact@etablissement.com" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
