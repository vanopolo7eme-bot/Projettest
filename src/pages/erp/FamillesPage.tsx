import React, { useState, useMemo } from 'react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import {
  familles, eleves, classes, etablissements, factures, absences,
  notes, matieres, messages, paiements, remisesFratrie,
} from '../../data/mockData';
import {
  Plus, Eye, Users, DollarSign, UserCheck, AlertTriangle,
  Phone, Mail, GraduationCap, CreditCard, MessageSquare,
  FileText, User, BookOpen, Clock, Send, Download,
  CheckCircle, XCircle, ChevronRight, BarChart3, X,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// ---- Types ----
type Famille = (typeof familles)[number];
type TabKey = 'overview' | 'enfants' | 'finances' | 'communication' | 'documents';

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: <Users size={14} /> },
  { key: 'enfants', label: 'Enfants', icon: <GraduationCap size={14} /> },
  { key: 'finances', label: 'Finances', icon: <CreditCard size={14} /> },
  { key: 'communication', label: 'Communication', icon: <MessageSquare size={14} /> },
  { key: 'documents', label: 'Documents', icon: <FileText size={14} /> },
];

// ---- Helpers ----
function formatCFA(montant: number) {
  return montant.toLocaleString('fr-FR') + ' FCFA';
}

function getElevesByFamille(fam: Famille) {
  return fam.enfants.map(id => eleves.find(e => e.id === id)).filter(Boolean) as (typeof eleves)[number][];
}

function getEleveMoyenne(eleveId: number): number | null {
  const eleveNotes = notes.filter(n => n.eleveId === eleveId);
  if (eleveNotes.length === 0) return null;
  const sum = eleveNotes.reduce((acc, n) => acc + n.note, 0);
  return Math.round((sum / eleveNotes.length) * 100) / 100;
}

function getFamilleFactures(familleId: number) {
  return factures.filter(f => f.familleId === familleId);
}

function getFamillePaiements(familleId: number) {
  const factureIds = getFamilleFactures(familleId).map(f => f.id);
  return paiements.filter(p => factureIds.includes(p.factureId));
}

function getRemiseFratrie(nbEnfants: number): { pourcentage: number; label: string } {
  if (nbEnfants >= 3) return { pourcentage: 15, label: '15% (3+ enfants)' };
  if (nbEnfants >= 2) return { pourcentage: 10, label: '10% (2 enfants)' };
  return { pourcentage: 0, label: 'Aucune' };
}

function getFamilleMessages(fam: Famille) {
  const nomFamille = fam.nom.toLowerCase();
  const nomPere = fam.pere.toLowerCase();
  const nomMere = fam.mere.toLowerCase();
  return messages.filter(m => {
    const dest = m.destinataire.toLowerCase();
    const exp = m.expediteur.nom.toLowerCase();
    return dest.includes(nomFamille) || dest.includes(nomPere) || dest.includes(nomMere)
      || exp.includes(nomPere) || exp.includes(nomMere)
      || dest === 'tous';
  });
}

// ---- Tab: Vue d'ensemble ----
function TabOverview({ famille }: { famille: Famille }) {
  const kids = getElevesByFamille(famille);
  const facs = getFamilleFactures(famille.id);
  const totalFacture = facs.reduce((s, f) => s + f.montant, 0);
  const totalPaye = facs.reduce((s, f) => s + f.paye, 0);
  const remise = getRemiseFratrie(kids.length);
  const moyennes = kids.map(k => getEleveMoyenne(k.id)).filter(v => v !== null) as number[];
  const moyFamiliale = moyennes.length > 0 ? Math.round((moyennes.reduce((a, b) => a + b, 0) / moyennes.length) * 100) / 100 : null;

  return (
    <div>
      {/* Carte famille */}
      <div className="card mb-24">
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div className="avatar avatar-xl" style={{ background: '#e8f4f8', color: '#1e3a5f', flexShrink: 0 }}>
            {famille.nom.split(' ').pop()?.[0] || 'F'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{famille.nom}</h2>
            <div className="grid-2 mt-16" style={{ gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                <User size={15} style={{ color: '#3498db' }} />
                <span><strong>Pere :</strong> {famille.pere}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                <User size={15} style={{ color: '#ec4899' }} />
                <span><strong>Mere :</strong> {famille.mere}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                <Phone size={15} style={{ color: '#6b7280' }} />
                <span>{famille.telephone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                <Mail size={15} style={{ color: '#6b7280' }} />
                <span>{famille.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume chiffres */}
      <div className="grid-4 mb-24">
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e3a5f' }}>{kids.length}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Enfants inscrits</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: moyFamiliale && moyFamiliale >= 10 ? '#27ae60' : '#e74c3c' }}>
            {moyFamiliale !== null ? `${moyFamiliale}/20` : 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Moyenne familiale</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: famille.solde === 0 ? '#27ae60' : '#e74c3c' }}>
            {famille.solde === 0 ? 'A jour' : formatCFA(Math.abs(famille.solde))}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Solde global</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f39c12' }}>{remise.label}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Remise fratrie</div>
        </div>
      </div>

      {/* Liste enfants */}
      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Enfants</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {kids.map(kid => {
          const cl = classes.find(c => c.id === kid.classeId);
          const etab = etablissements.find(e => e.id === kid.etablissementId);
          const moy = getEleveMoyenne(kid.id);
          return (
            <div key={kid.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="avatar avatar-sm" style={{
                background: kid.sexe === 'M' ? '#dbeafe' : '#fce7f3',
                color: kid.sexe === 'M' ? '#1e3a5f' : '#ec4899',
              }}>
                {kid.prenom[0]}{kid.nom[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{kid.prenom} {kid.nom}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{cl?.nom || kid.classe} - {etab?.nom || ''}</div>
              </div>
              <span className={`badge ${kid.statut === 'Actif' ? 'badge-success' : kid.statut === 'Transfere' ? 'badge-warning' : 'badge-secondary'}`}>
                {kid.statut}
              </span>
              {moy !== null && (
                <span style={{ fontWeight: 700, color: moy >= 10 ? '#27ae60' : '#e74c3c', fontSize: '14px', minWidth: '60px', textAlign: 'right' }}>
                  {moy}/20
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Tab: Enfants ----
function TabEnfants({ famille }: { famille: Famille }) {
  const kids = getElevesByFamille(famille);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {kids.map(kid => {
        const cl = classes.find(c => c.id === kid.classeId);
        const etab = etablissements.find(e => e.id === kid.etablissementId);
        const moy = getEleveMoyenne(kid.id);
        const kidAbsences = absences.filter(a => a.eleveId === kid.id).slice(0, 5);
        const kidNotes = notes.filter(n => n.eleveId === kid.id).slice(0, 5);

        return (
          <div key={kid.id} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div className="avatar avatar-lg" style={{
                background: kid.sexe === 'M' ? '#dbeafe' : '#fce7f3',
                color: kid.sexe === 'M' ? '#1e3a5f' : '#ec4899',
              }}>
                {kid.prenom[0]}{kid.nom[0]}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{kid.prenom} {kid.nom}</h3>
                <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '13px' }}>
                  {cl?.nom || kid.classe} | {etab?.nom || ''} | Matricule : {kid.matricule}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <span className={`badge ${kid.statut === 'Actif' ? 'badge-success' : 'badge-secondary'}`}>{kid.statut}</span>
                  {moy !== null && (
                    <span className={`badge ${moy >= 14 ? 'badge-success' : moy >= 10 ? 'badge-primary' : 'badge-danger'}`}>
                      Moy: {moy}/20
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Dernieres notes */}
            {kidNotes.length > 0 && (
              <div className="mb-16">
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  <BarChart3 size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  Dernieres notes
                </h4>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {kidNotes.map(n => {
                    const mat = matieres.find(m => m.id === n.matiereId);
                    return (
                      <span key={n.id} className="badge" style={{
                        background: `${mat?.couleur || '#3498db'}15`,
                        color: mat?.couleur || '#3498db',
                        fontSize: '11px',
                      }}>
                        {mat?.abr || '?'}: {n.note}/{n.sur}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dernieres absences */}
            {kidAbsences.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  Dernieres absences ({kidAbsences.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {kidAbsences.map(a => (
                    <div key={a.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
                      <span className={`badge ${a.type === 'Retard' ? 'badge-warning' : a.justifie ? 'badge-info' : 'badge-danger'}`} style={{ fontSize: '10px' }}>
                        {a.type}
                      </span>
                      <span style={{ color: '#6b7280' }}>{a.date}</span>
                      <span style={{ color: '#374151' }}>{a.motif}</span>
                      {a.justifie && <CheckCircle size={12} style={{ color: '#27ae60' }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kidAbsences.length === 0 && kidNotes.length === 0 && (
              <div className="alert alert-info" style={{ textAlign: 'center', padding: '12px', fontSize: '13px' }}>
                Aucune donnee complementaire disponible
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- Tab: Finances ----
function TabFinances({ famille }: { famille: Famille }) {
  const kids = getElevesByFamille(famille);
  const facs = getFamilleFactures(famille.id);
  const pays = getFamillePaiements(famille.id);
  const totalFacture = facs.reduce((s, f) => s + f.montant, 0);
  const totalPaye = facs.reduce((s, f) => s + f.paye, 0);
  const totalReste = totalFacture - totalPaye;
  const remise = getRemiseFratrie(kids.length);

  return (
    <div>
      {/* Resume financier */}
      <div className="grid-3 mb-24">
        <div className="card" style={{ textAlign: 'center', padding: '18px', borderLeft: '4px solid #3498db' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total facture</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e3a5f', marginTop: '4px' }}>{formatCFA(totalFacture)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '18px', borderLeft: '4px solid #27ae60' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total paye</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#27ae60', marginTop: '4px' }}>{formatCFA(totalPaye)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '18px', borderLeft: `4px solid ${totalReste > 0 ? '#e74c3c' : '#27ae60'}` }}>
          <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reste a payer</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: totalReste > 0 ? '#e74c3c' : '#27ae60', marginTop: '4px' }}>
            {totalReste > 0 ? formatCFA(totalReste) : 'A jour'}
          </div>
        </div>
      </div>

      {/* Remise fratrie */}
      {remise.pourcentage > 0 && (
        <div className="alert alert-info mb-16" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DollarSign size={16} />
          <span>Remise fratrie applicable : <strong>{remise.label}</strong> ({kids.length} enfants inscrits)</span>
        </div>
      )}

      {/* Factures */}
      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Factures</h3>
      {facs.length === 0 ? (
        <div className="alert alert-info" style={{ textAlign: 'center' }}>Aucune facture</div>
      ) : (
        <div className="table-container mb-24">
          <table>
            <thead>
              <tr>
                <th>Numero</th>
                <th>Eleve</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Paye</th>
                <th>Statut</th>
                <th>Echeance</th>
              </tr>
            </thead>
            <tbody>
              {facs.map(f => {
                const kid = eleves.find(e => e.id === f.eleveId);
                return (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600, fontSize: '13px' }}>{f.numero}</td>
                    <td>{kid ? `${kid.prenom} ${kid.nom}` : '-'}</td>
                    <td>{f.type}</td>
                    <td style={{ fontWeight: 600 }}>{formatCFA(f.montant)}</td>
                    <td>{formatCFA(f.paye)}</td>
                    <td>
                      <span className={`badge ${f.statut === 'Paye' ? 'badge-success' : f.statut === 'Partiel' ? 'badge-warning' : 'badge-danger'}`}>
                        {f.statut}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280' }}>{f.echeance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Historique paiements */}
      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Historique des paiements</h3>
      {pays.length === 0 ? (
        <div className="alert alert-info" style={{ textAlign: 'center' }}>Aucun paiement enregistre</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Montant</th>
                <th>Methode</th>
                <th>Reference</th>
                <th>Recu</th>
              </tr>
            </thead>
            <tbody>
              {pays.map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize: '13px' }}>{p.date}</td>
                  <td style={{ fontWeight: 700, color: '#27ae60' }}>{formatCFA(p.montant)}</td>
                  <td>{p.methode}</td>
                  <td style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>{p.reference}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }}>
                      <Download size={13} /> {p.recu}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Tab: Communication ----
function TabCommunication({ famille }: { famille: Famille }) {
  const msgs = getFamilleMessages(famille);
  const { showToast } = useToast();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Messages ({msgs.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => showToast('Fonctionnalite d\'envoi bientot disponible', 'info')}>
          <Send size={14} /> Envoyer un message
        </button>
      </div>

      {msgs.length === 0 ? (
        <div className="alert alert-info" style={{ textAlign: 'center', padding: '24px' }}>
          Aucun message echange avec cette famille
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {msgs.map(m => (
            <div key={m.id} className="card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{m.sujet}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    De : {m.expediteur.nom} ({m.expediteur.role}) &rarr; {m.destinataire}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>{m.date}</span>
                  {!m.lu && <span className="badge badge-danger" style={{ fontSize: '10px' }}>Non lu</span>}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{m.contenu}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Tab: Documents ----
function TabDocuments({ famille }: { famille: Famille }) {
  const docs = [
    { id: 1, nom: `Contrat de scolarite - ${famille.nom}`, type: 'PDF', date: '2025-09-01', taille: '1.2 MB' },
    { id: 2, nom: `Fiche de renseignements - ${famille.nom}`, type: 'PDF', date: '2025-08-25', taille: '340 KB' },
    { id: 3, nom: `Accord de reglement interieur`, type: 'PDF', date: '2025-09-02', taille: '890 KB' },
    { id: 4, nom: `Autorisation de droit a l'image`, type: 'PDF', date: '2025-09-02', taille: '210 KB' },
  ];

  return (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Documents partages</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {docs.map(d => (
          <div key={d.id} className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: '#fef3c7', color: '#f59e0b',
            }}>
              <FileText size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>{d.nom}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{d.type} - {d.taille} - {d.date}</div>
            </div>
            <button className="btn btn-ghost btn-sm">
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="alert alert-info mt-16" style={{ textAlign: 'center', fontSize: '13px' }}>
        Les documents sont generes automatiquement lors de l'inscription et disponibles en telechargement.
      </div>
    </div>
  );
}

// ---- Formulaire nouvelle famille ----
function FormNouvelleFamille({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ nom: '', pere: '', mere: '', telephone: '', email: '' });
  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, nom: form.nom || `Famille ${form.pere.split(' ').pop() || ''}` });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nom de la famille</label>
        <input type="text" placeholder="Ex: Famille Obame" value={form.nom} onChange={e => update('nom', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Pere *</label>
          <input type="text" placeholder="Prenom et nom du pere" value={form.pere} onChange={e => update('pere', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mere *</label>
          <input type="text" placeholder="Prenom et nom de la mere" value={form.mere} onChange={e => update('mere', e.target.value)} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Telephone *</label>
          <input type="tel" placeholder="+241 0X XX XX XX" value={form.telephone} onChange={e => update('telephone', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="email@exemple.ga" value={form.email} onChange={e => update('email', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn btn-primary"><Plus size={14} /> Creer la famille</button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function FamillesPage() {
  const [selectedFamille, setSelectedFamille] = useState<Famille | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showCreate, setShowCreate] = useState(false);
  const { showToast } = useToast();

  // ---- Stats ----
  const stats = useMemo(() => {
    const totalEnfants = familles.reduce((s, f) => s + f.enfants.length, 0);
    const aJour = familles.filter(f => f.solde === 0).length;
    const impayes = familles.filter(f => f.solde < 0).length;
    return { totalFamilles: familles.length, totalEnfants, aJour, impayes };
  }, []);

  // ---- Open dossier ----
  const openDossier = (fam: Famille) => {
    setSelectedFamille(fam);
    setActiveTab('overview');
  };

  // ---- Columns ----
  const columns = [
    {
      header: 'Famille', accessor: 'nom', render: (r: Famille) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar avatar-sm" style={{ background: '#e8f4f8', color: '#1e3a5f', fontSize: '11px' }}>
            {r.nom.split(' ').pop()?.[0] || 'F'}F
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{r.nom}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Parents', render: (r: Famille) => (
        <div>
          <div style={{ fontSize: '13px' }}>{r.pere}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{r.mere}</div>
        </div>
      ),
    },
    {
      header: 'Enfants', render: (r: Famille) => {
        const kids = getElevesByFamille(r);
        return (
          <div>
            {kids.map(k => (
              <span key={k.id} className="badge badge-primary" style={{ marginRight: '4px', marginBottom: '2px', fontSize: '11px' }}>
                {k.prenom} ({k.classe})
              </span>
            ))}
          </div>
        );
      },
    },
    { header: 'Telephone', accessor: 'telephone' },
    {
      header: 'Solde', render: (r: Famille) => (
        <span style={{ fontWeight: 700, color: r.solde === 0 ? '#27ae60' : '#e74c3c' }}>
          {r.solde === 0 ? 'A jour' : `${Math.abs(r.solde).toLocaleString('fr-FR')} FCFA`}
        </span>
      ),
    },
    {
      header: 'Statut', render: (r: Famille) => (
        <span className={`badge ${r.solde === 0 ? 'badge-success' : r.solde > -100000 ? 'badge-warning' : 'badge-danger'}`}>
          {r.solde === 0 ? 'A jour' : 'Solde debiteur'}
        </span>
      ),
    },
    {
      header: '', sortable: false, render: (r: Famille) => (
        <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); openDossier(r); }}>
          <Eye size={16} />
        </button>
      ),
    },
  ];

  // ---- Render tab content ----
  const renderTabContent = () => {
    if (!selectedFamille) return null;
    switch (activeTab) {
      case 'overview': return <TabOverview famille={selectedFamille} />;
      case 'enfants': return <TabEnfants famille={selectedFamille} />;
      case 'finances': return <TabFinances famille={selectedFamille} />;
      case 'communication': return <TabCommunication famille={selectedFamille} />;
      case 'documents': return <TabDocuments famille={selectedFamille} />;
      default: return null;
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>ERP</span><span className="breadcrumb-sep">/</span><span>Familles</span>
          </div>
          <h1 className="page-title">Gestion des Familles</h1>
          <p className="page-subtitle">Vision consolidee des cellules familiales et facturation</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Nouvelle famille
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-24">
        <StatCard label="Total familles" value={stats.totalFamilles} icon={<Users size={20} />} color="#1e3a5f" />
        <StatCard label="Total enfants inscrits" value={stats.totalEnfants} icon={<GraduationCap size={20} />} color="#3498db" />
        <StatCard label="Familles a jour" value={stats.aJour} icon={<UserCheck size={20} />} color="#27ae60" />
        <StatCard label="Familles avec impayes" value={stats.impayes} icon={<AlertTriangle size={20} />} color="#e74c3c" />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={familles}
        searchPlaceholder="Rechercher une famille..."
        onRowClick={openDossier}
      />

      {/* Modal Dossier Famille */}
      <Modal
        isOpen={!!selectedFamille}
        onClose={() => setSelectedFamille(null)}
        title={selectedFamille?.nom || 'Dossier famille'}
        size="xl"
        footer={null}
      >
        {selectedFamille && (
          <div>
            {/* Tab bar */}
            <div className="tab-bar" style={{ marginBottom: '20px' }}>
              {TAB_CONFIG.map(tab => (
                <button
                  key={tab.key}
                  className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="fade-in">
              {renderTabContent()}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Nouvelle Famille */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nouvelle famille"
        size="md"
        footer={null}
      >
        <FormNouvelleFamille
          onClose={() => setShowCreate(false)}
          onSave={(data) => {
            setShowCreate(false);
            showToast(`${data.nom || 'Famille'} creee avec succes`, 'success');
          }}
        />
      </Modal>
    </div>
  );
}
