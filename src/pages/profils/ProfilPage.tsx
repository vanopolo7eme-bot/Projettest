import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Shield, Lock, Bell, Palette } from 'lucide-react';

export default function ProfilPage() {
  const { user } = useAuth();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Compte</span><span className="breadcrumb-sep">/</span><span>Mon profil</span></div>
          <h1 className="page-title">Mon Profil</h1>
          <p className="page-subtitle">Gérez vos informations personnelles et paramètres</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Profil Card */}
        <div className="card">
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', padding: '32px', textAlign: 'center', color: 'white', borderRadius: '16px 16px 0 0' }}>
            <div className="avatar avatar-xl" style={{ background: user?.color || '#f4a623', color: 'white', margin: '0 auto 12px', fontSize: '24px' }}>
              {user?.initials || 'U'}
            </div>
            <h2 style={{ fontWeight: 700 }}>{user?.prenom} {user?.nom}</h2>
            <p style={{ opacity: 0.8, fontSize: '14px' }}>{user?.role}</p>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label"><Mail size={14} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Email</label>
              <input className="form-control" value={user?.email || ''} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label"><Shield size={14} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Rôle</label>
              <input className="form-control" value={user?.role || ''} readOnly />
            </div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: '8px' }}>Modifier le profil</button>
          </div>
        </div>

        {/* Paramètres */}
        <div>
          <div className="card mb-20">
            <div className="card-header"><div className="card-title"><Lock size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Sécurité</div></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Mot de passe actuel</label><input className="form-control" type="password" placeholder="••••••••" /></div>
              <div className="form-row"><div className="form-group"><label className="form-label">Nouveau mot de passe</label><input className="form-control" type="password" placeholder="••••••••" /></div><div className="form-group"><label className="form-label">Confirmer</label><input className="form-control" type="password" placeholder="••••••••" /></div></div>
              <button className="btn btn-secondary">Changer le mot de passe</button>
              <div className="divider" />
              <div className="form-check"><input type="checkbox" /><span>Activer l'authentification à deux facteurs (2FA)</span></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title"><Bell size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />Notifications</div></div>
            <div className="card-body">
              {['Absences (push + email)', 'Paiements reçus', 'Nouveaux messages', 'Bulletins publiés', 'Admissions en attente'].map((n, i) => (
                <div key={i} className="form-check" style={{ marginBottom: '12px' }}><input type="checkbox" defaultChecked={i < 3} /><span>{n}</span></div>
              ))}
              <button className="btn btn-secondary" style={{ marginTop: '8px' }}>Sauvegarder</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
