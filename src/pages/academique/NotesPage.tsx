import React, { useState, useMemo } from 'react';
import { eleves, notes as initialNotes, matieres, classes } from '../../data/mockData';
import { FileText, Download, Printer, Plus, Save } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import ExportDropdown from '../../components/ui/ExportDropdown';
import { exportToPDF } from '../../utils/exportUtils';

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState('saisie');
  const [selectedClasse, setSelectedClasse] = useState(1);
  const [notesList, setNotesList] = useState(initialNotes);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [newEval, setNewEval] = useState({
    matiereId: matieres[0].id,
    type: 'Devoir',
    date: new Date().toISOString().split('T')[0]
  });

  // State to hold typed grades before saving
  const [newGrades, setNewGrades] = useState<Record<number, string>>({});

  const classeEleves = useMemo(() => eleves.filter(e => e.classeId === selectedClasse && e.statut === 'Actif').slice(0, 10), [selectedClasse]);
  const classe = classes.find(c => c.id === selectedClasse);

  const getMoyenne = (eleveId: number, matiereId: number) => {
    const eleveNotes = notesList.filter(n => n.eleveId === eleveId && n.matiereId === matiereId);
    if (eleveNotes.length === 0) return '—';
    return (eleveNotes.reduce((s, n) => s + n.note, 0) / eleveNotes.length).toFixed(2);
  };

  const elevesWithAverages = useMemo(() => {
    return classeEleves.map(eleve => {
      let total = 0, coefTotal = 0;
      matieres.slice(0, 5).forEach(m => {
        const moy = getMoyenne(eleve.id, m.id);
        if (moy !== '—') { 
          total += parseFloat(moy) * m.coefficient; 
          coefTotal += m.coefficient; 
        }
      });
      const moyGen = coefTotal > 0 ? (total / coefTotal).toFixed(2) : '—';
      return { ...eleve, moyGen, numMoyGen: moyGen !== '—' ? parseFloat(moyGen) : 0 };
    }).sort((a, b) => b.numMoyGen - a.numMoyGen);
  }, [classeEleves, notesList]);

  const selectedEleve = elevesWithAverages[0];

  const handleOpenModal = () => {
    setNewGrades({});
    setIsModalOpen(true);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    
    const gradesToAdd = Object.keys(newGrades).map(eleveIdStr => {
      const elecId = Number(eleveIdStr);
      const val = parseFloat(newGrades[elecId]);
      if (!isNaN(val)) {
        return {
          id: Date.now() + Math.random(),
          eleveId: elecId,
          matiereId: newEval.matiereId,
          note: val,
          trimestre: 1 // default pour le mock
        };
      }
      return null;
    }).filter(n => n !== null) as typeof initialNotes;

    if (gradesToAdd.length === 0) {
      showToast('Aucune note valide saisie.', 'warning');
      return;
    }

    setNotesList(prev => [...prev, ...gradesToAdd]);
    setIsModalOpen(false);
    showToast(`Évaluation ajoutée. ${gradesToAdd.length} notes enregistrées. Moyennes recalculées.`, 'success');
  };

  const exportGrades = useMemo(() => {
    return elevesWithAverages.map((eleve, idx) => {
      const row: any = {
        'Rang': idx + 1,
        'Matricule': eleve.matricule,
        'Nom': eleve.nom,
        'Prénom': eleve.prenom
      };
      matieres.slice(0, 5).forEach(m => {
        row[m.nom] = getMoyenne(eleve.id, m.id);
      });
      row['Moyenne Générale'] = eleve.moyGen;
      return row;
    });
  }, [elevesWithAverages, notesList]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Académique</span><span className="breadcrumb-sep">/</span><span>Notes & Bulletins</span></div>
          <h1 className="page-title">Notes & Bulletins</h1>
          <p className="page-subtitle">Saisie des notes, calcul des moyennes et génération des bulletins en temps réel</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeTab === 'saisie' && (
            <ExportDropdown data={exportGrades} filename={`Notes_${classe?.nom?.replace(/ /g, '_')}`} elementId="notes-table" />
          )}
          <select className="form-select" style={{ width: '160px' }} value={selectedClasse} onChange={e => setSelectedClasse(Number(e.target.value))}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <button className="btn btn-primary" onClick={handleOpenModal}><Plus size={16} /> Saisir une évaluation</button>
        </div>
      </div>

      <div className="tab-bar">
        <div className={`tab-item ${activeTab === 'saisie' ? 'active' : ''}`} onClick={() => setActiveTab('saisie')}>📊 Tableau des notes et moyennes</div>
        <div className={`tab-item ${activeTab === 'bulletin' ? 'active' : ''}`} onClick={() => setActiveTab('bulletin')}>📄 Bulletin du 1er élève ({selectedEleve?.prenom})</div>
      </div>

      {activeTab === 'saisie' && (
        <div className="table-container fade-in" id="notes-table">
          <table>
            <thead>
              <tr>
                <th>Rang</th>
                <th>Élève</th>
                {matieres.slice(0, 5).map(m => (
                  <th key={m.id} style={{ textAlign: 'center' }}>
                    <div style={{ color: m.couleur }}>{m.abr}</div>
                    <div style={{ fontSize: '9px', fontWeight: 400, color: '#9ca3af' }}>Coef. {m.coefficient}</div>
                  </th>
                ))}
                <th style={{ textAlign: 'center' }}>Moy. Générale</th>
              </tr>
            </thead>
            <tbody>
              {elevesWithAverages.map((eleve, idx) => {
                return (
                  <tr key={eleve.id}>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${idx === 0 ? 'badge-info' : 'badge-primary'}`}>{idx + 1}<sup>e</sup></span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="avatar avatar-xs" style={{ background: '#e8f0fe', color: '#1e3a5f', fontSize: '9px' }}>{eleve.prenom[0]}{eleve.nom[0]}</div>
                        <span style={{ fontWeight: 600 }}>{eleve.prenom} {eleve.nom}</span>
                      </div>
                    </td>
                    {matieres.slice(0, 5).map(m => {
                      const moy = getMoyenne(eleve.id, m.id);
                      return (
                        <td key={m.id} style={{ textAlign: 'center', fontWeight: 600, color: moy !== '—' ? (parseFloat(moy) >= 10 ? '#27ae60' : '#e74c3c') : undefined }}>
                          {moy}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '15px', color: eleve.moyGen !== '—' ? (eleve.numMoyGen >= 10 ? '#27ae60' : '#e74c3c') : undefined }}>
                      {eleve.moyGen}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'bulletin' && selectedEleve && (
        <div className="fade-in">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button className="btn btn-secondary" onClick={exportToPDF}><Download size={16} /> Télécharger PDF</button>
            <button className="btn btn-secondary" onClick={exportToPDF}><Printer size={16} /> Imprimer</button>
          </div>

          <div className="bulletin-card">
            <div className="bulletin-header">
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>GROUPE SCOLAIRE</div>
              <h1 style={{ color: 'var(--primary)', marginBottom: 0 }}>LE GUIDE DE NOS ENFANTS</h1>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>BULLETIN SCOLAIRE — 1er Trimestre 2025-2026</div>
            </div>

            <div className="bulletin-info-grid">
              <div className="bulletin-info-item"><strong>Nom et Prénom</strong><span>{selectedEleve.prenom} {selectedEleve.nom}</span></div>
              <div className="bulletin-info-item"><strong>Matricule</strong><span>{selectedEleve.matricule}</span></div>
              <div className="bulletin-info-item"><strong>Classe</strong><span>{classe?.nom}</span></div>
              <div className="bulletin-info-item"><strong>Effectif</strong><span>{classe?.effectif} élèves</span></div>
            </div>

            <div className="table-container" style={{ marginBottom: '20px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th style={{ textAlign: 'center' }}>Coef.</th>
                    <th style={{ textAlign: 'center' }}>Moyenne Élève</th>
                    <th>Appréciation</th>
                  </tr>
                </thead>
                <tbody>
                  {matieres.slice(0, 5).map(m => {
                    const moy = getMoyenne(selectedEleve.id, m.id);
                    const appre = moy === '—' ? '' : parseFloat(moy) >= 16 ? 'Excellent' : parseFloat(moy) >= 14 ? 'Très bien' : parseFloat(moy) >= 12 ? 'Bien' : parseFloat(moy) >= 10 ? 'Assez bien' : 'Insuffisant';
                    return (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: m.couleur, marginRight: '8px' }} />{m.nom}</td>
                        <td style={{ textAlign: 'center' }}>{m.coefficient}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: moy !== '—' ? (parseFloat(moy) >= 10 ? '#27ae60' : '#e74c3c') : undefined }}>{moy}</td>
                        <td style={{ fontSize: '12px', color: '#6b7280' }}>{appre}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#f5f7fa', borderRadius: '10px' }}>
              <div><strong style={{ fontSize: '12px', color: '#6b7280' }}>MOYENNE GÉNÉRALE</strong><div style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a5f' }}>{selectedEleve.moyGen} / 20</div></div>
              <div><strong style={{ fontSize: '12px', color: '#6b7280' }}>RANG</strong><div style={{ fontSize: '24px', fontWeight: 800, color: '#f4a623' }}>1<sup>er</sup> / {classe?.effectif}</div></div>
              <div><strong style={{ fontSize: '12px', color: '#6b7280' }}>DÉCISION</strong><div style={{ fontSize: '16px', fontWeight: 700, color: '#27ae60' }}>Félicitations</div></div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SAISIE RAPIDE DE NOTES */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Saisie rapide des notes — ${classe?.nom}`} 
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" form="bulk-notes-form" className="btn btn-primary"><Save size={16} /> Enregistrer et recalculer</button>
          </div>
        }
      >
        <form id="bulk-notes-form" onSubmit={handleSaveEvaluation}>
          <div className="grid-3 mb-24">
            <div className="form-group">
              <label className="form-label">Matière *</label>
              <select className="form-select" value={newEval.matiereId} onChange={e => setNewEval({...newEval, matiereId: Number(e.target.value)})}>
                {matieres.slice(0, 5).map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type d'évaluation *</label>
              <select className="form-select" value={newEval.type} onChange={e => setNewEval({...newEval, type: e.target.value})}>
                <option value="Devoir">Devoir à la maison</option>
                <option value="Interrogation">Interrogation écrite</option>
                <option value="Examen">Examen du trimestre</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" required value={newEval.date} onChange={e => setNewEval({...newEval, date: e.target.value})} />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
              Notes des élèves (/20)
            </div>
            <div className="grid-2" style={{ gap: '12px' }}>
              {classeEleves.map(eleve => (
                <div key={eleve.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div className="avatar avatar-xs" style={{ background: '#e8f0fe', color: '#1e3a5f', fontSize: '9px' }}>{eleve.prenom[0]}{eleve.nom[0]}</div>
                  <div style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{eleve.prenom} {eleve.nom}</div>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0" 
                    max="20" 
                    className="form-input" 
                    style={{ width: '80px', textAlign: 'center', padding: '6px' }} 
                    placeholder="—/20"
                    value={newGrades[eleve.id] || ''}
                    onChange={e => setNewGrades(prev => ({...prev, [eleve.id]: e.target.value}))}
                  />
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
