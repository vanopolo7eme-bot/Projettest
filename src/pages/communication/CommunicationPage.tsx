import React, { useState, useMemo } from 'react';
import { messages, eleves, classes, etablissements, enseignants, familles } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import {
  Send, Search, Plus, MessageSquare, Users, Megaphone, FileText, BarChart3,
  Mail, Eye, EyeOff, Reply, Clock, CheckCircle, AlertCircle, Filter, X
} from 'lucide-react';

// ─── Types locaux ────────────────────────────────────────────────
interface Message {
  id: number;
  expediteur: { nom: string; role: string };
  destinataire: string;
  sujet: string;
  contenu: string;
  date: string;
  lu: boolean;
  type: string;
}

interface Diffusion {
  id: number;
  titre: string;
  contenu: string;
  auteur: string;
  date: string;
  cible: string;
  luPar: number;
  totalDestinataires: number;
}

interface Envoi {
  id: number;
  date: string;
  type: string;
  sujet: string;
  destinataires: number;
  delivres: number;
  ouverts: number;
  statut: string;
}

interface Template {
  id: number;
  titre: string;
  sujet: string;
  corps: string;
  variables: string[];
  categorie: string;
}

// ─── Donn\u00e9es statiques ────────────────────────────────────────────
const diffusionsData: Diffusion[] = [
  { id: 1, titre: 'Journ\u00e9e p\u00e9dagogique \u2014 25 mars', contenu: 'Les cours seront suspendus le 25 mars pour une journ\u00e9e p\u00e9dagogique. Les enseignants sont convi\u00e9s \u00e0 une session de formation continue.', auteur: 'Direction G\u00e9n\u00e9rale', date: '2026-03-14', cible: 'Tous', luPar: 342, totalDestinataires: 450 },
  { id: 2, titre: 'R\u00e9sultats du 1er trimestre disponibles', contenu: 'Les bulletins du 1er trimestre sont d\u00e9sormais consultables sur la plateforme. Connectez-vous pour y acc\u00e9der.', auteur: 'Direction Acad\u00e9mique', date: '2026-03-10', cible: 'Parents, \u00c9l\u00e8ves', luPar: 280, totalDestinataires: 380 },
  { id: 3, titre: 'Nouvelle politique de retard', contenu: '\u00c0 compter du 1er avril, tout retard non justifi\u00e9 sera comptabilis\u00e9 comme absence. Merci de veiller \u00e0 la ponctualit\u00e9.', auteur: 'Vie Scolaire', date: '2026-03-05', cible: 'Enseignants, Parents', luPar: 195, totalDestinataires: 300 },
  { id: 4, titre: 'Inscriptions 2026-2027 ouvertes', contenu: 'Les pr\u00e9-inscriptions pour l\u2019ann\u00e9e scolaire 2026-2027 sont d\u00e9sormais ouvertes en ligne. D\u00e9posez votre dossier avant le 30 avril.', auteur: 'Service Admissions', date: '2026-03-01', cible: 'Tous', luPar: 410, totalDestinataires: 450 },
  { id: 5, titre: 'Comp\u00e9tition sportive inter-\u00e9tablissements', contenu: 'Le tournoi de football inter-\u00e9tablissements aura lieu le 12 avril sur le terrain du Lyc\u00e9e Le Guide.', auteur: 'Service EPS', date: '2026-02-25', cible: '\u00c9l\u00e8ves', luPar: 120, totalDestinataires: 200 },
];

const templatesData: Template[] = [
  { id: 1, titre: 'Bienvenue', sujet: 'Bienvenue au sein du Guide de Nos Enfants', corps: 'Cher(e) {nom_parent},\n\nNous avons le plaisir de vous accueillir au sein de notre \u00e9tablissement. Votre enfant {nom_eleve} est d\u00e9sormais inscrit(e) en classe de {classe}.\n\nNous restons \u00e0 votre disposition pour toute question.\n\nCordialement,\nLa Direction', variables: ['{nom_parent}', '{nom_eleve}', '{classe}'], categorie: 'Inscription' },
  { id: 2, titre: 'Confirmation inscription', sujet: 'Confirmation d\'inscription \u2014 {nom_eleve}', corps: 'Cher(e) {nom_parent},\n\nNous confirmons l\'inscription de {nom_eleve} pour l\'ann\u00e9e scolaire 2025-2026 en classe de {classe} \u00e0 l\'\u00e9tablissement {etablissement}.\n\nLe montant des frais de scolarit\u00e9 s\'\u00e9l\u00e8ve \u00e0 {montant} FCFA.\n\nCordialement,\nLe Service des Inscriptions', variables: ['{nom_parent}', '{nom_eleve}', '{classe}', '{etablissement}', '{montant}'], categorie: 'Inscription' },
  { id: 3, titre: 'Rappel paiement', sujet: 'Rappel de paiement \u2014 \u00c9ch\u00e9ance d\u00e9pass\u00e9e', corps: 'Cher(e) {nom_parent},\n\nNous vous rappelons que le paiement d\'un montant de {montant} FCFA pour les frais de scolarit\u00e9 de {nom_eleve} est en attente depuis le {date_echeance}.\n\nMerci de r\u00e9gulariser votre situation dans les meilleurs d\u00e9lais.\n\nLe Service Comptabilit\u00e9', variables: ['{nom_parent}', '{nom_eleve}', '{montant}', '{date_echeance}'], categorie: 'Finance' },
  { id: 4, titre: 'Absence signal\u00e9e', sujet: 'Absence de {nom_eleve} \u2014 {date}', corps: 'Cher(e) {nom_parent},\n\nNous souhaitons vous informer que votre enfant {nom_eleve} a \u00e9t\u00e9 absent(e) le {date} sans justification pr\u00e9alable.\n\nMerci de nous transmettre un justificatif ou de nous contacter.\n\nCordialement,\nLa Vie Scolaire', variables: ['{nom_parent}', '{nom_eleve}', '{date}'], categorie: 'Vie scolaire' },
  { id: 5, titre: 'Bulletin publi\u00e9', sujet: 'Bulletin du {trimestre} disponible', corps: 'Cher(e) {nom_parent},\n\nLe bulletin scolaire de {nom_eleve} pour le {trimestre} est d\u00e9sormais disponible sur la plateforme.\n\nMoyenne g\u00e9n\u00e9rale : {moyenne}/20 \u2014 Rang : {rang}/{effectif}\n\nConsultez-le dans votre espace parent.\n\nCordialement,\nLa Direction Acad\u00e9mique', variables: ['{nom_parent}', '{nom_eleve}', '{trimestre}', '{moyenne}', '{rang}', '{effectif}'], categorie: 'Acad\u00e9mique' },
  { id: 6, titre: 'Convocation', sujet: 'Convocation \u2014 R\u00e9union du {date}', corps: 'Cher(e) {nom_parent},\n\nVous \u00eates convi\u00e9(e) \u00e0 une r\u00e9union le {date} \u00e0 {heure} dans la salle {salle} de l\'\u00e9tablissement {etablissement}.\n\nObjet : {objet}\n\nVotre pr\u00e9sence est vivement souhait\u00e9e.\n\nCordialement,\nLa Direction', variables: ['{nom_parent}', '{date}', '{heure}', '{salle}', '{etablissement}', '{objet}'], categorie: 'Administration' },
];

const envoisData: Envoi[] = [
  { id: 1, date: '2026-03-17 09:00', type: 'Email', sujet: 'Rappel : journ\u00e9e p\u00e9dagogique', destinataires: 450, delivres: 445, ouverts: 312, statut: 'Envoy\u00e9' },
  { id: 2, date: '2026-03-15 14:30', type: 'SMS', sujet: 'Bulletins T1 disponibles', destinataires: 380, delivres: 378, ouverts: 378, statut: 'Envoy\u00e9' },
  { id: 3, date: '2026-03-14 10:00', type: 'Email', sujet: 'Rappel paiement mars', destinataires: 85, delivres: 82, ouverts: 54, statut: 'Envoy\u00e9' },
  { id: 4, date: '2026-03-12 08:00', type: 'Push', sujet: 'Absence signal\u00e9e \u2014 3 \u00e9l\u00e8ves', destinataires: 3, delivres: 3, ouverts: 2, statut: 'Envoy\u00e9' },
  { id: 5, date: '2026-03-10 16:00', type: 'Email', sujet: 'Inscriptions 2026-2027', destinataires: 450, delivres: 447, ouverts: 389, statut: 'Envoy\u00e9' },
  { id: 6, date: '2026-03-08 11:00', type: 'SMS', sujet: 'Fermeture exceptionnelle vendredi', destinataires: 200, delivres: 198, ouverts: 198, statut: 'Envoy\u00e9' },
  { id: 7, date: '2026-03-05 09:30', type: 'Email', sujet: 'Nouvelle politique de retard', destinataires: 300, delivres: 295, ouverts: 201, statut: 'Envoy\u00e9' },
  { id: 8, date: '2026-03-03 15:00', type: 'Push', sujet: 'Note ajout\u00e9e \u2014 Contr\u00f4le maths', destinataires: 35, delivres: 35, ouverts: 28, statut: 'Envoy\u00e9' },
  { id: 9, date: '2026-03-01 10:00', type: 'Email', sujet: 'Bienvenue \u2014 Nouveaux inscrits', destinataires: 12, delivres: 12, ouverts: 11, statut: 'Envoy\u00e9' },
  { id: 10, date: '2026-02-28 08:00', type: 'SMS', sujet: 'Comp\u00e9tition sportive \u2014 rappel', destinataires: 200, delivres: 196, ouverts: 196, statut: 'Envoy\u00e9' },
];

// ─── Composant principal ─────────────────────────────────────────
export default function CommunicationPage() {
  const { user, hasRole } = useAuth();
  const { showToast } = useToast();

  // Onglets
  const [activeTab, setActiveTab] = useState<'messagerie' | 'diffusions' | 'templates' | 'envois'>('messagerie');

  // Messagerie
  const [messagesList, setMessagesList] = useState<Message[]>(messages as Message[]);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [searchMsg, setSearchMsg] = useState('');
  const [filterLu, setFilterLu] = useState<'all' | 'lu' | 'nonlu'>('all');
  const [filterType, setFilterType] = useState<'all' | 'individuel' | 'groupe'>('all');
  const [replyText, setReplyText] = useState('');

  // Compose modal
  const [showCompose, setShowCompose] = useState(false);
  const [composeType, setComposeType] = useState<'individuel' | 'classe' | 'niveau' | 'etablissement' | 'groupe'>('individuel');
  const [composeDest, setComposeDest] = useState('');
  const [composeSujet, setComposeSujet] = useState('');
  const [composeContenu, setComposeContenu] = useState('');

  // Diffusion modal
  const [diffusions, setDiffusions] = useState<Diffusion[]>(diffusionsData);
  const [showDiffusion, setShowDiffusion] = useState(false);
  const [diffTitre, setDiffTitre] = useState('');
  const [diffContenu, setDiffContenu] = useState('');
  const [diffCible, setDiffCible] = useState('Tous');

  // Permissions par r\u00f4le
  const isAdmin = hasRole(['Direction G\u00e9n\u00e9rale', 'Directeur d\'\u00c9tablissement', 'Administration Scolaire']);
  const isEnseignant = hasRole('Enseignant');
  const isParent = hasRole('Parent');

  const showTemplatesTab = isAdmin || isEnseignant;
  const showEnvoisTab = isAdmin;

  // ─── Filtrage messagerie ────────────────────────────────────
  const filteredMessages = useMemo(() => {
    return messagesList.filter(msg => {
      // Filtre texte
      if (searchMsg) {
        const s = searchMsg.toLowerCase();
        const match = msg.sujet.toLowerCase().includes(s) ||
          msg.expediteur.nom.toLowerCase().includes(s) ||
          msg.destinataire.toLowerCase().includes(s) ||
          msg.contenu.toLowerCase().includes(s);
        if (!match) return false;
      }
      // Filtre lu/non lu
      if (filterLu === 'lu' && !msg.lu) return false;
      if (filterLu === 'nonlu' && msg.lu) return false;
      // Filtre type
      if (filterType !== 'all' && msg.type !== filterType) return false;
      return true;
    });
  }, [messagesList, searchMsg, filterLu, filterType]);

  const unreadCount = messagesList.filter(m => !m.lu).length;

  // ─── Handlers ───────────────────────────────────────────────
  const handleSelectMsg = (msg: Message) => {
    setSelectedMsg(msg);
    setReplyText('');
    if (!msg.lu) {
      setMessagesList(prev => prev.map(m => m.id === msg.id ? { ...m, lu: true } : m));
    }
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedMsg) return;
    const newMsg: Message = {
      id: Date.now(),
      expediteur: { nom: user ? `${user.prenom} ${user.nom}` : 'Moi', role: user?.role || 'Admin' },
      destinataire: selectedMsg.expediteur.nom,
      sujet: `Re: ${selectedMsg.sujet}`,
      contenu: replyText,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lu: true,
      type: 'individuel',
    };
    setMessagesList(prev => [newMsg, ...prev]);
    setReplyText('');
    showToast('R\u00e9ponse envoy\u00e9e avec succ\u00e8s', 'success');
  };

  const handleSendMessage = () => {
    if (!composeDest || !composeSujet.trim() || !composeContenu.trim()) {
      showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }
    const newMsg: Message = {
      id: Date.now(),
      expediteur: { nom: user ? `${user.prenom} ${user.nom}` : 'Moi', role: user?.role || 'Admin' },
      destinataire: composeDest,
      sujet: composeSujet,
      contenu: composeContenu,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lu: true,
      type: composeType === 'individuel' ? 'individuel' : 'groupe',
    };
    setMessagesList(prev => [newMsg, ...prev]);
    setShowCompose(false);
    setComposeDest('');
    setComposeSujet('');
    setComposeContenu('');
    setComposeType('individuel');
    showToast('Message envoy\u00e9 avec succ\u00e8s !', 'success');
  };

  const handleSendDiffusion = () => {
    if (!diffTitre.trim() || !diffContenu.trim()) {
      showToast('Veuillez remplir tous les champs', 'warning');
      return;
    }
    const newDiff: Diffusion = {
      id: Date.now(),
      titre: diffTitre,
      contenu: diffContenu,
      auteur: user ? `${user.prenom} ${user.nom}` : 'Direction',
      date: new Date().toISOString().slice(0, 10),
      cible: diffCible,
      luPar: 0,
      totalDestinataires: diffCible === 'Tous' ? 450 : 150,
    };
    setDiffusions(prev => [newDiff, ...prev]);
    setShowDiffusion(false);
    setDiffTitre('');
    setDiffContenu('');
    setDiffCible('Tous');
    showToast('Diffusion publi\u00e9e avec succ\u00e8s !', 'success');
  };

  const handleUseTemplate = (tpl: Template) => {
    setComposeSujet(tpl.sujet);
    setComposeContenu(tpl.corps);
    setComposeType('individuel');
    setComposeDest('');
    setShowCompose(true);
    showToast(`Template "${tpl.titre}" charg\u00e9`, 'info');
  };

  // ─── Options destinataires selon r\u00f4le ─────────────────────
  const getDestinataireOptions = () => {
    if (composeType === 'individuel') {
      const options: { value: string; label: string }[] = [];
      if (isParent) {
        enseignants.forEach(e => options.push({ value: `${e.prenom} ${e.nom}`, label: `${e.prenom} ${e.nom} (Enseignant)` }));
        options.push({ value: 'Direction G\u00e9n\u00e9rale', label: 'Direction G\u00e9n\u00e9rale' });
      } else if (isEnseignant) {
        familles.forEach(f => options.push({ value: f.nom, label: `${f.nom} (Parent)` }));
        options.push({ value: 'Direction G\u00e9n\u00e9rale', label: 'Direction G\u00e9n\u00e9rale' });
      } else {
        enseignants.forEach(e => options.push({ value: `${e.prenom} ${e.nom}`, label: `${e.prenom} ${e.nom} (Enseignant)` }));
        familles.forEach(f => options.push({ value: f.nom, label: `${f.nom} (Parent)` }));
      }
      return options;
    }
    if (composeType === 'classe') {
      return classes.map(c => ({ value: `Parents ${c.nom}`, label: `${c.nom} \u2014 ${etablissements.find(e => e.id === c.etablissementId)?.nom || ''}` }));
    }
    if (composeType === 'niveau') {
      const niveaux = [...new Set(classes.map(c => c.niveau))];
      return niveaux.map(n => ({ value: `Parents niveau ${n}`, label: `Niveau ${n}` }));
    }
    if (composeType === 'etablissement') {
      return etablissements.map(e => ({ value: `Tout ${e.nom}`, label: e.nom }));
    }
    // groupe entier
    return [{ value: 'Tous', label: 'Tout le groupe scolaire' }];
  };

  // ─── Stats envois ──────────────────────────────────────────
  const totalEnvoyes = envoisData.reduce((s, e) => s + e.destinataires, 0);
  const totalDelivres = envoisData.reduce((s, e) => s + e.delivres, 0);
  const totalOuverts = envoisData.reduce((s, e) => s + e.ouverts, 0);
  const tauxDelivrance = totalEnvoyes > 0 ? ((totalDelivres / totalEnvoyes) * 100).toFixed(1) : '0';
  const tauxOuverture = totalDelivres > 0 ? ((totalOuverts / totalDelivres) * 100).toFixed(1) : '0';

  // ─── Colonnes DataTable envois ─────────────────────────────
  const envoisColumns = [
    { header: 'Date', accessor: 'date', render: (row: Envoi) => <span style={{ fontSize: '13px' }}>{row.date}</span> },
    {
      header: 'Type', accessor: 'type', render: (row: Envoi) => (
        <span className={`badge ${row.type === 'Email' ? 'badge-info' : row.type === 'SMS' ? 'badge-success' : 'badge-warning'}`}>
          {row.type}
        </span>
      )
    },
    { header: 'Sujet', accessor: 'sujet' },
    { header: 'Destinataires', accessor: 'destinataires' },
    {
      header: 'D\u00e9livr\u00e9s', accessor: 'delivres', render: (row: Envoi) => (
        <span>{row.delivres}/{row.destinataires}</span>
      )
    },
    {
      header: 'Ouverts', accessor: 'ouverts', render: (row: Envoi) => (
        <span>{row.ouverts}/{row.delivres}</span>
      )
    },
    {
      header: 'Statut', accessor: 'statut', render: (row: Envoi) => (
        <span className="badge badge-success"><CheckCircle size={12} style={{ marginRight: 4 }} />{row.statut}</span>
      )
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="fade-in">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Gestion</span><span className="breadcrumb-sep">/</span><span>Communication</span>
          </div>
          <h1 className="page-title">Communication</h1>
          <p className="page-subtitle">Messagerie, diffusions et suivi des envois</p>
        </div>
        <div className="page-actions">
          {activeTab === 'messagerie' && (
            <button className="btn btn-primary" onClick={() => setShowCompose(true)}>
              <Plus size={16} /> Nouveau message
            </button>
          )}
          {activeTab === 'diffusions' && isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowDiffusion(true)}>
              <Megaphone size={16} /> Nouvelle diffusion
            </button>
          )}
        </div>
      </div>

      {/* ── Onglets ───────────────────────────────────────────── */}
      <div className="tab-bar">
        <div className={`tab-item ${activeTab === 'messagerie' ? 'active' : ''}`} onClick={() => setActiveTab('messagerie')}>
          <MessageSquare size={16} /> Messagerie
          {unreadCount > 0 && <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: '10px', padding: '2px 6px' }}>{unreadCount}</span>}
        </div>
        <div className={`tab-item ${activeTab === 'diffusions' ? 'active' : ''}`} onClick={() => setActiveTab('diffusions')}>
          <Megaphone size={16} /> Diffusions
        </div>
        {showTemplatesTab && (
          <div className={`tab-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
            <FileText size={16} /> Templates
          </div>
        )}
        {showEnvoisTab && (
          <div className={`tab-item ${activeTab === 'envois' ? 'active' : ''}`} onClick={() => setActiveTab('envois')}>
            <BarChart3 size={16} /> Envois
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ONGLET MESSAGERIE                                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'messagerie' && (
        <div className="chat-layout">
          {/* Panneau gauche : liste */}
          <div className="chat-sidebar-pane">
            <div style={{ padding: '12px', borderBottom: '1px solid #e0e6ed' }}>
              <div className="search-input-wrap" style={{ width: '100%', marginBottom: 8 }}>
                <Search size={16} />
                <input
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="Rechercher un message..."
                  value={searchMsg}
                  onChange={e => setSearchMsg(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <select
                  className="form-select"
                  style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }}
                  value={filterLu}
                  onChange={e => setFilterLu(e.target.value as 'all' | 'lu' | 'nonlu')}
                >
                  <option value="all">Tous</option>
                  <option value="nonlu">Non lus</option>
                  <option value="lu">Lus</option>
                </select>
                <select
                  className="form-select"
                  style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }}
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as 'all' | 'individuel' | 'groupe')}
                >
                  <option value="all">Tout type</option>
                  <option value="individuel">Individuel</option>
                  <option value="groupe">Groupe</option>
                </select>
              </div>
            </div>

            {filteredMessages.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                Aucun message trouv\u00e9
              </div>
            ) : (
              filteredMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`chat-item ${selectedMsg?.id === msg.id ? 'active' : ''}`}
                  onClick={() => handleSelectMsg(msg)}
                >
                  <div
                    className="avatar avatar-sm"
                    style={{
                      background: msg.expediteur.role === 'Enseignant' ? '#dbeafe' : msg.expediteur.role === 'Parent' ? '#fef3c7' : msg.expediteur.role === 'DG' ? '#ddd6fe' : '#e8f4f8',
                      color: '#1e3a5f',
                      fontSize: '10px',
                      flexShrink: 0,
                    }}
                  >
                    {msg.expediteur.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: msg.lu ? 500 : 700, fontSize: '13px' }} className="truncate">
                        {msg.expediteur.nom}
                      </span>
                      <span style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {msg.date.split(' ')[0]}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: msg.lu ? 400 : 600, color: '#2c3e50' }} className="truncate">
                      {msg.sujet}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }} className="truncate">
                      {msg.contenu.slice(0, 50)}...
                    </div>
                  </div>
                  {!msg.lu && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3498db', flexShrink: 0 }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Panneau droit : d\u00e9tail */}
          <div className="chat-main">
            {selectedMsg ? (
              <>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0e6ed' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{selectedMsg.sujet}</h3>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px', color: '#6b7280', flexWrap: 'wrap' }}>
                    <span>De : <strong>{selectedMsg.expediteur.nom}</strong> ({selectedMsg.expediteur.role})</span>
                    <span>\u2192 {selectedMsg.destinataire}</span>
                    <span style={{ marginLeft: 'auto' }}><Clock size={12} style={{ marginRight: 4 }} />{selectedMsg.date}</span>
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <span className={`badge ${selectedMsg.type === 'individuel' ? 'badge-info' : 'badge-warning'}`}>
                      {selectedMsg.type === 'individuel' ? 'Individuel' : 'Groupe'}
                    </span>
                    <span className={`badge ${selectedMsg.lu ? 'badge-success' : 'badge-danger'}`}>
                      {selectedMsg.lu ? 'Lu' : 'Non lu'}
                    </span>
                  </div>
                </div>
                <div className="chat-messages" style={{ flex: 1, padding: '20px' }}>
                  <div className="chat-bubble received">
                    <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedMsg.contenu}</p>
                  </div>
                </div>
                <div className="chat-input-bar">
                  <Reply size={18} style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <input
                    className="chat-input"
                    placeholder="R\u00e9pondre..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReply()}
                  />
                  <button
                    className="btn btn-primary btn-icon"
                    style={{ borderRadius: '50%' }}
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <MessageSquare size={48} />
                <h3>S\u00e9lectionnez un message</h3>
                <p>Choisissez une conversation dans la liste pour la consulter</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ONGLET DIFFUSIONS                                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'diffusions' && (
        <div style={{ marginTop: 16 }}>
          {diffusions.length === 0 ? (
            <div className="card">
              <div className="card-body empty-state">
                <Megaphone size={48} />
                <h3>Aucune diffusion</h3>
                <p>Les annonces appara\u00eetront ici</p>
              </div>
            </div>
          ) : (
            <div className="grid-2">
              {diffusions.map(diff => (
                <div key={diff.id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className="badge badge-info">{diff.cible}</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' }}>
                        <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {diff.date}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{diff.titre}</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>{diff.contenu}</p>
                    <div className="divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#9ca3af' }}>
                      <span>par <strong>{diff.auteur}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={12} />
                        {diff.luPar}/{diff.totalDestinataires} lectures
                        <span style={{
                          display: 'inline-block',
                          width: '60px',
                          height: '4px',
                          background: '#e5e7eb',
                          borderRadius: '2px',
                          marginLeft: 6,
                          position: 'relative',
                          overflow: 'hidden',
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: `${(diff.luPar / diff.totalDestinataires) * 100}%`,
                            background: '#3498db',
                            borderRadius: '2px',
                          }} />
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ONGLET TEMPLATES                                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'templates' && showTemplatesTab && (
        <div style={{ marginTop: 16 }}>
          <div className="alert" style={{ marginBottom: 16 }}>
            <FileText size={16} style={{ flexShrink: 0 }} />
            <span>Utilisez ces mod\u00e8les pr\u00e9d\u00e9finis pour envoyer rapidement des messages standardis\u00e9s. Les variables entre accolades seront remplac\u00e9es automatiquement.</span>
          </div>
          <div className="grid-3">
            {templatesData.map(tpl => (
              <div key={tpl.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <FileText size={18} style={{ color: '#3498db' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{tpl.titre}</h3>
                  </div>
                  <span className="badge badge-info" style={{ marginBottom: 8, display: 'inline-block' }}>{tpl.categorie}</span>
                  <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5, marginBottom: 8, maxHeight: '80px', overflow: 'hidden' }}>
                    {tpl.corps.slice(0, 120)}...
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {tpl.variables.map(v => (
                      <span key={v} style={{ fontSize: '10px', background: '#f0f4f8', color: '#3498db', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        {v}
                      </span>
                    ))}
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleUseTemplate(tpl)}>
                    <Mail size={14} /> Utiliser ce template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ONGLET ENVOIS (Stats)                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'envois' && showEnvoisTab && (
        <div style={{ marginTop: 16 }}>
          {/* Cartes stats */}
          <div className="grid-3" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Send size={20} style={{ color: '#3498db' }} />
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Total envoy\u00e9s</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a5f' }}>{totalEnvoyes.toLocaleString('fr-FR')}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: 4 }}>sur les 10 derniers envois</div>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle size={20} style={{ color: '#27ae60' }} />
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Taux de d\u00e9livrance</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#27ae60' }}>{tauxDelivrance}%</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: 4 }}>{totalDelivres.toLocaleString('fr-FR')} d\u00e9livr\u00e9s sur {totalEnvoyes.toLocaleString('fr-FR')}</div>
            </div>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Eye size={20} style={{ color: '#f4a623' }} />
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Taux d'ouverture</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f4a623' }}>{tauxOuverture}%</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: 4 }}>{totalOuverts.toLocaleString('fr-FR')} ouverts sur {totalDelivres.toLocaleString('fr-FR')}</div>
            </div>
          </div>

          {/* Tableau des envois */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 16 }}>10 derniers envois</h3>
              <DataTable
                columns={envoisColumns}
                data={envoisData}
                searchable={true}
                searchPlaceholder="Rechercher un envoi..."
                pageSize={10}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL : Nouveau message (Compose)                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showCompose}
        onClose={() => { setShowCompose(false); setComposeSujet(''); setComposeContenu(''); setComposeDest(''); }}
        title="Nouveau message"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCompose(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSendMessage}>
              <Send size={16} /> Envoyer
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Type de destinataire <span className="req">*</span></label>
          <select
            className="form-select"
            value={composeType}
            onChange={e => { setComposeType(e.target.value as any); setComposeDest(''); }}
          >
            <option value="individuel">Individuel</option>
            <option value="classe">Classe</option>
            <option value="niveau">Niveau</option>
            <option value="etablissement">\u00c9tablissement</option>
            <option value="groupe">Groupe entier</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Destinataire <span className="req">*</span></label>
          <select
            className="form-select"
            value={composeDest}
            onChange={e => setComposeDest(e.target.value)}
          >
            <option value="">S\u00e9lectionner un destinataire...</option>
            {getDestinataireOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Sujet <span className="req">*</span></label>
          <input
            className="form-input"
            placeholder="Objet du message..."
            value={composeSujet}
            onChange={e => setComposeSujet(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contenu <span className="req">*</span></label>
          <textarea
            className="form-input"
            rows={8}
            placeholder="R\u00e9digez votre message..."
            value={composeContenu}
            onChange={e => setComposeContenu(e.target.value)}
            style={{ minHeight: '160px', resize: 'vertical' }}
          />
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL : Nouvelle diffusion                             */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showDiffusion}
        onClose={() => setShowDiffusion(false)}
        title="Nouvelle diffusion"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowDiffusion(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSendDiffusion}>
              <Megaphone size={16} /> Publier
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Titre <span className="req">*</span></label>
          <input
            className="form-input"
            placeholder="Titre de l'annonce..."
            value={diffTitre}
            onChange={e => setDiffTitre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cible</label>
          <select className="form-select" value={diffCible} onChange={e => setDiffCible(e.target.value)}>
            <option value="Tous">Tous</option>
            {etablissements.map(e => (
              <option key={e.id} value={e.nom}>{e.nom}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Contenu <span className="req">*</span></label>
          <textarea
            className="form-input"
            rows={6}
            placeholder="R\u00e9digez votre annonce..."
            value={diffContenu}
            onChange={e => setDiffContenu(e.target.value)}
            style={{ minHeight: '140px', resize: 'vertical' }}
          />
        </div>
      </Modal>
    </div>
  );
}
