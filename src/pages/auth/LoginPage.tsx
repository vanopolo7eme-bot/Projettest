import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { demoUsers } from '../../data/mockData';
import { Eye, EyeOff, Lock, Mail, GraduationCap, Shield, BookOpen, Users } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) { setError('Veuillez saisir votre email'); return; }
    const success = login(email, password);
    if (success) navigate('/dashboard');
    else setError('Identifiants incorrects');
  };

  const handleDemoLogin = (userId) => {
    loginAsDemo(userId);
    navigate('/dashboard');
  };

  const roleIcons = {
    'Direction Générale': <Shield size={16} />,
    'Directeur d\'Établissement': <GraduationCap size={16} />,
    'Enseignant': <BookOpen size={16} />,
    'Parent': <Users size={16} />,
    'Élève': <GraduationCap size={16} />,
    'Administration Scolaire': <Lock size={16} />,
  };

  return (
    <div className="login-page">
      <div className="login-left">
        {/* Floating animated orbs */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,166,35,0.15), transparent 70%)', top: '-50px', right: '-80px', animation: 'float 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)', bottom: '60px', left: '-40px', animation: 'float 10s ease-in-out infinite reverse', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,166,35,0.08), transparent 70%)', top: '40%', left: '20%', animation: 'float 12s ease-in-out infinite', pointerEvents: 'none' }} />
        <style>{`@keyframes float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }`}</style>
        <div style={{ textAlign: 'center', maxWidth: '460px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '88px', height: '88px', background: 'linear-gradient(135deg, #f4a623, #e8951a)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '38px', color: '#0f2137', margin: '0 auto 28px', boxShadow: '0 8px 32px rgba(244,166,35,0.35)' }}>
            LG
          </div>
          <h1 style={{ fontSize: '34px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.5px' }}>LE GUIDE DE NOS ENFANTS</h1>
          <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: 1.7, marginBottom: '40px' }}>
            Plateforme numérique éducative intégrée pour la gestion de vos établissements scolaires.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', textAlign: 'left' }}>
            {[
              { icon: '📊', title: 'Pilotage', desc: 'Tableaux de bord temps réel' },
              { icon: '📚', title: 'Académique', desc: 'Notes, bulletins, emploi du temps' },
              { icon: '💰', title: 'Finance', desc: 'Facturation et paiements' },
              { icon: '💬', title: 'Communication', desc: 'Messagerie intégrée' },
            ].map((feat, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s ease' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px' }}>{feat.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>{feat.title}</div>
                <div style={{ fontSize: '12px', opacity: 0.6, lineHeight: 1.5 }}>{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-logo">
          <div className="login-logo-icon">LG</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#1e3a5f' }}>LE GUIDE</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Espace connecté</div>
          </div>
        </div>

        <h1 className="login-title">Connexion</h1>
        <p className="login-sub">Connectez-vous à votre espace personnel</p>

        {error && <div className="alert alert-danger mb-16">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                className="form-control"
                type="email"
                placeholder="votre@email.ga"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <label className="form-check">
              <input type="checkbox" /> Se souvenir de moi
            </label>
            <a href="#!" style={{ fontSize: '13px', color: '#3498db' }}>Mot de passe oublié ?</a>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }}>
            Se connecter
          </button>
        </form>

        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e0e6ed' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px', textAlign: 'center' }}>— Accès rapide démo —</p>
          <div className="demo-users-grid">
            {demoUsers.map(u => (
              <button key={u.id} className="demo-user-btn" onClick={() => handleDemoLogin(u.id)}>
                <div className="avatar avatar-xs" style={{ background: u.color, color: 'white', fontSize: '9px' }}>{u.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '11px' }}>{u.prenom}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{u.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
