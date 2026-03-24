import React from 'react';
import DataTable from '../../components/ui/DataTable';
import { enseignants, etablissements, matieres } from '../../data/mockData';
import { Plus, Eye, Briefcase } from 'lucide-react';

export default function PersonnelPage() {
  const columns = [
    { header: 'Enseignant', render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="avatar avatar-sm" style={{ background: '#e8f0fe', color: '#1e3a5f', fontSize: '11px' }}>{r.prenom[0]}{r.nom[0]}</div>
        <div><div style={{ fontWeight: 600 }}>{r.prenom} {r.nom}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.email}</div></div>
      </div>
    )},
    { header: 'Spécialité', accessor: 'specialite' },
    { header: 'Matières', render: r => r.matieres.map(mId => {
      const m = matieres.find(x => x.id === mId);
      return m ? <span key={m.id} className="badge badge-primary" style={{ marginRight: '4px', background: `${m.couleur}20`, color: m.couleur }}>{m.abr}</span> : null;
    })},
    { header: 'Établissement', render: r => etablissements.find(e => e.id === r.etablissementId)?.nom?.replace('École Primaire ', '').replace("Lycée d'Excellence ", '') || '' },
    { header: 'Contrat', render: r => <span className={`badge ${r.contrat === 'Titulaire' ? 'badge-success' : 'badge-warning'}`}>{r.contrat}</span> },
    { header: 'Téléphone', accessor: 'telephone' },
    { header: '', sortable: false, render: () => <button className="btn btn-ghost btn-icon"><Eye size={16} /></button> },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>ERP</span><span className="breadcrumb-sep">/</span><span>Personnel</span></div>
          <h1 className="page-title">Gestion du Personnel</h1>
          <p className="page-subtitle">Enseignants et personnel administratif</p>
        </div>
        <div className="page-actions"><button className="btn btn-primary"><Plus size={16} /> Ajouter</button></div>
      </div>

      <div className="grid-4 mb-24">
        <div className="stat-card">
          <div className="stat-card-label">Total enseignants</div>
          <div className="stat-card-value">{enseignants.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Titulaires</div>
          <div className="stat-card-value" style={{ color: '#27ae60' }}>{enseignants.filter(e => e.contrat === 'Titulaire').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Contractuels</div>
          <div className="stat-card-value" style={{ color: '#f39c12' }}>{enseignants.filter(e => e.contrat === 'Contractuel').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Établissements</div>
          <div className="stat-card-value">{new Set(enseignants.map(e => e.etablissementId)).size}</div>
        </div>
      </div>

      <DataTable columns={columns} data={enseignants} searchPlaceholder="Rechercher un enseignant..." />
    </div>
  );
}
