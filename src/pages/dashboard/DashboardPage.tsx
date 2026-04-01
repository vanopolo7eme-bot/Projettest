import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/ui/StatCard';
import { etablissements, eleves, factures, absences, admissions, notifications as notifData, grillesFrais, notes, matieres, familles, classes, cahierTexte } from '../../data/mockData';
import { Users, GraduationCap, DollarSign, AlertTriangle, UserPlus, TrendingUp, CalendarDays, Clock, CheckCircle, XCircle, Building2, Target, BarChart3, BookOpen, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#1e3a5f', '#3498db', '#27ae60', '#f4a623', '#e74c3c', '#7c3aed'];

// ─── Parent Dashboard (RGPD: only own family data) ────────────
function ParentDashboard() {
  const { user } = useAuth();

  const myFamily = familles.find(f =>
    f.pere?.toLowerCase().includes(user?.prenom?.toLowerCase() || '') ||
    f.mere?.toLowerCase().includes(user?.prenom?.toLowerCase() || '') ||
    f.email === user?.email
  );
  const myChildrenIds = myFamily?.enfants || [];
  const myChildren = eleves.filter(e => myChildrenIds.includes(e.id));

  // KPIs
  const nbEnfants = myChildren.length;
  const myFactures = factures.filter(f => myFamily && f.familleId === myFamily.id);
  const soldeFamille = myFactures.reduce((s, f) => s + (f.montant - f.paye), 0);
  const myAbsences = absences.filter(a => myChildrenIds.includes(a.eleveId));
  const absencesCeMois = myAbsences.filter(a => a.date.startsWith('2026-03'));
  const prochainsDevoirsCount = cahierTexte.filter(ct => ct.dateRemise >= '2026-03-17').length;

  // Notes recentes
  const myNotes = notes
    .filter(n => myChildrenIds.includes(n.eleveId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  // Prochains devoirs
  const prochainDevoirs = cahierTexte
    .filter(ct => ct.dateRemise >= '2026-03-17')
    .sort((a, b) => a.dateRemise.localeCompare(b.dateRemise))
    .slice(0, 5);

  // Dernieres absences
  const dernieresAbsences = myAbsences
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  // Helper: child average T1
  const getChildAverage = (childId: number): string => {
    const childNotes = notes.filter(n => n.eleveId === childId && n.trimestre === 1);
    if (childNotes.length === 0) return '--';
    let total = 0;
    let coefTotal = 0;
    matieres.forEach(m => {
      const matNotes = childNotes.filter(n => n.matiereId === m.id);
      if (matNotes.length > 0) {
        const moy = matNotes.reduce((s, n) => s + n.note, 0) / matNotes.length;
        total += moy * m.coefficient;
        coefTotal += m.coefficient;
      }
    });
    return coefTotal > 0 ? (total / coefTotal).toFixed(2) : '--';
  };

  // Helper: last absence
  const getLastAbsence = (childId: number): string => {
    const childAbs = absences
      .filter(a => a.eleveId === childId)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (childAbs.length === 0) return 'Aucune';
    return `${childAbs[0].date} (${childAbs[0].type})`;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Accueil</span>
            <span className="breadcrumb-sep">/</span>
            <span>Tableau de bord</span>
          </div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">
            Bienvenue, {user?.prenom} — Suivi de vos enfants
          </p>
        </div>
        <div className="page-actions">
          <span className="badge badge-info" style={{ padding: '6px 14px', fontSize: '12px' }}>
            <CalendarDays size={14} /> Annee 2025-2026
          </span>
        </div>
      </div>

      {/* KPIs Parent */}
      <div className="grid-4 mb-24">
        <StatCard label="Mes enfants" value={nbEnfants} icon={<Users size={22} />} color="#1e3a5f" />
        <StatCard label="Solde famille" value={`${(soldeFamille / 1000).toFixed(0)}k FCFA`} icon={<DollarSign size={22} />} color={soldeFamille > 0 ? '#e74c3c' : '#27ae60'} trend={soldeFamille > 0 ? 'down' : 'up'} trendValue={soldeFamille > 0 ? 'A regler' : 'A jour'} />
        <StatCard label="Prochains devoirs" value={prochainsDevoirsCount} icon={<BookOpen size={22} />} color="#f4a623" />
        <StatCard label="Absences ce mois" value={absencesCeMois.length} icon={<AlertTriangle size={22} />} color="#e74c3c" />
      </div>

      {/* Cartes enfants */}
      <div className="grid-3 mb-24">
        {myChildren.map(child => {
          const childClasse = classes.find(c => c.id === child.classeId);
          const avg = getChildAverage(child.id);
          const lastAbs = getLastAbsence(child.id);
          return (
            <div className="card" key={child.id}>
              <div className="card-body" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: '#e8f0fe', color: '#1e3a5f', fontWeight: 700, fontSize: 16, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {child.prenom[0]}{child.nom[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1e3a5f' }}>{child.prenom} {child.nom}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{childClasse?.nom || child.classe} | {child.matricule}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Moyenne T1</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: avg !== '--' && parseFloat(avg) >= 10 ? '#27ae60' : '#e74c3c' }}>{avg}</div>
                  </div>
                  <div style={{ background: '#fef2f2', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Derniere absence</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e74c3c' }}>{lastAbs}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes recentes + Prochains devoirs */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Notes recentes</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {myNotes.length === 0 ? (
              <p style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>Aucune note disponible.</p>
            ) : (
              myNotes.map(n => {
                const child = eleves.find(e => e.id === n.eleveId);
                const matiere = matieres.find(m => m.id === n.matiereId);
                return (
                  <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f0f4f8' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: matiere?.couleur || '#94a3b8', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{child?.prenom} {child?.nom} - {matiere?.nom}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{n.type} | {n.date}</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: n.note >= 10 ? '#27ae60' : '#e74c3c' }}>
                      {n.note.toFixed(1)}/{n.sur}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Prochains devoirs</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {prochainDevoirs.length === 0 ? (
              <p style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>Aucun devoir a venir.</p>
            ) : (
              prochainDevoirs.map(ct => (
                <div key={ct.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f0f4f8' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#3498db" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{ct.matiere}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{ct.devoirs}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>A rendre le</div>
                    <div style={{ fontSize: 12, color: '#e74c3c', fontWeight: 700 }}>{ct.dateRemise}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dernieres absences */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Dernieres absences de mes enfants</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {dernieresAbsences.length === 0 ? (
            <p style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>Aucune absence enregistree.</p>
          ) : (
            dernieresAbsences.map(a => {
              const child = eleves.find(e => e.id === a.eleveId);
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f0f4f8' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.justifie ? '#f39c12' : '#e74c3c', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{child?.prenom} {child?.nom}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{a.motif || 'Non precise'}</div>
                  </div>
                  <span className={`badge ${a.type === 'Retard' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 11 }}>
                    {a.type}
                  </span>
                  <span className={`badge ${a.justifie ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: 11 }}>
                    {a.justifie ? 'Justifie' : 'Non justifie'}
                  </span>
                  <div style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{a.date}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DG / Admin Dashboard (original + Actions 5,6,7) ─────────
function AdminDashboard() {
  const { user } = useAuth();

  const totalEleves = eleves.filter(e => e.statut === 'Actif').length;
  const totalFacture = factures.reduce((s, f) => s + f.montant, 0);
  const totalPaye = factures.reduce((s, f) => s + f.paye, 0);
  const totalImpayes = totalFacture - totalPaye;
  const tauxRecouvrement = Math.round((totalPaye / totalFacture) * 100);
  const nbAbsences = absences.filter(a => a.date === '2026-03-17').length;
  const nbAdmissions = admissions.filter(a => !['Accepté', 'Refusé'].includes(a.statut)).length;

  // --- Action 5: CA prévisionnel (DG) ---
  const elevesActifs = eleves.filter(e => e.statut === 'Actif');
  const nbElevesPrimaire = elevesActifs.filter(e => {
    const etab = etablissements.find(et => et.id === e.etablissementId);
    return etab?.type === 'Primaire';
  }).length;
  const nbElevesLycee = elevesActifs.filter(e => {
    const etab = etablissements.find(et => et.id === e.etablissementId);
    return etab?.type === 'Lycée';
  }).length;
  const scolarite = grillesFrais[1]; // type: 'Scolarité'
  const caPrevisionnel = scolarite.primaire * nbElevesPrimaire + scolarite.lycee * nbElevesLycee;
  const caEncaisse = totalPaye;
  const ecartCA = caPrevisionnel - caEncaisse;

  // --- Action 6: Taux de réussite (DG) ---
  const elevesAvecNotes = [...new Set(notes.map(n => n.eleveId))];
  const elevesReussis = elevesAvecNotes.filter(eleveId => {
    const notesEleve = notes.filter(n => n.eleveId === eleveId);
    const totalCoeff = notesEleve.reduce((sum, n) => {
      const mat = matieres.find(m => m.id === n.matiereId);
      return sum + (mat?.coefficient || 1);
    }, 0);
    const totalPondere = notesEleve.reduce((sum, n) => {
      const mat = matieres.find(m => m.id === n.matiereId);
      return sum + n.note * (mat?.coefficient || 1);
    }, 0);
    const moyenne = totalCoeff > 0 ? totalPondere / totalCoeff : 0;
    return moyenne >= 10;
  }).length;
  const tauxReussite = elevesAvecNotes.length > 0 ? Math.round((elevesReussis / elevesAvecNotes.length) * 100) : 0;

  // --- Action 7: Taux conversion admissions ---
  const totalAdmissions = admissions.length;
  const admissionsAcceptees = admissions.filter(a => a.statut === 'Accepté').length;
  const tauxConversion = totalAdmissions > 0 ? Math.round((admissionsAcceptees / totalAdmissions) * 100) : 0;

  const effectifParEtab = etablissements.map(e => ({ name: e.nom.replace('École Primaire ', '').replace('Lycée d\'Excellence ', ''), effectif: e.effectif, capacite: e.capacite }));

  const financeData = [
    { mois: 'Oct', encaisse: 12500000, facture: 15000000 },
    { mois: 'Nov', encaisse: 14200000, facture: 15000000 },
    { mois: 'Déc', encaisse: 13800000, facture: 15000000 },
    { mois: 'Jan', encaisse: 11000000, facture: 15000000 },
    { mois: 'Fév', encaisse: 13500000, facture: 15000000 },
    { mois: 'Mar', encaisse: 9800000, facture: 15000000 },
  ];

  const repartitionStatut = [
    { name: 'Payé', value: factures.filter(f => f.statut === 'Payé').length },
    { name: 'Partiel', value: factures.filter(f => f.statut === 'Partiel').length },
    { name: 'Impayé', value: factures.filter(f => f.statut === 'Impayé').length },
  ];
  const pieColors = ['#27ae60', '#f39c12', '#e74c3c'];

  const absencesTrend = Array.from({ length: 10 }, (_, i) => ({
    jour: `${7 + i} Mar`,
    absences: 3 + Math.floor(Math.random() * 6),
    retards: 1 + Math.floor(Math.random() * 3),
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Accueil</span>
            <span className="breadcrumb-sep">/</span>
            <span>Tableau de bord</span>
          </div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">
            Bienvenue, {user?.prenom} — Vue d'ensemble du Groupe LE GUIDE DE NOS ENFANTS
          </p>
        </div>
        <div className="page-actions">
          <span className="badge badge-info" style={{ padding: '6px 14px', fontSize: '12px' }}>
            <CalendarDays size={14} /> Année 2025-2026
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 mb-24">
        <StatCard label="Élèves actifs" value={totalEleves} icon={<GraduationCap size={22} />} color="#1e3a5f" trend="up" trendValue="+5.2% vs N-1" />
        <StatCard label="Taux de recouvrement" value={`${tauxRecouvrement}%`} icon={<DollarSign size={22} />} color="#27ae60" trend={tauxRecouvrement >= 85 ? 'up' : 'down'} trendValue={tauxRecouvrement >= 85 ? 'Objectif atteint' : 'Sous objectif'} />
        <StatCard label="Absences aujourd'hui" value={nbAbsences} icon={<AlertTriangle size={22} />} color="#e74c3c" trend="down" trendValue="-2 vs hier" />
        <StatCard label="Dossiers admissions" value={nbAdmissions} icon={<UserPlus size={22} />} color="#f4a623" trend="up" trendValue="+3 cette semaine" />
      </div>

      {/* KPIs DG uniquement (Actions 5, 6, 7) */}
      <div className="grid-4 mb-24">
        {/* Action 5: CA prévisionnel */}
        <StatCard
          label="CA prévisionnel"
          value={`${(caPrevisionnel / 1000000).toFixed(1)}M`}
          icon={<BarChart3 size={22} />}
          color="#1e3a5f"
          trend={ecartCA > 0 ? 'down' : 'up'}
          trendValue={ecartCA > 0 ? `Écart: -${(ecartCA / 1000000).toFixed(1)}M FCFA` : 'CA atteint'}
        />
        {/* Action 6: Taux de réussite */}
        <StatCard
          label="Taux de réussite"
          value={`${tauxReussite}%`}
          icon={<Target size={22} />}
          color={tauxReussite < 70 ? '#e74c3c' : '#27ae60'}
          trend={tauxReussite >= 70 ? 'up' : 'down'}
          trendValue={tauxReussite < 70 ? 'ALERTE : < 70%' : 'Objectif atteint'}
        />
        {/* Action 7: Taux de conversion admissions */}
        <StatCard
          label="Taux conversion admissions"
          value={`${tauxConversion}%`}
          icon={<UserPlus size={22} />}
          color={tauxConversion < 60 ? '#e74c3c' : '#27ae60'}
          trend={tauxConversion >= 60 ? 'up' : 'down'}
          trendValue={tauxConversion < 60 ? 'Sous objectif' : 'Objectif atteint'}
        />
        {/* Impayés en valeur */}
        <StatCard
          label="Impayés totaux"
          value={`${(totalImpayes / 1000000).toFixed(1)}M`}
          icon={<DollarSign size={22} />}
          color="#e74c3c"
          trend="down"
          trendValue={`${factures.filter(f => f.statut === 'Impayé').length} factures impayées`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Effectifs par établissement</div>
              <div className="card-subtitle">Capacité vs effectif réel</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={effectifParEtab} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="effectif" name="Effectif" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacite" name="Capacité" fill="#e0e6ed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Suivi financier mensuel</div>
              <div className="card-subtitle">Encaissements vs facturation (FCFA)</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={financeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(v: any) => `${(Number(v) / 1000000).toFixed(1)}M FCFA`} />
                <Legend />
                <Line type="monotone" dataKey="facture" name="Facturé" stroke="#e0e6ed" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="encaisse" name="Encaissé" stroke="#27ae60" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Répartition des paiements</div>
              <div className="card-subtitle">Statut des factures émises</div>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={repartitionStatut} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {repartitionStatut.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Tendance absentéisme</div>
              <div className="card-subtitle">Derniers 10 jours</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={absencesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="jour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="absences" name="Absences" fill="#e74c3c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retards" name="Retards" fill="#f39c12" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Alerts + Recent Activity */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Alertes</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {notifData.filter(n => ['warning', 'danger'].includes(n.type)).map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid #f0f4f8' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.type === 'danger' ? '#e74c3c' : '#f39c12', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{n.titre}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{n.message}</div>
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{n.date.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Etablissements</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {etablissements.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid #f0f4f8' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} color="#1e3a5f" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{e.nom}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{e.directeur}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>{e.effectif}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>/ {e.capacite}</div>
                </div>
                <div className="progress" style={{ width: '60px' }}>
                  <div className={`progress-bar ${e.effectif / e.capacite > 0.9 ? 'progress-warning' : 'progress-primary'}`} style={{ width: `${(e.effectif / e.capacite) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export: route to correct dashboard ──────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const isParent = user?.role === 'Parent';

  if (isParent) {
    return <ParentDashboard />;
  }

  return <AdminDashboard />;
}
