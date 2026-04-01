import React, { useState, useMemo } from 'react';
import DataTable from '../../components/ui/DataTable';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import ExportDropdown from '../../components/ui/ExportDropdown';
import {
  factures as initialFactures,
  familles,
  eleves,
  etablissements,
  paiements as initialPaiements,
  relances as initialRelances,
  remisesFratrie,
  grillesFrais,
  echeanciers
} from '../../data/mockData';
import {
  DollarSign, TrendingUp, AlertTriangle, CreditCard, Plus, Save, CheckCircle,
  Wallet, Eye, Send, Calendar, Percent, BarChart3, FileText, Clock, Bell,
  Smartphone, Building, Receipt
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

type TabId = 'factures' | 'echeanciers' | 'paiements' | 'relances' | 'grilles' | 'rapports';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'factures', label: 'Factures', icon: <FileText size={15} /> },
  { id: 'echeanciers', label: 'Echeanciers', icon: <Calendar size={15} /> },
  { id: 'paiements', label: 'Paiements', icon: <Wallet size={15} /> },
  { id: 'relances', label: 'Relances', icon: <Bell size={15} /> },
  { id: 'grilles', label: 'Grilles & Remises', icon: <Percent size={15} /> },
  { id: 'rapports', label: 'Rapports', icon: <BarChart3 size={15} /> },
];

const METHODES_PAIEMENT = [
  'Mobile Money MTN',
  'Mobile Money Orange',
  'Mobile Money Airtel',
  'Carte bancaire',
  'Virement bancaire',
  'Espèces',
];

const COLORS_CHART = ['#27ae60', '#f39c12', '#e74c3c', '#3498db', '#8b5cf6', '#06b6d4'];

export default function FinancePage() {
  const { user } = useAuth();
  const isParent = user?.role === 'Parent';
  const myFamily = isParent ? familles.find(f =>
    f.pere?.toLowerCase().includes(user.prenom?.toLowerCase()) ||
    f.mere?.toLowerCase().includes(user.prenom?.toLowerCase()) ||
    f.email === user.email
  ) : null;
  const myChildrenIds = myFamily?.enfants || [];

  const [facturesList, setFacturesList] = useState(initialFactures);
  const [paiementsList, setPaiementsList] = useState(initialPaiements);
  const [relancesList, setRelancesList] = useState(initialRelances);
  const [activeTab, setActiveTab] = useState<TabId>('factures');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterEtablissement, setFilterEtablissement] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<any>(null);

  const { showToast } = useToast();

  // RGPD: Parent sees only their family's invoices
  const parentFilteredFactures = isParent && myFamily
    ? facturesList.filter(f => f.familleId === myFamily.id)
    : facturesList;

  // New facture form
  const [newFacture, setNewFacture] = useState({
    familleId: familles[0].id,
    eleveId: familles[0].enfants[0] || eleves[0].id,
    type: 'Scolarité',
    montant: 0,
    echeance: new Date().toISOString().split('T')[0],
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    montant: 0,
    methode: METHODES_PAIEMENT[0],
    reference: '',
  });

  // --- Computed: auto-calc montant from grille ---
  const selectedFamilleForForm = familles.find(f => f.id === newFacture.familleId);
  const selectedEleveForForm = eleves.find(e => e.id === newFacture.eleveId);
  const eleveEtablissement = selectedEleveForForm
    ? etablissements.find(et => et.id === selectedEleveForForm.etablissementId)
    : null;

  const calculatedMontant = useMemo(() => {
    const grille = grillesFrais.find(g => g.type === newFacture.type);
    if (!grille || !eleveEtablissement) return 0;
    const base = eleveEtablissement.type === 'Lycée' ? grille.lycee : grille.primaire;
    return base;
  }, [newFacture.type, eleveEtablissement]);

  const remiseApplicable = useMemo(() => {
    if (!selectedFamilleForForm) return null;
    const nbEnfants = selectedFamilleForForm.enfants.length;
    if (nbEnfants >= 3) return remisesFratrie.find(r => r.regle === '3 enfants ou plus' && r.active);
    if (nbEnfants >= 2) return remisesFratrie.find(r => r.regle === '2 enfants inscrits' && r.active);
    return null;
  }, [selectedFamilleForForm]);

  const montantFinal = useMemo(() => {
    if (calculatedMontant === 0) return newFacture.montant;
    const base = calculatedMontant;
    if (remiseApplicable) return Math.round(base * (1 - remiseApplicable.pourcentage / 100));
    return base;
  }, [calculatedMontant, remiseApplicable, newFacture.montant]);

  // --- Stats (RGPD: scoped to parent's family if Parent) ---
  const stats = useMemo(() => {
    const source = parentFilteredFactures;
    const totalFacture = source.reduce((s, f) => s + f.montant, 0);
    const totalPaye = source.reduce((s, f) => s + f.paye, 0);
    const totalImpayes = totalFacture - totalPaye;
    const tauxRecouvrement = totalFacture > 0 ? Math.round((totalPaye / totalFacture) * 100) : 100;
    const nbImpayes = source.filter(f => f.statut === 'Impayé').length;
    return { totalFacture, totalPaye, totalImpayes, tauxRecouvrement, nbImpayes };
  }, [parentFilteredFactures]);

  // --- Filtered factures (RGPD: scoped to parent's family if Parent) ---
  const filteredFactures = useMemo(() => {
    let list = parentFilteredFactures;
    if (filterStatut) list = list.filter(f => f.statut === filterStatut);
    if (filterType) list = list.filter(f => f.type === filterType);
    if (filterEtablissement) {
      const etabId = Number(filterEtablissement);
      list = list.filter(f => {
        const el = eleves.find(e => e.id === f.eleveId);
        return el?.etablissementId === etabId;
      });
    }
    return list;
  }, [parentFilteredFactures, filterStatut, filterType, filterEtablissement]);

  // --- Handlers ---
  const handleCreateFacture = (e: React.FormEvent) => {
    e.preventDefault();
    const montant = montantFinal > 0 ? montantFinal : newFacture.montant;
    if (montant <= 0) {
      showToast('Le montant doit etre superieur a 0.', 'error');
      return;
    }
    const created: any = {
      id: Date.now(),
      numero: `FAC-2026-${String(facturesList.length + 1).padStart(3, '0')}`,
      familleId: newFacture.familleId,
      eleveId: newFacture.eleveId,
      type: newFacture.type,
      montant,
      paye: 0,
      statut: 'Impayé',
      echeance: newFacture.echeance,
      datePaiement: null,
    };
    setFacturesList(prev => [created, ...prev]);
    setIsModalOpen(false);
    showToast(`Facture ${created.numero} creee avec succes.`, 'success');
  };

  const handleOpenPayModal = (facture: any) => {
    setSelectedFacture(facture);
    setPaymentForm({
      montant: facture.montant - facture.paye,
      methode: METHODES_PAIEMENT[0],
      reference: '',
    });
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacture || paymentForm.montant <= 0) return;
    const ref = paymentForm.reference || `PAY-${Date.now()}`;
    const newPaiement = {
      id: Date.now(),
      factureId: selectedFacture.id,
      montant: paymentForm.montant,
      date: new Date().toISOString().split('T')[0],
      methode: paymentForm.methode,
      reference: ref,
      recu: `REC-${new Date().getFullYear()}-${String(paiementsList.length + 1).padStart(3, '0')}`,
    };
    setPaiementsList(prev => [newPaiement, ...prev]);

    setFacturesList(prev =>
      prev.map(f => {
        if (f.id === selectedFacture.id) {
          const newPaye = f.paye + paymentForm.montant;
          return {
            ...f,
            paye: Math.min(newPaye, f.montant),
            statut: newPaye >= f.montant ? 'Payé' : 'Partiel',
            datePaiement: new Date().toISOString().split('T')[0],
          };
        }
        return f;
      })
    );
    setIsPayModalOpen(false);
    showToast(`Paiement de ${paymentForm.montant.toLocaleString('fr-FR')} FCFA enregistre. Recu: ${newPaiement.recu}`, 'success');
  };

  const handleOpenDetail = (facture: any) => {
    setSelectedFacture(facture);
    setIsDetailModalOpen(true);
  };

  const handleSendRelance = (factureId: number, familleId: number) => {
    const facture = facturesList.find(f => f.id === factureId);
    const existingRelances = relancesList.filter(r => r.factureId === factureId);
    let type = 'J+7';
    if (existingRelances.length === 1) type = 'J+15';
    if (existingRelances.length >= 2) type = 'J+30';
    const newRelance = {
      id: Date.now(),
      familleId,
      factureId,
      type,
      date: new Date().toISOString().split('T')[0],
      canal: type === 'J+30' ? 'Email + SMS' : type === 'J+15' ? 'SMS' : 'Email',
      statut: 'Envoyé',
      message: `Rappel ${type} : la facture ${facture?.numero} est en attente de reglement.`,
    };
    setRelancesList(prev => [newRelance, ...prev]);
    showToast(`Relance ${type} envoyee pour ${facture?.numero}.`, 'success');
  };

  // --- Export data ---
  const exportData = filteredFactures.map(f => {
    const fam = familles.find(fm => fm.id === f.familleId);
    const el = eleves.find(e => e.id === f.eleveId);
    return {
      'Numero': f.numero,
      'Famille': fam?.nom || '-',
      'Eleve': el ? `${el.prenom} ${el.nom}` : '-',
      'Type': f.type,
      'Montant': f.montant,
      'Payé': f.paye,
      'Reste': f.montant - f.paye,
      'Statut': f.statut,
      'Echeance': f.echeance,
    };
  });

  // --- Chart data for Rapports tab (RGPD: scoped) ---
  const chartData = useMemo(() => {
    const source = parentFilteredFactures;
    const repartitionStatut = [
      { name: 'Payé', value: source.filter(f => f.statut === 'Payé').length, color: '#27ae60' },
      { name: 'Partiel', value: source.filter(f => f.statut === 'Partiel').length, color: '#f39c12' },
      { name: 'Impayé', value: source.filter(f => f.statut === 'Impayé').length, color: '#e74c3c' },
    ];

    const types = ['Scolarité', 'Inscription', 'Cantine', 'Transport'];
    const parType = types.map(type => ({
      type,
      montant: source.filter(f => f.type === type).reduce((s, f) => s + f.montant, 0),
    }));

    const moisLabels = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Fev', 'Mar'];
    const caMensuel = moisLabels.map((mois, i) => {
      const moisNum = i < 4 ? 9 + i : i - 3;
      const annee = i < 4 ? 2025 : 2026;
      const paiementsMois = paiementsList.filter(p => {
        const d = new Date(p.date);
        return d.getMonth() + 1 === moisNum && d.getFullYear() === annee;
      });
      return { mois, montant: paiementsMois.reduce((s, p) => s + p.montant, 0) };
    });

    const tauxParEtab = etablissements.map(et => {
      const elevesEtab = eleves.filter(e => e.etablissementId === et.id).map(e => e.id);
      const facturesEtab = source.filter(f => elevesEtab.includes(f.eleveId));
      const total = facturesEtab.reduce((s, f) => s + f.montant, 0);
      const paye = facturesEtab.reduce((s, f) => s + f.paye, 0);
      const taux = total > 0 ? Math.round((paye / total) * 100) : 0;
      return { etablissement: et.nom.replace(/École Primaire |Lycée d'Excellence /, ''), taux };
    });

    return { repartitionStatut, parType, caMensuel, tauxParEtab };
  }, [parentFilteredFactures, paiementsList]);

  // --- Columns for factures tab ---
  const factureColumns = [
    { header: 'N. Facture', accessor: 'numero', render: (r: any) => <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{r.numero}</span> },
    { header: 'Famille', render: (r: any) => familles.find(f => f.id === r.familleId)?.nom || '-' },
    { header: 'Eleve', render: (r: any) => { const e = eleves.find(el => el.id === r.eleveId); return e ? `${e.prenom} ${e.nom}` : '-'; } },
    { header: 'Type', render: (r: any) => <span className="badge badge-secondary">{r.type}</span> },
    { header: 'Montant', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.montant.toLocaleString('fr-FR')} FCFA</span> },
    { header: 'Payé', render: (r: any) => <span style={{ color: '#27ae60', fontWeight: 600 }}>{r.paye.toLocaleString('fr-FR')} FCFA</span> },
    {
      header: 'Statut',
      render: (r: any) => (
        <span className={`badge ${r.statut === 'Payé' ? 'badge-success' : r.statut === 'Partiel' ? 'badge-warning' : 'badge-danger'}`}>
          {r.statut}
        </span>
      ),
    },
    {
      header: 'Actions',
      sortable: false,
      render: (r: any) => (
        <div className="table-actions">
          <button className="btn btn-ghost btn-icon btn-sm" title="Voir details" onClick={() => handleOpenDetail(r)}>
            <Eye size={16} />
          </button>
          {r.statut !== 'Payé' && !isParent && (
            <button className="btn btn-ghost btn-icon btn-sm" title="Enregistrer un paiement" onClick={() => handleOpenPayModal(r)}>
              <Wallet size={16} color="#27ae60" />
            </button>
          )}
          {r.statut !== 'Payé' && isParent && (
            <button className="btn btn-sm btn-primary" style={{ fontSize: 12, padding: '4px 10px' }} title="Payer en ligne" onClick={() => handleOpenPayModal(r)}>
              <Smartphone size={14} /> Payer
            </button>
          )}
        </div>
      ),
    },
  ];

  // --- Columns for paiements tab ---
  const paiementColumns = [
    { header: 'Date', accessor: 'date', render: (r: any) => r.date },
    {
      header: 'Facture',
      render: (r: any) => {
        const f = facturesList.find(fac => fac.id === r.factureId);
        return f?.numero || '-';
      },
    },
    { header: 'Montant', render: (r: any) => <span style={{ fontWeight: 600, color: '#27ae60' }}>{r.montant.toLocaleString('fr-FR')} FCFA</span> },
    {
      header: 'Methode',
      render: (r: any) => {
        let icon = <CreditCard size={14} />;
        if (r.methode?.includes('Mobile')) icon = <Smartphone size={14} />;
        if (r.methode?.includes('Virement')) icon = <Building size={14} />;
        if (r.methode?.includes('Espèces')) icon = <DollarSign size={14} />;
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {icon} {r.methode}
          </span>
        );
      },
    },
    { header: 'Reference', accessor: 'reference', render: (r: any) => <code style={{ fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{r.reference}</code> },
    { header: 'Recu', render: (r: any) => <span className="badge badge-secondary">{r.recu}</span> },
  ];

  // --- Columns for relances tab ---
  const relanceColumns = [
    { header: 'Date', accessor: 'date', render: (r: any) => r.date },
    { header: 'Famille', render: (r: any) => familles.find(f => f.id === r.familleId)?.nom || '-' },
    {
      header: 'Facture',
      render: (r: any) => {
        const f = facturesList.find(fac => fac.id === r.factureId);
        return f?.numero || '-';
      },
    },
    { header: 'Type', render: (r: any) => <span className={`badge ${r.type === 'J+30' ? 'badge-danger' : r.type === 'J+15' ? 'badge-warning' : 'badge-secondary'}`}>{r.type}</span> },
    { header: 'Canal', render: (r: any) => r.canal },
    { header: 'Statut', render: (r: any) => <span className="badge badge-success">{r.statut}</span> },
    { header: 'Message', render: (r: any) => <span style={{ fontSize: 12, color: '#64748b' }}>{r.message?.substring(0, 60)}...</span> },
  ];

  // --- Eleves filtered by famille for creation form ---
  const elevesFamille = useMemo(() => {
    const fam = familles.find(f => f.id === newFacture.familleId);
    if (!fam) return [];
    return eleves.filter(e => fam.enfants.includes(e.id));
  }, [newFacture.familleId]);

  // --- Factures with unpaid status for relance actions (RGPD: scoped) ---
  const facturesImpayees = parentFilteredFactures.filter(f => f.statut === 'Impayé' || f.statut === 'Partiel');

  // RGPD: Filter echeanciers for parent
  const parentFilteredEcheanciers = isParent && myFamily
    ? echeanciers.filter(ech => ech.familleId === myFamily.id)
    : echeanciers;

  // -------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------

  const renderFacturesTab = () => (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Liste des Factures</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {['', 'Payé', 'Partiel', 'Impayé'].map(s => (
            <button key={s} className={`btn btn-sm ${filterStatut === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatut(s)}>
              {s || 'Toutes'}
            </button>
          ))}
          <select className="form-select" style={{ width: 'auto', fontSize: 12, padding: '4px 8px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Tous types</option>
            {['Scolarité', 'Inscription', 'Cantine', 'Transport'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select className="form-select" style={{ width: 'auto', fontSize: 12, padding: '4px 8px' }} value={filterEtablissement} onChange={e => setFilterEtablissement(e.target.value)}>
            <option value="">Tous etablissements</option>
            {etablissements.map(et => (
              <option key={et.id} value={et.id}>{et.nom}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-body" style={{ padding: 0 }} id="finance-table">
        <DataTable columns={factureColumns} data={filteredFactures} searchPlaceholder="Rechercher une facture..." searchable={true} />
      </div>
    </div>
  );

  const renderEcheanciersTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {parentFilteredEcheanciers.map(ech => {
        const fam = familles.find(f => f.id === ech.familleId);
        const el = eleves.find(e => e.id === ech.eleveId);
        const totalPaye = ech.echeances.reduce((s: number, e: any) => {
          if (e.statut === 'Payé') return s + e.montant;
          if (e.montantPaye) return s + e.montantPaye;
          return s;
        }, 0);
        const progression = Math.round((totalPaye / ech.montantTotal) * 100);

        return (
          <div className="card" key={ech.id}>
            <div className="card-header">
              <div>
                <div className="card-title">{fam?.nom || '-'} - {el ? `${el.prenom} ${el.nom}` : '-'}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{ech.type} | {ech.annee} | Total: {ech.montantTotal.toLocaleString('fr-FR')} FCFA</div>
              </div>
              <span style={{ fontWeight: 700, color: progression === 100 ? '#27ae60' : '#f39c12' }}>{progression}%</span>
            </div>
            <div className="card-body">
              {/* Progress bar */}
              <div style={{ background: '#e2e8f0', borderRadius: 8, height: 10, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ background: progression === 100 ? '#27ae60' : progression > 50 ? '#f39c12' : '#e74c3c', width: `${progression}%`, height: '100%', borderRadius: 8, transition: 'width 0.5s ease' }} />
              </div>
              {/* Echeances details */}
              <div className="grid-3">
                {ech.echeances.map((e: any, idx: number) => (
                  <div key={idx} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: `1px solid ${e.statut === 'Payé' ? '#27ae60' : e.statut === 'Partiel' ? '#f39c12' : '#e2e8f0'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>Echeance {e.numero}</span>
                      <span className={`badge ${e.statut === 'Payé' ? 'badge-success' : e.statut === 'Partiel' ? 'badge-warning' : e.statut === 'Impayé' ? 'badge-danger' : 'badge-secondary'}`}>
                        {e.statut}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Montant: {e.montant.toLocaleString('fr-FR')} FCFA</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Echeance: {e.echeance}</div>
                    {e.datePaiement && <div style={{ fontSize: 12, color: '#27ae60' }}>Paye le: {e.datePaiement}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // RGPD: filter paiements for parent
  const parentFilteredPaiements = useMemo(() => {
    if (!isParent || !myFamily) return paiementsList;
    const myFactureIds = parentFilteredFactures.map(f => f.id);
    return paiementsList.filter(p => myFactureIds.includes(p.factureId));
  }, [isParent, myFamily, paiementsList, parentFilteredFactures]);

  const renderPaiementsTab = () => (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Historique des paiements</div>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <DataTable columns={paiementColumns} data={parentFilteredPaiements} searchPlaceholder="Rechercher un paiement..." searchable={true} />
      </div>
    </div>
  );

  const renderRelancesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Workflow explanation */}
      <div className="alert" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-secondary" style={{ fontSize: 13, padding: '4px 12px' }}>J+7</span>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Email</div>
          </div>
          <div style={{ fontSize: 20, color: '#94a3b8', alignSelf: 'center' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-warning" style={{ fontSize: 13, padding: '4px 12px' }}>J+15</span>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>SMS</div>
          </div>
          <div style={{ fontSize: 20, color: '#94a3b8', alignSelf: 'center' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <span className="badge badge-danger" style={{ fontSize: 13, padding: '4px 12px' }}>J+30</span>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Email + SMS</div>
          </div>
        </div>
      </div>

      {/* Actions : send relance for unpaid */}
      {facturesImpayees.length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">Factures en attente de relance</div></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {facturesImpayees.map(f => {
                const fam = familles.find(fm => fm.id === f.familleId);
                const nbRelances = relancesList.filter(r => r.factureId === f.id).length;
                return (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{f.numero}</span>
                      <span style={{ color: '#64748b', marginLeft: 8, fontSize: 13 }}>{fam?.nom} - {(f.montant - f.paye).toLocaleString('fr-FR')} FCFA restant</span>
                      <span style={{ marginLeft: 8 }}>
                        <span className="badge badge-secondary" style={{ fontSize: 11 }}>{nbRelances} relance{nbRelances > 1 ? 's' : ''}</span>
                      </span>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => handleSendRelance(f.id, f.familleId)} disabled={nbRelances >= 3}>
                      <Send size={14} /> {nbRelances >= 3 ? 'Max atteint' : 'Envoyer relance'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Historique */}
      <div className="card">
        <div className="card-header"><div className="card-title">Historique des relances</div></div>
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable columns={relanceColumns} data={relancesList} searchPlaceholder="Rechercher une relance..." searchable={true} />
        </div>
      </div>
    </div>
  );

  const renderGrillesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Grilles de frais */}
      <div className="card">
        <div className="card-header"><div className="card-title">Grille des frais par type d'etablissement</div></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type de frais</th>
                  <th>Primaire (FCFA)</th>
                  <th>Lycee (FCFA)</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {grillesFrais.map(g => (
                  <tr key={g.id}>
                    <td><span style={{ fontWeight: 600 }}>{g.type}</span></td>
                    <td>{g.primaire.toLocaleString('fr-FR')}</td>
                    <td>{g.lycee.toLocaleString('fr-FR')}</td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>{g.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Remises fratrie */}
      <div className="card">
        <div className="card-header"><div className="card-title">Regles de remises fratrie</div></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Regle</th>
                  <th>Pourcentage</th>
                  <th>Description</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {remisesFratrie.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.regle}</td>
                    <td><span className="badge badge-secondary">{r.pourcentage}%</span></td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>{r.description}</td>
                    <td><span className={`badge ${r.active ? 'badge-success' : 'badge-danger'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRapportsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="grid-2 mb-24">
        {/* CA par mois */}
        <div className="card">
          <div className="card-header"><div className="card-title">Chiffre d'affaires par mois</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.caMensuel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} FCFA`} />
                <Bar dataKey="montant" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repartition par type */}
        <div className="card">
          <div className="card-header"><div className="card-title">Repartition par type de frais</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData.parType} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="montant" nameKey="type" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {chartData.parType.map((_: any, i: number) => <Cell key={i} fill={COLORS_CHART[i % COLORS_CHART.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} FCFA`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Taux recouvrement par etab */}
        <div className="card">
          <div className="card-header"><div className="card-title">Taux de recouvrement par etablissement</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.tauxParEtab} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} />
                <YAxis type="category" dataKey="etablissement" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="taux" radius={[0, 4, 4, 0]}>
                  {chartData.tauxParEtab.map((_: any, i: number) => (
                    <Cell key={i} fill={chartData.tauxParEtab[i].taux >= 80 ? '#27ae60' : chartData.tauxParEtab[i].taux >= 50 ? '#f39c12' : '#e74c3c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repartition statut */}
        <div className="card">
          <div className="card-header"><div className="card-title">Repartition par statut de paiement</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData.repartitionStatut} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {chartData.repartitionStatut.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // Detail modal: paiements + relances linked to the selected facture
  const detailPaiements = selectedFacture ? paiementsList.filter(p => p.factureId === selectedFacture.id) : [];
  const detailRelances = selectedFacture ? relancesList.filter(r => r.factureId === selectedFacture.id) : [];

  return (
    <div className="fade-in">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Gestion</span><span className="breadcrumb-sep">/</span><span>Finance</span>
          </div>
          <h1 className="page-title">{isParent ? 'Mes Factures' : 'Gestion Financiere'}</h1>
          <p className="page-subtitle">{isParent ? `Suivi financier de la ${myFamily?.nom || 'famille'}` : 'Facturation, paiements, echeanciers et suivi comptable'}</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ExportDropdown data={exportData} filename="Reporting_Financier_LeGuide" elementId="finance-table" />
          {!isParent && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Nouvelle facture
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid-4 mb-24">
        <StatCard label="Total facture" value={`${(stats.totalFacture / 1000000).toFixed(1)}M`} icon={<DollarSign size={22} />} color="#1e3a5f" />
        <StatCard label="Total encaisse" value={`${(stats.totalPaye / 1000000).toFixed(1)}M`} icon={<CreditCard size={22} />} color="#27ae60" trend="up" trendValue={`${stats.tauxRecouvrement}%`} />
        <StatCard label="Impayes" value={`${(stats.totalImpayes / 1000000).toFixed(1)}M`} icon={<AlertTriangle size={22} />} color="#e74c3c" trend="down" trendValue={`${stats.nbImpayes} factures`} />
        <StatCard label="Taux recouvrement" value={`${stats.tauxRecouvrement}%`} icon={<TrendingUp size={22} />} color={stats.tauxRecouvrement >= 85 ? '#27ae60' : '#f39c12'} />
      </div>

      {/* TABS (RGPD: hide admin-only tabs for Parent) */}
      <div className="tab-bar mb-24">
        {TABS.filter(tab => !isParent || !['relances', 'grilles'].includes(tab.id)).map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'factures' && renderFacturesTab()}
      {activeTab === 'echeanciers' && renderEcheanciersTab()}
      {activeTab === 'paiements' && renderPaiementsTab()}
      {activeTab === 'relances' && renderRelancesTab()}
      {activeTab === 'grilles' && renderGrillesTab()}
      {activeTab === 'rapports' && renderRapportsTab()}

      {/* ============================================================ */}
      {/*  MODAL: NOUVELLE FACTURE                                      */}
      {/* ============================================================ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generer une nouvelle facture"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" form="new-facture-form" className="btn btn-primary"><Save size={16} /> Creer la facture</button>
          </div>
        }
      >
        <form id="new-facture-form" onSubmit={handleCreateFacture}>
          <div className="form-group">
            <label className="form-label">Famille *</label>
            <select
              className="form-select"
              value={newFacture.familleId}
              onChange={e => {
                const famId = Number(e.target.value);
                const fam = familles.find(f => f.id === famId);
                setNewFacture({ ...newFacture, familleId: famId, eleveId: fam?.enfants[0] || eleves[0].id });
              }}
            >
              {familles.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Eleve *</label>
            <select className="form-select" value={newFacture.eleveId} onChange={e => setNewFacture({ ...newFacture, eleveId: Number(e.target.value) })}>
              {elevesFamille.length > 0
                ? elevesFamille.map(el => <option key={el.id} value={el.id}>{el.prenom} {el.nom}</option>)
                : eleves.slice(0, 10).map(el => <option key={el.id} value={el.id}>{el.prenom} {el.nom}</option>)
              }
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type de frais *</label>
              <select className="form-select" value={newFacture.type} onChange={e => setNewFacture({ ...newFacture, type: e.target.value })}>
                {grillesFrais.map(g => <option key={g.id} value={g.type}>{g.type}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Echeance *</label>
              <input type="date" className="form-input" required value={newFacture.echeance} onChange={e => setNewFacture({ ...newFacture, echeance: e.target.value })} />
            </div>
          </div>

          {/* Auto-calc info */}
          {calculatedMontant > 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Montant grille ({eleveEtablissement?.type || 'Primaire'}) :</span>
                <span style={{ fontWeight: 600 }}>{calculatedMontant.toLocaleString('fr-FR')} FCFA</span>
              </div>
              {remiseApplicable && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', marginBottom: 4 }}>
                  <span>Remise ({remiseApplicable.regle}) :</span>
                  <span style={{ fontWeight: 600 }}>-{remiseApplicable.pourcentage}%</span>
                </div>
              )}
              <div className="divider" style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Montant final :</span>
                <span>{montantFinal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Montant (FCFA) {calculatedMontant > 0 ? '(auto-calcule)' : '*'}</label>
            <input
              type="number"
              className="form-input"
              required={calculatedMontant === 0}
              value={calculatedMontant > 0 ? montantFinal : newFacture.montant}
              onChange={e => setNewFacture({ ...newFacture, montant: Number(e.target.value) })}
              readOnly={calculatedMontant > 0}
              style={calculatedMontant > 0 ? { background: '#f1f5f9' } : {}}
              placeholder="Ex: 750000"
            />
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/*  MODAL: ENREGISTRER PAIEMENT                                  */}
      {/* ============================================================ */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={isParent ? `Payer en ligne - ${selectedFacture?.numero}` : `Enregistrer un versement - ${selectedFacture?.numero}`}
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPayModalOpen(false)}>Annuler</button>
            <button type="submit" form="pay-facture-form" className="btn btn-success"><CheckCircle size={16} /> Valider le paiement</button>
          </div>
        }
      >
        <form id="pay-facture-form" onSubmit={handleRecordPayment}>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Montant total :</span>
              <span style={{ fontWeight: 700 }}>{selectedFacture?.montant.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27ae60' }}>
              <span>Deja paye :</span>
              <span style={{ fontWeight: 700 }}>{selectedFacture?.paye.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="divider" style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#e74c3c' }}>
              <span>Reste a payer :</span>
              <span>{((selectedFacture?.montant || 0) - (selectedFacture?.paye || 0)).toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Montant du versement (FCFA) *</label>
            <input
              type="number"
              className="form-input"
              required
              autoFocus
              max={(selectedFacture?.montant || 0) - (selectedFacture?.paye || 0)}
              value={paymentForm.montant}
              onChange={e => setPaymentForm({ ...paymentForm, montant: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Methode de paiement *</label>
            <select className="form-select" value={paymentForm.methode} onChange={e => setPaymentForm({ ...paymentForm, methode: e.target.value })}>
              {METHODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reference de transaction</label>
            <input
              type="text"
              className="form-input"
              value={paymentForm.reference}
              onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              placeholder="Ex: MTN-2026-031234"
            />
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/*  MODAL: DETAIL FACTURE                                        */}
      {/* ============================================================ */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Detail facture ${selectedFacture?.numero || ''}`}
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>Fermer</button>
          </div>
        }
      >
        {selectedFacture && (
          <div>
            {/* Resume */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Famille</div>
                  <div style={{ fontWeight: 600 }}>{familles.find(f => f.id === selectedFacture.familleId)?.nom || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Eleve</div>
                  <div style={{ fontWeight: 600 }}>
                    {(() => { const e = eleves.find(el => el.id === selectedFacture.eleveId); return e ? `${e.prenom} ${e.nom}` : '-'; })()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Type</div>
                  <div>{selectedFacture.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Echeance</div>
                  <div>{selectedFacture.echeance}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Montant</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedFacture.montant.toLocaleString('fr-FR')} FCFA</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Statut</div>
                  <span className={`badge ${selectedFacture.statut === 'Payé' ? 'badge-success' : selectedFacture.statut === 'Partiel' ? 'badge-warning' : 'badge-danger'}`}>
                    {selectedFacture.statut}
                  </span>
                </div>
              </div>
              {/* Progress */}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>Progression</span>
                  <span>{Math.round((selectedFacture.paye / selectedFacture.montant) * 100)}%</span>
                </div>
                <div style={{ background: '#e2e8f0', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                  <div style={{ background: selectedFacture.statut === 'Payé' ? '#27ae60' : '#f39c12', width: `${Math.round((selectedFacture.paye / selectedFacture.montant) * 100)}%`, height: '100%', borderRadius: 8 }} />
                </div>
              </div>
            </div>

            {/* Historique paiements */}
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Historique des paiements ({detailPaiements.length})</h3>
            {detailPaiements.length > 0 ? (
              <div className="table-container" style={{ marginBottom: 16 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Methode</th>
                      <th>Reference</th>
                      <th>Recu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailPaiements.map(p => (
                      <tr key={p.id}>
                        <td>{p.date}</td>
                        <td style={{ fontWeight: 600, color: '#27ae60' }}>{p.montant.toLocaleString('fr-FR')} FCFA</td>
                        <td>{p.methode}</td>
                        <td><code style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{p.reference}</code></td>
                        <td><span className="badge badge-secondary">{p.recu}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Aucun paiement enregistre.</p>
            )}

            {/* Historique relances */}
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Relances envoyees ({detailRelances.length})</h3>
            {detailRelances.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Canal</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRelances.map(r => (
                      <tr key={r.id}>
                        <td>{r.date}</td>
                        <td><span className={`badge ${r.type === 'J+30' ? 'badge-danger' : r.type === 'J+15' ? 'badge-warning' : 'badge-secondary'}`}>{r.type}</span></td>
                        <td>{r.canal}</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{r.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>Aucune relance envoyee.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
