import React, { useState } from 'react';
import { actualites } from '../../data/mockData';
import { Calendar, Tag, ChevronRight, Search, Clock, Building2 } from 'lucide-react';

const allActualites = [
  ...actualites.map((a, i) => ({ ...a, etablissement: ['Les Palmiers', 'Les Cocotiers', 'Les Frangipaniers', 'Le Guide'][i % 4] })),
  { id: 5, titre: 'Compétition inter-écoles de mathématiques', resume: 'Nos élèves ont brillé lors de la compétition inter-écoles avec 3 médailles d\'or et 5 médailles d\'argent.', date: '2026-02-25', image: null, categorie: 'Académique', etablissement: 'Les Palmiers' },
  { id: 6, titre: 'Cérémonie de remise des prix du 1er trimestre', resume: 'Les meilleurs élèves de chaque établissement ont été récompensés lors d\'une cérémonie solennelle.', date: '2026-02-20', image: null, categorie: 'Événement', etablissement: 'Les Cocotiers' },
  { id: 7, titre: 'Lancement du programme de mentorat numérique', resume: 'Un nouveau programme de mentorat digital connecte nos élèves avec des professionnels de la tech.', date: '2026-02-15', image: null, categorie: 'Partenariat', etablissement: 'Le Guide' },
  { id: 8, titre: 'Semaine de la science dans nos écoles', resume: 'Du 10 au 14 février, nos établissements ont accueilli des ateliers scientifiques pour éveiller la curiosité de nos élèves.', date: '2026-02-10', image: null, categorie: 'Académique', etablissement: 'Les Frangipaniers' },
];

const categories = ['Toutes', 'Événement', 'Académique', 'Partenariat', 'Admissions'];
const etablissementsList = ['Tous', 'Les Palmiers', 'Les Cocotiers', 'Les Frangipaniers', 'Le Guide'];

export default function ActualitesPage() {
  const [selectedCat, setSelectedCat] = useState('Toutes');
  const [selectedEtab, setSelectedEtab] = useState('Tous');
  const [search, setSearch] = useState('');

  const filtered = allActualites.filter(a => {
    if (selectedCat !== 'Toutes' && a.categorie !== selectedCat) return false;
    if (selectedEtab !== 'Tous' && a.etablissement !== selectedEtab) return false;
    if (search && !a.titre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const featured = allActualites[0];

  return (
    <div className="fade-in">
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', color: 'white', padding: '80px 80px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 75% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '12px' }}>Actualités & Événements</h1>
          <p style={{ fontSize: '17px', opacity: 0.85, maxWidth: '550px', margin: '0 auto' }}>
            Restez informés de la vie de nos établissements et des dernières nouvelles du groupe.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      <section className="public-section" style={{ paddingBottom: '32px' }}>
        <div className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #3498db)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'white' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📰</div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '12px', padding: '4px 12px' }}>À la une</span>
              </div>
            </div>
            <div style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span className="badge badge-gold">{featured.categorie}</span>
                <span style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {new Date(featured.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a5f', marginBottom: '12px', lineHeight: 1.3 }}>{featured.titre}</h2>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.7, marginBottom: '20px' }}>{featured.resume}</p>
              <span style={{ fontSize: '14px', color: '#1e3a5f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Lire l'article complet <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="public-section" style={{ paddingTop: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat} className={`btn btn-sm ${selectedCat === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCat(cat)}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Building2 size={16} style={{ color: '#64748b' }} />
              {etablissementsList.map(etab => (
                <button key={etab} className={`btn btn-sm ${selectedEtab === etab ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedEtab(etab)}>
                  {etab}
                </button>
              ))}
            </div>
          </div>
          <div className="search-input-wrap">
            <Search size={16} />
            <input className="search-input" placeholder="Rechercher une actualité..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid-3">
          {filtered.slice(1).map(actu => (
            <div key={actu.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <div style={{ height: '140px', background: `linear-gradient(135deg, ${actu.categorie === 'Événement' ? '#f4a623, #e65100' : actu.categorie === 'Académique' ? '#1e3a5f, #3498db' : actu.categorie === 'Partenariat' ? '#27ae60, #2ecc71' : '#7c3aed, #9b59b6'})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '40px', opacity: 0.6 }}>
                  {actu.categorie === 'Événement' ? '🎉' : actu.categorie === 'Académique' ? '📚' : actu.categorie === 'Partenariat' ? '🤝' : '📋'}
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-gold" style={{ fontSize: '10px' }}>{actu.categorie}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} /> {new Date(actu.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.4, color: '#2c3e50' }}>{actu.titre}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginBottom: '12px' }}>{actu.resume}</p>
                <span style={{ fontSize: '13px', color: '#1e3a5f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Lire la suite <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
