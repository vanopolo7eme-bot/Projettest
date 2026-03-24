import React from 'react';
import DataTable from '../../components/ui/DataTable';
import { familles, eleves } from '../../data/mockData';
import { Users, Eye, DollarSign, Plus } from 'lucide-react';

export default function FamillesPage() {
  const columns = [
    { header: 'Famille', render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="avatar avatar-sm" style={{ background: '#e8f4f8', color: '#1e3a5f', fontSize: '11px' }}>{r.nom.split(' ').pop()[0]}F</div>
        <div><div style={{ fontWeight: 600 }}>{r.nom}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.email}</div></div>
      </div>
    )},
    { header: 'Parents', render: r => <div><div style={{ fontSize: '13px' }}>{r.pere}</div><div style={{ fontSize: '12px', color: '#6b7280' }}>{r.mere}</div></div> },
    { header: 'Enfants', render: r => {
      const kids = r.enfants.map(id => eleves.find(e => e.id === id)).filter(Boolean);
      return <div>{kids.map(k => <span key={k.id} className="badge badge-primary" style={{ marginRight: '4px', marginBottom: '2px' }}>{k.prenom} ({k.classe})</span>)}</div>;
    }},
    { header: 'Téléphone', accessor: 'telephone' },
    { header: 'Solde', render: r => (
      <span style={{ fontWeight: 700, color: r.solde < 0 ? '#e74c3c' : '#27ae60' }}>
        {r.solde === 0 ? 'À jour' : `${Math.abs(r.solde).toLocaleString('fr-FR')} FCFA`}
      </span>
    )},
    { header: 'Statut', render: r => (
      <span className={`badge ${r.solde === 0 ? 'badge-success' : r.solde > -100000 ? 'badge-warning' : 'badge-danger'}`}>
        {r.solde === 0 ? 'À jour' : 'Solde débiteur'}
      </span>
    )},
    { header: '', sortable: false, render: () => <button className="btn btn-ghost btn-icon"><Eye size={16} /></button> },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>ERP</span><span className="breadcrumb-sep">/</span><span>Familles</span></div>
          <h1 className="page-title">Gestion des Familles</h1>
          <p className="page-subtitle">Vision consolidée des cellules familiales et facturation</p>
        </div>
        <div className="page-actions"><button className="btn btn-primary"><Plus size={16} /> Nouvelle famille</button></div>
      </div>
      <DataTable columns={columns} data={familles} searchPlaceholder="Rechercher une famille..." />
    </div>
  );
}
