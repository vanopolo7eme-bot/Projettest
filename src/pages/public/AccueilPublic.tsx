import React from 'react';
import { Link } from 'react-router-dom';
import { etablissements, actualites } from '../../data/mockData';
import { ChevronRight, GraduationCap, Users, BookOpen, Shield, Award, Globe, Star, ArrowRight } from 'lucide-react';

export default function AccueilPublic() {
  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="public-hero">
        <div className="public-hero-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(244,166,35,0.2), rgba(244,166,35,0.1))', padding: '7px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: 700, color: '#f4a623', border: '1px solid rgba(244,166,35,0.2)', backdropFilter: 'blur(4px)' }}>
            📚 Inscriptions 2026-2027 ouvertes
          </div>
          <h1>L'Excellence Éducative<br />pour l'Avenir de vos Enfants</h1>
          <p>
            LE GUIDE DE NOS ENFANTS est un groupe scolaire d'excellence composé de 3 écoles primaires et 1 lycée, 
            formant plus de 3 000 élèves avec des valeurs d'intégrité, de travail et d'ouverture sur le monde.
          </p>
          <div style={{ display: 'flex', gap: '14px' }}>
            <Link to="/preinscription" className="btn btn-gold btn-lg">
              Pré-inscrire mon enfant <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
              Espace parents
            </Link>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section style={{ background: 'white', padding: '48px 80px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', maxWidth: '1280px', margin: '0 auto' }}>
          {[
            { value: '3 000+', label: 'Élèves', icon: <GraduationCap size={28} />, color: '#1e3a5f', bg: '#e8f0fe' },
            { value: '4', label: 'Établissements', icon: <Globe size={28} />, color: '#3b82f6', bg: '#dbeafe' },
            { value: '150+', label: 'Enseignants', icon: <Users size={28} />, color: '#10b981', bg: '#d1fae5' },
            { value: '98%', label: 'Taux de réussite', icon: <Award size={28} />, color: '#f4a623', bg: '#fef3c7' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '28px 20px', borderRadius: '16px', transition: 'all 0.3s ease', cursor: 'default' }}>
              <div style={{ width: '64px', height: '64px', background: stat.bg, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: stat.color, transition: 'transform 0.3s ease' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: stat.color, letterSpacing: '-1px', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Nos Établissements */}
      <section className="public-section">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1e3a5f', marginBottom: '8px' }}>Nos Établissements</h2>
          <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Quatre établissements d'excellence répartis sur deux villes
          </p>
        </div>
        <div className="grid-2">
          {etablissements.map(etab => (
            <div key={etab.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <div style={{ height: '120px', background: `linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 900, opacity: 0.3 }}>{etab.type === 'Primaire' ? '🏫' : '🎓'}</div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{etab.nom}</div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                  <div><div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a5f' }}>{etab.effectif}</div><div style={{ fontSize: '11px', color: '#6b7280' }}>Élèves</div></div>
                  <div><div style={{ fontSize: '20px', fontWeight: 800, color: '#3498db' }}>{etab.niveaux.length}</div><div style={{ fontSize: '11px', color: '#6b7280' }}>Niveaux</div></div>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>{etab.adresse}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {etab.niveaux.map(n => <span key={n} className="badge badge-secondary" style={{ fontSize: '10px' }}>{n}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Valeurs */}
      <section style={{ background: '#f8fafc', padding: '72px 80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '34px', fontWeight: 900, color: '#1e3a5f', marginBottom: '10px', letterSpacing: '-0.5px' }}>Nos Valeurs</h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Les piliers de notre engagement éducatif</p>
          </div>
          <div className="grid-3">
            {[
              { icon: <Star size={26} />, titre: 'Excellence', desc: 'Nous visons l\'excellence dans tous les aspects de l\'éducation de vos enfants.', gradient: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)' },
              { icon: <Shield size={26} />, titre: 'Intégrité', desc: 'Des valeurs morales solides transmises au quotidien à travers notre enseignement.', gradient: 'linear-gradient(135deg, #0f2137, #1e3a5f)' },
              { icon: <BookOpen size={26} />, titre: 'Innovation', desc: 'Des outils numériques modernes et une pédagogie adaptée au monde de demain.', gradient: 'linear-gradient(135deg, #2d5a8e, #3b82f6)' },
            ].map((val, i) => (
              <div key={i} className="card" style={{ border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)' }}>
                <div className="card-body" style={{ textAlign: 'center', padding: '36px 28px' }}>
                  <div style={{ width: '60px', height: '60px', background: val.gradient, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#f4a623', boxShadow: '0 4px 14px rgba(30,58,95,0.2)' }}>
                    {val.icon}
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '10px', color: '#1a202c' }}>{val.titre}</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.8 }}>{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actualités */}
      <section className="public-section">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1e3a5f', marginBottom: '8px' }}>Actualités</h2>
        </div>
        <div className="grid-2">
          {actualites.map(actu => (
            <div key={actu.id} className="card" style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-gold">{actu.categorie}</span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(actu.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{actu.titre}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>{actu.resume}</p>
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#1e3a5f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Lire la suite <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0f2137 0%, #1e3a5f 50%, #2d5a8e 100%)', padding: '72px 80px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(244,166,35,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '14px', letterSpacing: '-0.5px' }}>Rejoignez LE GUIDE DE NOS ENFANTS</h2>
          <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '28px', maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.7 }}>
            Offrez à vos enfants une éducation d'excellence dans un environnement numérique moderne.
          </p>
          <Link to="/preinscription" className="btn btn-gold btn-lg">
            Pré-inscrire mon enfant <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
