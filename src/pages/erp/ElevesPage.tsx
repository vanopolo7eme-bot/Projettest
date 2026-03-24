import React, { useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { eleves, classes, etablissements } from '../../data/mockData';
import { Plus, Eye, Edit, Download, GraduationCap } from 'lucide-react';

export default function ElevesPage() {
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterEtab, setFilterEtab] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const data = eleves.filter(e => {
    if (filterEtab && e.etablissementId !== Number(filterEtab)) return false;
    if (filterStatut && e.statut !== filterStatut) return false;
    return true;
  });

  const columns = [
    { header: 'Élève', accessor: r => `${r.prenom} ${r.nom}`, render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="avatar avatar-sm" style={{ background: r.sexe === 'M' ? '#dbeafe' : '#fce7f3', color: r.sexe === 'M' ? '#1e3a5f' : '#ec4899', fontSize: '11px' }}>
          {r.prenom[0]}{r.nom[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{r.prenom} {r.nom}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.matricule}</div>
        </div>
      </div>
    )},
    { header: 'Classe', accessor: 'classe' },
    { header: 'Établissement', accessor: r => etablissements.find(e => e.id === r.etablissementId)?.nom?.replace('École Primaire ', '').replace("Lycée d'Excellence ", '') || '' },
    { header: 'Date de naissance', accessor: 'dateNaissance', render: r => new Date(r.dateNaissance).toLocaleDateString('fr-FR') },
    { header: 'Statut', render: r => (
      <span className={`badge ${r.statut === 'Actif' ? 'badge-success' : r.statut === 'Transféré' ? 'badge-warning' : 'badge-secondary'}`}>
        {r.statut}
      </span>
    )},
    { header: 'Actions', sortable: false, render: r => (
      <div className="table-actions">
        <button className="btn btn-ghost btn-icon" title="Voir" onClick={(e) => { e.stopPropagation(); setSelectedEleve(r); setShowModal(true); }}><Eye size={16} /></button>
        <button className="btn btn-ghost btn-icon" title="Modifier"><Edit size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>ERP</span><span className="breadcrumb-sep">/</span><span>Élèves</span>
          </div>
          <h1 className="page-title">Gestion des Élèves</h1>
          <p className="page-subtitle">Dossiers élèves du Groupe LE GUIDE DE NOS ENFANTS</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Download size={16} /> Exporter</button>
          <button className="btn btn-primary"><Plus size={16} /> Nouvel élève</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-12 mb-16" style={{ flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: '200px' }} value={filterEtab} onChange={e => setFilterEtab(e.target.value)}>
          <option value="">Tous les établissements</option>
          {etablissements.map(e => <option key={e.id} value={e.id}>{e.nom.replace('École Primaire ', '').replace("Lycée d'Excellence ", '')}</option>)}
        </select>
        <select className="form-select" style={{ width: '160px' }} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Transféré">Transféré</option>
          <option value="Inactif">Inactif</option>
        </select>
        <span className="badge badge-secondary" style={{ padding: '8px 14px' }}>{data.length} élève{data.length > 1 ? 's' : ''}</span>
      </div>

      <DataTable columns={columns} data={data} searchPlaceholder="Rechercher un élève par nom, prénom ou matricule..." onRowClick={r => { setSelectedEleve(r); setShowModal(true); }} />

      {/* Modal Détail Élève */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Dossier Élève" size="lg" footer={
        <>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Fermer</button>
          <button className="btn btn-primary"><Download size={16} /> Exporter PDF</button>
        </>
      }>
        {selectedEleve && (
          <div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
              <div className="avatar avatar-xl" style={{ background: selectedEleve.sexe === 'M' ? '#dbeafe' : '#fce7f3', color: selectedEleve.sexe === 'M' ? '#1e3a5f' : '#ec4899' }}>
                {selectedEleve.prenom[0]}{selectedEleve.nom[0]}
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{selectedEleve.prenom} {selectedEleve.nom}</h2>
                <p style={{ color: '#6b7280' }}>Matricule : {selectedEleve.matricule}</p>
                <span className={`badge ${selectedEleve.statut === 'Actif' ? 'badge-success' : 'badge-warning'}`}>{selectedEleve.statut}</span>
              </div>
            </div>

            <div className="tab-bar">
              <div className="tab-item active">Identité</div>
              <div className="tab-item">Responsables</div>
              <div className="tab-item">Scolarité</div>
              <div className="tab-item">Médical</div>
            </div>

            <div className="form-row" style={{ marginTop: '16px' }}>
              <div className="form-group"><label className="form-label">Prénom</label><input className="form-control" value={selectedEleve.prenom} readOnly /></div>
              <div className="form-group"><label className="form-label">Nom</label><input className="form-control" value={selectedEleve.nom} readOnly /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Date de naissance</label><input className="form-control" value={new Date(selectedEleve.dateNaissance).toLocaleDateString('fr-FR')} readOnly /></div>
              <div className="form-group"><label className="form-label">Sexe</label><input className="form-control" value={selectedEleve.sexe === 'M' ? 'Masculin' : 'Féminin'} readOnly /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Classe</label><input className="form-control" value={selectedEleve.classe} readOnly /></div>
              <div className="form-group"><label className="form-label">Établissement</label><input className="form-control" value={etablissements.find(e => e.id === selectedEleve.etablissementId)?.nom || ''} readOnly /></div>
            </div>
            {selectedEleve.allergies && (
              <div className="alert alert-warning mt-16">
                <AlertInfo /> Allergie signalée : {selectedEleve.allergies}
              </div>
            )}
            <div className="divider" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Responsables légaux</h3>
            <div className="form-row">
              <div className="form-group"><label className="form-label">{selectedEleve.responsable1.lien}</label><input className="form-control" value={selectedEleve.responsable1.nom} readOnly /><div className="form-hint">{selectedEleve.responsable1.telephone}</div></div>
              <div className="form-group"><label className="form-label">{selectedEleve.responsable2.lien}</label><input className="form-control" value={selectedEleve.responsable2.nom} readOnly /><div className="form-hint">{selectedEleve.responsable2.telephone}</div></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AlertInfo() { return <span style={{ fontSize: '16px' }}>⚠️</span>; }
