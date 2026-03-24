import React, { useState } from 'react';
import { messages } from '../../data/mockData';
import { Send, Paperclip, Search, Plus, MessageSquare, Users, User } from 'lucide-react';
import ComposeModal from '../../components/ui/ComposeModal';

export default function CommunicationPage() {
  const [selectedMsg, setSelectedMsg] = useState(messages[0]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('messages');
  const [showCompose, setShowCompose] = useState(false);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Gestion</span><span className="breadcrumb-sep">/</span><span>Communication</span></div>
          <h1 className="page-title">Communication</h1>
          <p className="page-subtitle">Messagerie interne et notifications</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCompose(true)}><Plus size={16} /> Nouveau message</button>
        </div>
      </div>

      <div className="tab-bar">
        <div className={`tab-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
          <MessageSquare size={16} /> Messages
        </div>
        <div className={`tab-item ${activeTab === 'actualites' ? 'active' : ''}`} onClick={() => setActiveTab('actualites')}>
          📢 Diffusions
        </div>
      </div>

      {activeTab === 'messages' && (
        <div className="chat-layout">
          {/* Liste des conversations */}
          <div className="chat-sidebar-pane">
            <div style={{ padding: '12px', borderBottom: '1px solid #e0e6ed' }}>
              <div className="search-input-wrap" style={{ width: '100%' }}>
                <Search size={16} />
                <input className="search-input" style={{ width: '100%' }} placeholder="Rechercher..." />
              </div>
            </div>
            {messages.map(msg => (
              <div key={msg.id} className={`chat-item ${selectedMsg?.id === msg.id ? 'active' : ''}`} onClick={() => setSelectedMsg(msg)}>
                <div className="avatar avatar-sm" style={{ background: msg.expediteur.role === 'Enseignant' ? '#dbeafe' : msg.expediteur.role === 'Parent' ? '#fef3c7' : msg.expediteur.role === 'DG' ? '#ddd6fe' : '#e8f4f8', color: '#1e3a5f', fontSize: '10px', flexShrink: 0 }}>
                  {msg.expediteur.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }} className="truncate">{msg.expediteur.nom}</span>
                    <span style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{msg.date.split(' ')[0]}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#2c3e50' }} className="truncate">{msg.sujet}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }} className="truncate">{msg.contenu.slice(0, 50)}...</div>
                </div>
                {!msg.lu && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3498db', flexShrink: 0 }} />}
              </div>
            ))}
          </div>

          {/* Contenu du message */}
          <div className="chat-main">
            {selectedMsg ? (
              <>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0e6ed' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{selectedMsg.sujet}</h3>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                    <span>De : <strong>{selectedMsg.expediteur.nom}</strong> ({selectedMsg.expediteur.role})</span>
                    <span>→ {selectedMsg.destinataire}</span>
                    <span style={{ marginLeft: 'auto' }}>{selectedMsg.date}</span>
                  </div>
                </div>
                <div className="chat-messages" style={{ flex: 1 }}>
                  <div className="chat-bubble received">
                    <p style={{ lineHeight: 1.7 }}>{selectedMsg.contenu}</p>
                  </div>
                </div>
                <div className="chat-input-bar">
                  <button className="btn btn-ghost btn-icon"><Paperclip size={18} /></button>
                  <input className="chat-input" placeholder="Répondre..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                  <button className="btn btn-primary btn-icon" style={{ borderRadius: '50%' }}><Send size={16} /></button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <MessageSquare size={48} />
                <h3>Sélectionnez un message</h3>
                <p>Choisissez une conversation dans la liste</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'actualites' && (
        <div className="grid-2" style={{ marginTop: '16px' }}>
          {[
            { titre: 'Journée pédagogique — 25 mars', contenu: 'Les cours seront suspendus le 25 mars pour une journée pédagogique.', auteur: 'Direction Générale', date: '2026-03-14', cible: 'Tous' },
            { titre: 'Résultats du 1er trimestre disponibles', contenu: 'Les bulletins du 1er trimestre sont désormais consultables sur la plateforme.', auteur: 'Direction Académique', date: '2026-03-10', cible: 'Parents, Élèves' },
            { titre: 'Nouvelle politique de retard', contenu: 'À compter du 1er avril, tout retard non justifié sera comptabilisé comme absence.', auteur: 'Vie Scolaire', date: '2026-03-05', cible: 'Enseignants, Parents' },
          ].map((actu, i) => (
            <div key={i} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge badge-info">{actu.cible}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' }}>{actu.date}</span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{actu.titre}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>{actu.contenu}</p>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>par {actu.auteur}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Modal */}
      <ComposeModal isOpen={showCompose} onClose={() => setShowCompose(false)} />
    </div>
  );
}
