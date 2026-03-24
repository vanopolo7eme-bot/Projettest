import React from 'react';
import { etablissements } from '../../data/mockData';
import { MapPin, Phone, Mail, Users, GraduationCap, Calendar, Award, ChevronRight, Building2 } from 'lucide-react';

export default function NosEtablissementsPage() {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 50%, #1e3a5f 100%)', color: 'white', padding: '80px 80px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(244,166,35,0.2)', padding: '6px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#f4a623', marginBottom: '20px' }}>
            <Building2 size={16} /> 4 Établissements d'Excellence
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.15 }}>Nos Établissements</h1>
          <p style={{ fontSize: '17px', opacity: 0.85, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Quatre établissements d'excellence répartis sur Libreville et Port-Gentil, offrant un environnement éducatif
            de qualité du CP à la Terminale.
          </p>
        </div>
      </section>

      {/* Chiffres clés */}
      <section style={{ background: 'white', padding: '40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', maxWidth: '1280px', margin: '0 auto' }}>
          {[
            { value: etablissements.reduce((s, e) => s + e.effectif, 0).toLocaleString('fr-FR'), label: 'Élèves inscrits', color: '#1e3a5f' },
            { value: '4', label: 'Établissements', color: '#3498db' },
            { value: '150+', label: 'Enseignants qualifiés', color: '#27ae60' },
            { value: '98%', label: 'Taux de réussite', color: '#f4a623' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Établissements */}
      <section className="public-section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {etablissements.map((etab, i) => (
            <div key={etab.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: i % 2 === 0 ? '380px 1fr' : '1fr 380px' }}>
                {/* Image / Visual */}
                {(i % 2 === 0 || i % 2 !== 0) && (
                  <div style={{
                    background: `linear-gradient(135deg, ${i % 2 === 0 ? '#1e3a5f' : '#2d5a8e'} 0%, ${i % 2 === 0 ? '#2d5a8e' : '#1e3a5f'} 100%)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '40px',
                    order: i % 2 === 0 ? 0 : 1,
                    position: 'relative', overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5, position: 'relative', zIndex: 1 }}>
                      {etab.type === 'Primaire' ? '🏫' : '🎓'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', position: 'relative', zIndex: 1 }}>{etab.nom}</div>
                    <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px', position: 'relative', zIndex: 1 }}>{etab.type}</div>
                  </div>
                )}

                {/* Info */}
                <div style={{ padding: '32px', order: i % 2 === 0 ? 1 : 0 }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a5f', marginBottom: '6px' }}>{etab.nom}</h2>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                    {etab.type === 'Primaire'
                      ? `Notre école primaire offre un cadre d'apprentissage chaleureux et structuré pour les enfants du CP au CM2, avec une pédagogie adaptée et un suivi personnalisé.`
                      : `Notre lycée d'excellence prépare les élèves de la 6ème à la Terminale aux défis académiques et professionnels, avec des résultats exceptionnels aux examens nationaux.`
                    }
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a5f', flexShrink: 0 }}>
                        <Users size={18} />
                      </div>
                      <div><div style={{ fontWeight: 700, fontSize: '16px' }}>{etab.effectif}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Élèves</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#d4edda', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#27ae60', flexShrink: 0 }}>
                        <GraduationCap size={18} />
                      </div>
                      <div><div style={{ fontWeight: 700, fontSize: '16px' }}>{etab.niveaux.length}</div><div style={{ fontSize: '11px', color: '#9ca3af' }}>Niveaux</div></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {etab.niveaux.map(n => <span key={n} className="badge badge-primary" style={{ fontSize: '11px' }}>{n}</span>)}
                  </div>

                  <div style={{ borderTop: '1px solid #e0e6ed', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <MapPin size={14} style={{ color: '#1e3a5f', flexShrink: 0 }} /> {etab.adresse}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <Phone size={14} style={{ color: '#1e3a5f', flexShrink: 0 }} /> {etab.telephone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <Mail size={14} style={{ color: '#1e3a5f', flexShrink: 0 }} /> {etab.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <Award size={14} style={{ color: '#1e3a5f', flexShrink: 0 }} /> Directeur : {etab.directeur}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', padding: '56px 80px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>Intéressé par nos établissements ?</h2>
        <p style={{ fontSize: '16px', opacity: 0.85, marginBottom: '24px' }}>Pré-inscrivez votre enfant en ligne dès maintenant.</p>
        <a href="/preinscription" className="btn btn-gold btn-lg">
          Pré-inscription en ligne <ChevronRight size={18} />
        </a>
      </section>
    </div>
  );
}
