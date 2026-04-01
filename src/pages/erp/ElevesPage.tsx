import React, { useState, useMemo } from 'react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import {
  eleves,
  classes,
  etablissements,
  notes,
  matieres,
  absences,
  factures,
  familles,
  historiqueScolaire,
  infosMedicales,
  sanctions,
  distinctions,
} from '../../data/mockData';
import {
  Plus, Eye, Edit, Download, GraduationCap, User, Users, BookOpen,
  Heart, Clock, BarChart3, CreditCard, Shield, FileText, Calendar,
  Phone, Mail, MapPin, AlertTriangle, Award, ChevronRight, Printer,
  UserPlus, X
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// ---- Types ----
type Eleve = (typeof eleves)[number];
type TabKey = 'identite' | 'responsables' | 'scolarite' | 'medical' | 'absences' | 'notes' | 'finances' | 'discipline';

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'identite', label: 'Identité', icon: <User size={14} /> },
  { key: 'responsables', label: 'Responsables', icon: <Users size={14} /> },
  { key: 'scolarite', label: 'Scolarité', icon: <BookOpen size={14} /> },
  { key: 'medical', label: 'Médical', icon: <Heart size={14} /> },
  { key: 'absences', label: 'Absences', icon: <Clock size={14} /> },
  { key: 'notes', label: 'Notes', icon: <BarChart3 size={14} /> },
  { key: 'finances', label: 'Finances', icon: <CreditCard size={14} /> },
  { key: 'discipline', label: 'Discipline', icon: <Shield size={14} /> },
];

// ---- Helper: empty state ----
function EmptyState({ message }: { message: string }) {
  return (
    <div className="alert alert-info" style={{ textAlign: 'center', padding: '24px' }}>
      {message}
    </div>
  );
}

// ---- Helper: format currency ----
function formatCFA(montant: number) {
  return montant.toLocaleString('fr-FR') + ' FCFA';
}

// ---- Tab: Identite ----
function TabIdentite({ eleve }: { eleve: Eleve }) {
  const etab = etablissements.find(e => e.id === eleve.etablissementId);
  const classe = classes.find(c => c.id === eleve.classeId);
  const age = Math.floor((Date.now() - new Date(eleve.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  return (
    <div>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
        <div className="avatar avatar-xl" style={{
          background: eleve.sexe === 'M' ? '#dbeafe' : '#fce7f3',
          color: eleve.sexe === 'M' ? '#1e3a5f' : '#ec4899',
          flexShrink: 0,
        }}>
          {eleve.prenom[0]}{eleve.nom[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{eleve.prenom} {eleve.nom}</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 8px' }}>Matricule : {eleve.matricule}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`badge ${eleve.statut === 'Actif' ? 'badge-success' : eleve.statut === 'Transféré' ? 'badge-warning' : 'badge-secondary'}`}>{eleve.statut}</span>
            <span className={`badge ${eleve.sexe === 'M' ? 'badge-info' : 'badge-primary'}`}>{eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Prénom</label>
          <input className="form-control" value={eleve.prenom} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Nom</label>
          <input className="form-control" value={eleve.nom} readOnly />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date de naissance</label>
          <input className="form-control" value={new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Âge</label>
          <input className="form-control" value={`${age} ans`} readOnly />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Sexe</label>
          <input className="form-control" value={eleve.sexe === 'M' ? 'Masculin' : 'Féminin'} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Nationalité</label>
          <input className="form-control" value="Gabonaise" readOnly />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Classe actuelle</label>
          <input className="form-control" value={eleve.classe} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Établissement</label>
          <input className="form-control" value={etab?.nom || '-'} readOnly />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Professeur principal</label>
          <input className="form-control" value={classe?.professeurPrincipal || '-'} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Salle</label>
          <input className="form-control" value={classe?.salle || '-'} readOnly />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Contact d'urgence</label>
          <input className="form-control" value={eleve.contactUrgence} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Matricule</label>
          <input className="form-control" value={eleve.matricule} readOnly />
        </div>
      </div>

      {eleve.allergies && (
        <div className="alert alert-warning mt-16" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> Allergie signalée : {eleve.allergies}
        </div>
      )}
    </div>
  );
}

// ---- Tab: Responsables ----
function TabResponsables({ eleve }: { eleve: Eleve }) {
  const famille = familles.find(f => f.enfants.includes(eleve.id));

  return (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Responsables légaux</h3>

      <div className="grid-2" style={{ gap: '16px', marginBottom: '20px' }}>
        {/* Responsable 1 */}
        <div className="card">
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div className="avatar avatar-sm" style={{ background: '#dbeafe', color: '#1e3a5f', fontSize: '11px' }}>
                {eleve.responsable1.nom.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{eleve.responsable1.nom}</div>
                <span className="badge badge-primary" style={{ fontSize: '10px' }}>{eleve.responsable1.lien}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>
              <Phone size={13} /> {eleve.responsable1.telephone}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              Accès : Portail parent, bulletins, absences
            </div>
          </div>
        </div>

        {/* Responsable 2 */}
        <div className="card">
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div className="avatar avatar-sm" style={{ background: '#fce7f3', color: '#ec4899', fontSize: '11px' }}>
                {eleve.responsable2.nom.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{eleve.responsable2.nom}</div>
                <span className="badge badge-primary" style={{ fontSize: '10px' }}>{eleve.responsable2.lien}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px', marginBottom: '6px' }}>
              <Phone size={13} /> {eleve.responsable2.telephone}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              Accès : Portail parent, bulletins, absences
            </div>
          </div>
        </div>
      </div>

      {/* Famille */}
      {famille ? (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Famille rattachée</h4>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nom de la famille</label>
                <input className="form-control" value={famille.nom} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" value={famille.email} readOnly />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-control" value={famille.telephone} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Enfants inscrits</label>
                <input className="form-control" value={`${famille.enfants.length} enfant(s)`} readOnly />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Solde financier</label>
              <span className={`badge ${famille.solde < 0 ? 'badge-danger' : 'badge-success'}`} style={{ padding: '6px 12px' }}>
                {formatCFA(famille.solde)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message="Aucune famille rattachée pour cet élève." />
      )}
    </div>
  );
}

// ---- Tab: Scolarite ----
function TabScolarite({ eleve }: { eleve: Eleve }) {
  const historique = Array.isArray(historiqueScolaire)
    ? historiqueScolaire.filter((h: any) => h.eleveId === eleve.id)
    : [];
  const classe = classes.find(c => c.id === eleve.classeId);

  return (
    <div>
      {/* Classe actuelle */}
      <div className="card mb-16">
        <div className="card-header">
          <h4 className="card-title">Classe actuelle - 2025-2026</h4>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Classe</label>
              <input className="form-control" value={eleve.classe} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Établissement</label>
              <input className="form-control" value={etablissements.find(e => e.id === eleve.etablissementId)?.nom || '-'} readOnly />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Professeur principal</label>
              <input className="form-control" value={classe?.professeurPrincipal || '-'} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Effectif de la classe</label>
              <input className="form-control" value={classe ? `${classe.effectif} élèves` : '-'} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Historique scolaire</h4>
        </div>
        <div className="card-body">
          {historique.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Année</th>
                    <th>Classe</th>
                    <th>Établissement</th>
                    <th>Moyenne</th>
                    <th>Décision</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map((h: any, i: number) => (
                    <tr key={i}>
                      <td>{h.annee}</td>
                      <td>{h.classe}</td>
                      <td>{h.etablissement || '-'}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: (h.moyenne || 0) >= 10 ? '#27ae60' : '#e74c3c' }}>
                          {h.moyenne != null ? `${h.moyenne}/20` : '-'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${h.decision === 'Admis' ? 'badge-success' : h.decision === 'Redoublement' ? 'badge-danger' : 'badge-warning'}`}>
                          {h.decision || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Aucun historique scolaire disponible pour cet élève." />
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Tab: Medical ----
function TabMedical({ eleve }: { eleve: Eleve }) {
  const medical = Array.isArray(infosMedicales)
    ? infosMedicales.find((m: any) => m.eleveId === eleve.id)
    : null;

  return (
    <div>
      {eleve.allergies && (
        <div className="alert alert-warning mb-16" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> Allergie connue : {eleve.allergies}
        </div>
      )}

      {medical ? (
        <>
          <div className="card mb-16">
            <div className="card-header">
              <h4 className="card-title">Informations médicales</h4>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Groupe sanguin</label>
                  <input className="form-control" value={(medical as any).groupeSanguin || '-'} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Médecin traitant</label>
                  <input className="form-control" value={(medical as any).medecinTraitant || '-'} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <input className="form-control" value={(medical as any).allergies?.join(', ') || eleve.allergies || 'Aucune'} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Maladies chroniques</label>
                  <input className="form-control" value={(medical as any).maladiesChroniques?.join(', ') || 'Aucune'} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Vaccins */}
          {(medical as any).vaccins && (medical as any).vaccins.length > 0 && (
            <div className="card mb-16">
              <div className="card-header">
                <h4 className="card-title">Vaccinations</h4>
              </div>
              <div className="card-body">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Vaccin</th>
                        <th>Date</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(medical as any).vaccins.map((v: any, i: number) => (
                        <tr key={i}>
                          <td>{v.nom}</td>
                          <td>{v.date ? new Date(v.date).toLocaleDateString('fr-FR') : '-'}</td>
                          <td>
                            <span className={`badge ${v.fait ? 'badge-success' : 'badge-warning'}`}>
                              {v.fait ? 'Effectué' : 'En attente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PAI */}
          {(medical as any).pai && (
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Projet d'Accueil Individualise (PAI)</h4>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Motif</label>
                    <input className="form-control" value={(medical as any).pai.motif || '-'} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date de mise en place</label>
                    <input className="form-control" value={(medical as any).pai.dateMiseEnPlace ? new Date((medical as any).pai.dateMiseEnPlace).toLocaleDateString('fr-FR') : '-'} readOnly />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Aménagements</label>
                  <textarea className="form-control" value={(medical as any).pai.amenagements || '-'} readOnly style={{ minHeight: '60px', resize: 'none' }} />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState message="Aucune donnée médicale disponible pour cet élève." />
      )}
    </div>
  );
}

// ---- Tab: Absences ----
function TabAbsences({ eleve }: { eleve: Eleve }) {
  const eleveAbsences = absences.filter(a => a.eleveId === eleve.id);
  const totalAbsences = eleveAbsences.filter(a => a.type === 'Absent').length;
  const totalRetards = eleveAbsences.filter(a => a.type === 'Retard').length;
  const justifiees = eleveAbsences.filter(a => a.justifie).length;
  const nonJustifiees = eleveAbsences.filter(a => !a.justifie).length;

  return (
    <div>
      {/* Stats absences */}
      <div className="grid-4 mb-16">
        <div className="stat-card">
          <div className="stat-card-label">Total absences</div>
          <div className="stat-card-value">{totalAbsences}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Retards</div>
          <div className="stat-card-value" style={{ color: '#f39c12' }}>{totalRetards}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Justifiées</div>
          <div className="stat-card-value" style={{ color: '#27ae60' }}>{justifiees}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Non justifiées</div>
          <div className="stat-card-value" style={{ color: '#e74c3c' }}>{nonJustifiees}</div>
        </div>
      </div>

      {/* Tableau */}
      {eleveAbsences.length > 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Horaire</th>
                    <th>Motif</th>
                    <th>Justifiée</th>
                  </tr>
                </thead>
                <tbody>
                  {eleveAbsences
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((a, i) => (
                      <tr key={i}>
                        <td>{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <span className={`badge ${a.type === 'Absent' ? 'badge-danger' : 'badge-warning'}`}>
                            {a.type}
                          </span>
                        </td>
                        <td>{a.heureDebut} - {a.heureFin}</td>
                        <td>{a.motif}</td>
                        <td>
                          <span className={`badge ${a.justifie ? 'badge-success' : 'badge-danger'}`}>
                            {a.justifie ? 'Oui' : 'Non'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message="Aucune absence enregistrée pour cet élève." />
      )}
    </div>
  );
}

// ---- Tab: Notes ----
function TabNotes({ eleve }: { eleve: Eleve }) {
  const eleveNotes = notes.filter(n => n.eleveId === eleve.id && n.trimestre === 1);

  // Group by matiere and calculate averages
  const moyennesParMatiere = useMemo(() => {
    const grouped: Record<number, { notes: number[]; matiere: (typeof matieres)[number] }> = {};
    eleveNotes.forEach(n => {
      if (!grouped[n.matiereId]) {
        const mat = matieres.find(m => m.id === n.matiereId);
        if (mat) grouped[n.matiereId] = { notes: [], matiere: mat };
      }
      if (grouped[n.matiereId]) {
        grouped[n.matiereId].notes.push(n.note);
      }
    });
    return Object.values(grouped).map(g => ({
      matiere: g.matiere,
      moyenne: Math.round((g.notes.reduce((s, v) => s + v, 0) / g.notes.length) * 100) / 100,
      nbNotes: g.notes.length,
      min: Math.min(...g.notes),
      max: Math.max(...g.notes),
    }));
  }, [eleveNotes]);

  const moyenneGenerale = moyennesParMatiere.length > 0
    ? Math.round(
        (moyennesParMatiere.reduce((s, m) => s + m.moyenne * m.matiere.coefficient, 0) /
          moyennesParMatiere.reduce((s, m) => s + m.matiere.coefficient, 0)) * 100
      ) / 100
    : null;

  return (
    <div>
      {/* Moyenne generale */}
      {moyenneGenerale !== null && (
        <div className="card mb-16">
          <div className="card-body" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Moyenne générale - Trimestre 1</div>
            <div style={{
              fontSize: '32px',
              fontWeight: 700,
              color: moyenneGenerale >= 10 ? '#27ae60' : '#e74c3c',
            }}>
              {moyenneGenerale}/20
            </div>
          </div>
        </div>
      )}

      {/* Moyennes par matiere */}
      {moyennesParMatiere.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Moyennes par matière - Trimestre 1</h4>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Coeff.</th>
                    <th>Nb notes</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {moyennesParMatiere.map((m, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: m.matiere.couleur, display: 'inline-block'
                          }} />
                          {m.matiere.nom}
                        </div>
                      </td>
                      <td>{m.matiere.coefficient}</td>
                      <td>{m.nbNotes}</td>
                      <td>{m.min.toFixed(2)}</td>
                      <td>{m.max.toFixed(2)}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: m.moyenne >= 10 ? '#27ae60' : '#e74c3c',
                        }}>
                          {m.moyenne.toFixed(2)}/20
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message="Aucune note disponible pour cet élève au trimestre 1." />
      )}

      {/* Detail des notes */}
      {eleveNotes.length > 0 && (
        <div className="card mt-16">
          <div className="card-header">
            <h4 className="card-title">Détail des notes</h4>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Matière</th>
                    <th>Type</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {eleveNotes
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((n, i) => {
                      const mat = matieres.find(m => m.id === n.matiereId);
                      return (
                        <tr key={i}>
                          <td>{new Date(n.date).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <span className="badge badge-primary" style={{ background: `${mat?.couleur}20`, color: mat?.couleur }}>
                              {mat?.abr || '-'}
                            </span>
                          </td>
                          <td>{n.type}</td>
                          <td>
                            <span style={{ fontWeight: 600, color: n.note >= 10 ? '#27ae60' : '#e74c3c' }}>
                              {n.note.toFixed(2)}/{n.sur}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Tab: Finances ----
function TabFinances({ eleve }: { eleve: Eleve }) {
  const eleveFactures = factures.filter(f => f.eleveId === eleve.id);
  const totalDu = eleveFactures.reduce((s, f) => s + f.montant, 0);
  const totalPaye = eleveFactures.reduce((s, f) => s + f.paye, 0);
  const solde = totalPaye - totalDu;

  return (
    <div>
      {/* Stats finances */}
      <div className="grid-3 mb-16">
        <div className="stat-card">
          <div className="stat-card-label">Total facturé</div>
          <div className="stat-card-value" style={{ fontSize: '18px' }}>{formatCFA(totalDu)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total payé</div>
          <div className="stat-card-value" style={{ color: '#27ae60', fontSize: '18px' }}>{formatCFA(totalPaye)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Solde</div>
          <div className="stat-card-value" style={{ color: solde < 0 ? '#e74c3c' : '#27ae60', fontSize: '18px' }}>{formatCFA(solde)}</div>
        </div>
      </div>

      {/* Factures */}
      {eleveFactures.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Factures</h4>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Type</th>
                    <th>Montant</th>
                    <th>Payé</th>
                    <th>Reste</th>
                    <th>Échéance</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {eleveFactures.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{f.numero}</td>
                      <td>{f.type}</td>
                      <td>{formatCFA(f.montant)}</td>
                      <td>{formatCFA(f.paye)}</td>
                      <td style={{ fontWeight: 600, color: f.montant - f.paye > 0 ? '#e74c3c' : '#27ae60' }}>
                        {formatCFA(f.montant - f.paye)}
                      </td>
                      <td>{new Date(f.echeance).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <span className={`badge ${f.statut === 'Payé' ? 'badge-success' : f.statut === 'Partiel' ? 'badge-warning' : 'badge-danger'}`}>
                          {f.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message="Aucune facture pour cet élève." />
      )}
    </div>
  );
}

// ---- Tab: Discipline ----
function TabDiscipline({ eleve }: { eleve: Eleve }) {
  const eleveSanctions = Array.isArray(sanctions)
    ? sanctions.filter((s: any) => s.eleveId === eleve.id)
    : [];
  const eleveDistinctions = Array.isArray(distinctions)
    ? distinctions.filter((d: any) => d.eleveId === eleve.id)
    : [];

  return (
    <div>
      {/* Sanctions */}
      <div className="card mb-16">
        <div className="card-header">
          <h4 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} /> Sanctions
            {eleveSanctions.length > 0 && (
              <span className="badge badge-danger" style={{ fontSize: '11px' }}>{eleveSanctions.length}</span>
            )}
          </h4>
        </div>
        <div className="card-body">
          {eleveSanctions.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Motif</th>
                    <th>Décidé par</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {eleveSanctions.map((s: any, i: number) => (
                    <tr key={i}>
                      <td>{s.date ? new Date(s.date).toLocaleDateString('fr-FR') : '-'}</td>
                      <td>
                        <span className={`badge ${s.type === 'Exclusion' ? 'badge-danger' : s.type === 'Avertissement' ? 'badge-warning' : 'badge-secondary'}`}>
                          {s.type}
                        </span>
                      </td>
                      <td>{s.motif || '-'}</td>
                      <td>{s.decidePar || s.par || '-'}</td>
                      <td>{s.duree || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Aucune sanction pour cet élève." />
          )}
        </div>
      </div>

      {/* Distinctions */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} /> Distinctions
            {eleveDistinctions.length > 0 && (
              <span className="badge badge-success" style={{ fontSize: '11px' }}>{eleveDistinctions.length}</span>
            )}
          </h4>
        </div>
        <div className="card-body">
          {eleveDistinctions.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Motif</th>
                    <th>Attribué par</th>
                  </tr>
                </thead>
                <tbody>
                  {eleveDistinctions.map((d: any, i: number) => (
                    <tr key={i}>
                      <td>{d.date ? new Date(d.date).toLocaleDateString('fr-FR') : '-'}</td>
                      <td>
                        <span className="badge badge-success">{d.type}</span>
                      </td>
                      <td>{d.motif || '-'}</td>
                      <td>{d.attribuePar || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="Aucune distinction pour cet élève." />
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════
export default function ElevesPage() {
  const { showToast } = useToast();
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('identite');
  const [filterEtab, setFilterEtab] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [filterSexe, setFilterSexe] = useState('');

  // ---- Create form state ----
  const [newEleve, setNewEleve] = useState({
    prenom: '', nom: '', dateNaissance: '', sexe: 'M', classeId: '', contactUrgence: '',
    responsable1Nom: '', responsable1Lien: 'Père', responsable1Tel: '',
    responsable2Nom: '', responsable2Lien: 'Mère', responsable2Tel: '',
  });

  // ---- Filter data ----
  const data = useMemo(() => {
    return eleves.filter(e => {
      if (filterEtab && e.etablissementId !== Number(filterEtab)) return false;
      if (filterStatut && e.statut !== filterStatut) return false;
      if (filterClasse && e.classeId !== Number(filterClasse)) return false;
      if (filterSexe && e.sexe !== filterSexe) return false;
      return true;
    });
  }, [filterEtab, filterStatut, filterClasse, filterSexe]);

  // ---- Stats ----
  const totalEleves = eleves.length;
  const actifs = eleves.filter(e => e.statut === 'Actif').length;
  const transferes = eleves.filter(e => e.statut === 'Transféré').length;
  const inactifs = eleves.filter(e => e.statut === 'Inactif').length;
  const garcons = eleves.filter(e => e.sexe === 'M').length;
  const filles = eleves.filter(e => e.sexe === 'F').length;

  // ---- Filtered classes (based on establishment filter) ----
  const filteredClasses = filterEtab
    ? classes.filter(c => c.etablissementId === Number(filterEtab))
    : classes;

  // ---- Open dossier ----
  const openDossier = (eleve: Eleve) => {
    setSelectedEleve(eleve);
    setActiveTab('identite');
    setShowModal(true);
  };

  // ---- Export PDF ----
  const handleExportPDF = () => {
    window.print();
    showToast('Export PDF lancé', 'info');
  };

  // ---- Create eleve ----
  const handleCreate = () => {
    if (!newEleve.prenom || !newEleve.nom || !newEleve.dateNaissance || !newEleve.classeId) {
      showToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    showToast(`Élève ${newEleve.prenom} ${newEleve.nom} créé avec succès`, 'success');
    setShowCreateModal(false);
    setNewEleve({
      prenom: '', nom: '', dateNaissance: '', sexe: 'M', classeId: '', contactUrgence: '',
      responsable1Nom: '', responsable1Lien: 'Pere', responsable1Tel: '',
      responsable2Nom: '', responsable2Lien: 'Mere', responsable2Tel: '',
    });
  };

  // ---- Table columns ----
  const columns = [
    {
      header: 'Élève',
      accessor: (r: Eleve) => `${r.prenom} ${r.nom}`,
      render: (r: Eleve) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar avatar-sm" style={{
            background: r.sexe === 'M' ? '#dbeafe' : '#fce7f3',
            color: r.sexe === 'M' ? '#1e3a5f' : '#ec4899',
            fontSize: '11px',
          }}>
            {r.prenom[0]}{r.nom[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{r.prenom} {r.nom}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.matricule}</div>
          </div>
        </div>
      ),
    },
    { header: 'Classe', accessor: 'classe' },
    {
      header: 'Établissement',
      accessor: (r: Eleve) =>
        etablissements.find(e => e.id === r.etablissementId)?.nom
          ?.replace('École Primaire ', '')
          .replace("Lycée d'Excellence ", '') || '',
    },
    {
      header: 'Date de naissance',
      accessor: 'dateNaissance',
      render: (r: Eleve) => new Date(r.dateNaissance).toLocaleDateString('fr-FR'),
    },
    {
      header: 'Sexe',
      render: (r: Eleve) => (
        <span className={`badge ${r.sexe === 'M' ? 'badge-info' : 'badge-primary'}`}>
          {r.sexe === 'M' ? 'M' : 'F'}
        </span>
      ),
    },
    {
      header: 'Statut',
      render: (r: Eleve) => (
        <span className={`badge ${r.statut === 'Actif' ? 'badge-success' : r.statut === 'Transféré' ? 'badge-warning' : 'badge-secondary'}`}>
          {r.statut}
        </span>
      ),
    },
    {
      header: 'Actions',
      sortable: false,
      render: (r: Eleve) => (
        <div className="table-actions">
          <button className="btn btn-ghost btn-icon" title="Voir le dossier" onClick={(e) => { e.stopPropagation(); openDossier(r); }}>
            <Eye size={16} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Modifier">
            <Edit size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ---- Render active tab content ----
  const renderTabContent = () => {
    if (!selectedEleve) return null;
    switch (activeTab) {
      case 'identite': return <TabIdentite eleve={selectedEleve} />;
      case 'responsables': return <TabResponsables eleve={selectedEleve} />;
      case 'scolarite': return <TabScolarite eleve={selectedEleve} />;
      case 'medical': return <TabMedical eleve={selectedEleve} />;
      case 'absences': return <TabAbsences eleve={selectedEleve} />;
      case 'notes': return <TabNotes eleve={selectedEleve} />;
      case 'finances': return <TabFinances eleve={selectedEleve} />;
      case 'discipline': return <TabDiscipline eleve={selectedEleve} />;
      default: return null;
    }
  };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>ERP</span><span className="breadcrumb-sep">/</span><span>Élèves</span>
          </div>
          <h1 className="page-title">Gestion des Élèves</h1>
          <p className="page-subtitle">Dossiers élèves du Groupe LE GUIDE DE NOS ENFANTS</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => { window.print(); showToast('Export lancé', 'info'); }}>
            <Download size={16} /> Exporter
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Nouvel élève
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        <div className="stat-card">
          <div className="stat-card-label">Total élèves</div>
          <div className="stat-card-value">{totalEleves}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Actifs</div>
          <div className="stat-card-value" style={{ color: '#27ae60' }}>{actifs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Garcons / Filles</div>
          <div className="stat-card-value" style={{ fontSize: '20px' }}>
            <span style={{ color: '#3498db' }}>{garcons}</span>
            <span style={{ color: '#9ca3af', margin: '0 6px' }}>/</span>
            <span style={{ color: '#ec4899' }}>{filles}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Transférés / Inactifs</div>
          <div className="stat-card-value" style={{ fontSize: '20px' }}>
            <span style={{ color: '#f39c12' }}>{transferes}</span>
            <span style={{ color: '#9ca3af', margin: '0 6px' }}>/</span>
            <span style={{ color: '#6b7280' }}>{inactifs}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-12 mb-16" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-select" style={{ width: '200px' }} value={filterEtab} onChange={e => { setFilterEtab(e.target.value); setFilterClasse(''); }}>
          <option value="">Tous les établissements</option>
          {etablissements.map(e => (
            <option key={e.id} value={e.id}>
              {e.nom.replace('École Primaire ', '').replace("Lycée d'Excellence ", '')}
            </option>
          ))}
        </select>
        <select className="form-select" style={{ width: '160px' }} value={filterClasse} onChange={e => setFilterClasse(e.target.value)}>
          <option value="">Toutes les classes</option>
          {filteredClasses.map(c => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
        <select className="form-select" style={{ width: '140px' }} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Transféré">Transféré</option>
          <option value="Inactif">Inactif</option>
        </select>
        <select className="form-select" style={{ width: '130px' }} value={filterSexe} onChange={e => setFilterSexe(e.target.value)}>
          <option value="">Tous les sexes</option>
          <option value="M">Garçons</option>
          <option value="F">Filles</option>
        </select>
        <span className="badge badge-secondary" style={{ padding: '8px 14px' }}>
          {data.length} élève{data.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Rechercher un élève par nom, prénom ou matricule..."
        onRowClick={(r: Eleve) => openDossier(r)}
      />

      {/* ═══════════════════════════════════════════════════════
          MODAL: Dossier Eleve Complet
          ═══════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Dossier Élève"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Fermer</button>
            <button className="btn btn-primary" onClick={handleExportPDF}>
              <Printer size={16} /> Exporter PDF
            </button>
          </>
        }
      >
        {selectedEleve && (
          <div>
            {/* Header du dossier */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
              <div className="avatar avatar-xl" style={{
                background: selectedEleve.sexe === 'M' ? '#dbeafe' : '#fce7f3',
                color: selectedEleve.sexe === 'M' ? '#1e3a5f' : '#ec4899',
                flexShrink: 0,
              }}>
                {selectedEleve.prenom[0]}{selectedEleve.nom[0]}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{selectedEleve.prenom} {selectedEleve.nom}</h2>
                <p style={{ color: '#6b7280', margin: '4px 0 8px' }}>
                  {selectedEleve.matricule} &middot; {selectedEleve.classe} &middot;{' '}
                  {etablissements.find(e => e.id === selectedEleve.etablissementId)?.nom
                    ?.replace('École Primaire ', '')
                    .replace("Lycée d'Excellence ", '') || ''}
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`badge ${selectedEleve.statut === 'Actif' ? 'badge-success' : selectedEleve.statut === 'Transféré' ? 'badge-warning' : 'badge-secondary'}`}>
                    {selectedEleve.statut}
                  </span>
                  <span className={`badge ${selectedEleve.sexe === 'M' ? 'badge-info' : 'badge-primary'}`}>
                    {selectedEleve.sexe === 'M' ? 'Garçon' : 'Fille'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab bar */}
            <div className="tab-bar" style={{ marginBottom: '20px', overflowX: 'auto' }}>
              {TAB_CONFIG.map(tab => (
                <div
                  key={tab.key}
                  className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  {tab.icon} {tab.label}
                </div>
              ))}
            </div>

            {/* Tab content */}
            <div className="fade-in" key={activeTab}>
              {renderTabContent()}
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════
          MODAL: Creation Eleve
          ═══════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel Élève"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleCreate}>
              <UserPlus size={16} /> Créer l'élève
            </button>
          </>
        }
      >
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Informations personnelles</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prénom *</label>
              <input
                className="form-control"
                placeholder="Prénom de l'élève"
                value={newEleve.prenom}
                onChange={e => setNewEleve({ ...newEleve, prenom: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input
                className="form-control"
                placeholder="Nom de famille"
                value={newEleve.nom}
                onChange={e => setNewEleve({ ...newEleve, nom: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date de naissance *</label>
              <input
                className="form-control"
                type="date"
                value={newEleve.dateNaissance}
                onChange={e => setNewEleve({ ...newEleve, dateNaissance: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sexe *</label>
              <select
                className="form-select"
                value={newEleve.sexe}
                onChange={e => setNewEleve({ ...newEleve, sexe: e.target.value })}
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Classe *</label>
              <select
                className="form-select"
                value={newEleve.classeId}
                onChange={e => setNewEleve({ ...newEleve, classeId: e.target.value })}
              >
                <option value="">-- Choisir une classe --</option>
                {classes.map(c => {
                  const etab = etablissements.find(e => e.id === c.etablissementId);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.nom} ({etab?.nom?.replace('École Primaire ', '').replace("Lycée d'Excellence ", '') || ''})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact d'urgence</label>
              <input
                className="form-control"
                placeholder="+241 ..."
                value={newEleve.contactUrgence}
                onChange={e => setNewEleve({ ...newEleve, contactUrgence: e.target.value })}
              />
            </div>
          </div>

          <div className="divider" />

          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Responsable 1</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                className="form-control"
                placeholder="Nom du responsable"
                value={newEleve.responsable1Nom}
                onChange={e => setNewEleve({ ...newEleve, responsable1Nom: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lien</label>
              <select
                className="form-select"
                value={newEleve.responsable1Lien}
                onChange={e => setNewEleve({ ...newEleve, responsable1Lien: e.target.value })}
              >
                <option value="Père">Père</option>
                <option value="Mère">Mère</option>
                <option value="Tuteur">Tuteur</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input
                className="form-control"
                placeholder="+241 ..."
                value={newEleve.responsable1Tel}
                onChange={e => setNewEleve({ ...newEleve, responsable1Tel: e.target.value })}
              />
            </div>
            <div className="form-group" />
          </div>

          <div className="divider" />

          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Responsable 2</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                className="form-control"
                placeholder="Nom du responsable"
                value={newEleve.responsable2Nom}
                onChange={e => setNewEleve({ ...newEleve, responsable2Nom: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lien</label>
              <select
                className="form-select"
                value={newEleve.responsable2Lien}
                onChange={e => setNewEleve({ ...newEleve, responsable2Lien: e.target.value })}
              >
                <option value="Père">Père</option>
                <option value="Mère">Mère</option>
                <option value="Tuteur">Tuteur</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input
                className="form-control"
                placeholder="+241 ..."
                value={newEleve.responsable2Tel}
                onChange={e => setNewEleve({ ...newEleve, responsable2Tel: e.target.value })}
              />
            </div>
            <div className="form-group" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
