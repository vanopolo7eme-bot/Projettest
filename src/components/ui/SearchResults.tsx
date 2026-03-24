import React from 'react';
import { useNavigate } from 'react-router-dom';
import { eleves, classes, documents, enseignants } from '../../data/mockData';
import { GraduationCap, School, FileText, User, Search as SearchIcon } from 'lucide-react';

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export default function SearchResults({ query, onClose }: SearchResultsProps) {
  const navigate = useNavigate();
  const q = query.toLowerCase().trim();
  if (q.length < 2) return null;

  const matchedEleves = eleves.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(q) || e.matricule.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchedClasses = classes.filter(c =>
    c.nom.toLowerCase().includes(q) || c.niveau.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchedDocs = documents.filter(d =>
    d.nom.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchedEnseignants = enseignants.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(q)
  ).slice(0, 3);

  const totalResults = matchedEleves.length + matchedClasses.length + matchedDocs.length + matchedEnseignants.length;

  if (totalResults === 0) {
    return (
      <div className="search-results-dropdown">
        <div className="search-results-empty">
          <SearchIcon size={24} style={{ opacity: 0.3 }} />
          <p>Aucun résultat pour « {query} »</p>
        </div>
      </div>
    );
  }

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="search-results-dropdown">
      {matchedEleves.length > 0 && (
        <div className="search-results-section">
          <div className="search-results-section-title">
            <GraduationCap size={14} /> Élèves
          </div>
          {matchedEleves.map(e => (
            <div key={e.id} className="search-result-item" onClick={() => handleNav('/erp/eleves')}>
              <div className="avatar avatar-xs" style={{ background: e.sexe === 'M' ? '#dbeafe' : '#fce7f3', color: e.sexe === 'M' ? '#1e3a5f' : '#ec4899', fontSize: '9px' }}>
                {e.prenom[0]}{e.nom[0]}
              </div>
              <div>
                <div className="search-result-name">{e.prenom} {e.nom}</div>
                <div className="search-result-detail">{e.matricule} • {e.classe}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {matchedClasses.length > 0 && (
        <div className="search-results-section">
          <div className="search-results-section-title">
            <School size={14} /> Classes
          </div>
          {matchedClasses.map(c => (
            <div key={c.id} className="search-result-item" onClick={() => handleNav('/erp/classes')}>
              <div className="search-result-name">{c.nom}</div>
              <div className="search-result-detail">{c.effectif} élèves • {c.professeurPrincipal}</div>
            </div>
          ))}
        </div>
      )}

      {matchedEnseignants.length > 0 && (
        <div className="search-results-section">
          <div className="search-results-section-title">
            <User size={14} /> Personnel
          </div>
          {matchedEnseignants.map(e => (
            <div key={e.id} className="search-result-item" onClick={() => handleNav('/erp/personnel')}>
              <div className="search-result-name">{e.prenom} {e.nom}</div>
              <div className="search-result-detail">{e.specialite} • {e.contrat}</div>
            </div>
          ))}
        </div>
      )}

      {matchedDocs.length > 0 && (
        <div className="search-results-section">
          <div className="search-results-section-title">
            <FileText size={14} /> Documents
          </div>
          {matchedDocs.map(d => (
            <div key={d.id} className="search-result-item" onClick={() => handleNav('/ged')}>
              <div className="search-result-name">{d.nom}</div>
              <div className="search-result-detail">{d.categorie} • {d.taille}</div>
            </div>
          ))}
        </div>
      )}

      <div className="search-results-footer">
        {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
      </div>
    </div>
  );
}
