import React, { useState } from 'react';
import Modal from './Modal';
import { Send, Paperclip, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const destinataireOptions = [
  { label: 'Tous les parents', value: 'all-parents' },
  { label: 'Tous les enseignants', value: 'all-teachers' },
  { label: 'Parents CP-A', value: 'parents-cpa' },
  { label: 'Parents CE1-A', value: 'parents-ce1a' },
  { label: 'Parents 6ème-A', value: 'parents-6a' },
  { label: 'Parents Terminale S', value: 'parents-ts' },
  { label: 'Direction Générale', value: 'dg' },
  { label: 'Mme Essono (Enseignant)', value: 'essono' },
  { label: 'M. Boussougou (Enseignant)', value: 'boussougou' },
  { label: 'Patrick Obame (Parent)', value: 'obame' },
];

export default function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const { showToast } = useToast();
  const [destinataire, setDestinataire] = useState('');
  const [sujet, setSujet] = useState('');
  const [contenu, setContenu] = useState('');
  const [priority, setPriority] = useState('normal');

  const handleSend = () => {
    if (!destinataire || !sujet || !contenu) {
      showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }
    showToast('Message envoyé avec succès !', 'success');
    setDestinataire('');
    setSujet('');
    setContenu('');
    setPriority('normal');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau Message"
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSend}>
            <Send size={16} /> Envoyer
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Destinataire <span className="req">*</span></label>
        <select className="form-select" value={destinataire} onChange={e => setDestinataire(e.target.value)}>
          <option value="">Sélectionner un destinataire...</option>
          {destinataireOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Sujet <span className="req">*</span></label>
          <input
            className="form-control"
            placeholder="Objet du message..."
            value={sujet}
            onChange={e => setSujet(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Priorité</label>
          <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="normal">Normale</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Message <span className="req">*</span></label>
        <textarea
          className="form-control"
          rows={8}
          placeholder="Rédigez votre message..."
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          style={{ minHeight: '160px' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#6b7280' }}>
        <Paperclip size={16} />
        <span>Glissez des fichiers ici ou </span>
        <button className="btn btn-sm btn-secondary" style={{ padding: '4px 10px' }}>parcourir</button>
      </div>
    </Modal>
  );
}
