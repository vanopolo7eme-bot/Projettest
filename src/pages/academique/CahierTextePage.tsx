import React, { useState, useMemo } from 'react';
import { cahierTexte, classes, matieres, eleves } from '../../data/mockData';
import { BookOpen, Calendar, FileText, Clock, Plus, Link, Video, File, Filter, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';

type OngletType = 'cours' | 'ressources';
type CategorieRessource = 'Tous' | 'Cours' | 'Exercices' | 'Videos' | 'Liens';

interface Ressource {
  id: number;
  nom: string;
  type: 'PDF' | 'Video' | 'Lien' | 'Word';
  matiere: string;
  categorie: 'Cours' | 'Exercices' | 'Videos' | 'Liens';
  date: string;
  auteur: string;
}

const mockRessources: Ressource[] = [
  { id: 1, nom: 'Cours complet - Integrales', type: 'PDF', matiere: 'Mathematiques', categorie: 'Cours', date: '2026-03-15', auteur: 'Dr. Nziengui' },
  { id: 2, nom: 'Exercices corriges - Derivees', type: 'PDF', matiere: 'Mathematiques', categorie: 'Exercices', date: '2026-03-12', auteur: 'Dr. Nziengui' },
  { id: 3, nom: 'Video - Radioactivite expliquee', type: 'Video', matiere: 'Physique-Chimie', categorie: 'Videos', date: '2026-03-10', auteur: 'M. Boussougou' },
  { id: 4, nom: 'Fiche de revision - Decolonisation', type: 'PDF', matiere: 'Histoire-Geographie', categorie: 'Cours', date: '2026-03-08', auteur: 'M. Mboumba' },
  { id: 5, nom: 'Lien - Dictionnaire en ligne', type: 'Lien', matiere: 'Francais', categorie: 'Liens', date: '2026-03-05', auteur: 'Mme Moussavou' },
];

const periodes = [
  { id: 'toutes', label: 'Toutes les periodes' },
  { id: 'semaine', label: 'Cette semaine' },
  { id: 'mois', label: 'Ce mois' },
  { id: 't1', label: 'Trimestre 1' },
  { id: 't2', label: 'Trimestre 2' },
];

function getStatutDevoir(dateRemise: string): 'rendu' | 'a-rendre' | 'en-retard' {
  const now = new Date('2026-03-31');
  const remise = new Date(dateRemise);
  if (remise < now) return 'en-retard';
  const diff = remise.getTime() - now.getTime();
  if (diff < 3 * 24 * 60 * 60 * 1000) return 'a-rendre';
  return 'a-rendre';
}

function getStatutBadge(dateRemise: string, index: number) {
  // For demo: first 2 entries are "Rendu", next is "En retard", rest is "A rendre"
  if (index < 2) {
    return <span className="badge badge-success" style={{ fontSize: '11px' }}><CheckCircle size={11} style={{ marginRight: '3px' }} />Rendu</span>;
  }
  const now = new Date('2026-03-31');
  const remise = new Date(dateRemise);
  if (remise < now) {
    return <span className="badge badge-danger" style={{ fontSize: '11px' }}><AlertTriangle size={11} style={{ marginRight: '3px' }} />En retard</span>;
  }
  return <span className="badge badge-warning" style={{ fontSize: '11px' }}><Clock size={11} style={{ marginRight: '3px' }} />A rendre</span>;
}

function getRessourceIcon(type: string) {
  switch (type) {
    case 'PDF': return <File size={16} style={{ color: '#e74c3c' }} />;
    case 'Word': return <FileText size={16} style={{ color: '#2980b9' }} />;
    case 'Video': return <Video size={16} style={{ color: '#8b5cf6' }} />;
    case 'Lien': return <Link size={16} style={{ color: '#27ae60' }} />;
    default: return <File size={16} />;
  }
}

export default function CahierTextePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isParent = user?.role === 'Parent';

  const [onglet, setOnglet] = useState<OngletType>('cours');
  const [selectedClasse, setSelectedClasse] = useState(8); // Terminale S
  const [selectedMatiere, setSelectedMatiere] = useState(0); // 0 = toutes
  const [selectedPeriode, setSelectedPeriode] = useState('toutes');
  const [categorieRessource, setCategorieRessource] = useState<CategorieRessource>('Tous');

  // Modal pour ajouter une entree
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRessourceModalOpen, setIsRessourceModalOpen] = useState(false);
  const [entries, setEntries] = useState(cahierTexte);
  const [ressources, setRessources] = useState<Ressource[]>(mockRessources);

  const [newEntry, setNewEntry] = useState({
    date: '2026-03-31', matiereId: 1, lecon: '', devoirs: '', dateRemise: ''
  });
  const [newRessource, setNewRessource] = useState({
    nom: '', type: 'PDF' as 'PDF' | 'Video' | 'Lien' | 'Word', matiereId: 1, categorie: 'Cours' as 'Cours' | 'Exercices' | 'Videos' | 'Liens'
  });

  const classeObj = classes.find(c => c.id === selectedClasse);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = [...entries];
    if (selectedMatiere > 0) {
      const mat = matieres.find(m => m.id === selectedMatiere);
      if (mat) result = result.filter(e => e.matiere === mat.nom);
    }
    // Simple period filtering
    if (selectedPeriode === 'semaine') {
      result = result.filter(e => new Date(e.date) >= new Date('2026-03-25'));
    } else if (selectedPeriode === 'mois') {
      result = result.filter(e => new Date(e.date).getMonth() === 2); // mars
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, selectedMatiere, selectedPeriode]);

  // Filter ressources
  const filteredRessources = useMemo(() => {
    let result = [...ressources];
    if (categorieRessource !== 'Tous') {
      result = result.filter(r => r.categorie === categorieRessource);
    }
    if (selectedMatiere > 0) {
      const mat = matieres.find(m => m.id === selectedMatiere);
      if (mat) result = result.filter(r => r.matiere === mat.nom);
    }
    return result;
  }, [ressources, categorieRessource, selectedMatiere]);

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.lecon) {
      showToast('Veuillez saisir le contenu de la lecon.', 'error');
      return;
    }
    const mat = matieres.find(m => m.id === newEntry.matiereId);
    if (!mat) return;

    const created = {
      id: Date.now(),
      date: newEntry.date,
      matiere: mat.nom,
      classe: classeObj?.nom || 'Terminale S',
      enseignant: user ? `${user.prenom} ${user.nom}` : 'Enseignant',
      lecon: newEntry.lecon,
      devoirs: newEntry.devoirs || null,
      dateRemise: newEntry.dateRemise || '2026-04-07'
    };

    setEntries(prev => [created, ...prev]);
    setIsModalOpen(false);
    showToast('Entree ajoutee au cahier de texte.', 'success');
    setNewEntry({ date: '2026-03-31', matiereId: 1, lecon: '', devoirs: '', dateRemise: '' });
  };

  const handleCreateRessource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRessource.nom) {
      showToast('Veuillez saisir le nom de la ressource.', 'error');
      return;
    }
    const mat = matieres.find(m => m.id === newRessource.matiereId);
    if (!mat) return;

    const created: Ressource = {
      id: Date.now(),
      nom: newRessource.nom,
      type: newRessource.type,
      matiere: mat.nom,
      categorie: newRessource.categorie,
      date: '2026-03-31',
      auteur: user ? `${user.prenom} ${user.nom}` : 'Enseignant'
    };

    setRessources(prev => [created, ...prev]);
    setIsRessourceModalOpen(false);
    showToast('Ressource ajoutee avec succes.', 'success');
    setNewRessource({ nom: '', type: 'PDF', matiereId: 1, categorie: 'Cours' });
  };

  // Couleur badge matiere
  const getMatiereBadgeColor = (matiereName: string) => {
    const mat = matieres.find(m => m.nom === matiereName);
    return mat?.couleur || '#6b7280';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Academique</span><span className="breadcrumb-sep">/</span><span>Cahier de texte</span></div>
          <h1 className="page-title">Cahier de Texte</h1>
          <p className="page-subtitle">Lecons dispensees et devoirs -- {classeObj?.nom || 'Terminale S'}</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isParent && onglet === 'cours' && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Ajouter une entree
            </button>
          )}
          {!isParent && onglet === 'ressources' && (
            <button className="btn btn-primary" onClick={() => setIsRessourceModalOpen(true)}>
              <Plus size={16} /> Ajouter une ressource
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={16} style={{ color: '#6b7280' }} />
          <select className="form-select" style={{ width: '180px' }} value={selectedClasse} onChange={e => setSelectedClasse(Number(e.target.value))}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select className="form-select" style={{ width: '200px' }} value={selectedMatiere} onChange={e => setSelectedMatiere(Number(e.target.value))}>
            <option value={0}>Toutes les matieres</option>
            {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
          <select className="form-select" style={{ width: '180px' }} value={selectedPeriode} onChange={e => setSelectedPeriode(e.target.value)}>
            {periodes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: '20px' }}>
        <div className={`tab-item ${onglet === 'cours' ? 'active' : ''}`} onClick={() => setOnglet('cours')}>
          <BookOpen size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
          Cours & Devoirs
          <span className="badge badge-primary" style={{ marginLeft: '6px', fontSize: '11px' }}>{filteredEntries.length}</span>
        </div>
        <div className={`tab-item ${onglet === 'ressources' ? 'active' : ''}`} onClick={() => setOnglet('ressources')}>
          <FileText size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
          Ressources
          <span className="badge badge-primary" style={{ marginLeft: '6px', fontSize: '11px' }}>{filteredRessources.length}</span>
        </div>
      </div>

      {/* Cours & Devoirs tab */}
      {onglet === 'cours' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEntries.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <BookOpen size={48} style={{ color: '#d1d5db', marginBottom: '12px' }} />
                <p style={{ color: '#9ca3af' }}>Aucune entree trouvee pour les filtres selectionnes</p>
              </div>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <div key={entry.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {/* Date column */}
                    <div style={{ width: '64px', textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a5f' }}>
                        {new Date(entry.date).getDate()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>
                        {new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                        {new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: '3px', borderRadius: '3px', background: getMatiereBadgeColor(entry.matiere), minHeight: '80px', alignSelf: 'stretch', flexShrink: 0 }} />

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                          background: getMatiereBadgeColor(entry.matiere) + '18',
                          color: getMatiereBadgeColor(entry.matiere),
                          border: `1px solid ${getMatiereBadgeColor(entry.matiere)}30`
                        }}>
                          {entry.matiere}
                        </span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{entry.enseignant}</span>
                      </div>

                      {/* Lecon */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#2c3e50', marginBottom: '4px' }}>
                          <FileText size={14} /> Lecon
                        </div>
                        <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.6, paddingLeft: '20px' }}>{entry.lecon}</p>
                      </div>

                      {/* Devoirs */}
                      {entry.devoirs && (
                        <div style={{ background: '#fff9e6', border: '1px solid #f4a623', borderRadius: '8px', padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f4a623' }}>
                              <Clock size={14} /> Devoirs -- A rendre le {new Date(entry.dateRemise).toLocaleDateString('fr-FR')}
                            </div>
                            {getStatutBadge(entry.dateRemise, index)}
                          </div>
                          <p style={{ fontSize: '13px', color: '#856404' }}>{entry.devoirs}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ressources tab */}
      {onglet === 'ressources' && (
        <div>
          {/* Category filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {(['Tous', 'Cours', 'Exercices', 'Videos', 'Liens'] as CategorieRessource[]).map(cat => (
              <button
                key={cat}
                className={`btn ${categorieRessource === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '13px', padding: '6px 14px' }}
                onClick={() => setCategorieRessource(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredRessources.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <FileText size={48} style={{ color: '#d1d5db', marginBottom: '12px' }} />
                <p style={{ color: '#9ca3af' }}>Aucune ressource trouvee pour cette categorie</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Nom</th>
                      <th>Matiere</th>
                      <th>Categorie</th>
                      <th>Auteur</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRessources.map(r => (
                      <tr key={r.id}>
                        <td>{getRessourceIcon(r.type)}</td>
                        <td style={{ fontWeight: 600 }}>{r.nom}</td>
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                            background: getMatiereBadgeColor(r.matiere) + '18',
                            color: getMatiereBadgeColor(r.matiere)
                          }}>
                            {r.matiere}
                          </span>
                        </td>
                        <td><span className="badge badge-secondary" style={{ fontSize: '11px' }}>{r.categorie}</span></td>
                        <td style={{ fontSize: '13px', color: '#6b7280' }}>{r.auteur}</td>
                        <td style={{ fontSize: '13px', color: '#6b7280' }}>{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Ajouter une entree */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter une entree au cahier de texte"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" form="add-entry-form" className="btn btn-primary"><Plus size={16} /> Enregistrer</button>
          </div>
        }
      >
        <form id="add-entry-form" onSubmit={handleCreateEntry}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Matiere</label>
              <select className="form-select" value={newEntry.matiereId} onChange={e => setNewEntry({ ...newEntry, matiereId: Number(e.target.value) })}>
                {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contenu du cours</label>
            <textarea className="form-input" rows={3} required value={newEntry.lecon} onChange={e => setNewEntry({ ...newEntry, lecon: e.target.value })} placeholder="Decrivez le contenu du cours..." style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Devoirs (optionnel)</label>
            <textarea className="form-input" rows={2} value={newEntry.devoirs} onChange={e => setNewEntry({ ...newEntry, devoirs: e.target.value })} placeholder="Description du devoir..." style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Date de remise</label>
            <input type="date" className="form-input" value={newEntry.dateRemise} onChange={e => setNewEntry({ ...newEntry, dateRemise: e.target.value })} />
          </div>
        </form>
      </Modal>

      {/* Modal: Ajouter une ressource */}
      <Modal
        isOpen={isRessourceModalOpen}
        onClose={() => setIsRessourceModalOpen(false)}
        title="Ajouter une ressource"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRessourceModalOpen(false)}>Annuler</button>
            <button type="submit" form="add-ressource-form" className="btn btn-primary"><Plus size={16} /> Enregistrer</button>
          </div>
        }
      >
        <form id="add-ressource-form" onSubmit={handleCreateRessource}>
          <div className="form-group">
            <label className="form-label">Nom de la ressource</label>
            <input type="text" className="form-input" required value={newRessource.nom} onChange={e => setNewRessource({ ...newRessource, nom: e.target.value })} placeholder="Ex: Cours complet - Chapitre 5" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type de fichier</label>
              <select className="form-select" value={newRessource.type} onChange={e => setNewRessource({ ...newRessource, type: e.target.value as any })}>
                <option value="PDF">PDF</option>
                <option value="Video">Video</option>
                <option value="Lien">Lien</option>
                <option value="Word">Word</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Categorie</label>
              <select className="form-select" value={newRessource.categorie} onChange={e => setNewRessource({ ...newRessource, categorie: e.target.value as any })}>
                <option value="Cours">Cours</option>
                <option value="Exercices">Exercices</option>
                <option value="Videos">Videos</option>
                <option value="Liens">Liens</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Matiere</label>
            <select className="form-select" value={newRessource.matiereId} onChange={e => setNewRessource({ ...newRessource, matiereId: Number(e.target.value) })}>
              {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
