import React, { useState, useMemo } from 'react';
import { eleves, notes as initialNotes, matieres, classes, etablissements, enseignants, appreciations, familles } from '../../data/mockData';
import { FileText, Download, Printer, Plus, Save, BarChart3, BookOpen, Trophy, TrendingUp, Users, Award, Target, AlertTriangle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import ExportDropdown from '../../components/ui/ExportDropdown';
import StatCard from '../../components/ui/StatCard';
import { exportToPDF } from '../../utils/exportUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

// ─── Helpers ────────────────────────────────────────────────────
function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getDecision(moy: number): { label: string; color: string } {
  if (moy >= 16) return { label: 'Felicitations', color: '#27ae60' };
  if (moy >= 14) return { label: 'Tableau d\'honneur', color: '#2ecc71' };
  if (moy >= 12) return { label: 'Encouragements', color: '#f39c12' };
  if (moy >= 10) return { label: 'Passable', color: '#e67e22' };
  return { label: 'Insuffisant - Avertissement', color: '#e74c3c' };
}

function ordinalSuffix(n: number): string {
  if (n === 1) return 'er';
  return 'e';
}

// ─── Component ──────────────────────────────────────────────────
export default function NotesPage() {
  const { user } = useAuth();
  const isParent = user?.role === 'Parent';
  const myFamily = isParent ? familles.find(f =>
    f.pere?.toLowerCase().includes(user.prenom?.toLowerCase()) ||
    f.mere?.toLowerCase().includes(user.prenom?.toLowerCase()) ||
    f.email === user.email
  ) : null;
  const myChildrenIds = myFamily?.enfants || [];

  const [activeTab, setActiveTab] = useState<'saisie' | 'bulletin' | 'stats'>(isParent ? 'bulletin' : 'saisie');
  const [selectedClasse, setSelectedClasse] = useState(1);
  const [selectedTrimestre, setSelectedTrimestre] = useState(1);
  const [selectedEleveId, setSelectedEleveId] = useState<number | null>(isParent && myChildrenIds.length > 0 ? myChildrenIds[0] : null);
  const [notesList, setNotesList] = useState(initialNotes);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [newEval, setNewEval] = useState({
    matiereId: matieres[0].id,
    type: 'Devoir',
    coefficient: 1,
    date: new Date().toISOString().split('T')[0],
  });
  const [newGrades, setNewGrades] = useState<Record<number, string>>({});

  const classe = classes.find(c => c.id === selectedClasse);
  const classeEtablissement = etablissements.find(e => e.id === classe?.etablissementId);

  const classeEleves = useMemo(
    () => eleves.filter(e => e.classeId === selectedClasse && e.statut === 'Actif'),
    [selectedClasse],
  );

  // ─── Moyenne d'un eleve dans une matiere pour le trimestre selectionne ──
  const getMoyenne = (eleveId: number, matiereId: number): number | null => {
    const eleveNotes = notesList.filter(
      n => n.eleveId === eleveId && n.matiereId === matiereId && n.trimestre === selectedTrimestre,
    );
    if (eleveNotes.length === 0) return null;
    return eleveNotes.reduce((s, n) => s + n.note, 0) / eleveNotes.length;
  };

  // ─── Moyenne de classe dans une matiere ──
  const getMoyenneClasse = (matiereId: number): number | null => {
    const moyennes = classeEleves
      .map(e => getMoyenne(e.id, matiereId))
      .filter((v): v is number => v !== null);
    if (moyennes.length === 0) return null;
    return moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
  };

  const getMinClasse = (matiereId: number): number | null => {
    const moyennes = classeEleves
      .map(e => getMoyenne(e.id, matiereId))
      .filter((v): v is number => v !== null);
    if (moyennes.length === 0) return null;
    return Math.min(...moyennes);
  };

  const getMaxClasse = (matiereId: number): number | null => {
    const moyennes = classeEleves
      .map(e => getMoyenne(e.id, matiereId))
      .filter((v): v is number => v !== null);
    if (moyennes.length === 0) return null;
    return Math.max(...moyennes);
  };

  // ─── Eleves avec moyennes generales ponderees ──
  const elevesWithAverages = useMemo(() => {
    return classeEleves
      .map(eleve => {
        let total = 0;
        let coefTotal = 0;
        matieres.forEach(m => {
          const moy = getMoyenne(eleve.id, m.id);
          if (moy !== null) {
            total += moy * m.coefficient;
            coefTotal += m.coefficient;
          }
        });
        const numMoyGen = coefTotal > 0 ? total / coefTotal : -1;
        const moyGen = numMoyGen >= 0 ? numMoyGen.toFixed(2) : '--';
        return { ...eleve, moyGen, numMoyGen };
      })
      .sort((a, b) => b.numMoyGen - a.numMoyGen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classeEleves, notesList, selectedTrimestre]);

  // ─── Statistiques de classe ──
  const classStats = useMemo(() => {
    const moyennes = elevesWithAverages.filter(e => e.numMoyGen >= 0).map(e => e.numMoyGen);
    if (moyennes.length === 0)
      return { moyenne: 0, mediane: 0, min: 0, max: 0, tauxReussite: 0 };
    const sum = moyennes.reduce((a, b) => a + b, 0);
    return {
      moyenne: sum / moyennes.length,
      mediane: median(moyennes),
      min: Math.min(...moyennes),
      max: Math.max(...moyennes),
      tauxReussite: (moyennes.filter(m => m >= 10).length / moyennes.length) * 100,
    };
  }, [elevesWithAverages]);

  // ─── Selected eleve for bulletin ──
  const getRang = (eleveId: number): number => {
    const idx = elevesWithAverages.findIndex(e => e.id === eleveId);
    return idx >= 0 ? idx + 1 : 0;
  };

  const selectedEleve = useMemo(() => {
    if (selectedEleveId) {
      return elevesWithAverages.find(e => e.id === selectedEleveId) || elevesWithAverages[0];
    }
    return elevesWithAverages[0];
  }, [selectedEleveId, elevesWithAverages]);

  // ─── Appreciation for bulletin ──
  const getAppreciation = (eleveId: number, matiereId: number): string => {
    const found = appreciations.find(
      a => a.eleveId === eleveId && a.matiereId === matiereId && a.trimestre === selectedTrimestre,
    );
    if (found) return found.appreciation;
    // Fallback automatique
    const moy = getMoyenne(eleveId, matiereId);
    if (moy === null) return '';
    if (moy >= 16) return 'Excellent';
    if (moy >= 14) return 'Tres bien';
    if (moy >= 12) return 'Bien';
    if (moy >= 10) return 'Assez bien';
    return 'Insuffisant';
  };

  // ─── Export data for grades ──
  const exportGrades = useMemo(() => {
    return elevesWithAverages.map((eleve, idx) => {
      const row: Record<string, any> = {
        Rang: idx + 1,
        Matricule: eleve.matricule,
        Nom: eleve.nom,
        Prenom: eleve.prenom,
      };
      matieres.forEach(m => {
        const moy = getMoyenne(eleve.id, m.id);
        row[m.nom] = moy !== null ? moy.toFixed(2) : '--';
      });
      row['Moyenne Generale'] = eleve.moyGen;
      return row;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elevesWithAverages, notesList, selectedTrimestre]);

  // ─── Stats charts data ──
  const distributionData = useMemo(() => {
    const bins = [
      { label: '0-4', min: 0, max: 4, count: 0 },
      { label: '4-6', min: 4, max: 6, count: 0 },
      { label: '6-8', min: 6, max: 8, count: 0 },
      { label: '8-10', min: 8, max: 10, count: 0 },
      { label: '10-12', min: 10, max: 12, count: 0 },
      { label: '12-14', min: 12, max: 14, count: 0 },
      { label: '14-16', min: 14, max: 16, count: 0 },
      { label: '16-18', min: 16, max: 18, count: 0 },
      { label: '18-20', min: 18, max: 20.01, count: 0 },
    ];
    elevesWithAverages.forEach(e => {
      if (e.numMoyGen >= 0) {
        const bin = bins.find(b => e.numMoyGen >= b.min && e.numMoyGen < b.max);
        if (bin) bin.count++;
      }
    });
    return bins;
  }, [elevesWithAverages]);

  const moyennesParMatiere = useMemo(() => {
    return matieres.map(m => {
      const mc = getMoyenneClasse(m.id);
      return { matiere: m.abr, nom: m.nom, moyenne: mc !== null ? parseFloat(mc.toFixed(2)) : 0, couleur: m.couleur };
    }).filter(m => m.moyenne > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classeEleves, notesList, selectedTrimestre]);

  const evolutionData = useMemo(() => {
    return [1, 2, 3].map(tri => {
      const moyennes = classeEleves.map(eleve => {
        let total = 0;
        let coefTotal = 0;
        matieres.forEach(m => {
          const eleveNotes = notesList.filter(
            n => n.eleveId === eleve.id && n.matiereId === m.id && n.trimestre === tri,
          );
          if (eleveNotes.length > 0) {
            const moy = eleveNotes.reduce((s, n) => s + n.note, 0) / eleveNotes.length;
            total += moy * m.coefficient;
            coefTotal += m.coefficient;
          }
        });
        return coefTotal > 0 ? total / coefTotal : null;
      }).filter((v): v is number => v !== null);
      const avg = moyennes.length > 0 ? moyennes.reduce((a, b) => a + b, 0) / moyennes.length : null;
      return { trimestre: `T${tri}`, moyenne: avg !== null ? parseFloat(avg.toFixed(2)) : null };
    }).filter(d => d.moyenne !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classeEleves, notesList]);

  // ─── Modal handlers ──
  const handleOpenModal = () => {
    setNewGrades({});
    setNewEval({
      matiereId: matieres[0].id,
      type: 'Devoir',
      coefficient: 1,
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const gradesToAdd = Object.keys(newGrades)
      .map(eleveIdStr => {
        const elecId = Number(eleveIdStr);
        const val = parseFloat(newGrades[elecId]);
        if (!isNaN(val) && val >= 0 && val <= 20) {
          return {
            id: Date.now() + Math.random(),
            eleveId: elecId,
            matiereId: newEval.matiereId,
            type: newEval.type,
            note: val,
            sur: 20,
            date: newEval.date,
            trimestre: selectedTrimestre,
            commentaire: '',
          };
        }
        return null;
      })
      .filter(n => n !== null) as typeof initialNotes;

    if (gradesToAdd.length === 0) {
      showToast('Aucune note valide saisie.', 'warning');
      return;
    }

    setNotesList(prev => [...prev, ...gradesToAdd]);
    setIsModalOpen(false);
    showToast(
      `Evaluation ajoutee. ${gradesToAdd.length} notes enregistrees. Moyennes recalculees.`,
      'success',
    );
  };

  // ─── Trimestre label ──
  const trimestreLabel = selectedTrimestre === 1 ? '1er' : `${selectedTrimestre}eme`;

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="fade-in">
      {/* ─── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Academique</span>
            <span className="breadcrumb-sep">/</span>
            <span>Notes & Bulletins</span>
          </div>
          <h1 className="page-title">{isParent ? 'Notes de mes enfants' : 'Notes & Bulletins'}</h1>
          <p className="page-subtitle">
            {isParent ? `Suivi scolaire - ${myFamily?.nom || 'Famille'}` : 'Saisie des notes, calcul des moyennes et generation des bulletins en temps reel'}
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {activeTab === 'saisie' && (
            <ExportDropdown
              data={exportGrades}
              filename={`Notes_${classe?.nom?.replace(/ /g, '_')}_T${selectedTrimestre}`}
              elementId="notes-table"
            />
          )}
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={selectedClasse}
            onChange={e => setSelectedClasse(Number(e.target.value))}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: '140px' }}
            value={selectedTrimestre}
            onChange={e => setSelectedTrimestre(Number(e.target.value))}
          >
            <option value={1}>1er Trimestre</option>
            <option value={2}>2eme Trimestre</option>
            <option value={3}>3eme Trimestre</option>
          </select>
          {!isParent && (
            <button className="btn btn-primary" onClick={handleOpenModal}>
              <Plus size={16} /> Saisir une evaluation
            </button>
          )}
        </div>
      </div>

      {/* ─── Tab Bar ── */}
      <div className="tab-bar">
        {!isParent && (
          <div
            className={`tab-item ${activeTab === 'saisie' ? 'active' : ''}`}
            onClick={() => setActiveTab('saisie')}
          >
            <BookOpen size={15} style={{ marginRight: 6 }} />
            Tableau des notes
          </div>
        )}
        <div
          className={`tab-item ${activeTab === 'bulletin' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulletin')}
        >
          <FileText size={15} style={{ marginRight: 6 }} />
          Bulletin scolaire
        </div>
        <div
          className={`tab-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={15} style={{ marginRight: 6 }} />
          Statistiques
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ONGLET 1 : TABLEAU DES NOTES
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'saisie' && (
        <div className="fade-in">
          {/* Stat cards */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <StatCard
              label="Moyenne de classe"
              value={classStats.moyenne.toFixed(2) + ' / 20'}
              icon={<Target size={20} />}
              color="#3498db"
            />
            <StatCard
              label="Taux de reussite"
              value={classStats.tauxReussite.toFixed(0) + ' %'}
              icon={<Trophy size={20} />}
              color={classStats.tauxReussite >= 50 ? '#27ae60' : '#e74c3c'}
            />
            <StatCard
              label="Meilleure moyenne"
              value={classStats.max.toFixed(2) + ' / 20'}
              icon={<Award size={20} />}
              color="#f4a623"
            />
            <StatCard
              label="Plus faible moyenne"
              value={classStats.min.toFixed(2) + ' / 20'}
              icon={<AlertTriangle size={20} />}
              color="#e74c3c"
            />
          </div>

          <div className="table-container" id="notes-table" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2, minWidth: '40px' }}>
                    Rang
                  </th>
                  <th style={{ position: 'sticky', left: '40px', background: '#f8fafc', zIndex: 2, minWidth: '180px' }}>
                    Eleve
                  </th>
                  {matieres.map(m => (
                    <th key={m.id} style={{ textAlign: 'center', minWidth: '70px' }}>
                      <div style={{ color: m.couleur, fontWeight: 700 }}>{m.abr}</div>
                      <div style={{ fontSize: '9px', fontWeight: 400, color: '#9ca3af' }}>
                        Coef. {m.coefficient}
                      </div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', minWidth: '100px', background: '#f0f9ff' }}>
                    Moy. Generale
                  </th>
                </tr>
              </thead>
              <tbody>
                {elevesWithAverages.map((eleve, idx) => (
                  <tr key={eleve.id}>
                    <td style={{ textAlign: 'center', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>
                      <span className={`badge ${idx === 0 ? 'badge-info' : idx <= 2 ? 'badge-primary' : 'badge-secondary'}`}>
                        {idx + 1}
                        <sup>{ordinalSuffix(idx + 1)}</sup>
                      </span>
                    </td>
                    <td style={{ position: 'sticky', left: '40px', background: 'white', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          className="avatar avatar-xs"
                          style={{
                            background: '#e8f0fe',
                            color: '#1e3a5f',
                            fontSize: '9px',
                          }}
                        >
                          {eleve.prenom[0]}
                          {eleve.nom[0]}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '13px' }}>
                            {eleve.prenom} {eleve.nom}
                          </span>
                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>{eleve.matricule}</div>
                        </div>
                      </div>
                    </td>
                    {matieres.map(m => {
                      const moy = getMoyenne(eleve.id, m.id);
                      return (
                        <td
                          key={m.id}
                          style={{
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: '13px',
                            color: moy !== null ? (moy >= 10 ? '#27ae60' : '#e74c3c') : '#d1d5db',
                            background: moy !== null ? (moy >= 10 ? '#f0fdf4' : '#fef2f2') : undefined,
                          }}
                        >
                          {moy !== null ? moy.toFixed(2) : '--'}
                        </td>
                      );
                    })}
                    <td
                      style={{
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '15px',
                        color:
                          eleve.numMoyGen >= 0
                            ? eleve.numMoyGen >= 10
                              ? '#27ae60'
                              : '#e74c3c'
                            : '#d1d5db',
                        background: '#f0f9ff',
                      }}
                    >
                      {eleve.moyGen}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Statistiques de classe */}
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', fontSize: '12px', color: '#64748b' }}>
                    MOY. CLASSE
                  </td>
                  {matieres.map(m => {
                    const mc = getMoyenneClasse(m.id);
                    return (
                      <td key={m.id} style={{ textAlign: 'center', fontSize: '12px', color: mc !== null ? (mc >= 10 ? '#27ae60' : '#e74c3c') : '#d1d5db' }}>
                        {mc !== null ? mc.toFixed(2) : '--'}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', fontSize: '13px', color: '#1e3a5f', background: '#f0f9ff' }}>
                    {classStats.moyenne.toFixed(2)}
                  </td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', fontSize: '12px', color: '#64748b' }}>
                    MIN / MAX
                  </td>
                  {matieres.map(m => {
                    const mi = getMinClasse(m.id);
                    const ma = getMaxClasse(m.id);
                    return (
                      <td key={m.id} style={{ textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
                        {mi !== null ? `${mi.toFixed(1)} / ${ma!.toFixed(1)}` : '--'}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', background: '#f0f9ff' }}>
                    {classStats.min.toFixed(1)} / {classStats.max.toFixed(1)}
                  </td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', fontSize: '12px', color: '#64748b' }}>
                    MEDIANE
                  </td>
                  {matieres.map(m => {
                    const moyennes = classeEleves
                      .map(e => getMoyenne(e.id, m.id))
                      .filter((v): v is number => v !== null);
                    const med = moyennes.length > 0 ? median(moyennes) : null;
                    return (
                      <td key={m.id} style={{ textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                        {med !== null ? med.toFixed(2) : '--'}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', background: '#f0f9ff' }}>
                    {classStats.mediane.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          ONGLET 2 : BULLETIN SCOLAIRE
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'bulletin' && (
        <div className="fade-in">
          {/* Selecteur d'eleve + actions */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: '260px' }}
              value={selectedEleve?.id || ''}
              onChange={e => setSelectedEleveId(Number(e.target.value))}
            >
              {(isParent
                ? elevesWithAverages.filter(el => myChildrenIds.includes(el.id))
                : elevesWithAverages
              ).map((el, idx) => (
                <option key={el.id} value={el.id}>
                  {idx + 1}. {el.prenom} {el.nom} ({el.matricule})
                </option>
              ))}
            </select>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Download size={16} /> Telecharger PDF
            </button>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Imprimer
            </button>
          </div>

          {selectedEleve && (
            <div className="bulletin-card" id="bulletin-content">
              {/* ── En-tete bulletin ── */}
              <div className="bulletin-header" style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  {/* Logo */}
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1e3a5f, #2980b9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 900,
                      fontSize: '24px',
                      flexShrink: 0,
                    }}
                  >
                    LG
                  </div>
                  {/* Centre */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>
                      Republique Gabonaise
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a5f', marginTop: '4px' }}>
                      GROUPE SCOLAIRE
                    </div>
                    <h1 style={{ color: 'var(--primary)', margin: '4px 0', fontSize: '20px' }}>
                      LE GUIDE DE NOS ENFANTS
                    </h1>
                    {classeEtablissement && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {classeEtablissement.nom} - {classeEtablissement.adresse}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      Tel: {classeEtablissement?.telephone || ''} | Email: {classeEtablissement?.email || ''}
                    </div>
                  </div>
                  {/* Annee */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        background: '#1e3a5f',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      2025-2026
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #1e3a5f, #2980b9)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  Bulletin Scolaire - {trimestreLabel} Trimestre
                </div>
              </div>

              {/* ── Infos eleve ── */}
              <div className="bulletin-info-grid" style={{ marginTop: '20px' }}>
                <div className="bulletin-info-item">
                  <strong>Nom et Prenom</strong>
                  <span>{selectedEleve.prenom} {selectedEleve.nom}</span>
                </div>
                <div className="bulletin-info-item">
                  <strong>Matricule</strong>
                  <span>{selectedEleve.matricule}</span>
                </div>
                <div className="bulletin-info-item">
                  <strong>Classe</strong>
                  <span>{classe?.nom}</span>
                </div>
                <div className="bulletin-info-item">
                  <strong>Effectif</strong>
                  <span>{classeEleves.length} eleves</span>
                </div>
                <div className="bulletin-info-item">
                  <strong>Trimestre</strong>
                  <span>{trimestreLabel} Trimestre</span>
                </div>
                <div className="bulletin-info-item">
                  <strong>Prof. Principal</strong>
                  <span>{classe?.professeurPrincipal}</span>
                </div>
              </div>

              {/* ── Tableau des matieres ── */}
              <div className="table-container" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <table>
                  <thead>
                    <tr style={{ background: '#1e3a5f' }}>
                      <th style={{ color: 'white', fontWeight: 700 }}>Matiere</th>
                      <th style={{ color: 'white', fontWeight: 700, textAlign: 'center' }}>Coef.</th>
                      <th style={{ color: 'white', fontWeight: 700, textAlign: 'center' }}>Moy. Eleve</th>
                      <th style={{ color: 'white', fontWeight: 700, textAlign: 'center' }}>Moy. Classe</th>
                      <th style={{ color: 'white', fontWeight: 700, textAlign: 'center' }}>Min</th>
                      <th style={{ color: 'white', fontWeight: 700, textAlign: 'center' }}>Max</th>
                      <th style={{ color: 'white', fontWeight: 700 }}>Appreciation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matieres.map(m => {
                      const moy = getMoyenne(selectedEleve.id, m.id);
                      const mc = getMoyenneClasse(m.id);
                      const mi = getMinClasse(m.id);
                      const ma = getMaxClasse(m.id);
                      const appr = getAppreciation(selectedEleve.id, m.id);
                      return (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600 }}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: m.couleur,
                                marginRight: '8px',
                              }}
                            />
                            {m.nom}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.coefficient}</td>
                          <td
                            style={{
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                              color: moy !== null ? (moy >= 10 ? '#27ae60' : '#e74c3c') : '#d1d5db',
                            }}
                          >
                            {moy !== null ? moy.toFixed(2) : '--'}
                          </td>
                          <td style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                            {mc !== null ? mc.toFixed(2) : '--'}
                          </td>
                          <td style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                            {mi !== null ? mi.toFixed(2) : '--'}
                          </td>
                          <td style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                            {ma !== null ? ma.toFixed(2) : '--'}
                          </td>
                          <td style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic', maxWidth: '200px' }}>
                            {appr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Resume bulletin ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f5f7fa, #e8f0fe)',
                  borderRadius: '12px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    Moyenne Generale
                  </div>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 900,
                      color: selectedEleve.numMoyGen >= 10 ? '#27ae60' : '#e74c3c',
                    }}
                  >
                    {selectedEleve.moyGen}
                    <span style={{ fontSize: '14px', fontWeight: 400, color: '#9ca3af' }}> / 20</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    Rang
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#f4a623' }}>
                    {getRang(selectedEleve.id)}
                    <sup>{ordinalSuffix(getRang(selectedEleve.id))}</sup>
                    <span style={{ fontSize: '14px', fontWeight: 400, color: '#9ca3af' }}> / {classeEleves.length}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    Decision du conseil
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: selectedEleve.numMoyGen >= 0 ? getDecision(selectedEleve.numMoyGen).color : '#6b7280',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      background: 'white',
                      display: 'inline-block',
                    }}
                  >
                    {selectedEleve.numMoyGen >= 0 ? getDecision(selectedEleve.numMoyGen).label : '--'}
                  </div>
                </div>
              </div>

              {/* ── Zone signature ── */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '30px 40px',
                  marginTop: '16px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e3a5f', marginBottom: '50px' }}>
                    Le Professeur Principal
                  </div>
                  <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '8px', fontSize: '12px', color: '#6b7280', minWidth: '180px' }}>
                    {classe?.professeurPrincipal}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e3a5f', marginBottom: '50px' }}>
                    Le Directeur
                  </div>
                  <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '8px', fontSize: '12px', color: '#6b7280', minWidth: '180px' }}>
                    {classeEtablissement?.directeur || ''}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          ONGLET 3 : STATISTIQUES
          ═══════════════════════════════════════════════════════ */}
      {activeTab === 'stats' && (
        <div className="fade-in">
          {/* Stats cards */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <StatCard
              label="Eleves dans la classe"
              value={classeEleves.length}
              icon={<Users size={20} />}
              color="#3498db"
            />
            <StatCard
              label="Moyenne de classe"
              value={classStats.moyenne.toFixed(2) + ' / 20'}
              icon={<Target size={20} />}
              color="#27ae60"
            />
            <StatCard
              label="Taux de reussite"
              value={classStats.tauxReussite.toFixed(0) + ' %'}
              icon={<Trophy size={20} />}
              color="#f4a623"
            />
            <StatCard
              label="Mediane"
              value={classStats.mediane.toFixed(2) + ' / 20'}
              icon={<TrendingUp size={20} />}
              color="#7c3aed"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Distribution des moyennes */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a5f', marginBottom: '16px' }}>
                Distribution des moyennes
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(value: number) => [`${value} eleve(s)`, 'Effectif']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {distributionData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.min >= 10 ? '#27ae60' : entry.min >= 8 ? '#f39c12' : '#e74c3c'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Moyennes par matiere */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a5f', marginBottom: '16px' }}>
                Moyennes par matiere
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={moyennesParMatiere} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="matiere" tick={{ fontSize: 11 }} width={50} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(value: number, _name: any, props: any) => [`${value} / 20`, props.payload.nom]}
                  />
                  <Bar dataKey="moyenne" radius={[0, 4, 4, 0]}>
                    {moyennesParMatiere.map((entry, i) => (
                      <Cell key={i} fill={entry.couleur} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Evolution des moyennes */}
          {evolutionData.length > 1 && (
            <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a5f', marginBottom: '16px' }}>
                Evolution de la moyenne de classe par trimestre
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="trimestre" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(value: number) => [`${value} / 20`, 'Moyenne de classe']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="moyenne"
                    name="Moyenne de classe"
                    stroke="#1e3a5f"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#1e3a5f' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tableau comparatif (RGPD: hidden for Parent) */}
          {!isParent && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Top 5 */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#27ae60', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} /> Top 5 - Meilleurs eleves
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Rang</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Eleve</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {elevesWithAverages.slice(0, 5).map((el, idx) => (
                    <tr key={el.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <span
                          className="badge badge-info"
                          style={{
                            background: idx === 0 ? '#f4a623' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : '#e2e8f0',
                            color: idx < 3 ? 'white' : '#64748b',
                          }}
                        >
                          {idx + 1}<sup>{ordinalSuffix(idx + 1)}</sup>
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 600, fontSize: '13px' }}>
                        {el.prenom} {el.nom}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 700, color: '#27ae60', fontSize: '14px' }}>
                        {el.moyGen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom 5 */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e74c3c', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Eleves en difficulte
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Rang</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Eleve</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {[...elevesWithAverages]
                    .filter(e => e.numMoyGen >= 0)
                    .reverse()
                    .slice(0, 5)
                    .map((el, idx) => {
                      const rang = getRang(el.id);
                      return (
                        <tr key={el.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 8px' }}>
                            <span className="badge badge-secondary">
                              {rang}<sup>{ordinalSuffix(rang)}</sup>
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px', fontWeight: 600, fontSize: '13px' }}>
                            {el.prenom} {el.nom}
                          </td>
                          <td
                            style={{
                              textAlign: 'center',
                              padding: '10px 8px',
                              fontWeight: 700,
                              color: el.numMoyGen >= 10 ? '#27ae60' : '#e74c3c',
                              fontSize: '14px',
                            }}
                          >
                            {el.moyGen}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* RGPD: Parent sees only their children's summary in stats */}
          {isParent && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a5f', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} /> Notes de mes enfants
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Enfant</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Classe</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Moyenne</th>
                    <th style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#6b7280' }}>Rang</th>
                  </tr>
                </thead>
                <tbody>
                  {myChildrenIds.map(childId => {
                    const child = eleves.find(e => e.id === childId);
                    if (!child) return null;
                    const childInAvg = elevesWithAverages.find(e => e.id === childId);
                    const childClasse = classes.find(c => c.id === child.classeId);
                    const rang = childInAvg ? getRang(childId) : null;
                    return (
                      <tr key={childId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600, fontSize: '13px' }}>
                          {child.prenom} {child.nom}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '13px', color: '#64748b' }}>
                          {childClasse?.nom || child.classe || '-'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 700, color: childInAvg && childInAvg.numMoyGen >= 10 ? '#27ae60' : '#e74c3c', fontSize: '14px' }}>
                          {childInAvg?.moyGen || '--'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: '13px' }}>
                          {rang ? `${rang}e` : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL SAISIE RAPIDE DE NOTES
          ═══════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Saisie rapide des notes - ${classe?.nom} (T${selectedTrimestre})`}
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" form="bulk-notes-form" className="btn btn-primary">
              <Save size={16} /> Enregistrer et recalculer
            </button>
          </div>
        }
      >
        <form id="bulk-notes-form" onSubmit={handleSaveEvaluation}>
          <div className="grid-3 mb-24">
            <div className="form-group">
              <label className="form-label">Matiere *</label>
              <select
                className="form-select"
                value={newEval.matiereId}
                onChange={e => setNewEval({ ...newEval, matiereId: Number(e.target.value) })}
              >
                {matieres.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nom} (Coef. {m.coefficient})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type d'evaluation *</label>
              <select
                className="form-select"
                value={newEval.type}
                onChange={e => setNewEval({ ...newEval, type: e.target.value })}
              >
                <option value="Devoir">Devoir a la maison</option>
                <option value="Interrogation">Interrogation ecrite</option>
                <option value="Controle">Controle continu</option>
                <option value="Examen">Examen du trimestre</option>
                <option value="TP">Travaux pratiques</option>
                <option value="Oral">Evaluation orale</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Coefficient *</label>
              <select
                className="form-select"
                value={newEval.coefficient}
                onChange={e => setNewEval({ ...newEval, coefficient: Number(e.target.value) })}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Date de l'evaluation *</label>
              <input
                type="date"
                className="form-input"
                required
                style={{ maxWidth: '200px' }}
                value={newEval.date}
                onChange={e => setNewEval({ ...newEval, date: e.target.value })}
              />
            </div>
          </div>

          {/* Calcul instantane */}
          {(() => {
            const filled = Object.values(newGrades).filter(v => v !== '' && !isNaN(parseFloat(v)));
            const avg =
              filled.length > 0
                ? (filled.reduce((s, v) => s + parseFloat(v), 0) / filled.length).toFixed(2)
                : '--';
            return (
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '12px 16px',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1e3a5f',
                }}
              >
                <span>Notes saisies : {filled.length} / {classeEleves.length}</span>
                <span>Moyenne : {avg}</span>
              </div>
            );
          })()}

          <div
            style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '12px',
                textTransform: 'uppercase',
              }}
            >
              Notes des eleves (/20)
            </div>
            <div className="grid-2" style={{ gap: '12px' }}>
              {classeEleves.map(eleve => {
                const val = newGrades[eleve.id] || '';
                const num = parseFloat(val);
                const isValid = val === '' || (!isNaN(num) && num >= 0 && num <= 20);
                return (
                  <div
                    key={eleve.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      background: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${!isValid ? '#e74c3c' : '#e2e8f0'}`,
                    }}
                  >
                    <div
                      className="avatar avatar-xs"
                      style={{ background: '#e8f0fe', color: '#1e3a5f', fontSize: '9px' }}
                    >
                      {eleve.prenom[0]}
                      {eleve.nom[0]}
                    </div>
                    <div style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>
                      {eleve.prenom} {eleve.nom}
                    </div>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="20"
                      className="form-input"
                      style={{
                        width: '80px',
                        textAlign: 'center',
                        padding: '6px',
                        borderColor: !isValid ? '#e74c3c' : undefined,
                      }}
                      placeholder="-- /20"
                      value={val}
                      onChange={e =>
                        setNewGrades(prev => ({ ...prev, [eleve.id]: e.target.value }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
