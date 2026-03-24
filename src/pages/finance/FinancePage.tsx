import React, { useState, useMemo } from 'react';
import DataTable from '../../components/ui/DataTable';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import { factures as initialFactures, familles, eleves } from '../../data/mockData';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, Download, Plus, Filter, Save, CheckCircle, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '../../contexts/ToastContext';
import ExportDropdown from '../../components/ui/ExportDropdown';

export default function FinancePage() {
  const [facturesList, setFacturesList] = useState(initialFactures);
  const [activeTab, setActiveTab] = useState('tableau');
  const [filterStatut, setFilterStatut] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<any>(null);
  const { showToast } = useToast();

  const [newFacture, setNewFacture] = useState({
    familleId: familles[0].id,
    eleveId: eleves[0].id,
    type: 'Scolarité',
    montant: 0,
    echeance: new Date().toISOString().split('T')[0]
  });

  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Stats calculation
  const stats = useMemo(() => {
    const totalFacture = facturesList.reduce((s, f) => s + f.montant, 0);
    const totalPaye = facturesList.reduce((s, f) => s + f.paye, 0);
    const totalImpayes = totalFacture - totalPaye;
    const tauxRecouvrement = totalFacture > 0 ? Math.round((totalPaye / totalFacture) * 100) : 100;
    const nbImpayes = facturesList.filter(f => f.statut === 'Impayé').length;
    
    return { totalFacture, totalPaye, totalImpayes, tauxRecouvrement, nbImpayes };
  }, [facturesList]);

  const filteredFactures = useMemo(() => {
    return filterStatut ? facturesList.filter(f => f.statut === filterStatut) : facturesList;
  }, [facturesList, filterStatut]);

  const chartData = useMemo(() => {
    const repartition = [
      { name: 'Payé', value: facturesList.filter(f => f.statut === 'Payé').length, color: '#27ae60' },
      { name: 'Partiel', value: facturesList.filter(f => f.statut === 'Partiel').length, color: '#f39c12' },
      { name: 'Impayé', value: facturesList.filter(f => f.statut === 'Impayé').length, color: '#e74c3c' },
    ];

    const types = ['Scolarité', 'Inscription', 'Cantine', 'Transport'];
    const parType = types.map(type => ({
      type,
      montant: facturesList.filter(f => f.type === type).reduce((s, f) => s + f.montant, 0)
    }));

    return { repartition, parType };
  }, [facturesList]);

  const handleCreateFacture = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFacture.montant <= 0) {
      showToast('Le montant doit être supérieur à 0.', 'error');
      return;
    }

    const created: any = {
      ...newFacture,
      id: Date.now(),
      numero: `FAC-2026-${String(facturesList.length + 1).padStart(3, '0')}`,
      paye: 0,
      statut: 'Impayé',
      datePaiement: null
    };

    setFacturesList(prev => [created, ...prev]);
    setIsModalOpen(false);
    showToast(`Facture ${created.numero} créée avec succès.`, 'success');
  };

  const handleOpenPayModal = (facture: any) => {
    setSelectedFacture(facture);
    setPaymentAmount(facture.montant - facture.paye);
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacture || paymentAmount <= 0) return;

    setFacturesList(prev => prev.map(f => {
      if (f.id === selectedFacture.id) {
        const newPaye = f.paye + paymentAmount;
        let newStatut = 'Partiel';
        if (newPaye >= f.montant) newStatut = 'Payé';
        
        return {
          ...f,
          paye: newPaye,
          statut: newStatut,
          datePaiement: new Date().toISOString().split('T')[0]
        };
      }
      return f;
    }));

    setIsPayModalOpen(false);
    showToast(`Paiement de ${paymentAmount.toLocaleString('fr-FR')} FCFA enregistré.`, 'success');
  };

  const exportData = filteredFactures.map(f => {
    const fam = familles.find(fam => fam.id === f.familleId);
    const el = eleves.find(el => el.id === f.eleveId);
    return {
      'Numéro': f.numero,
      'Famille': fam?.nom || '—',
      'Élève': el ? `${el.prenom} ${el.nom}` : '—',
      'Type': f.type,
      'Montant': f.montant,
      'Payé': f.paye,
      'Reste': f.montant - f.paye,
      'Statut': f.statut,
      'Échéance': f.echeance
    };
  });

  const columns = [
    { header: 'N° Facture', accessor: 'numero', render: r => <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{r.numero}</span> },
    { header: 'Famille', render: r => { const f = familles.find(fam => fam.id === r.familleId); return f?.nom || '—'; }},
    { header: 'Élève', render: r => { const e = eleves.find(el => el.id === r.eleveId); return e ? `${e.prenom} ${e.nom}` : '—'; }},
    { header: 'Type', render: r => <span className="badge badge-secondary">{r.type}</span> },
    { header: 'Montant', render: r => <span style={{ fontWeight: 600 }}>{r.montant.toLocaleString('fr-FR')} FCFA</span> },
    { header: 'Payé', render: r => <span style={{ color: '#27ae60', fontWeight: 600 }}>{r.paye.toLocaleString('fr-FR')} FCFA</span> },
    { header: 'Statut', render: r => (
      <span className={`badge ${r.statut === 'Payé' ? 'badge-success' : r.statut === 'Partiel' ? 'badge-warning' : 'badge-danger'}`}>{r.statut}</span>
    )},
    { header: 'Actions', sortable: false, render: r => (
      <div className="table-actions">
        {r.statut !== 'Payé' && (
          <button className="btn btn-ghost btn-icon btn-sm" title="Enregistrer un paiement" onClick={() => handleOpenPayModal(r)}>
            <Wallet size={16} color="#27ae60" />
          </button>
        )}
        <button className="btn btn-ghost btn-icon btn-sm" title="Voir détails">
          <Filter size={16} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Gestion</span><span className="breadcrumb-sep">/</span><span>Finance</span></div>
          <h1 className="page-title">Gestion Financière</h1>
          <p className="page-subtitle">Facturation, paiements et suivi comptable</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExportDropdown data={exportData} filename="Reporting_Financier_LeGuide" elementId="finance-table" />
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Nouvelle facture</button>
        </div>
      </div>

      <div className="grid-4 mb-24">
        <StatCard label="Total facturé" value={`${(stats.totalFacture / 1000000).toFixed(1)}M`} icon={<DollarSign size={22} />} color="#1e3a5f" />
        <StatCard label="Total encaissé" value={`${(stats.totalPaye / 1000000).toFixed(1)}M`} icon={<CreditCard size={22} />} color="#27ae60" trend="up" trendValue={`${stats.tauxRecouvrement}%`} />
        <StatCard label="Impayés" value={`${(stats.totalImpayes / 1000000).toFixed(1)}M`} icon={<AlertTriangle size={22} />} color="#e74c3c" trend="down" trendValue={`${stats.nbImpayes} factures`} />
        <StatCard label="Taux recouvrement" value={`${stats.tauxRecouvrement}%`} icon={<TrendingUp size={22} />} color={stats.tauxRecouvrement >= 85 ? '#27ae60' : '#f39c12'} />
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header"><div className="card-title">Répartition par statut</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData.repartition} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {chartData.repartition.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Facturation par type</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.parType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={v => `${v.toLocaleString('fr-FR')} FCFA`} />
                <Bar dataKey="montant" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Liste des Factures</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['', 'Payé', 'Partiel', 'Impayé'].map(s => (
              <button key={s} className={`btn btn-sm ${filterStatut === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatut(s)}>
                {s || 'Toutes'}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }} id="finance-table">
          <DataTable columns={columns} data={filteredFactures} searchPlaceholder="Rechercher une facture..." searchable={true} />
        </div>
      </div>

      {/* MODAL NOUVELLE FACTURE */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Générer une nouvelle facture" 
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" form="new-facture-form" className="btn btn-primary"><Save size={16} /> Créer la facture</button>
          </div>
        }
      >
        <form id="new-facture-form" onSubmit={handleCreateFacture}>
          <div className="form-group">
            <label className="form-label">Famille *</label>
            <select className="form-select" value={newFacture.familleId} onChange={e => setNewFacture({...newFacture, familleId: Number(e.target.value)})}>
              {familles.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Élève *</label>
            <select className="form-select" value={newFacture.eleveId} onChange={e => setNewFacture({...newFacture, eleveId: Number(e.target.value)})}>
              {eleves.map(el => <option key={el.id} value={el.id}>{el.prenom} {el.nom}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type de frais *</label>
              <select className="form-select" value={newFacture.type} onChange={e => setNewFacture({...newFacture, type: e.target.value})}>
                <option value="Scolarité">Scolarité</option>
                <option value="Inscription">Inscription</option>
                <option value="Cantine">Cantine</option>
                <option value="Transport">Transport</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Échéance *</label>
              <input type="date" className="form-input" required value={newFacture.echeance} onChange={e => setNewFacture({...newFacture, echeance: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Montant (FCFA) *</label>
            <input type="number" className="form-input" required value={newFacture.montant} onChange={e => setNewFacture({...newFacture, montant: Number(e.target.value)})} placeholder="Ex: 750000" />
          </div>
        </form>
      </Modal>

      {/* MODAL ENREGISTRER PAIEMENT */}
      <Modal 
        isOpen={isPayModalOpen} 
        onClose={() => setIsPayModalOpen(false)} 
        title={`Enregistrer un versement — ${selectedFacture?.numero}`} 
        size="sm"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPayModalOpen(false)}>Annuler</button>
            <button type="submit" form="pay-facture-form" className="btn btn-success"><CheckCircle size={16} /> Valider le paiement</button>
          </div>
        }
      >
        <form id="pay-facture-form" onSubmit={handleRecordPayment}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Montant total :</span>
              <span style={{ fontWeight: 700 }}>{selectedFacture?.montant.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27ae60' }}>
              <span>Déjà payé :</span>
              <span style={{ fontWeight: 700 }}>{selectedFacture?.paye.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="divider" style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#e74c3c' }}>
              <span>Reste à payer :</span>
              <span>{(selectedFacture?.montant - selectedFacture?.paye).toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Montant du versement *</label>
            <input 
              type="number" 
              className="form-input" 
              required 
              autoFocus
              max={selectedFacture?.montant - selectedFacture?.paye}
              value={paymentAmount} 
              onChange={e => setPaymentAmount(Number(e.target.value))} 
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
