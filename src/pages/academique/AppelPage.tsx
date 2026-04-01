import React, { useState, useMemo } from 'react';
import { eleves, absences as initialAbsences, classes, etablissements, justificatifs as initialJustificatifs, alertesAbsenteisme as initialAlertes } from '../../data/mockData';
import {
  Check, X, Clock, AlertTriangle, Save, Plus, Users, UserCheck, UserX,
  Bell, FileText, Shield, Filter, Calendar, TrendingUp, Upload, Eye,
  CheckCircle, XCircle, Phone, Mail, ChevronRight
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ExportDropdown from '../../components/ui/ExportDropdown';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import { useToast } from '../../contexts/ToastContext';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────
type AppelStatut = 'present' | 'absent' | 'retard';
type OngletActif = 'appel' | 'historique' | 'justificatifs' | 'alertes';

interface Justificatif {
  id: number;
  absenceId: number;
  eleveId: number;
  type: string;
  fichier: string | null;
  dateDepot: string | null;
  valide: boolean;
  validePar: string | null;
  contenu?: string;
}

interface AlerteAbsenteisme {
  id: number;
  eleveId: number;
  totalAbsences: number;
  totalRetards: number;
  periode: string;
  seuil: number;
  statut: string;
  dateAlerte: string;
  notifieParents: boolean;
  notifieDirection: boolean;
}

// ────────────────────────────────────────────────────────
// Couleurs graphiques
// ────────────────────────────────────────────────────────
const COLORS_PIE = ['#27ae60', '#e74c3c'];
const COLORS_LINE = '#3498db';

// ────────────────────────────────────────────────────────
// Composant principal
// ────────────────────────────────────────────────────────
export default function AppelPage() {
  const { showToast } = useToast();

  // --- Onglet actif ---
  const [onglet, setOnglet] = useState<OngletActif>('appel');

  // --- Appel du jour ---
  const [selectedClasse, setSelectedClasse] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [appelData, setAppelData] = useState<Record<number, AppelStatut>>({});

  // --- Absences (copie mutable) ---
  const [absencesList, setAbsencesList] = useState(initialAbsences);

  // --- Justificatifs ---
  const [justificatifsList, setJustificatifsList] = useState<Justificatif[]>(initialJustificatifs as Justificatif[]);
  const [isJustifModalOpen, setIsJustifModalOpen] = useState(false);
  const [newJustif, setNewJustif] = useState({ eleveId: 0, absenceId: 0, type: 'Certificat medical', fichier: '' });

  // --- Alertes ---
  const [alertesList, setAlertesList] = useState<AlerteAbsenteisme[]>(initialAlertes as AlerteAbsenteisme[]);
  const [seuilAlerte, setSeuilAlerte] = useState(15);

  // --- Filtres historique ---
  const [filtreClasse, setFiltreClasse] = useState(0); // 0 = toutes
  const [filtreType, setFiltreType] = useState(''); // '' = tous
  const [filtreJustifie, setFiltreJustifie] = useState(''); // '' = tous
  const [filtrePeriodeDebut, setFiltrePeriodeDebut] = useState('2026-03-01');
  const [filtrePeriodeFin, setFiltrePeriodeFin] = useState('2026-03-31');

  // ────────────────────────────────────────────────────────
  // Calculs derives
  // ────────────────────────────────────────────────────────
  const classe = classes.find(c => c.id === selectedClasse);
  const classeEleves = eleves.filter(e => e.classeId === selectedClasse && e.statut === 'Actif');
  const totalElevesActifs = eleves.filter(e => e.statut === 'Actif').length;

  const todayAbsences = absencesList.filter(a => a.date === date);
  const nbAbsentsJour = todayAbsences.filter(a => a.type === 'Absent').length;
  const nbRetardsJour = todayAbsences.filter(a => a.type === 'Retard').length;
  const tauxPresence = totalElevesActifs > 0
    ? Math.round(((totalElevesActifs - nbAbsentsJour) / totalElevesActifs) * 100)
    : 100;

  const nbAlertesChroniques = alertesList.length;

  // Compteur temps reel de l'appel en cours
  const appelCounts = useMemo(() => {
    let presents = 0, absents = 0, retards = 0;
    classeEleves.forEach(e => {
      const s = appelData[e.id] || 'present';
      if (s === 'present') presents++;
      else if (s === 'absent') absents++;
      else retards++;
    });
    return { presents, absents, retards, total: classeEleves.length };
  }, [appelData, classeEleves]);

  // ────────────────────────────────────────────────────────
  // Historique : filtres
  // ────────────────────────────────────────────────────────
  const absencesFiltrees = useMemo(() => {
    return absencesList.filter(a => {
      if (filtreClasse > 0) {
        const eleve = eleves.find(e => e.id === a.eleveId);
        if (!eleve || eleve.classeId !== filtreClasse) return false;
      }
      if (filtreType && a.type !== filtreType) return false;
      if (filtreJustifie === 'oui' && !a.justifie) return false;
      if (filtreJustifie === 'non' && a.justifie) return false;
      if (filtrePeriodeDebut && a.date < filtrePeriodeDebut) return false;
      if (filtrePeriodeFin && a.date > filtrePeriodeFin) return false;
      return true;
    });
  }, [absencesList, filtreClasse, filtreType, filtreJustifie, filtrePeriodeDebut, filtrePeriodeFin]);

  // ────────────────────────────────────────────────────────
  // Graphique : evolution par semaine
  // ────────────────────────────────────────────────────────
  const evolutionParSemaine = useMemo(() => {
    const semaines: Record<string, { absences: number; retards: number }> = {};
    absencesList.forEach(a => {
      const d = new Date(a.date);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay() + 1);
      const key = startOfWeek.toISOString().split('T')[0];
      if (!semaines[key]) semaines[key] = { absences: 0, retards: 0 };
      if (a.type === 'Absent') semaines[key].absences++;
      else semaines[key].retards++;
    });
    return Object.entries(semaines)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sem, val]) => ({
        semaine: `Sem. ${sem.slice(5)}`,
        Absences: val.absences,
        Retards: val.retards,
      }));
  }, [absencesList]);

  // ────────────────────────────────────────────────────────
  // Graphique : repartition justifie / non justifie
  // ────────────────────────────────────────────────────────
  const repartitionJustifie = useMemo(() => {
    let justifie = 0, nonJustifie = 0;
    absencesFiltrees.forEach(a => {
      if (a.justifie) justifie++;
      else nonJustifie++;
    });
    return [
      { name: 'Justifie', value: justifie },
      { name: 'Non justifie', value: nonJustifie },
    ];
  }, [absencesFiltrees]);

  // ────────────────────────────────────────────────────────
  // Top 5 eleves les plus absents
  // ────────────────────────────────────────────────────────
  const top5Absents = useMemo(() => {
    const counts: Record<number, number> = {};
    absencesList.filter(a => a.type === 'Absent').forEach(a => {
      counts[a.eleveId] = (counts[a.eleveId] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, nb]) => {
        const eleve = eleves.find(e => e.id === Number(id));
        const cl = eleve ? classes.find(c => c.id === eleve.classeId) : null;
        return { eleve, classe: cl, nbAbsences: nb };
      });
  }, [absencesList]);

  // ────────────────────────────────────────────────────────
  // Actions : Appel du jour
  // ────────────────────────────────────────────────────────
  const setStatut = (eleveId: number, statut: AppelStatut) => {
    const prev = appelData[eleveId];
    setAppelData(p => ({ ...p, [eleveId]: statut }));

    // Notification parents si marque absent
    if (statut === 'absent' && prev !== 'absent') {
      const eleve = eleves.find(e => e.id === eleveId);
      if (eleve) {
        showToast(`Notification envoyee aux parents de ${eleve.prenom} ${eleve.nom}`, 'info');
      }
    }
  };

  const handleSaveAppel = () => {
    // Generer les absences / retards depuis appelData
    const newEntries: typeof absencesList = [];
    Object.entries(appelData).forEach(([eleveIdStr, statut]) => {
      if (statut === 'absent' || statut === 'retard') {
        const eleveId = Number(eleveIdStr);
        // Verifier qu'il n'existe pas deja
        const exists = absencesList.some(a => a.eleveId === eleveId && a.date === date);
        if (!exists) {
          newEntries.push({
            id: Date.now() + eleveId,
            eleveId,
            date,
            type: statut === 'absent' ? 'Absent' : 'Retard',
            justifie: false,
            motif: '',
            heureDebut: '08:00',
            heureFin: '17:00',
          });
        }
      }
    });
    if (newEntries.length > 0) {
      setAbsencesList(prev => [...newEntries, ...prev]);
    }
    showToast(`Appel enregistre pour ${classe?.nom || 'la classe'} le ${date}. ${appelCounts.presents} presents, ${appelCounts.absents} absents, ${appelCounts.retards} retards.`, 'success');
  };

  // ────────────────────────────────────────────────────────
  // Actions : Justificatifs
  // ────────────────────────────────────────────────────────
  const handleValiderJustif = (id: number) => {
    setJustificatifsList(prev => prev.map(j =>
      j.id === id ? { ...j, valide: true, validePar: 'Administration', dateDepot: j.dateDepot || new Date().toISOString().split('T')[0] } : j
    ));
    showToast('Justificatif valide avec succes.', 'success');
  };

  const handleRejeterJustif = (id: number) => {
    setJustificatifsList(prev => prev.filter(j => j.id !== id));
    showToast('Justificatif rejete.', 'warning');
  };

  const handleDepotJustif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJustif.eleveId) {
      showToast('Veuillez selectionner un eleve.', 'error');
      return;
    }
    const created: Justificatif = {
      id: Date.now(),
      absenceId: newJustif.absenceId || 0,
      eleveId: newJustif.eleveId,
      type: newJustif.type,
      fichier: newJustif.fichier || null,
      dateDepot: new Date().toISOString().split('T')[0],
      valide: false,
      validePar: null,
    };
    setJustificatifsList(prev => [created, ...prev]);
    setIsJustifModalOpen(false);
    setNewJustif({ eleveId: 0, absenceId: 0, type: 'Certificat medical', fichier: '' });
    showToast('Justificatif depose, en attente de validation.', 'success');
  };

  // ────────────────────────────────────────────────────────
  // Actions : Alertes
  // ────────────────────────────────────────────────────────
  const handleNotifierParents = (alerteId: number) => {
    setAlertesList(prev => prev.map(a =>
      a.id === alerteId ? { ...a, notifieParents: true } : a
    ));
    const alerte = alertesList.find(a => a.id === alerteId);
    const eleve = alerte ? eleves.find(e => e.id === alerte.eleveId) : null;
    showToast(`Notification envoyee aux parents de ${eleve?.prenom || ''} ${eleve?.nom || ''}.`, 'success');
  };

  const handleConvoquerFamille = (alerteId: number) => {
    const alerte = alertesList.find(a => a.id === alerteId);
    const eleve = alerte ? eleves.find(e => e.id === alerte.eleveId) : null;
    showToast(`Convocation envoyee a la famille de ${eleve?.prenom || ''} ${eleve?.nom || ''}.`, 'info');
  };

  // ────────────────────────────────────────────────────────
  // Export data
  // ────────────────────────────────────────────────────────
  const exportAppelSheet = classeEleves.map(eleve => ({
    'Matricule': eleve.matricule,
    'Nom': eleve.nom,
    'Prenom': eleve.prenom,
    'Classe': classe?.nom || '',
    'Date': date,
    'Statut': appelData[eleve.id] === 'absent' ? 'Absent' : appelData[eleve.id] === 'retard' ? 'Retard' : 'Present',
  }));

  const exportRapportAbsences = absencesFiltrees.map(a => {
    const eleve = eleves.find(e => e.id === a.eleveId);
    const cl = eleve ? classes.find(c => c.id === eleve.classeId) : null;
    return {
      'Date': a.date,
      'Eleve': eleve ? `${eleve.prenom} ${eleve.nom}` : 'Inconnu',
      'Matricule': eleve?.matricule || '',
      'Classe': cl?.nom || '',
      'Type': a.type,
      'Justifie': a.justifie ? 'Oui' : 'Non',
      'Motif': a.motif,
    };
  });

  // ────────────────────────────────────────────────────────
  // Rendu onglets
  // ────────────────────────────────────────────────────────
  const onglets: { key: OngletActif; label: string; icon: React.ReactNode }[] = [
    { key: 'appel', label: 'Appel du jour', icon: <UserCheck size={16} /> },
    { key: 'historique', label: 'Historique & Statistiques', icon: <TrendingUp size={16} /> },
    { key: 'justificatifs', label: 'Justificatifs', icon: <FileText size={16} /> },
    { key: 'alertes', label: 'Alertes absenteisme', icon: <AlertTriangle size={16} /> },
  ];

  // ────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      {/* ---- Header ---- */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Academique</span>
            <span className="breadcrumb-sep">/</span>
            <span>Appel & Absences</span>
          </div>
          <h1 className="page-title">Appel & Absences</h1>
          <p className="page-subtitle">Gestion des presences, justificatifs et suivi de l'absenteisme</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onglet === 'appel' && (
            <>
              <ExportDropdown data={exportAppelSheet} filename={`Feuille_Appel_${classe?.nom?.replace(/ /g, '_')}_${date}`} elementId="appel-sheet" />
              <button className="btn btn-primary" onClick={handleSaveAppel}><Save size={16} /> Enregistrer l'appel</button>
            </>
          )}
          {onglet === 'historique' && (
            <ExportDropdown data={exportRapportAbsences} filename={`Rapport_Absences_${filtrePeriodeDebut}_${filtrePeriodeFin}`} />
          )}
          {onglet === 'justificatifs' && (
            <button className="btn btn-primary" onClick={() => setIsJustifModalOpen(true)}><Plus size={16} /> Deposer un justificatif</button>
          )}
        </div>
      </div>

      {/* ---- Stats en haut (4 cartes) ---- */}
      <div className="grid-4 mb-24">
        <StatCard
          label="Taux de presence du jour"
          value={`${tauxPresence}%`}
          icon={<UserCheck size={22} />}
          color={tauxPresence >= 90 ? '#27ae60' : tauxPresence >= 75 ? '#f39c12' : '#e74c3c'}
          trend={tauxPresence >= 90 ? 'up' : 'down'}
          trendValue={tauxPresence >= 90 ? 'Bon niveau' : 'A surveiller'}
        />
        <StatCard
          label="Absences du jour"
          value={nbAbsentsJour}
          icon={<UserX size={22} />}
          color="#e74c3c"
          trend={nbAbsentsJour > 5 ? 'up' : 'down'}
          trendValue={`${date}`}
        />
        <StatCard
          label="Retards du jour"
          value={nbRetardsJour}
          icon={<Clock size={22} />}
          color="#f39c12"
          trend={nbRetardsJour > 3 ? 'up' : 'down'}
          trendValue={`${date}`}
        />
        <StatCard
          label="Alertes absenteisme"
          value={nbAlertesChroniques}
          icon={<AlertTriangle size={22} />}
          color="#e74c3c"
          trend={nbAlertesChroniques > 0 ? 'up' : 'down'}
          trendValue={nbAlertesChroniques > 0 ? `${alertesList.filter(a => a.statut === 'Critique').length} critique(s)` : 'Aucune alerte'}
        />
      </div>

      {/* ---- Onglets ---- */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
        {onglets.map(o => (
          <button
            key={o.key}
            onClick={() => setOnglet(o.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: onglet === o.key ? '3px solid var(--primary, #3498db)' : '3px solid transparent',
              color: onglet === o.key ? 'var(--primary, #3498db)' : '#6b7280',
              fontWeight: onglet === o.key ? 600 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px',
            }}
          >
            {o.icon} {o.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          ONGLET 1 : APPEL DU JOUR
         ════════════════════════════════════════════════════════ */}
      {onglet === 'appel' && (
        <div>
          {/* Selecteurs + compteur */}
          <div className="card mb-24">
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Classe</label>
                <select className="form-select" style={{ width: '180px' }} value={selectedClasse} onChange={e => { setSelectedClasse(Number(e.target.value)); setAppelData({}); }}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom} ({etablissements.find(et => et.id === c.etablissementId)?.nom?.split(' ').slice(-1)})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Date</label>
                <input type="date" className="form-input" style={{ width: '170px' }} value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#27ae60' }}>{appelCounts.presents}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Presents</div>
                </div>
                <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#e74c3c' }}>{appelCounts.absents}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Absents</div>
                </div>
                <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#f39c12' }}>{appelCounts.retards}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Retards</div>
                </div>
                <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#3498db' }}>{appelCounts.total}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feuille d'appel */}
          <div className="card" id="appel-sheet">
            <div className="card-header">
              <div className="card-title">Feuille d'appel -- {classe?.nom || ''} ({classe?.professeurPrincipal})</div>
            </div>
            <div className="card-body" style={{ padding: 0, maxHeight: '600px', overflowY: 'auto' }}>
              {classeEleves.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  Aucun eleve actif dans cette classe.
                </div>
              ) : (
                classeEleves.map((eleve, idx) => {
                  const statut = appelData[eleve.id] || 'present';
                  return (
                    <div
                      key={eleve.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 20px',
                        borderBottom: '1px solid #f0f4f8',
                        background: statut === 'absent' ? '#fef2f2' : statut === 'retard' ? '#fffbeb' : idx % 2 === 0 ? '#fafbfc' : 'white',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ width: '28px', fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>
                        {idx + 1}
                      </div>
                      <div
                        className="avatar avatar-sm"
                        style={{
                          background: eleve.sexe === 'M' ? '#dbeafe' : '#fce7f3',
                          color: eleve.sexe === 'M' ? '#1e3a5f' : '#ec4899',
                          fontSize: '10px', flexShrink: 0,
                        }}
                      >
                        {eleve.prenom[0]}{eleve.nom[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{eleve.prenom} {eleve.nom}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{eleve.matricule}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className={`btn btn-sm ${statut === 'present' ? 'btn-success' : 'btn-ghost'}`}
                          onClick={() => setStatut(eleve.id, 'present')}
                          title="Present"
                          style={{ minWidth: '80px', gap: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Check size={14} /> {statut === 'present' && <span style={{ fontSize: '12px' }}>Present</span>}
                        </button>
                        <button
                          className={`btn btn-sm ${statut === 'absent' ? 'btn-danger' : 'btn-ghost'}`}
                          onClick={() => setStatut(eleve.id, 'absent')}
                          title="Absent"
                          style={{ minWidth: '80px', gap: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X size={14} /> {statut === 'absent' && <span style={{ fontSize: '12px' }}>Absent</span>}
                        </button>
                        <button
                          className={`btn btn-sm ${statut === 'retard' ? 'btn-warning' : 'btn-ghost'}`}
                          onClick={() => setStatut(eleve.id, 'retard')}
                          title="Retard"
                          style={{ minWidth: '80px', gap: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Clock size={14} /> {statut === 'retard' && <span style={{ fontSize: '12px' }}>Retard</span>}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ONGLET 2 : HISTORIQUE & STATISTIQUES
         ════════════════════════════════════════════════════════ */}
      {onglet === 'historique' && (
        <div>
          {/* Filtres */}
          <div className="card mb-24">
            <div className="card-body" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Classe</label>
                <select className="form-select" style={{ width: '160px' }} value={filtreClasse} onChange={e => setFiltreClasse(Number(e.target.value))}>
                  <option value={0}>Toutes les classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Type</label>
                <select className="form-select" style={{ width: '140px' }} value={filtreType} onChange={e => setFiltreType(e.target.value)}>
                  <option value="">Tous</option>
                  <option value="Absent">Absences</option>
                  <option value="Retard">Retards</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Justifie</label>
                <select className="form-select" style={{ width: '140px' }} value={filtreJustifie} onChange={e => setFiltreJustifie(e.target.value)}>
                  <option value="">Tous</option>
                  <option value="oui">Justifie</option>
                  <option value="non">Non justifie</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Du</label>
                <input type="date" className="form-input" style={{ width: '160px' }} value={filtrePeriodeDebut} onChange={e => setFiltrePeriodeDebut(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Au</label>
                <input type="date" className="form-input" style={{ width: '160px' }} value={filtrePeriodeFin} onChange={e => setFiltrePeriodeFin(e.target.value)} />
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>
                {absencesFiltrees.length} enregistrement{absencesFiltrees.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Tableau des absences */}
          <div className="card mb-24">
            <div className="card-header">
              <div className="card-title">Historique des absences et retards</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <DataTable
                columns={[
                  { header: 'Date', accessor: 'date', sortable: true },
                  {
                    header: 'Eleve',
                    accessor: (row: any) => {
                      const el = eleves.find(e => e.id === row.eleveId);
                      return el ? `${el.prenom} ${el.nom}` : 'Inconnu';
                    },
                    sortable: true,
                  },
                  {
                    header: 'Classe',
                    accessor: (row: any) => {
                      const el = eleves.find(e => e.id === row.eleveId);
                      const cl = el ? classes.find(c => c.id === el.classeId) : null;
                      return cl?.nom || '-';
                    },
                    sortable: true,
                  },
                  {
                    header: 'Type',
                    accessor: 'type',
                    render: (row: any) => (
                      <span className={`badge ${row.type === 'Absent' ? 'badge-danger' : 'badge-warning'}`}>{row.type}</span>
                    ),
                  },
                  {
                    header: 'Justifie',
                    accessor: (row: any) => row.justifie ? 'Oui' : 'Non',
                    render: (row: any) => (
                      <span className={`badge ${row.justifie ? 'badge-success' : 'badge-secondary'}`}>
                        {row.justifie ? 'Justifie' : 'Non justifie'}
                      </span>
                    ),
                  },
                  { header: 'Motif', accessor: 'motif' },
                  { header: 'Horaires', accessor: (row: any) => `${row.heureDebut || ''} - ${row.heureFin || ''}` },
                ]}
                data={absencesFiltrees}
                searchPlaceholder="Rechercher un eleve, une date..."
                pageSize={10}
              />
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid-2 mb-24">
            {/* Evolution par semaine */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Evolution des absences par semaine</div>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionParSemaine}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="semaine" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Absences" stroke="#e74c3c" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Retards" stroke="#f39c12" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Repartition justifie / non justifie */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Repartition justifie / non justifie</div>
              </div>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={repartitionJustifie}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {repartitionJustifie.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top 5 eleves les plus absents */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Top 5 des eleves les plus absents</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {top5Absents.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Aucune donnee</div>
              ) : (
                top5Absents.map((item, idx) => (
                  <div key={item.eleve?.id || idx} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 20px', borderBottom: '1px solid #f0f4f8',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: idx === 0 ? '#e74c3c' : idx === 1 ? '#f39c12' : idx === 2 ? '#f1c40f' : '#e2e8f0',
                      color: idx < 3 ? 'white' : '#6b7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '13px', flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        {item.eleve?.prenom} {item.eleve?.nom}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {item.classe?.nom || '-'} -- {item.eleve?.matricule}
                      </div>
                    </div>
                    <div style={{
                      background: item.nbAbsences >= 15 ? '#fef2f2' : item.nbAbsences >= 10 ? '#fffbeb' : '#f0fdf4',
                      color: item.nbAbsences >= 15 ? '#e74c3c' : item.nbAbsences >= 10 ? '#f39c12' : '#27ae60',
                      padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '14px',
                    }}>
                      {item.nbAbsences} absence{item.nbAbsences > 1 ? 's' : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ONGLET 3 : JUSTIFICATIFS
         ════════════════════════════════════════════════════════ */}
      {onglet === 'justificatifs' && (
        <div>
          {/* En attente de validation */}
          <div className="card mb-24">
            <div className="card-header">
              <div className="card-title">Justificatifs en attente de validation</div>
              <span className="badge badge-warning" style={{ fontSize: '13px' }}>
                {justificatifsList.filter(j => !j.valide).length} en attente
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {justificatifsList.filter(j => !j.valide).length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  Aucun justificatif en attente de validation.
                </div>
              ) : (
                justificatifsList.filter(j => !j.valide).map(j => {
                  const eleve = eleves.find(e => e.id === j.eleveId);
                  const cl = eleve ? classes.find(c => c.id === eleve.classeId) : null;
                  return (
                    <div key={j.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 20px', borderBottom: '1px solid #f0f4f8',
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: '#fff7ed', color: '#f39c12',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <FileText size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>
                          {eleve ? `${eleve.prenom} ${eleve.nom}` : 'Inconnu'} -- {cl?.nom || ''}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Type : {j.type} {j.fichier ? `-- Fichier : ${j.fichier}` : '-- Pas de fichier joint'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          Depose le {j.dateDepot || 'Non precise'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleValiderJustif(j.id)}
                          style={{ gap: '4px', display: 'flex', alignItems: 'center' }}
                        >
                          <CheckCircle size={14} /> Valider
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRejeterJustif(j.id)}
                          style={{ gap: '4px', display: 'flex', alignItems: 'center' }}
                        >
                          <XCircle size={14} /> Rejeter
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Justificatifs valides */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Justificatifs valides</div>
              <span className="badge badge-success" style={{ fontSize: '13px' }}>
                {justificatifsList.filter(j => j.valide).length} valide(s)
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {justificatifsList.filter(j => j.valide).length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  Aucun justificatif valide.
                </div>
              ) : (
                justificatifsList.filter(j => j.valide).map(j => {
                  const eleve = eleves.find(e => e.id === j.eleveId);
                  return (
                    <div key={j.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 20px', borderBottom: '1px solid #f0f4f8',
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: '#f0fdf4', color: '#27ae60',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <CheckCircle size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>
                          {eleve ? `${eleve.prenom} ${eleve.nom}` : 'Inconnu'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {j.type} {j.fichier ? `-- ${j.fichier}` : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#27ae60', fontWeight: 500 }}>
                        Valide par {j.validePar}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ONGLET 4 : ALERTES ABSENTEISME
         ════════════════════════════════════════════════════════ */}
      {onglet === 'alertes' && (
        <div>
          {/* Configuration du seuil */}
          <div className="card mb-24">
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Shield size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Seuil d'alerte absenteisme :</span>
              <input
                type="number"
                className="form-input"
                style={{ width: '80px' }}
                value={seuilAlerte}
                onChange={e => setSeuilAlerte(Number(e.target.value))}
                min={1}
              />
              <span style={{ fontSize: '13px', color: '#6b7280' }}>absences par periode</span>
              <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#6b7280' }}>
                {alertesList.length} eleve{alertesList.length > 1 ? 's' : ''} en alerte
              </div>
            </div>
          </div>

          {/* Liste des alertes */}
          {alertesList.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                <Shield size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Aucune alerte d'absenteisme</div>
                <div style={{ fontSize: '13px' }}>Tous les eleves sont en dessous du seuil de {seuilAlerte} absences.</div>
              </div>
            </div>
          ) : (
            alertesList.map(alerte => {
              const eleve = eleves.find(e => e.id === alerte.eleveId);
              const cl = eleve ? classes.find(c => c.id === eleve.classeId) : null;
              const isCritique = alerte.statut === 'Critique';
              return (
                <div key={alerte.id} className="card mb-24" style={{
                  borderLeft: `4px solid ${isCritique ? '#e74c3c' : '#f39c12'}`,
                }}>
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: isCritique ? '#fef2f2' : '#fffbeb',
                        color: isCritique ? '#e74c3c' : '#f39c12',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <AlertTriangle size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700 }}>
                            {eleve ? `${eleve.prenom} ${eleve.nom}` : 'Inconnu'}
                          </span>
                          <span className={`badge ${isCritique ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '12px' }}>
                            {alerte.statut}
                          </span>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {cl?.nom || ''} -- {eleve?.matricule || ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                          <span><strong style={{ color: '#e74c3c' }}>{alerte.totalAbsences}</strong> absences</span>
                          <span><strong style={{ color: '#f39c12' }}>{alerte.totalRetards}</strong> retards</span>
                          <span>Periode : {alerte.periode}</span>
                          <span>Seuil : {alerte.seuil}</span>
                          <span>Alerte le {alerte.dateAlerte}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {alerte.notifieParents ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#27ae60' }}>
                              <CheckCircle size={14} /> Parents notifies
                            </span>
                          ) : (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleNotifierParents(alerte.id)}
                              style={{ gap: '4px', display: 'flex', alignItems: 'center' }}
                            >
                              <Bell size={14} /> Notifier les parents
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleConvoquerFamille(alerte.id)}
                            style={{ gap: '4px', display: 'flex', alignItems: 'center' }}
                          >
                            <Mail size={14} /> Convoquer la famille
                          </button>
                          {alerte.notifieDirection && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#3498db' }}>
                              <CheckCircle size={14} /> Direction notifiee
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'center', padding: '12px 20px',
                        background: isCritique ? '#fef2f2' : '#fffbeb',
                        borderRadius: '12px',
                      }}>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: isCritique ? '#e74c3c' : '#f39c12' }}>
                          {alerte.totalAbsences}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>absences</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL : Depot de justificatif
         ════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isJustifModalOpen}
        onClose={() => setIsJustifModalOpen(false)}
        title="Deposer un justificatif"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsJustifModalOpen(false)}>Annuler</button>
            <button type="submit" form="justif-form" className="btn btn-primary"><Upload size={16} /> Deposer</button>
          </div>
        }
      >
        <form id="justif-form" onSubmit={handleDepotJustif}>
          <div className="form-group">
            <label className="form-label">Eleve *</label>
            <select
              className="form-select"
              value={newJustif.eleveId}
              onChange={e => setNewJustif({ ...newJustif, eleveId: Number(e.target.value) })}
              required
            >
              <option value={0}>Selectionner un eleve...</option>
              {eleves.filter(e => e.statut === 'Actif').map(e => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom} -- {classes.find(c => c.id === e.classeId)?.nom}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Absence concernee</label>
            <select
              className="form-select"
              value={newJustif.absenceId}
              onChange={e => setNewJustif({ ...newJustif, absenceId: Number(e.target.value) })}
            >
              <option value={0}>Selectionner une absence (optionnel)</option>
              {absencesList
                .filter(a => newJustif.eleveId ? a.eleveId === newJustif.eleveId : true)
                .slice(0, 20)
                .map(a => {
                  const el = eleves.find(e => e.id === a.eleveId);
                  return (
                    <option key={a.id} value={a.id}>
                      {a.date} -- {a.type} -- {el ? `${el.prenom} ${el.nom}` : ''}
                    </option>
                  );
                })}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Type de justificatif *</label>
            <select
              className="form-select"
              value={newJustif.type}
              onChange={e => setNewJustif({ ...newJustif, type: e.target.value })}
            >
              <option value="Certificat medical">Certificat medical</option>
              <option value="Mot des parents">Mot des parents</option>
              <option value="Convocation officielle">Convocation officielle</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nom du fichier joint (optionnel)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: certificat_medical.pdf"
              value={newJustif.fichier}
              onChange={e => setNewJustif({ ...newJustif, fichier: e.target.value })}
            />
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              Dans un environnement de production, un champ upload de fichier serait utilise ici.
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
