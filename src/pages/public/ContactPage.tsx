import React, { useState } from 'react';
import { etablissements } from '../../data/mockData';
import { MapPin, Phone, Mail, Clock, Send, Building2, Globe, ChevronRight } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', etablissement: '', sujet: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="fade-in">
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', color: 'white', padding: '80px 80px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '12px' }}>Contactez-nous</h1>
          <p style={{ fontSize: '17px', opacity: 0.85, maxWidth: '550px', margin: '0 auto' }}>
            Une question ? N'hésitez pas à nous contacter. Notre équipe vous répondra dans les plus brefs délais.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="public-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Formulaire */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a5f', marginBottom: '8px' }}>Envoyez-nous un message</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.</p>

            {sent && (
              <div className="alert alert-success" style={{ marginBottom: '16px' }}>
                ✅ Votre message a été envoyé avec succès ! Nous vous répondrons sous 24h.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nom complet <span className="req">*</span></label>
                  <input className="form-control" placeholder="Votre nom et prénom" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input className="form-control" type="email" placeholder="votre@email.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-control" placeholder="+241 0X XX XX XX" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Établissement concerné</label>
                  <select className="form-select" value={formData.etablissement} onChange={e => setFormData({...formData, etablissement: e.target.value})}>
                    <option value="">Sélectionner un établissement</option>
                    <option value="general">Direction Générale</option>
                    {etablissements.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sujet <span className="req">*</span></label>
                <select className="form-select" required value={formData.sujet} onChange={e => setFormData({...formData, sujet: e.target.value})}>
                  <option value="">Choisir un sujet</option>
                  <option value="information">Demande d'informations</option>
                  <option value="admission">Admission / Inscription</option>
                  <option value="pedagogie">Questions pédagogiques</option>
                  <option value="finance">Questions financières</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message <span className="req">*</span></label>
                <textarea className="form-control" rows={5} placeholder="Écrivez votre message ici..." required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                <Send size={18} /> Envoyer le message
              </button>
            </form>
          </div>

          {/* Informations */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a5f', marginBottom: '8px' }}>Nos coordonnées</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Vous pouvez aussi nous joindre directement.</p>

            {/* Direction Générale */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4a623', flexShrink: 0 }}>
                    <Globe size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>Direction Générale</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>LE GUIDE DE NOS ENFANTS</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <MapPin size={14} style={{ color: '#1e3a5f', flexShrink: 0 }} /> 100 Boulevard Triomphal, Libreville, Gabon
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <Phone size={14} style={{ color: '#1e3a5f', flexShrink: 0 }} /> +241 01 76 78 90
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <Mail size={14} style={{ color: '#1e3a5f', flexShrink: 0 }} /> contact@leguide.ga
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <Clock size={14} style={{ color: '#1e3a5f', flexShrink: 0 }} /> Lun - Ven : 07h30 — 17h00
                  </div>
                </div>
              </div>
            </div>

            {/* Établissements */}
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#2c3e50', marginBottom: '12px', marginTop: '24px' }}>Nos établissements</h3>
            {etablissements.map(etab => (
              <div key={etab.id} className="card" style={{ marginBottom: '10px' }}>
                <div className="card-body" style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a5f', flexShrink: 0 }}>
                      <Building2 size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{etab.nom}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{etab.adresse}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
                      <div>{etab.telephone}</div>
                      <div>{etab.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="card" style={{ marginTop: '16px', overflow: 'hidden' }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #e8f0fe, #dbeafe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px'
              }}>
                <MapPin size={32} color="#1e3a5f" />
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a5f' }}>Libreville & Port-Gentil, Gabon</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>4 établissements à votre service</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
