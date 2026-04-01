import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { etablissements } from '../../data/mockData';
import { MapPin, Phone, Mail, Users, GraduationCap, Award, ChevronLeft, ChevronRight, Building2, Image, Map } from 'lucide-react';

export default function EtablissementDetailPage() {
  const { id } = useParams();
  const etab = etablissements.find(e => e.id === Number(id));

  if (!etab) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a5f', marginBottom: '12px' }}>Établissement introuvable</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>L'établissement demandé n'existe pas ou a été supprimé.</p>
        <Link to="/nos-etablissements" className="btn btn-primary">
          <ChevronLeft size={16} /> Retour aux établissements
        </Link>
      </div>
    );
  }

  const tauxRemplissage = Math.round((etab.effectif / etab.capacite) * 100);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)`,
        color: 'white',
        padding: '80px 80px 60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link to="/nos-etablissements" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
            <ChevronLeft size={16} /> Nos établissements
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              {etab.type === 'Primaire' ? '🏫' : '🎓'}
            </div>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1.15 }}>{etab.nom}</h1>
              <p style={{ fontSize: '15px', opacity: 0.8, marginTop: '4px' }}>{etab.type} — {etab.adresse}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section style={{ background: 'white', padding: '40px 80px', borderBottom: '1px solid #e0e6ed' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', maxWidth: '1280px', margin: '0 auto' }}>
          {[
            { value: etab.effectif.toLocaleString('fr-FR'), label: 'Élèves inscrits', color: '#1e3a5f', icon: <Users size={22} /> },
            { value: etab.capacite.toLocaleString('fr-FR'), label: 'Capacité totale', color: '#3498db', icon: <Building2 size={22} /> },
            { value: `${tauxRemplissage}%`, label: 'Taux de remplissage', color: tauxRemplissage > 90 ? '#e74c3c' : '#27ae60', icon: <GraduationCap size={22} /> },
            { value: etab.niveaux.length, label: 'Niveaux proposés', color: '#f4a623', icon: <Award size={22} /> },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: stat.color }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: stat.color, marginBottom: '2px' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Colonne principale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Présentation détaillée */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Présentation</div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>
                  {etab.type === 'Primaire'
                    ? `${etab.nom} est un établissement d'enseignement primaire du groupe LE GUIDE DE NOS ENFANTS, situé à ${etab.adresse}. Notre école offre un cadre d'apprentissage chaleureux et structuré pour les enfants du CP au CM2, avec une pédagogie adaptée et un suivi personnalisé de chaque élève. Notre équipe pédagogique qualifiée met en oeuvre des méthodes d'enseignement modernes tout en respectant les programmes officiels gabonais.`
                    : `${etab.nom} est l'établissement secondaire phare du groupe LE GUIDE DE NOS ENFANTS, situé à ${etab.adresse}. Notre lycée d'excellence prépare les élèves de la 6ème à la Terminale aux défis académiques et professionnels, avec des résultats exceptionnels aux examens nationaux. Nous proposons un encadrement rigoureux, des infrastructures modernes et un accompagnement personnalisé vers la réussite.`
                  }
                </p>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.8 }}>
                  L'établissement accueille actuellement {etab.effectif} élèves pour une capacité de {etab.capacite} places, soit un taux de remplissage de {tauxRemplissage}%. Nous nous engageons à offrir un environnement propice à l'épanouissement et à la réussite scolaire de chaque enfant.
                </p>
              </div>
            </div>

            {/* Programmes par niveau */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Programmes par niveau</div>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                  {etab.niveaux.map(niveau => (
                    <div key={niveau} style={{
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e0e6ed',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>
                        {['CP', 'CE1', 'CE2'].includes(niveau) ? '📘' : ['CM1', 'CM2'].includes(niveau) ? '📗' : ['6ème', '5ème', '4ème', '3ème'].includes(niveau) ? '📙' : '📕'}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a5f' }}>{niveau}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {['CP', 'CE1', 'CE2'].includes(niveau) ? 'Cycle 2' : ['CM1', 'CM2'].includes(niveau) ? 'Cycle 3' : ['6ème', '5ème', '4ème', '3ème'].includes(niveau) ? 'Collège' : 'Lycée'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Galerie placeholder */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Galerie photos</div>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{
                      aspectRatio: '4/3',
                      background: 'linear-gradient(135deg, #f0f4f8 0%, #e0e6ed 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      border: '1px dashed #d1d5db'
                    }}>
                      <Image size={24} />
                      <div style={{ fontSize: '11px', marginTop: '6px' }}>Photo {i}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Équipe de direction */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Direction</div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#1e3a5f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {etab.directeur.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e3a5f' }}>{etab.directeur}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Directeur{etab.directeur.startsWith('Marie') || etab.directeur.startsWith('Sylvie') ? 'rice' : ''} d'établissement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Contacts</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a5f', flexShrink: 0 }}>
                    <MapPin size={16} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#374151' }}>{etab.adresse}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#d4edda', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#27ae60', flexShrink: 0 }}>
                    <Phone size={16} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#374151' }}>{etab.telephone}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4a623', flexShrink: 0 }}>
                    <Mail size={16} />
                  </div>
                  <div style={{ fontSize: '13px', color: '#374151' }}>{etab.email}</div>
                </div>
              </div>
            </div>

            {/* Carte placeholder */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Localisation</div>
              </div>
              <div className="card-body">
                <div style={{
                  height: '200px',
                  background: 'linear-gradient(135deg, #f0f4f8 0%, #e0e6ed 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  border: '1px dashed #d1d5db'
                }}>
                  <Map size={32} />
                  <div style={{ fontSize: '13px', marginTop: '8px', fontWeight: 600 }}>Carte interactive</div>
                  <div style={{ fontSize: '11px', marginTop: '2px' }}>{etab.adresse}</div>
                </div>
              </div>
            </div>

            {/* CTA Inscription */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', color: 'white' }}>
              <div className="card-body" style={{ textAlign: 'center', padding: '28px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Intéressé ?</h3>
                <p style={{ fontSize: '13px', opacity: 0.85, marginBottom: '16px' }}>Pré-inscrivez votre enfant dès maintenant.</p>
                <Link to="/preinscription" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                  Pré-inscription <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
