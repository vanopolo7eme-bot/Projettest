import React from 'react';
import { useTheme, accentPresets } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Sun, Moon, Globe, Database, HelpCircle, Download, Shield, Bell, Palette, Check } from 'lucide-react';

export default function ParametresPage() {
  const { theme, toggleTheme, isDark, accentColor, setAccentColor } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleExport = () => {
    showToast('Export des données lancé. Vous recevrez un email avec le fichier.', 'info');
  };

  const handleSave = () => {
    showToast('Paramètres sauvegardés avec succès !', 'success');
  };

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
