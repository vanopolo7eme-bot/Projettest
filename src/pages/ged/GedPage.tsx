import React, { useState } from 'react';
import { documents } from '../../data/mockData';
import { FolderOpen, File, FileText, FileSpreadsheet, Image, Search, Upload, Download, ChevronRight, Folder } from 'lucide-react';

const dossiers = [
  { nom: 'Administratif', icon: '📂', count: 3, taille: '7.3 MB' },
  { nom: 'Pédagogique', icon: '📚', count: 3, taille: '6.5 MB', children: ['Primaire', 'Lycée'] },
  { nom: 'Financier', icon: '💰', count: 2, taille: '1.5 MB' },
  { nom: 'RH', icon: '👥', count: 1, taille: '900 KB' },
  { nom: 'Communication', icon: '📢', count: 1, taille: '15 MB' },
];

const getDocIcon = (type) => {
  switch (type) {
    case 'PDF': return <div className="doc-icon pdf"><FileText size={20} /></div>;
    case 'Word': return <div className="doc-icon word"><File size={20} /></div>;
    case 'Excel': return <div className="doc-icon excel"><FileSpreadsheet size={20} /></div>;
    case 'Image': return <div className="doc-icon image"><Image size={20} /></div>;
    default: return <div className="doc-icon default"><File size={20} /></div>;
  }
};

export default function GedPage() {
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [search, setSearch] = useState('');

  const filteredDocs = documents.filter(d => {
    if (selectedDossier && !d.dossier.includes(selectedDossier)) return false;
    if (search && !d.nom.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Gestion</span><span className="breadcrumb-sep">/</span><span>Documents</span></div>
          <h1 className="page-title">Gestion Documentaire (GED)</h1>
          <p className="page-subtitle">Archivage numérique — Groupe LE GUIDE DE NOS ENFANTS</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary"><Upload size={16} /> Importer un document</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
        {/* Arborescence */}
        <div className="card">
          <div className="card-header"><div className="card-title">📁 Arborescence</div></div>
          <div className="card-body" style={{ padding: '8px' }}>
            <div
              className={`sidebar-nav-item ${!selectedDossier ? 'active' : ''}`}
              style={{ color: '#2c3e50', borderLeft: 'none', borderRadius: '6px' }}
              onClick={() => setSelectedDossier(null)}
            >
              <FolderOpen size={16} /> <span>Tous les documents</span>
            </div>
            {dossiers.map(d => (
              <div key={d.nom}>
                <div
                  className={`sidebar-nav-item ${selectedDossier === d.nom ? 'active' : ''}`}
                  style={{ color: '#2c3e50', borderLeft: 'none', borderRadius: '6px' }}
                  onClick={() => setSelectedDossier(d.nom)}
                >
                  <span>{d.icon}</span>
                  <span style={{ flex: 1 }}>{d.nom}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>{d.count}</span>
                </div>
                {d.children && selectedDossier === d.nom && d.children.map(child => (
                  <div key={child} className="sidebar-nav-item" style={{ paddingLeft: '36px', color: '#6b7280', borderLeft: 'none', borderRadius: '6px', fontSize: '12px' }}>
                    <Folder size={14} /> <span>{child}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div>
          <div className="filter-bar mb-16">
            <div className="search-input-wrap">
              <Search size={16} />
              <input className="search-input" placeholder="Rechercher un document..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="badge badge-secondary" style={{ padding: '6px 12px' }}>{filteredDocs.length} document{filteredDocs.length > 1 ? 's' : ''}</span>
          </div>

          {selectedDossier && (
            <div className="breadcrumb mb-16">
              <span style={{ cursor: 'pointer' }} onClick={() => setSelectedDossier(null)}>Documents</span>
              <ChevronRight size={14} />
              <span style={{ fontWeight: 600 }}>{selectedDossier}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredDocs.map(doc => (
              <div key={doc.id} className="doc-item">
                {getDocIcon(doc.type)}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{doc.nom}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{doc.categorie} • {doc.taille} • {new Date(doc.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <span className={`badge ${doc.type === 'PDF' ? 'badge-danger' : doc.type === 'Word' ? 'badge-info' : doc.type === 'Excel' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '10px' }}>{doc.type}</span>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{doc.auteur}</div>
                <button className="btn btn-ghost btn-icon" title="Télécharger"><Download size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
