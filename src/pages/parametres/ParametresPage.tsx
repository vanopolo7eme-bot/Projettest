import React, { useState } from 'react';
import { useTheme, accentPresets } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { configSysteme, grillesFrais, remisesFratrie, etablissements } from '../../data/mockData';
import {
  Sun, Moon, Globe, Database, HelpCircle, Download, Shield, Bell, Palette, Check,
  Calendar, ClipboardList, GraduationCap, Settings, Lock, AlertTriangle, BookOpen
} from 'lucide-react';

export default function ParametresPage() {
  const { theme, toggleTheme, isDark, accentColor, setAccentColor } = useTheme();
  const { user, hasRole } = useAuth();
  const { showToast } = useToast();

  // --- Rôles ---
  const isAdmin = hasRole(['Direction Générale', 'Administration Scolaire']);
  const isDirecteur = hasRole('Directeur d\'Établissement');
  const canViewSystemSettings = isAdmin || isDirecteur;
  const canEditSystemSettings = isAdmin;

  // --- State pour les sections systeme ---
  const [anneeScolaireActiveId, setAnneeScolaireActiveId] = useState(configSysteme.anneeScolaireActive.id);
  const [systemePeriodes, setSystemePeriodes] = useState(configSysteme.periodesNotation);
  const [modeNotation, setModeNotation] = useState<'trimestres' | 'semestres'>('trimestres');
  const [reglesPassage, setReglesPassage] = useState(configSysteme.reglesPassage);
  const [formatMatricule, setFormatMatricule] = useState(configSysteme.formatMatricule);
  const [deviseParDefaut, setDeviseParDefaut] = useState(configSysteme.deviseParDefaut);
  const [fuseauHoraire, setFuseauHoraire] = useState(configSysteme.fuseauHoraire);
  const [seuilAbsenteisme, setSeuilAbsenteisme] = useState(15);

  // --- Seuils d'alerte KPI ---
  const [seuilRecouvrement, setSeuilRecouvrement] = useState(85);
  const [seuilAbsenteismeKPI, setSeuilAbsenteismeKPI] = useState(10);
  const [seuilReussite, setSeuilReussite] = useState(70);
  const [seuilConversion, setSeuilConversion] = useState(60);

  const handleExport = () => {
    showToast('Export des données lancé. Vous recevrez un email avec le fichier.', 'info');
  };

  const handleSave = () => {
    showToast('Paramètres sauvegardés avec succès !', 'success');
  };

  const handleCloturerAnnee = () => {
    showToast('Clôture de l\'année scolaire en cours... (simulation)', 'info');
  };

  const handleCloturerPeriode = (periodeId: number) => {
    setSystemePeriodes(prev =>
      prev.map(p =>
        p.id === periodeId ? { ...p, active: false, cloture: true } : p
      )
    );
    showToast('Période clôturée avec succès !', 'success');
  };

  const handleRegleChange = (niveau: string, field: string, value: any) => {
    setReglesPassage(prev =>
      prev.map(r =>
        r.niveau === niveau ? { ...r, [field]: value } : r
      )
    );
  };

  const anneeScolaireActive = configSysteme.anneesDisponibles.find(a => a.id === anneeScolaireActiveId);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Compte</span><span className="breadcrumb-sep">/</span><span>Paramètres</span></div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Personnalisez votre expérience sur la plateforme</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave}>Sauvegarder</button>
        </div>
      </div>

      {/* ═══ Couleur du thème — pleine largeur ═══ */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title"><Palette size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Couleur du thème</div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '18px' }}>
            Choisissez la couleur principale de votre interface. Ce réglage change la sidebar, les boutons et les accents dans toute l'application.
          </p>
          <div className="color-presets-grid">
            {accentPresets.map(preset => (
              <button
                key={preset.id}
                className={`color-preset-card ${accentColor.id === preset.id ? 'active' : ''}`}
                onClick={() => {
                  setAccentColor(preset);
                  showToast(`Thème "${preset.label}" appliqué !`, 'success');
                }}
              >
                <div className="color-preset-preview">
                  <div className="color-preset-sidebar" style={{ background: `linear-gradient(180deg, ${preset.primaryDark}, ${preset.primary})` }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '6px', background: preset.gold, margin: '6px auto' }} />
                    <div style={{ width: '24px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)', margin: '4px auto' }} />
                    <div style={{ width: '20px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)', margin: '3px auto' }} />
                    <div style={{ width: '22px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)', margin: '3px auto' }} />
                  </div>
                  <div className="color-preset-content" style={{ background: isDark ? '#1e293b' : '#f0f2f5' }}>
                    <div style={{ height: '6px', borderRadius: '3px', background: isDark ? '#334155' : '#e2e8f0', width: '70%', marginBottom: '4px' }} />
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <div style={{ flex: 1, height: '14px', borderRadius: '3px', background: preset.primaryLight + '20', border: `1px solid ${preset.primaryLight}30` }} />
                      <div style={{ flex: 1, height: '14px', borderRadius: '3px', background: preset.primaryLight + '20', border: `1px solid ${preset.primaryLight}30` }} />
                    </div>
                  </div>
                </div>
                <div className="color-preset-info">
                  <div className="color-preset-swatches">
                    <div className="color-swatch" style={{ background: preset.primary }} />
                    <div className="color-swatch" style={{ background: preset.primaryLight }} />
                    <div className="color-swatch" style={{ background: preset.gold }} />
                  </div>
                  <span className="color-preset-label">{preset.label}</span>
                  {accentColor.id === preset.id && (
                    <div className="color-preset-check">
                      <Check size={12} />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Apparence */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Sun size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Apparence</div>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Thème d'affichage</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  className={`btn ${!isDark ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => isDark && toggleTheme()}
                  style={{ flex: 1, justifyContent: 'center', padding: '16px' }}
                >
                  <Sun size={20} /> Clair
                </button>
                <button
                  className={`btn ${isDark ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => !isDark && toggleTheme()}
                  style={{ flex: 1, justifyContent: 'center', padding: '16px' }}
                >
                  <Moon size={20} /> Sombre
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Densité d'affichage</label>
              <select className="form-select">
                <option>Confortable</option>
                <option>Compact</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Animations</label>
              <div className="form-check">
                <input type="checkbox" defaultChecked />
                <span>Activer les animations et transitions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Langue & Région */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Globe size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Langue & Région</div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Langue de l'interface</label>
              <select className="form-select">
                <option>Français</option>
                <option>Anglais</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Format de date</label>
              <select className="form-select">
                <option>JJ/MM/AAAA (17/03/2026)</option>
                <option>MM/JJ/AAAA (03/17/2026)</option>
                <option>AAAA-MM-JJ (2026-03-17)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Devise</label>
              <select className="form-select">
                <option>FCFA — Franc CFA</option>
                <option>EUR — Euro</option>
                <option>USD — Dollar US</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Bell size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Notifications</div>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Choisissez les notifications que vous souhaitez recevoir.</p>
            {[
              { label: 'Absences et retards', desc: 'Push + Email', checked: true },
              { label: 'Paiements reçus', desc: 'Email uniquement', checked: true },
              { label: 'Nouveaux messages', desc: 'Push + Email', checked: true },
              { label: 'Bulletins publiés', desc: 'Email uniquement', checked: false },
              { label: 'Admissions en attente', desc: 'Push uniquement', checked: false },
              { label: 'Alertes système', desc: 'Push + Email', checked: true },
            ].map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{n.label}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{n.desc}</div>
                </div>
                <div className="form-check" style={{ marginBottom: 0 }}>
                  <input type="checkbox" defaultChecked={n.checked} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Données & Sécurité */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Database size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Données & Sécurité</div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Année scolaire active</label>
              <select className="form-select">
                <option>2025-2026 (en cours)</option>
                <option>2024-2025</option>
                <option>2023-2024</option>
              </select>
            </div>

            <div className="divider" />

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Export de données</label>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>Téléchargez vos données au format Excel ou PDF.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export Excel</button>
                <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export PDF</button>
              </div>
            </div>

            <div className="divider" />

            <div>
              <label className="form-label"><Shield size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />Sessions actives</label>
              <div style={{ padding: '12px 16px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Navigateur actuel</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Connecté en tant que {user?.prenom} {user?.nom}</div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTIONS SYSTEME — visibles selon le rôle                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {canViewSystemSettings && (
        <>
          {/* Titre de section */}
          <div style={{ margin: '32px 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={20} style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: isDark ? '#e2e8f0' : '#1e293b' }}>Paramétrage Système</h2>
            {!canEditSystemSettings && (
              <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                <Lock size={10} style={{ marginRight: '4px' }} />Lecture seule
              </span>
            )}
          </div>

          <div className="grid-2">
            {/* ═══ Année Scolaire ═══ */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><Calendar size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Année Scolaire</div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Année scolaire active</label>
                  <select
                    className="form-select"
                    value={anneeScolaireActiveId}
                    onChange={(e) => canEditSystemSettings && setAnneeScolaireActiveId(Number(e.target.value))}
                    disabled={!canEditSystemSettings}
                  >
                    {configSysteme.anneesDisponibles.map(a => (
                      <option key={a.id} value={a.id}>{a.label}{a.active ? ' (en cours)' : ''}</option>
                    ))}
                  </select>
                </div>

                {anneeScolaireActive && (
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Date de début</label>
                      <input
                        type="date"
                        className="form-input"
                        value={anneeScolaireActive.debut}
                        disabled={!canEditSystemSettings}
                        readOnly
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Date de fin</label>
                      <input
                        type="date"
                        className="form-input"
                        value={anneeScolaireActive.fin}
                        disabled={!canEditSystemSettings}
                        readOnly
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b' }}
                      />
                    </div>
                  </div>
                )}

                {canEditSystemSettings && (
                  <button className="btn btn-danger btn-sm" onClick={handleCloturerAnnee} style={{ marginBottom: '16px' }}>
                    <AlertTriangle size={14} /> Clôturer l'année
                  </button>
                )}

                <div className="divider" />

                <label className="form-label">Années disponibles</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {configSysteme.anneesDisponibles.map(a => (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                        background: a.active ? (isDark ? '#1e3a5f20' : '#eff6ff') : (isDark ? '#0f172a' : '#f8fafc'),
                        border: a.active ? '1px solid #3b82f640' : '1px solid transparent'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600 }}>{a.label}</span>
                        <span style={{ color: '#6b7280', marginLeft: '8px', fontSize: '11px' }}>
                          {a.debut} au {a.fin}
                        </span>
                      </div>
                      <span className={`badge ${a.active ? 'badge-success' : 'badge-secondary'}`}>
                        {a.active ? 'Active' : 'Clôturée'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ Périodes de Notation ═══ */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><ClipboardList size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Périodes de Notation</div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Mode de notation</label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <button
                      className={`btn btn-sm ${modeNotation === 'trimestres' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => canEditSystemSettings && setModeNotation('trimestres')}
                      disabled={!canEditSystemSettings}
                    >
                      Trimestres
                    </button>
                    <button
                      className={`btn btn-sm ${modeNotation === 'semestres' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => canEditSystemSettings && setModeNotation('semestres')}
                      disabled={!canEditSystemSettings}
                    >
                      Semestres
                    </button>
                  </div>
                </div>

                <div className="divider" />

                <label className="form-label">Périodes ({modeNotation})</label>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Période</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Début</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Fin</th>
                        <th style={{ textAlign: 'center', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Statut</th>
                        {canEditSystemSettings && (
                          <th style={{ textAlign: 'center', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {systemePeriodes.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{p.label}</td>
                          <td style={{ padding: '10px', color: '#6b7280' }}>{p.debut}</td>
                          <td style={{ padding: '10px', color: '#6b7280' }}>{p.fin}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {p.cloture ? (
                              <span className="badge badge-secondary">Clôturée</span>
                            ) : p.active ? (
                              <span className="badge badge-success">Active</span>
                            ) : (
                              <span className="badge badge-warning">A venir</span>
                            )}
                          </td>
                          {canEditSystemSettings && (
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              {p.active && !p.cloture && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleCloturerPeriode(p.id)}
                                  style={{ fontSize: '11px', padding: '4px 10px' }}
                                >
                                  Clôturer
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ═══ Règles de Passage ═══ */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><GraduationCap size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Règles de Passage</div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                  Configurez les critères de passage par niveau scolaire.
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Niveau</th>
                        <th style={{ textAlign: 'center', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Moy. minimale</th>
                        <th style={{ textAlign: 'center', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Redoublements max</th>
                        <th style={{ textAlign: 'center', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>Décision auto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reglesPassage.map(r => (
                        <tr key={r.niveau} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: 600 }}>
                            <BookOpen size={14} style={{ verticalAlign: 'text-bottom', marginRight: '6px', color: '#6b7280' }} />
                            {r.niveau}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <input
                              type="number"
                              value={r.moyenneMinimale}
                              onChange={(e) => canEditSystemSettings && handleRegleChange(r.niveau, 'moyenneMinimale', Number(e.target.value))}
                              disabled={!canEditSystemSettings}
                              min={0}
                              max={20}
                              step={0.5}
                              style={{
                                width: '70px', textAlign: 'center', padding: '6px 8px', borderRadius: '6px',
                                border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600,
                                background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b'
                              }}
                            />
                            <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '4px' }}>/20</span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <input
                              type="number"
                              value={r.redoublementMax}
                              onChange={(e) => canEditSystemSettings && handleRegleChange(r.niveau, 'redoublementMax', Number(e.target.value))}
                              disabled={!canEditSystemSettings}
                              min={0}
                              max={3}
                              style={{
                                width: '60px', textAlign: 'center', padding: '6px 8px', borderRadius: '6px',
                                border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600,
                                background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b'
                              }}
                            />
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <div className="form-check" style={{ justifyContent: 'center', marginBottom: 0 }}>
                              <input
                                type="checkbox"
                                checked={r.decisionAuto}
                                onChange={(e) => canEditSystemSettings && handleRegleChange(r.niveau, 'decisionAuto', e.target.checked)}
                                disabled={!canEditSystemSettings}
                              />
                              <span style={{ fontSize: '12px', color: r.decisionAuto ? '#16a34a' : '#6b7280' }}>
                                {r.decisionAuto ? 'Oui' : 'Non'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ═══ Configuration Générale ═══ */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><Settings size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Configuration Générale</div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Format du matricule</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formatMatricule}
                    onChange={(e) => canEditSystemSettings && setFormatMatricule(e.target.value)}
                    disabled={!canEditSystemSettings}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: '8px',
                      border: '1px solid #e2e8f0', fontSize: '13px', fontFamily: 'monospace',
                      background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b'
                    }}
                  />
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    {'{AA}'} = 2 derniers chiffres de l'année, {'{NNNN}'} = numéro séquentiel sur 4 chiffres
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Devise par défaut</label>
                  <select
                    className="form-select"
                    value={deviseParDefaut}
                    onChange={(e) => canEditSystemSettings && setDeviseParDefaut(e.target.value)}
                    disabled={!canEditSystemSettings}
                  >
                    <option value="FCFA">FCFA - Franc CFA</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - Dollar US</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fuseau horaire</label>
                  <select
                    className="form-select"
                    value={fuseauHoraire}
                    onChange={(e) => canEditSystemSettings && setFuseauHoraire(e.target.value)}
                    disabled={!canEditSystemSettings}
                  >
                    <option value="Africa/Libreville">Africa/Libreville (UTC+1)</option>
                    <option value="Africa/Douala">Africa/Douala (UTC+1)</option>
                    <option value="Europe/Paris">Europe/Paris (UTC+1/+2)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <AlertTriangle size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px', color: '#f59e0b' }} />
                    Seuil d'alerte absentéisme
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      value={seuilAbsenteisme}
                      onChange={(e) => canEditSystemSettings && setSeuilAbsenteisme(Number(e.target.value))}
                      disabled={!canEditSystemSettings}
                      min={1}
                      max={50}
                      style={{
                        width: '80px', textAlign: 'center', padding: '8px 12px', borderRadius: '8px',
                        border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600,
                        background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>absences avant alerte</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    Une notification sera envoyée aux parents et à la direction quand ce seuil est atteint.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seuils d'alerte KPI */}
          <div className="card mt-24" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <div className="card-title">
                <AlertTriangle size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px', color: '#f59e0b' }} />
                Seuils d'alerte KPI
              </div>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                Configurez les seuils qui declenchent des alertes sur les tableaux de bord. Quand un indicateur passe sous (ou au-dessus) de son seuil, une alerte est generee automatiquement.
              </p>
              <div className="grid-2" style={{ gap: '20px' }}>
                {/* Seuil recouvrement */}
                <div style={{ padding: '16px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '4px' }}>Taux de recouvrement minimum</label>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>Alerte si le taux de recouvrement descend sous ce seuil.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      value={seuilRecouvrement}
                      onChange={(e) => canEditSystemSettings && setSeuilRecouvrement(Number(e.target.value))}
                      disabled={!canEditSystemSettings}
                      min={0} max={100}
                      style={{ width: '80px', textAlign: 'center', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 700, background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b' }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>%</span>
                    <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Defaut : 85%</span>
                  </div>
                </div>

                {/* Seuil absenteisme */}
                <div style={{ padding: '16px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '4px' }}>Taux d'absenteisme maximum</label>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>Alerte si le taux d'absenteisme depasse ce seuil.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      value={seuilAbsenteismeKPI}
                      onChange={(e) => canEditSystemSettings && setSeuilAbsenteismeKPI(Number(e.target.value))}
                      disabled={!canEditSystemSettings}
                      min={0} max={100}
                      style={{ width: '80px', textAlign: 'center', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 700, background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b' }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>%</span>
                    <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Defaut : 10%</span>
                  </div>
                </div>

                {/* Seuil reussite */}
                <div style={{ padding: '16px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '4px' }}>Taux de reussite minimum</label>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>Alerte si le taux de reussite (moyenne &gt;= 10/20) descend sous ce seuil.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      value={seuilReussite}
                      onChange={(e) => canEditSystemSettings && setSeuilReussite(Number(e.target.value))}
                      disabled={!canEditSystemSettings}
                      min={0} max={100}
                      style={{ width: '80px', textAlign: 'center', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 700, background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b' }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>%</span>
                    <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Defaut : 70%</span>
                  </div>
                </div>

                {/* Seuil conversion */}
                <div style={{ padding: '16px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '4px' }}>Taux de conversion admissions minimum</label>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>Alerte si le taux de conversion des admissions descend sous ce seuil.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      value={seuilConversion}
                      onChange={(e) => canEditSystemSettings && setSeuilConversion(Number(e.target.value))}
                      disabled={!canEditSystemSettings}
                      min={0} max={100}
                      style={{ width: '80px', textAlign: 'center', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 700, background: isDark ? '#1e293b' : '#fff', color: isDark ? '#e2e8f0' : '#1e293b' }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>%</span>
                    <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Defaut : 60%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Aide */}
      <div className="card mt-24">
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
          <div style={{ width: '48px', height: '48px', background: '#dbeafe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <HelpCircle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Besoin d'aide ?</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Contactez notre support technique à support@leguide.ga ou consultez la FAQ.</div>
          </div>
          <button className="btn btn-info btn-sm">Contacter le support</button>
        </div>
      </div>
    </div>
  );
}
