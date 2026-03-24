import React from 'react';
import { classes, etablissements, eleves, enseignants } from '../../data/mockData';
import { School, Users, BookOpen, Plus } from 'lucide-react';

export default function ClassesPage() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><span>ERP</span><span className="breadcrumb-sep">/</span><span>Classes</span></div>
          <h1 className="page-title">Gestion des Classes</h1>
          <p className="page-subtitle">Organisation pédagogique par établissement</p>
        </div>
        <div className="page-actions"><button className="btn btn-primary"><Plus size={16} /> Nouvelle classe</button></div>
      </div>

      {etablissements.map(etab => {
        const etabClasses = classes.filter(c => c.etablissementId === etab.id);
        if (etabClasses.length === 0) return null;

        return (
          <div key={etab.id} style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <School size={18} color="#1e3a5f" /> {etab.nom}
            </h2>
            <div className="grid-3">
              {etabClasses.map(classe => {
                const nbEleves = eleves.filter(e => e.classeId === classe.id && e.statut === 'Actif').length;
                return (
                  <div key={classe.id} className="card" style={{ cursor: 'pointer' }}>
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a5f' }}>{classe.nom}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Niveau {classe.niveau}</div>
                        </div>
                        <div className="badge badge-primary">{classe.salle}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <Users size={14} color="#6b7280" /> <strong>{classe.effectif}</strong> élèves
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={14} /> Prof. principal : <strong style={{ color: '#2c3e50' }}>{classe.professeurPrincipal}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
