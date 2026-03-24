import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table as TableIcon, File as PdfIcon, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToWord, exportToPDF } from '../../utils/exportUtils';
import { useToast } from '../../contexts/ToastContext';

interface ExportDropdownProps {
  data: any[];
  filename: string;
  elementId?: string; // For Word export of specific HTML block
}

export default function ExportDropdown({ data, filename, elementId }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (type: 'pdf' | 'excel' | 'csv' | 'word') => {
    try {
      switch (type) {
        case 'csv':
          exportToCSV(data, filename);
          showToast('Fichier Excel (CSV) généré avec succès.', 'success');
          break;
        case 'excel':
          exportToExcel(data, filename);
          showToast('Fichier Excel généré avec succès.', 'success');
          break;
        case 'pdf':
          // We trigger native print for PDF
          showToast('Préparation du document PDF...', 'info');
          exportToPDF();
          break;
        case 'word':
          if (elementId) {
            exportToWord(elementId, filename);
            showToast('Fichier Word généré avec succès.', 'success');
          } else {
            showToast('Impossible de générer le fichier Word pour cette vue.', 'error');
          }
          break;
      }
    } catch (e) {
      showToast('Erreur lors de l\'export.', 'error');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ display: 'inline-block' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Download size={16} />
        <span>Exporter</span>
        <ChevronDown size={14} style={{ marginLeft: '4px' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          minWidth: '200px',
          zIndex: 50,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Options d'exportation</div>
          <button 
            className="dropdown-item" 
            onClick={() => handleExport('pdf')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#1e293b', fontSize: '14px', transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <PdfIcon size={16} style={{ color: '#e74c3c' }} /> Document PDF
          </button>
          <button 
            className="dropdown-item" 
            onClick={() => handleExport('excel')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#1e293b', fontSize: '14px', transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <TableIcon size={16} style={{ color: '#27ae60' }} /> Classeur Excel (.xls)
          </button>
          <button 
            className="dropdown-item" 
            onClick={() => handleExport('csv')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#1e293b', fontSize: '14px', transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <TableIcon size={16} style={{ color: '#059669' }} /> Format de données (.csv)
          </button>
          {elementId && (
            <button 
              className="dropdown-item" 
              onClick={() => handleExport('word')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#1e293b', fontSize: '14px', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FileText size={16} style={{ color: '#2980b9' }} /> Microsoft Word (.doc)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
