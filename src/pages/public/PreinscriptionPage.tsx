import React, { useState } from 'react';
import { etablissements } from '../../data/mockData';
import { Upload, Check, ChevronRight, ChevronLeft } from 'lucide-react';

const etapes = [
  { label: 'Informations parent', icon: '👤' },
  { label: 'Informations enfant', icon: '🧒' },
  { label: 'Choix établissement', icon: '🏫' },
  { label: 'Documents', icon: '📄' },
  { label: 'Confirmation', icon: '✅' },
];

export default function PreinscriptionPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ parentNom: '', parentPrenom: '', parentEmail: '', parentTel: '', enfantNom: '', enfantPrenom: '', enfantDateNaissance: '', enfantSexe: '', etablissement: '', niveau: '' });

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

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

            {/* Step 0 */}
            {step === 0 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Informations du parent / responsable légal</h3>
                <div className="form-row"><div className="form-group"><label className="form-label">Nom <span className="req">*</span></label><input className="form-control" value={form.parentNom} onChange={e => updateForm('parentNom', e.target.value)} placeholder="Votre nom" /></div><div className="form-group"><label className="form-label">Prénom <span className="req">*</span></label><input className="form-control" value={form.parentPrenom} onChange={e => updateForm('parentPrenom', e.target.value)} placeholder="Votre prénom" /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input className="form-control" type="email" value={form.parentEmail} onChange={e => updateForm('parentEmail', e.target.value)} placeholder="votre@email.com" /></div><div className="form-group"><label className="form-label">Téléphone <span className="req">*</span></label><input className="form-control" value={form.parentTel} onChange={e => updateForm('parentTel', e.target.value)} placeholder="+241 0X XX XX XX" /></div></div>
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Informations de l'enfant</h3>
                <div className="form-row"><div className="form-group"><label className="form-label">Nom <span className="req">*</span></label><input className="form-control" value={form.enfantNom} onChange={e => updateForm('enfantNom', e.target.value)} /></div><div className="form-group"><label className="form-label">Prénom <span className="req">*</span></label><input className="form-control" value={form.enfantPrenom} onChange={e => updateForm('enfantPrenom', e.target.value)} /></div></div>
                <div className="form-row"><div className="form-group"><label className="form-label">Date de naissance <span className="req">*</span></label><input className="form-control" type="date" value={form.enfantDateNaissance} onChange={e => updateForm('enfantDateNaissance', e.target.value)} /></div><div className="form-group"><label className="form-label">Sexe <span className="req">*</span></label><select className="form-select" value={form.enfantSexe} onChange={e => updateForm('enfantSexe', e.target.value)}><option value="">Sélectionner</option><option value="M">Masculin</option><option value="F">Féminin</option></select></div></div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Choix de l'établissement</h3>
                <div className="form-group"><label className="form-label">Établissement souhaité <span className="req">*</span></label><select className="form-select" value={form.etablissement} onChange={e => updateForm('etablissement', e.target.value)}><option value="">Choisir un établissement</option>{etablissements.map(et => <option key={et.id} value={et.id}>{et.nom}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Niveau demandé <span className="req">*</span></label><select className="form-select" value={form.niveau} onChange={e => updateForm('niveau', e.target.value)}><option value="">Choisir un niveau</option>{['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Documents requis</h3>
                <div className="alert alert-info mb-16">Veuillez fournir les documents suivants au format PDF, JPG ou PNG.</div>
                {['Acte de naissance', 'Bulletins des 2 dernières années', 'Carnet de vaccination', 'Certificat médical', 'Photo d\'identité'].map((doc, i) => (
                  <div key={i} className="doc-item" style={{ marginBottom: '8px' }}>
                    <div className="doc-icon default"><Upload size={18} /></div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '13px' }}>{doc}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>PDF, JPG ou PNG — Max 5 MB</div></div>
                    <button className="btn btn-secondary btn-sm">Choisir un fichier</button>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '64px', height: '64px', background: '#d4edda', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#27ae60' }}>
                  <Check size={32} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Pré-inscription envoyée !</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>Votre dossier a été soumis avec succès. Vous recevrez un email de confirmation à {form.parentEmail || 'votre adresse'}.</p>
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
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
                <ChevronLeft size={16} /> Précédent
              </button>
              {step < 4 ? (
                <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
                  {step === 3 ? 'Soumettre' : 'Suivant'} <ChevronRight size={16} />
                </button>
              ) : (
                <a href="/" className="btn btn-primary">Retour à l'accueil</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
