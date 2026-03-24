import React from 'react';
import { cahierTexte } from '../../data/mockData';
import { BookOpen, Calendar, FileText, Clock } from 'lucide-react';

export default function CahierTextePage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>Académique</span><span className="breadcrumb-sep">/</span><span>Cahier de texte</span></div>
          <h1 className="page-title">Cahier de Texte</h1>
          <p className="page-subtitle">Leçons dispensées et devoirs — Terminale S</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary"><BookOpen size={16} /> Ajouter une entrée</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {cahierTexte.map(entry => (
          <div key={entry.id} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '64px', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a5f' }}>{new Date(entry.date).getDate()}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>{new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short' })}</div>
                </div>

                <div className="divider" style={{ width: '1px', height: 'auto', minHeight: '80px', margin: '0', alignSelf: 'stretch' }} />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-primary">{entry.matiere}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{entry.enseignant}</span>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#2c3e50', marginBottom: '4px' }}>
                      <FileText size={14} /> Leçon
                    </div>
                    <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.6, paddingLeft: '20px' }}>{entry.lecon}</p>
                  </div>

                  {entry.devoirs && (
                    <div style={{ background: '#fff9e6', border: '1px solid #f4a623', borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f4a623', marginBottom: '4px' }}>
                        <Clock size={14} /> Devoirs — À rendre le {new Date(entry.dateRemise).toLocaleDateString('fr-FR')}
                      </div>
                      <p style={{ fontSize: '13px', color: '#856404' }}>{entry.devoirs}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
