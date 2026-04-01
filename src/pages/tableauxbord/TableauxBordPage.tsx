import React, { useState, useMemo } from 'react';
import { etablissements, eleves, factures, absences } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import { BarChart3, Users, DollarSign, AlertTriangle, TrendingUp, Award, Building2, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, LineChart, Line } from 'recharts';

export default function TableauxBordPage() {
  const [periodeVue, setPeriodeVue] = useState<1 | 2 | 3>(1);
  const kpis = etablissements.map(e => ({
    nom: e.nom.replace('École Primaire ', '').replace("Lycée d'Excellence ", ''),
    effectif: e.effectif,
    capacite: e.capacite,
    taux: Math.round((e.effectif / e.capacite) * 100),
    moyGen: (10 + Math.random() * 5).toFixed(1),
    tauxAbsence: (3 + Math.random() * 7).toFixed(1),
    tauxRecouvrement: Math.round(75 + Math.random() * 20),
  }));

  const radarData = kpis.map(k => ({
    nom: k.nom,
    Effectif: k.taux,
    Académique: parseFloat(k.moyGen) * 5,
    Finance: k.tauxRecouvrement,
    Présence: 100 - parseFloat(k.tauxAbsence),
  }));

  const totalEleves = eleves.filter(e => e.statut === 'Actif').length;
  const totalFacture = factures.reduce((s, f) => s + f.montant, 0);
  const totalPaye = factures.reduce((s, f) => s + f.paye, 0);

  // Multi-year mock data for trend charts
  const evolutionData = useMemo(() => {
    const currentYear = 2026;
    const years: { annee: string; effectif: number; CA: number; recouvrement: number; moyGenerale: number }[] = [];
    for (let i = periodeVue - 1; i >= 0; i--) {
      const y = currentYear - i;
      const factor = 1 - i * 0.08;
      years.push({
        annee: `${y - 1}-${y}`,
        effectif: Math.round(totalEleves * factor),
        CA: Math.round((totalFacture / 1000000) * factor),
        recouvrement: Math.round(((totalPaye / totalFacture) * 100) * (1 - i * 0.03)),
        moyGenerale: parseFloat((13.2 - i * 0.4).toFixed(1)),
      });
    }
    return years;
  }, [periodeVue, totalEleves, totalFacture, totalPaye]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Pilotage</span><span className="breadcrumb-sep">/</span><span>Tableaux de bord</span></div>
          <h1 className="page-title">Tableaux de Bord Strategiques</h1>
          <p className="page-subtitle">Vue consolidee -- Direction Generale</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            {([1, 2, 3] as const).map(n => (
              <button
                key={n}
                className={`btn btn-sm ${periodeVue === n ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPeriodeVue(n)}
                style={{ minWidth: '60px' }}
              >
                <Calendar size={14} style={{ marginRight: '4px' }} />{n} an{n > 1 ? 's' : ''}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary">Exporter PDF</button>
          <button className="btn btn-secondary">Exporter Excel</button>
        </div>
      </div>

      <div className="grid-4 mb-24">
        <StatCard label="Effectif total" value={totalEleves} icon={<Users size={22} />} color="#1e3a5f" trend="up" trendValue="+5.2%" />
        <StatCard label="CA année" value={`${(totalFacture / 1000000).toFixed(0)}M FCFA`} icon={<DollarSign size={22} />} color="#27ae60" />
        <StatCard label="Taux recouvrement" value={`${Math.round((totalPaye / totalFacture) * 100)}%`} icon={<TrendingUp size={22} />} color="#3498db" />
        <StatCard label="Moy. générale groupe" value="13.2/20" icon={<Award size={22} />} color="#f4a623" trend="up" trendValue="+0.5 pts" />
      </div>

      {/* Comparaison inter-établissements */}
      <div className="card mb-24">
        <div className="card-header"><div className="card-title">📊 Comparaison inter-établissements</div></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Établissement</th>
                  <th style={{ textAlign: 'center' }}>Effectif</th>
                  <th style={{ textAlign: 'center' }}>Taux occupation</th>
                  <th style={{ textAlign: 'center' }}>Moy. générale</th>
                  <th style={{ textAlign: 'center' }}>Absentéisme</th>
                  <th style={{ textAlign: 'center' }}>Recouvrement</th>
                  <th style={{ textAlign: 'center' }}>Score global</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((k, i) => {
                  const score = Math.round((k.tauxRecouvrement * 0.3 + parseFloat(k.moyGen) * 5 * 0.3 + (100 - parseFloat(k.tauxAbsence)) * 0.2 + k.taux * 0.2));
                  return (
                    <tr key={i}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={16} color="#1e3a5f" /><strong>{k.nom}</strong></div></td>
                      <td style={{ textAlign: 'center' }}>{k.effectif} / {k.capacite}</td>
                      <td style={{ textAlign: 'center' }}><span className={`badge ${k.taux > 90 ? 'badge-warning' : 'badge-success'}`}>{k.taux}%</span></td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: parseFloat(k.moyGen) >= 12 ? '#27ae60' : '#f39c12' }}>{k.moyGen}/20</td>
                      <td style={{ textAlign: 'center' }}><span className={`badge ${parseFloat(k.tauxAbsence) > 8 ? 'badge-danger' : 'badge-success'}`}>{k.tauxAbsence}%</span></td>
                      <td style={{ textAlign: 'center' }}><span className={`badge ${k.tauxRecouvrement >= 85 ? 'badge-success' : 'badge-warning'}`}>{k.tauxRecouvrement}%</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <div className="progress" style={{ width: '60px' }}><div className="progress-bar progress-primary" style={{ width: `${score}%` }} /></div>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>{score}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header"><div className="card-title">Effectifs par établissement</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={kpis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="nom" tick={{ fontSize: 10 }} />
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
          <div className="card-header"><div className="card-title">Radar de performance</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e0e6ed" />
                <PolarAngleAxis dataKey="nom" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Performance" dataKey="Finance" stroke="#1e3a5f" fill="#1e3a5f" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Evolution pluriannuelle */}
      {periodeVue > 1 && (
        <div className="grid-2 mb-24">
          <div className="card">
            <div className="card-header"><div className="card-title">Evolution des effectifs et du CA ({periodeVue} ans)</div></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                  <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="effectif" name="Effectif" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="CA" name="CA (M FCFA)" fill="#27ae60" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Tendance recouvrement et moyenne ({periodeVue} ans)</div></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                  <XAxis dataKey="annee" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="recouvrement" name="Recouvrement (%)" stroke="#3498db" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="moyGenerale" name="Moy. generale (/20)" stroke="#f4a623" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Alertes KPI */}
      <div className="card">
        <div className="card-header"><div className="card-title">🚨 Alertes KPI</div></div>
        <div className="card-body" style={{ padding: 0 }}>
          {[
            { alert: 'Taux de recouvrement sous objectif', etab: 'École Les Frangipaniers', valeur: '78%', seuil: '< 85%', type: 'warning' },
            { alert: 'Absentéisme élevé', etab: 'Lycée Le Guide', valeur: '9.2%', seuil: '> 8%', type: 'danger' },
            { alert: 'Capacité proche du maximum', etab: 'École Les Palmiers', valeur: '95%', seuil: '> 90%', type: 'warning' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid #f0f4f8' }}>
              <span style={{ fontSize: '16px' }}>{a.type === 'danger' ? '🔴' : '🟡'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{a.alert}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{a.etab} — Valeur : {a.valeur} (seuil : {a.seuil})</div>
              </div>
              <span className={`badge ${a.type === 'danger' ? 'badge-danger' : 'badge-warning'}`}>{a.type === 'danger' ? 'Critique' : 'Attention'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
