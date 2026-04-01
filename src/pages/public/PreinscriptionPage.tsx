import React, { useState } from 'react';
import { etablissements } from '../../data/mockData';
import { Upload, Check, ChevronRight, ChevronLeft, Mail, Phone, ShieldCheck } from 'lucide-react';

const etapes = [
  { label: 'Création compte', icon: '🔐' },
  { label: 'Informations parent', icon: '👤' },
  { label: 'Informations enfant', icon: '🧒' },
  { label: 'Choix établissement', icon: '🏫' },
  { label: 'Documents', icon: '📄' },
  { label: 'Confirmation', icon: '✅' },
];

export default function PreinscriptionPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ accountEmail: '', accountTel: '', parentNom: '', parentPrenom: '', parentEmail: '', parentTel: '', enfantNom: '', enfantPrenom: '', enfantDateNaissance: '', enfantSexe: '', etablissement: '', niveau: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSendOtp = () => {
    if (!form.accountEmail || !form.accountTel) return;
    setOtpSent(true);
    setOtpError('');
  };

  const handleVerifyOtp = () => {
    if (otpCode === '123456') {
      setOtpVerified(true);
      setOtpError('');
    } else {
      setOtpError('Code incorrect. Veuillez réessayer. (Indice : 123456)');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', padding: '48px 80px', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Pré-inscription en ligne</h1>
        <p style={{ fontSize: '16px', opacity: 0.85 }}>Inscrivez votre enfant pour l'année scolaire 2026-2027</p>
      </div>

      <div style={{ maxWidth: '700px', margin: '-30px auto 60px', padding: '0 20px' }}>
        <div className="card">
          <div className="card-body" style={{ padding: '32px' }}>
            {/* Stepper */}
            <div className="stepper" style={{ marginBottom: '32px' }}>
              {etapes.map((e, i) => (
                <div key={i} className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  <div className="step-circle">{i < step ? <Check size={14} /> : e.icon}</div>
                  <div className="step-label">{e.label}</div>
                </div>
              ))}
            </div>

            {/* Step 0: Création de compte (OTP) */}
            {step === 0 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Création de compte</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                  Veuillez renseigner votre email et téléphone. Un code de vérification vous sera envoyé.
                </p>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><Mail size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Email <span className="req">*</span></label>
                    <input className="form-control" type="email" value={form.accountEmail} onChange={e => updateForm('accountEmail', e.target.value)} placeholder="votre@email.com" disabled={otpVerified} />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Phone size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Téléphone <span className="req">*</span></label>
                    <input className="form-control" value={form.accountTel} onChange={e => updateForm('accountTel', e.target.value)} placeholder="+241 0X XX XX XX" disabled={otpVerified} />
                  </div>
                </div>

                {!otpSent && (
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '12px' }}
                    onClick={handleSendOtp}
                    disabled={!form.accountEmail || !form.accountTel}
                  >
                    <ShieldCheck size={16} /> Envoyer le code
                  </button>
                )}

                {otpSent && !otpVerified && (
                  <div style={{ marginTop: '20px', padding: '20px', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#1e3a5f' }}>
                      Un code de vérification a été envoyé à {form.accountEmail}
                    </p>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">Code OTP <span className="req">*</span></label>
                      <input
                        className="form-control"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        placeholder="Entrez le code à 6 chiffres"
                        maxLength={6}
                        style={{ letterSpacing: '4px', fontSize: '18px', textAlign: 'center', maxWidth: '250px' }}
                      />
                    </div>
                    {otpError && (
                      <div className="alert alert-danger" style={{ marginBottom: '12px', padding: '8px 12px', fontSize: '12px' }}>{otpError}</div>
                    )}
                    <button className="btn btn-primary" onClick={handleVerifyOtp}>
                      Vérifier le code
                    </button>
                    <button className="btn btn-secondary" style={{ marginLeft: '8px' }} onClick={() => { setOtpSent(false); setOtpCode(''); setOtpError(''); }}>
                      Renvoyer
                    </button>
                  </div>
                )}

                {otpVerified && (
                  <div className="alert alert-success" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={18} /> Compte vérifié avec succès ! Cliquez sur "Suivant" pour continuer.
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Informations parent */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Informations du parent / responsable légal</h3>
                <div className="form-row"><div className="form-group"><label className="form-label">Nom <span className="req">*</span></label><input className="form-control" value={form.parentNom} onChange={e => updateForm('parentNom', e.target.value)} placeholder="Votre nom" /></div><div className="form-group"><label className="form-label">Prénom <span className="req">*</span></label><input className="form-control" value={form.parentPrenom} onChange={e => updateForm('parentPrenom', e.target.value)} placeholder="Votre prénom" /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input className="form-control" type="email" value={form.parentEmail} onChange={e => updateForm('parentEmail', e.target.value)} placeholder="votre@email.com" /></div><div className="form-group"><label className="form-label">Téléphone <span className="req">*</span></label><input className="form-control" value={form.parentTel} onChange={e => updateForm('parentTel', e.target.value)} placeholder="+241 0X XX XX XX" /></div></div>
              </div>
            )}

            {/* Step 2: Informations enfant */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Informations de l'enfant</h3>
                <div className="form-row"><div className="form-group"><label className="form-label">Nom <span className="req">*</span></label><input className="form-control" value={form.enfantNom} onChange={e => updateForm('enfantNom', e.target.value)} /></div><div className="form-group"><label className="form-label">Prénom <span className="req">*</span></label><input className="form-control" value={form.enfantPrenom} onChange={e => updateForm('enfantPrenom', e.target.value)} /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Date de naissance <span className="req">*</span></label><input className="form-control" type="date" value={form.enfantDateNaissance} onChange={e => updateForm('enfantDateNaissance', e.target.value)} /></div><div className="form-group"><label className="form-label">Sexe <span className="req">*</span></label><select className="form-select" value={form.enfantSexe} onChange={e => updateForm('enfantSexe', e.target.value)}><option value="">Sélectionner</option><option value="M">Masculin</option><option value="F">Féminin</option></select></div></div>
              </div>
            )}

            {/* Step 3: Choix établissement */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Choix de l'établissement</h3>
                <div className="form-group"><label className="form-label">Établissement souhaité <span className="req">*</span></label><select className="form-select" value={form.etablissement} onChange={e => updateForm('etablissement', e.target.value)}><option value="">Choisir un établissement</option>{etablissements.map(et => <option key={et.id} value={et.id}>{et.nom}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Niveau demandé <span className="req">*</span></label><select className="form-select" value={form.niveau} onChange={e => updateForm('niveau', e.target.value)}><option value="">Choisir un niveau</option>{['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
              </div>
            )}

            {/* Step 4: Documents (7 documents) */}
            {step === 4 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Documents requis</h3>
                <div className="alert alert-info mb-16">Veuillez fournir les documents suivants au format PDF, JPG ou PNG.</div>
                {['Acte de naissance', 'Bulletins des 2 dernières années', 'Carnet de vaccination', 'Certificat médical', 'Photo d\'identité', 'Justificatif de domicile', 'Copie CNI / Passeport du responsable légal'].map((doc, i) => (
                  <div key={i} className="doc-item" style={{ marginBottom: '8px' }}>
                    <div className="doc-icon default"><Upload size={18} /></div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '13px' }}>{doc}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>PDF, JPG ou PNG — Max 5 MB</div></div>
                    <button className="btn btn-secondary btn-sm">Choisir un fichier</button>
                  </div>
                ))}
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '64px', height: '64px', background: '#d4edda', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#27ae60' }}>
                  <Check size={32} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Pré-inscription envoyée !</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>Votre dossier a été soumis avec succès. Vous recevrez un email de confirmation à {form.parentEmail || form.accountEmail || 'votre adresse'}.</p>
                <div className="alert alert-info" style={{ textAlign: 'left' }}>
                  <div>
                    <strong>Prochaines étapes :</strong>
                    <ol style={{ paddingLeft: '16px', marginTop: '8px', lineHeight: 2 }}>
                      <li>Vérification de votre dossier par notre équipe (2-5 jours)</li>
                      <li>Étude pédagogique de la candidature</li>
                      <li>Notification de la décision par email et SMS</li>
                    </ol>
                  </div>
                </div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '16px' }}>Connectez-vous pour suivre l'avancement de votre dossier en temps réel</p>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={16} /> Précédent
              </button>
              {step < 5 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 0 && !otpVerified}
                >
                  {step === 4 ? 'Soumettre' : 'Suivant'} <ChevronRight size={16} />
                </button>
              ) : (
                <a href="/login" className="btn btn-primary">Accéder à mon espace parent</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
