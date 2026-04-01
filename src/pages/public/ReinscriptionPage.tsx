import React, { useState } from 'react';
import { Check, RefreshCw, CreditCard } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const enfantsMock = [
  { id: 1, nom: 'Ndong', prenom: 'Aya', classeActuelle: 'CE2-A', classeProchaine: 'CM1', etablissement: 'Les Palmiers', frais: 450000 },
  { id: 2, nom: 'Ndong', prenom: 'Kévin', classeActuelle: 'CM2-B', classeProchaine: '6ème', etablissement: 'Les Cocotiers', frais: 520000 },
  { id: 3, nom: 'Ndong', prenom: 'Inès', classeActuelle: '2nde A', classeProchaine: '1ère', etablissement: 'Lycée Le Guide', frais: 680000 },
];

export default function ReinscriptionPage() {
  const { showToast } = useToast();
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});

  const handleConfirm = (enfantId: number, prenom: string) => {
    setConfirmed(prev => ({ ...prev, [enfantId]: true }));
    showToast(`Réinscription de ${prenom} confirmée avec succès !`, 'success');
  };

  return (
    <div className="fade-in">
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', color: 'white', padding: '60px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 75% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'rgba(244,166,35,0.15)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, color: '#f4a623', border: '1px solid rgba(244,166,35,0.2)' }}>
            <RefreshCw size={14} /> Réinscription
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '10px' }}>Réinscription 2026-2027</h1>
          <p style={{ fontSize: '16px', opacity: 0.85, maxWidth: '600px', margin: '0 auto' }}>
            Confirmez la réinscription de votre enfant pour l'année 2026-2027
          </p>
        </div>
      </section>

      {/* Liste des enfants */}
      <section style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a5f', marginBottom: '24px' }}>Vos enfants</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {enfantsMock.map(enfant => (
            <div key={enfant.id} className="card" style={{ overflow: 'hidden' }}>
              <div className="card-body" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e3a5f', marginBottom: '16px' }}>
                      {enfant.prenom} {enfant.nom}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>Classe actuelle</div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#2c3e50' }}>{enfant.classeActuelle}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>Classe prévue</div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#2c3e50' }}>{enfant.classeProchaine}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>Établissement</div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#2c3e50' }}>{enfant.etablissement}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>Frais estimés</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#f4a623' }}>{enfant.frais.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {confirmed[enfant.id] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#d4edda', borderRadius: '10px', color: '#27ae60', fontWeight: 600, fontSize: '14px' }}>
                        <Check size={18} /> Réinscription confirmée
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleConfirm(enfant.id, enfant.prenom)}
                      >
                        <RefreshCw size={16} /> Confirmer la réinscription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section paiement */}
        <div className="card" style={{ marginTop: '32px' }}>
          <div className="card-body" style={{ padding: '28px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: '#e8f0fe', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#1e3a5f' }}>
              <CreditCard size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e3a5f', marginBottom: '8px' }}>Paiement des frais</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.7 }}>
              Le paiement des frais de réinscription sera disponible prochainement
            </p>
            <div style={{ marginTop: '16px', padding: '12px 20px', background: '#fef3c7', borderRadius: '10px', display: 'inline-block', fontSize: '13px', color: '#92400e', fontWeight: 500 }}>
              Module de paiement en cours de mise en place
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
