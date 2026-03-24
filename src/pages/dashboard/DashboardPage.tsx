import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/ui/StatCard';
import { etablissements, eleves, factures, absences, admissions, notifications as notifData } from '../../data/mockData';
import { Users, GraduationCap, DollarSign, AlertTriangle, UserPlus, TrendingUp, CalendarDays, Clock, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#1e3a5f', '#3498db', '#27ae60', '#f4a623', '#e74c3c', '#7c3aed'];

export default function DashboardPage() {
  const { user } = useAuth();

  const totalEleves = eleves.filter(e => e.statut === 'Actif').length;
  const totalFacture = factures.reduce((s, f) => s + f.montant, 0);
  const totalPaye = factures.reduce((s, f) => s + f.paye, 0);
  const totalImpayes = totalFacture - totalPaye;
  const tauxRecouvrement = Math.round((totalPaye / totalFacture) * 100);
  const nbAbsences = absences.filter(a => a.date === '2026-03-17').length;
  const nbAdmissions = admissions.filter(a => !['Accepté', 'Refusé'].includes(a.statut)).length;

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
                <Tooltip formatter={v => `${(v / 1000000).toFixed(1)}M FCFA`} />
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
            <div className="card-title">🚨 Alertes</div>
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
            <div className="card-title">📋 Établissements</div>
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
