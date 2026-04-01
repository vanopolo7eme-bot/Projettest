import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { User, Mail, Phone, Shield, Lock, Activity, Clock, LogOut, Key, Smartphone, Edit3, Save, CheckCircle } from 'lucide-react';
import { familles, eleves, classes, etablissements, enseignants, matieres } from '../../data/mockData';

type OngletType = 'informations' | 'securite' | 'activite';

const mockActivites = [
  { id: 1, action: 'Connexion', detail: 'Connexion depuis Chrome / macOS', date: '2026-03-31 08:15', type: 'connexion' },
  { id: 2, action: 'Consultation bulletin', detail: 'Bulletin T1 - CP-A consulte', date: '2026-03-30 16:42', type: 'consultation' },
  { id: 3, action: 'Message envoye', detail: 'Message a Mme Essono', date: '2026-03-29 14:20', type: 'message' },
  { id: 4, action: 'Consultation emploi du temps', detail: 'Emploi du temps CP-A', date: '2026-03-28 09:10', type: 'consultation' },
  { id: 5, action: 'Modification profil', detail: 'Numero de telephone mis a jour', date: '2026-03-27 11:35', type: 'modification' },
  { id: 6, action: 'Connexion', detail: 'Connexion depuis Safari / iPhone', date: '2026-03-26 07:50', type: 'connexion' },
  { id: 7, action: 'Consultation notes', detail: 'Notes de Mathematiques consultees', date: '2026-03-25 15:30', type: 'consultation' },
  { id: 8, action: 'Telechargement document', detail: 'Reglement interieur 2025-2026', date: '2026-03-24 10:05', type: 'telechargement' },
  { id: 9, action: 'Message envoye', detail: 'Message a la Direction', date: '2026-03-23 13:45', type: 'message' },
  { id: 10, action: 'Connexion', detail: 'Connexion depuis Firefox / Windows', date: '2026-03-22 08:00', type: 'connexion' },
];

function getActivityBadge(type: string) {
  switch (type) {
    case 'connexion': return <span className="badge badge-success" style={{ fontSize: '10px' }}>Connexion</span>;
    case 'consultation': return <span className="badge badge-primary" style={{ fontSize: '10px' }}>Consultation</span>;
    case 'message': return <span className="badge badge-info" style={{ fontSize: '10px' }}>Message</span>;
    case 'modification': return <span className="badge badge-warning" style={{ fontSize: '10px' }}>Modification</span>;
    case 'telechargement': return <span className="badge badge-secondary" style={{ fontSize: '10px' }}>Telechargement</span>;
    default: return <span className="badge badge-secondary" style={{ fontSize: '10px' }}>{type}</span>;
  }
}

export default function ProfilPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [onglet, setOnglet] = useState<OngletType>('informations');
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: '+241 07 00 00 00'
  });

  // Security state
  const [passwords, setPasswords] = useState({ ancien: '', nouveau: '', confirmer: '' });
  const [twoFA, setTwoFA] = useState(false);

  // Role-specific data
  const isParent = user?.role === 'Parent';
  const isEnseignant = user?.role === 'Enseignant';

  // Find parent's children
  const parentFamille = isParent ? familles.find(f => f.email === user?.email || f.pere?.includes(user?.prenom || '') || f.mere?.includes(user?.prenom || '')) : null;
  const parentEnfants = parentFamille ? eleves.filter(e => parentFamille.enfants.includes(e.id)) : [];

  // If logged as the demo parent (Patrick Obame), match famille Obame
  const enfantsToShow = parentEnfants.length > 0 ? parentEnfants : (isParent ? eleves.filter(e => [1, 11, 21].includes(e.id)) : []);

  // Find teacher data
  const enseignantObj = isEnseignant ? enseignants.find(en => en.email === user?.email || (en.prenom === user?.prenom && en.nom === user?.nom)) : null;
  const enseignantMatieres = enseignantObj ? matieres.filter(m => enseignantObj.matieres.includes(m.id)) : [];

  const handleUpdateProfile = () => {
    setIsEditing(false);
    showToast('Profil mis a jour avec succes.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.ancien || !passwords.nouveau || !passwords.confirmer) {
      showToast('Veuillez remplir tous les champs.', 'error');
      return;
    }
    if (passwords.nouveau !== passwords.confirmer) {
      showToast('Les mots de passe ne correspondent pas.', 'error');
      return;
    }
    if (passwords.nouveau.length < 8) {
      showToast('Le mot de passe doit contenir au moins 8 caracteres.', 'error');
      return;
    }
    setPasswords({ ancien: '', nouveau: '', confirmer: '' });
    showToast('Mot de passe modifie avec succes.', 'success');
  };

  const handleLogoutAll = () => {
    showToast('Toutes les sessions ont ete deconnectees.', 'success');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Direction Generale': return '#1e3a5f';
      case 'Directeur d\'Etablissement': return '#27ae60';
      case 'Enseignant': return '#3498db';
      case 'Parent': return '#f4a623';
      case 'Eleve': return '#7c3aed';
      case 'Administration Scolaire': return '#e74c3c';
      default: return '#6b7280';
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Compte</span><span className="breadcrumb-sep">/</span><span>Mon profil</span></div>
          <h1 className="page-title">Mon Profil</h1>
          <p className="page-subtitle">Gerez vos informations personnelles et parametres</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
          padding: '40px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          color: 'white'
        }}>
          <div className="avatar" style={{
            width: '80px', height: '80px', background: user?.color || '#f4a623',
            color: 'white', fontSize: '28px', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)',
            flexShrink: 0
          }}>
            {user?.initials || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 700, fontSize: '22px', marginBottom: '4px' }}>{user?.prenom} {user?.nom}</h2>
            <p style={{ opacity: 0.8, fontSize: '14px', marginBottom: '8px' }}>{user?.email}</p>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <Shield size={12} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: '24px' }}>
        <div className={`tab-item ${onglet === 'informations' ? 'active' : ''}`} onClick={() => setOnglet('informations')}>
          <User size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
          Informations
        </div>
        <div className={`tab-item ${onglet === 'securite' ? 'active' : ''}`} onClick={() => setOnglet('securite')}>
          <Lock size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
          Securite
        </div>
        <div className={`tab-item ${onglet === 'activite' ? 'active' : ''}`} onClick={() => setOnglet('activite')}>
          <Activity size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
          Activite
        </div>
      </div>

      {/* Informations tab */}
      {onglet === 'informations' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div className="card-title">
                <User size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                Informations personnelles
              </div>
              {!isEditing ? (
                <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                  <Edit3 size={14} /> Modifier
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleUpdateProfile}>
                  <Save size={14} /> Mettre a jour
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Prenom</label>
                  <input
                    className="form-input"
                    value={formData.prenom}
                    readOnly={!isEditing}
                    onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                    style={!isEditing ? { background: '#f8fafc', cursor: 'default' } : {}}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    className="form-input"
                    value={formData.nom}
                    readOnly={!isEditing}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    style={!isEditing ? { background: '#f8fafc', cursor: 'default' } : {}}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={14} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    Email
                  </label>
                  <input
                    className="form-input"
                    type="email"
                    value={formData.email}
                    readOnly={!isEditing}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={!isEditing ? { background: '#f8fafc', cursor: 'default' } : {}}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Phone size={14} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    Telephone
                  </label>
                  <input
                    className="form-input"
                    value={formData.telephone}
                    readOnly={!isEditing}
                    onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                    style={!isEditing ? { background: '#f8fafc', cursor: 'default' } : {}}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Parent: children */}
          {isParent && enfantsToShow.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <div className="card-title">Enfants rattaches</div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Classe</th>
                        <th>Etablissement</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enfantsToShow.map(enfant => {
                        const cl = classes.find(c => c.id === enfant.classeId);
                        const etab = etablissements.find(et => et.id === enfant.etablissementId);
                        return (
                          <tr key={enfant.id}>
                            <td style={{ fontWeight: 600 }}>{enfant.prenom} {enfant.nom}</td>
                            <td>{cl?.nom || '-'}</td>
                            <td style={{ fontSize: '13px', color: '#6b7280' }}>{etab?.nom || '-'}</td>
                            <td>
                              <span className={`badge ${enfant.statut === 'Actif' ? 'badge-success' : enfant.statut === 'Transfere' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                                {enfant.statut}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Enseignant: info */}
          {isEnseignant && enseignantObj && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Informations enseignant</div>
              </div>
              <div className="card-body">
                <div className="grid-2" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Specialite</label>
                    <input className="form-input" value={enseignantObj.specialite} readOnly style={{ background: '#f8fafc', cursor: 'default' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contrat</label>
                    <input className="form-input" value={enseignantObj.contrat} readOnly style={{ background: '#f8fafc', cursor: 'default' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Matieres enseignees</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {enseignantMatieres.map(m => (
                      <span key={m.id} style={{
                        display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                        background: m.couleur + '18', color: m.couleur, border: `1px solid ${m.couleur}30`
                      }}>
                        {m.nom}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label">Etablissement</label>
                  <input className="form-input" value={etablissements.find(et => et.id === enseignantObj.etablissementId)?.nom || '-'} readOnly style={{ background: '#f8fafc', cursor: 'default' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Securite tab */}
      {onglet === 'securite' && (
        <div>
          {/* Change password */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div className="card-title">
                <Key size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                Changer le mot de passe
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Mot de passe actuel</label>
                  <input className="form-input" type="password" placeholder="Entrez votre mot de passe actuel" value={passwords.ancien} onChange={e => setPasswords({ ...passwords, ancien: e.target.value })} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Nouveau mot de passe</label>
                    <input className="form-input" type="password" placeholder="8 caracteres minimum" value={passwords.nouveau} onChange={e => setPasswords({ ...passwords, nouveau: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmer le nouveau mot de passe</label>
                    <input className="form-input" type="password" placeholder="Confirmez le mot de passe" value={passwords.confirmer} onChange={e => setPasswords({ ...passwords, confirmer: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                  <Lock size={14} /> Changer le mot de passe
                </button>
              </form>
            </div>
          </div>

          {/* 2FA */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div className="card-title">
                <Smartphone size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                Authentification a deux facteurs (2FA)
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                    {twoFA ? 'Activee' : 'Desactivee'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    La 2FA ajoute une couche de securite supplementaire en demandant un code a usage unique lors de la connexion.
                  </p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', flexShrink: 0, marginLeft: '16px' }}>
                  <input
                    type="checkbox"
                    checked={twoFA}
                    onChange={() => {
                      setTwoFA(!twoFA);
                      showToast(twoFA ? '2FA desactivee.' : '2FA activee avec succes.', twoFA ? 'info' : 'success');
                    }}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    background: twoFA ? '#27ae60' : '#d1d5db', borderRadius: '26px', transition: 'all 0.3s'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '20px', width: '20px',
                      left: twoFA ? '24px' : '3px', bottom: '3px',
                      background: 'white', borderRadius: '50%', transition: 'all 0.3s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Active sessions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Activity size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                Sessions actives
              </div>
              <button className="btn btn-secondary" style={{ color: '#e74c3c' }} onClick={handleLogoutAll}>
                <LogOut size={14} /> Deconnecter toutes les sessions
              </button>
            </div>
            <div className="card-body">
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#27ae60', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <CheckCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Chrome -- macOS (session actuelle)</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Libreville, Gabon -- Derniere activite: il y a 2 minutes
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>IP: 197.155.xxx.xxx</div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activite tab */}
      {onglet === 'activite' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
              10 dernieres actions
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {mockActivites.map((act, index) => (
                <div key={act.id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 24px',
                  borderBottom: index < mockActivites.length - 1 ? '1px solid #f1f5f9' : 'none'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: act.type === 'connexion' ? '#dcfce7' : act.type === 'message' ? '#dbeafe' : act.type === 'modification' ? '#fef3c7' : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {act.type === 'connexion' && <LogOut size={16} style={{ color: '#27ae60' }} />}
                    {act.type === 'consultation' && <Activity size={16} style={{ color: '#6b7280' }} />}
                    {act.type === 'message' && <Mail size={16} style={{ color: '#3498db' }} />}
                    {act.type === 'modification' && <Edit3 size={16} style={{ color: '#f59e0b' }} />}
                    {act.type === 'telechargement' && <Activity size={16} style={{ color: '#6b7280' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{act.action}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{act.detail}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {getActivityBadge(act.type)}
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                      {new Date(act.date).toLocaleDateString('fr-FR')} {act.date.split(' ')[1]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
