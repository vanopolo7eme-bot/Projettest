import React, { useState, useMemo } from 'react';
import { documents, etablissements } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import StatCard from '../../components/ui/StatCard';
import {
  FolderOpen, Folder, FileText, File, FileSpreadsheet, Image,
  Search, Upload, Download, Share2, Trash2, Eye, ChevronRight,
  ChevronDown, HardDrive, Clock, Archive, FolderPlus, Filter,
  UploadCloud, X, Shield, Users, Calendar, History, Lock
} from 'lucide-react';

// ─── Types & constantes ────────────────────────────────────────

type DocCategorie = 'Administratif' | 'Pédagogique' | 'Financier' | 'RH' | 'Communication' | 'Réglementaire';
type DocType = 'PDF' | 'Word' | 'Excel' | 'Image';

const CATEGORIES: DocCategorie[] = ['Administratif', 'Pédagogique', 'Financier', 'RH', 'Communication', 'Réglementaire'];
const ANNEES_SCOLAIRES = ['2025-2026', '2024-2025', '2023-2024'];
const FORMATS_ACCEPTES = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
const TAILLE_MAX_MB = 10;

const categorieIcons: Record<string, React.ReactNode> = {
  'Administratif': <FileText size={15} />,
  'Pédagogique': <File size={15} />,
  'Financier': <FileSpreadsheet size={15} />,
  'RH': <Users size={15} />,
  'Communication': <Share2 size={15} />,
  'Réglementaire': <Shield size={15} />,
};

const typeBadge: Record<string, { cls: string; color: string }> = {
  'PDF': { cls: 'badge-danger', color: '#e74c3c' },
  'Word': { cls: 'badge-info', color: '#3498db' },
  'Excel': { cls: 'badge-success', color: '#27ae60' },
  'Image': { cls: 'badge-warning', color: '#f39c12' },
};

// ─── Données simulées enrichies ────────────────────────────────

const versionsSimulees = [
  { version: 'v3 (actuelle)', date: '2026-03-15', auteur: 'Direction Générale', taille: '2.4 MB', commentaire: 'Mise à jour clauses disciplinaires' },
  { version: 'v2', date: '2025-11-20', auteur: 'Direction Générale', taille: '2.1 MB', commentaire: 'Ajout annexe restauration' },
  { version: 'v1', date: '2025-08-15', auteur: 'Direction Générale', taille: '1.8 MB', commentaire: 'Version initiale' },
];

const journalAccesSimule = [
  { utilisateur: 'Jean-Marie Directeur Général', action: 'Consultation', date: '2026-03-28 14:32' },
  { utilisateur: 'Marie Directrice (Palmiers)', action: 'Téléchargement', date: '2026-03-27 09:15' },
  { utilisateur: 'Marie Essono', action: 'Consultation', date: '2026-03-25 16:45' },
  { utilisateur: 'Patrick Obame (Parent)', action: 'Consultation (lien partagé)', date: '2026-03-24 20:10' },
  { utilisateur: 'Système Admin', action: 'Indexation automatique', date: '2026-03-20 02:00' },
];

// ─── Helpers ───────────────────────────────────────────────────

function getDocIcon(type: string, size = 18) {
  switch (type) {
    case 'PDF': return <FileText size={size} style={{ color: '#e74c3c' }} />;
    case 'Word': return <File size={size} style={{ color: '#3498db' }} />;
    case 'Excel': return <FileSpreadsheet size={size} style={{ color: '#27ae60' }} />;
    case 'Image': return <Image size={size} style={{ color: '#f39c12' }} />;
    default: return <File size={size} style={{ color: '#6b7280' }} />;
  }
}

function parseTailleMB(taille: string): number {
  if (taille.includes('MB')) return parseFloat(taille);
  if (taille.includes('KB')) return parseFloat(taille) / 1024;
  return 0;
}

// ─── Composant arborescence ────────────────────────────────────

interface TreeNodeProps {
  label: string;
  icon?: React.ReactNode;
  count: number;
  depth: number;
  isSelected: boolean;
  isOpen: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

function TreeNode({ label, icon, count, depth, isSelected, isOpen, hasChildren, onToggle, onSelect }: TreeNodeProps) {
  return (
    <div
      className={`sidebar-nav-item ${isSelected ? 'active' : ''}`}
      style={{
        paddingLeft: `${12 + depth * 18}px`,
        color: '#2c3e50',
        borderLeft: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: depth > 1 ? '12.5px' : '13px',
      }}
      onClick={() => { onSelect(); if (hasChildren) onToggle(); }}
    >
      {hasChildren ? (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      ) : (
        <span style={{ width: 14, flexShrink: 0 }} />
      )}
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {icon || (isOpen ? <FolderOpen size={15} /> : <Folder size={15} />)}
      </span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, background: '#f3f4f6', borderRadius: '10px', padding: '1px 7px' }}>{count}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function GedPage() {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();

  // ─── State ─────────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({ root: true });
  const [showUpload, setShowUpload] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    nom: '',
    categorie: '' as string,
    etablissementId: '' as string,
    description: '',
    type: 'PDF' as string,
  });

  // Local docs state (pour simuler ajout/suppression)
  const [localDocs, setLocalDocs] = useState(documents);

  // ─── Droits d'accès ────────────────────────────────────
  const canManage = hasPermission('manage_documents');
  const isEnseignant = user?.role === 'Enseignant';
  const isDirecteur = user?.role === "Directeur d'Établissement";
  const isDG = user?.role === 'Direction Générale';

  // Filtrer docs selon le rôle
  const accessibleDocs = useMemo(() => {
    return localDocs.filter(doc => {
      if (isDG) return true;
      if (isDirecteur && user?.etablissementId) {
        return doc.etablissementId === null || doc.etablissementId === user.etablissementId;
      }
      if (isEnseignant) {
        return doc.categorie === 'Pédagogique' || doc.categorie === 'Communication';
      }
      return true; // Admin scolaire, etc.
    });
  }, [localDocs, user, isDG, isDirecteur, isEnseignant]);

  // ─── Filtrage par arborescence + recherche + type ──────
  const filteredDocs = useMemo(() => {
    let docs = accessibleDocs;

    // Filtre arborescence
    if (selectedPath.length > 0) {
      const [, etabName, , categorie] = selectedPath;
      if (categorie) {
        docs = docs.filter(d => d.categorie === categorie);
      }
      if (etabName) {
        const etab = etablissements.find(e => e.nom === etabName);
        if (etab) {
          docs = docs.filter(d => d.etablissementId === etab.id || d.etablissementId === null);
        }
      }
    }

    // Filtre type fichier
    if (filterType) {
      docs = docs.filter(d => d.type === filterType);
    }

    // Recherche full-text
    if (searchText) {
      const s = searchText.toLowerCase();
      docs = docs.filter(d =>
        d.nom.toLowerCase().includes(s) ||
        d.auteur.toLowerCase().includes(s) ||
        d.categorie.toLowerCase().includes(s)
      );
    }

    return docs;
  }, [accessibleDocs, selectedPath, filterType, searchText]);

  // ─── Stats ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalDocs = accessibleDocs.length;
    const stockageMB = accessibleDocs.reduce((sum, d) => sum + parseTailleMB(d.taille), 0);
    const parCategorie = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = accessibleDocs.filter(d => d.categorie === cat).length;
      return acc;
    }, {} as Record<string, number>);
    const derniereModif = accessibleDocs.reduce((latest, d) => d.date > latest ? d.date : latest, '');
    return { totalDocs, stockageMB, parCategorie, derniereModif };
  }, [accessibleDocs]);

  // Compter docs par catégorie pour un établissement
  function countDocs(etabId: number | null, categorie?: string): number {
    return accessibleDocs.filter(d => {
      if (etabId !== null && d.etablissementId !== etabId && d.etablissementId !== null) return false;
      if (categorie && d.categorie !== categorie) return false;
      return true;
    }).length;
  }

  // ─── Toggle arborescence ───────────────────────────────
  function toggleNode(key: string) {
    setOpenNodes(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // ─── Actions ───────────────────────────────────────────
  function handleDelete(doc: any) {
    if (!canManage) {
      showToast('Vous n\'avez pas les droits pour supprimer', 'error');
      return;
    }
    setLocalDocs(prev => prev.filter(d => d.id !== doc.id));
    showToast(`"${doc.nom}" supprimé`, 'success');
  }

  function handleDownload(doc: any) {
    showToast(`Téléchargement de "${doc.nom}" en cours...`, 'info');
  }

  function handleShare(doc: any) {
    showToast(`Lien de partage sécurisé généré pour "${doc.nom}"`, 'success');
  }

  function handleUploadSubmit() {
    if (!uploadForm.nom || !uploadForm.categorie) {
      showToast('Veuillez remplir le nom et la catégorie', 'error');
      return;
    }
    const newDoc = {
      id: Math.max(...localDocs.map(d => d.id)) + 1,
      nom: uploadForm.nom,
      type: uploadForm.type as string,
      categorie: uploadForm.categorie,
      etablissementId: uploadForm.etablissementId ? Number(uploadForm.etablissementId) : null,
      taille: '1.2 MB',
      date: new Date().toISOString().split('T')[0],
      auteur: user ? `${user.prenom} ${user.nom}` : 'Inconnu',
      dossier: `/${uploadForm.categorie}`,
    };
    setLocalDocs(prev => [newDoc, ...prev]);
    setShowUpload(false);
    setUploadForm({ nom: '', categorie: '', etablissementId: '', description: '', type: 'PDF' });
    showToast(`Document "${newDoc.nom}" importé avec succès`, 'success');
  }

  function handleArchiveYear() {
    const count = accessibleDocs.filter(d => d.date < '2025-09-01').length;
    showToast(`${count} document(s) de l'année précédente archivé(s)`, 'success');
    setShowArchive(false);
  }

  // ─── Colonnes DataTable ────────────────────────────────
  const columns = [
    {
      header: 'Document',
      accessor: 'nom',
      render: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {getDocIcon(row.type)}
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>{row.nom}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{row.dossier}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row: any) => {
        const badge = typeBadge[row.type] || { cls: 'badge-secondary', color: '#6b7280' };
        return <span className={`badge ${badge.cls}`} style={{ fontSize: '11px' }}>{row.type}</span>;
      },
    },
    {
      header: 'Catégorie',
      accessor: 'categorie',
      render: (row: any) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
          {categorieIcons[row.categorie]}
          {row.categorie}
        </span>
      ),
    },
    { header: 'Taille', accessor: 'taille' },
    {
      header: 'Date',
      accessor: 'date',
      render: (row: any) => new Date(row.date).toLocaleDateString('fr-FR'),
    },
    { header: 'Auteur', accessor: 'auteur' },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (row: any) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn btn-ghost btn-icon" title="Voir détails" onClick={(e) => { e.stopPropagation(); setShowDetail(row); }}>
            <Eye size={15} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Télécharger" onClick={(e) => { e.stopPropagation(); handleDownload(row); }}>
            <Download size={15} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Partager" onClick={(e) => { e.stopPropagation(); handleShare(row); }}>
            <Share2 size={15} />
          </button>
          {canManage && (
            <button className="btn btn-ghost btn-icon" title="Supprimer" onClick={(e) => { e.stopPropagation(); handleDelete(row); }} style={{ color: '#e74c3c' }}>
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ─── RENDU ─────────────────────────────────────────────

  const topCategories = Object.entries(stats.parCategorie)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  return (
    <div className="fade-in">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Gestion</span>
            <span className="breadcrumb-sep">/</span>
            <span>Documents</span>
          </div>
          <h1 className="page-title">Gestion Documentaire (GED)</h1>
          <p className="page-subtitle">Archivage numérique &mdash; Groupe LE GUIDE DE NOS ENFANTS</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          {canManage && (
            <button className="btn btn-secondary" onClick={() => setShowArchive(true)}>
              <Archive size={16} /> Archiver l'ann&eacute;e
            </button>
          )}
          {canManage && (
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              <Upload size={16} /> Importer un document
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────── */}
      <div className="grid-4 mb-16" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <StatCard
          label="Total documents"
          value={stats.totalDocs}
          icon={<FileText size={22} />}
          color="#3498db"
          trend="up"
          trendValue={`${stats.totalDocs} fichiers`}
        />
        <StatCard
          label="Par catégorie"
          value={topCategories || 'Aucun'}
          icon={<Folder size={22} />}
          color="#27ae60"
        />
        <StatCard
          label="Stockage utilisé"
          value={`${stats.stockageMB.toFixed(1)} MB`}
          icon={<HardDrive size={22} />}
          color="#f39c12"
          trend="up"
          trendValue="sur 500 MB"
        />
        <StatCard
          label="Dernière modification"
          value={stats.derniereModif ? new Date(stats.derniereModif).toLocaleDateString('fr-FR') : '--'}
          icon={<Clock size={22} />}
          color="#8b5cf6"
        />
      </div>

      {/* ── 2 panneaux : Arborescence + Liste ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>

        {/* ── Panneau gauche : Arborescence ────────────── */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderPlus size={16} /> Arborescence
            </div>
          </div>
          <div className="card-body" style={{ padding: '6px' }}>
            {/* Racine : Tous */}
            <TreeNode
              label="Tous les documents"
              icon={<FolderOpen size={15} style={{ color: '#3498db' }} />}
              count={accessibleDocs.length}
              depth={0}
              isSelected={selectedPath.length === 0}
              isOpen={!!openNodes['root']}
              hasChildren={true}
              onToggle={() => toggleNode('root')}
              onSelect={() => setSelectedPath([])}
            />

            {openNodes['root'] && etablissements.map(etab => {
              const etabKey = `etab-${etab.id}`;
              const etabCount = countDocs(etab.id);

              // Respect droits : directeur ne voit que son etab
              if (isDirecteur && user?.etablissementId && etab.id !== user.etablissementId) return null;

              return (
                <React.Fragment key={etab.id}>
                  <TreeNode
                    label={etab.nom}
                    icon={<Folder size={15} style={{ color: '#f39c12' }} />}
                    count={etabCount}
                    depth={1}
                    isSelected={selectedPath[1] === etab.nom && selectedPath.length === 2}
                    isOpen={!!openNodes[etabKey]}
                    hasChildren={true}
                    onToggle={() => toggleNode(etabKey)}
                    onSelect={() => setSelectedPath(['root', etab.nom])}
                  />

                  {openNodes[etabKey] && ANNEES_SCOLAIRES.map(annee => {
                    const anneeKey = `${etabKey}-${annee}`;
                    return (
                      <React.Fragment key={annee}>
                        <TreeNode
                          label={annee}
                          icon={<Calendar size={14} style={{ color: '#8b5cf6' }} />}
                          count={etabCount}
                          depth={2}
                          isSelected={selectedPath[2] === annee && selectedPath[1] === etab.nom && selectedPath.length === 3}
                          isOpen={!!openNodes[anneeKey]}
                          hasChildren={true}
                          onToggle={() => toggleNode(anneeKey)}
                          onSelect={() => setSelectedPath(['root', etab.nom, annee])}
                        />

                        {openNodes[anneeKey] && CATEGORIES.map(cat => {
                          const catCount = countDocs(etab.id, cat);
                          // Enseignant ne voit que Pédagogique
                          if (isEnseignant && cat !== 'Pédagogique' && cat !== 'Communication') return null;

                          return (
                            <TreeNode
                              key={cat}
                              label={cat}
                              icon={categorieIcons[cat]}
                              count={catCount}
                              depth={3}
                              isSelected={selectedPath[3] === cat && selectedPath[1] === etab.nom}
                              isOpen={false}
                              hasChildren={false}
                              onToggle={() => {}}
                              onSelect={() => setSelectedPath(['root', etab.nom, annee, cat])}
                            />
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── Panneau droit : Liste documents ──────────── */}
        <div>
          {/* Breadcrumb de sélection */}
          {selectedPath.length > 0 && (
            <div className="breadcrumb mb-16" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ cursor: 'pointer', color: '#3498db' }} onClick={() => setSelectedPath([])}>Documents</span>
              {selectedPath.slice(1).map((seg, i) => (
                <React.Fragment key={i}>
                  <ChevronRight size={14} style={{ color: '#9ca3af' }} />
                  <span
                    style={{ cursor: 'pointer', fontWeight: i === selectedPath.length - 2 ? 600 : 400 }}
                    onClick={() => setSelectedPath(selectedPath.slice(0, i + 2))}
                  >
                    {seg}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Barre de filtres type */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-input-wrap" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={16} />
              <input
                className="search-input"
                placeholder="Rechercher dans les documents..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Filter size={14} style={{ color: '#6b7280' }} />
              {(['', 'PDF', 'Word', 'Excel', 'Image'] as const).map(t => (
                <button
                  key={t}
                  className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                  onClick={() => setFilterType(t)}
                >
                  {t || 'Tous'}
                </button>
              ))}
            </div>
          </div>

          {/* DataTable */}
          <div className="card">
            <DataTable
              columns={columns}
              data={filteredDocs}
              searchable={false}
              pageSize={8}
              onRowClick={(row: any) => setShowDetail(row)}
            />
          </div>
        </div>
      </div>

      {/* ═══════ MODAL UPLOAD ═══════════════════════════════ */}
      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Importer un document"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowUpload(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleUploadSubmit}>
              <Upload size={16} /> Importer
            </button>
          </div>
        }
      >
        {/* Zone drag & drop */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            showToast('Fichier sélectionné (simulation)', 'info');
            if (!uploadForm.nom) {
              setUploadForm(prev => ({ ...prev, nom: 'Document importé' }));
            }
          }}
          style={{
            border: `2px dashed ${dragOver ? '#3498db' : '#d1d5db'}`,
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            marginBottom: '20px',
            background: dragOver ? '#ebf5fb' : '#f9fafb',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
        >
          <UploadCloud size={40} style={{ color: dragOver ? '#3498db' : '#9ca3af', marginBottom: '8px' }} />
          <div style={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
            Glissez-déposez un fichier ici
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            ou cliquez pour sélectionner &mdash; PDF, Word, Excel, Images &mdash; Max {TAILLE_MAX_MB} MB
          </div>
        </div>

        <div className="divider" />

        {/* Champs du formulaire */}
        <div className="form-group">
          <label>Nom du document *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex: Règlement intérieur 2026"
            value={uploadForm.nom}
            onChange={e => setUploadForm(prev => ({ ...prev, nom: e.target.value }))}
          />
        </div>

        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Catégorie *</label>
            <select
              className="form-control"
              value={uploadForm.categorie}
              onChange={e => setUploadForm(prev => ({ ...prev, categorie: e.target.value }))}
            >
              <option value="">-- Sélectionner --</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Type de fichier</label>
            <select
              className="form-control"
              value={uploadForm.type}
              onChange={e => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="PDF">PDF</option>
              <option value="Word">Word</option>
              <option value="Excel">Excel</option>
              <option value="Image">Image</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Établissement</label>
          <select
            className="form-control"
            value={uploadForm.etablissementId}
            onChange={e => setUploadForm(prev => ({ ...prev, etablissementId: e.target.value }))}
          >
            <option value="">Groupe (tous les établissements)</option>
            {etablissements.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Description optionnelle du document..."
            value={uploadForm.description}
            onChange={e => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={12} />
          Formats acceptés : {FORMATS_ACCEPTES} &mdash; Taille max : {TAILLE_MAX_MB} MB
        </div>
      </Modal>

      {/* ═══════ MODAL DETAIL DOCUMENT ═════════════════════ */}
      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={showDetail ? showDetail.nom : ''}
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => { if (showDetail) handleDownload(showDetail); }}>
              <Download size={16} /> Télécharger
            </button>
            <button className="btn btn-secondary" onClick={() => { if (showDetail) handleShare(showDetail); }}>
              <Share2 size={16} /> Partager avec une famille
            </button>
            {canManage && (
              <button className="btn btn-primary" onClick={() => {
                showToast(`"${showDetail?.nom}" archivé`, 'success');
                setShowDetail(null);
              }}>
                <Archive size={16} /> Archiver
              </button>
            )}
          </div>
        }
      >
        {showDetail && (
          <div>
            {/* Métadonnées */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              {getDocIcon(showDetail.type, 32)}
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>{showDetail.nom}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{showDetail.dossier}</div>
              </div>
              <span className={`badge ${typeBadge[showDetail.type]?.cls || 'badge-secondary'}`} style={{ marginLeft: 'auto' }}>
                {showDetail.type}
              </span>
            </div>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Catégorie</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {categorieIcons[showDetail.categorie]} {showDetail.categorie}
                </div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Taille</div>
                <div style={{ fontWeight: 600 }}>{showDetail.taille}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Date de création</div>
                <div style={{ fontWeight: 600 }}>{new Date(showDetail.date).toLocaleDateString('fr-FR')}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Auteur</div>
                <div style={{ fontWeight: 600 }}>{showDetail.auteur}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Établissement</div>
                <div style={{ fontWeight: 600 }}>
                  {showDetail.etablissementId
                    ? etablissements.find(e => e.id === showDetail.etablissementId)?.nom || 'Inconnu'
                    : 'Groupe (tous)'}
                </div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Droits d'accès</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={14} style={{ color: '#27ae60' }} /> Interne
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Historique des versions */}
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={16} /> Historique des versions
            </h3>
            <div className="table-container" style={{ marginBottom: '20px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Date</th>
                    <th>Auteur</th>
                    <th>Taille</th>
                    <th>Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {versionsSimulees.map((v, i) => (
                    <tr key={i}>
                      <td><span className={`badge ${i === 0 ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '11px' }}>{v.version}</span></td>
                      <td>{new Date(v.date).toLocaleDateString('fr-FR')}</td>
                      <td>{v.auteur}</td>
                      <td>{v.taille}</td>
                      <td style={{ fontSize: '12px', color: '#6b7280' }}>{v.commentaire}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divider" />

            {/* Journal d'accès */}
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} /> Journal d'accès
            </h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Date & heure</th>
                  </tr>
                </thead>
                <tbody>
                  {journalAccesSimule.map((j, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{j.utilisateur}</td>
                      <td>
                        <span className={`badge ${
                          j.action.includes('Téléchargement') ? 'badge-info'
                          : j.action.includes('Indexation') ? 'badge-warning'
                          : 'badge-secondary'
                        }`} style={{ fontSize: '11px' }}>
                          {j.action}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#6b7280' }}>{j.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════ MODAL ARCHIVAGE ═══════════════════════════ */}
      <Modal
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        title="Archiver une année scolaire"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowArchive(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleArchiveYear}>
              <Archive size={16} /> Confirmer l'archivage
            </button>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <Archive size={48} style={{ color: '#f39c12', marginBottom: '12px' }} />
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>Archiver l'année 2024-2025 ?</p>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
            Tous les documents datant d'avant septembre 2025 seront déplacés dans l'archive.
            Ils resteront consultables mais ne seront plus modifiables.
          </p>
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#856404', textAlign: 'left' }}>
            <strong>Attention :</strong> Cette action concerne {accessibleDocs.filter(d => d.date < '2025-09-01').length} document(s).
            L'opération est irréversible.
          </div>
        </div>
      </Modal>
    </div>
  );
}
