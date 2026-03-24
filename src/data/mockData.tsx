// ═══════════════════════════════════════════════════════
// MOCK DATA — LE GUIDE DE NOS ENFANTS
// Données de démonstration pour tous les modules
// ═══════════════════════════════════════════════════════

export const etablissements = [
  { id: 1, nom: 'École Primaire Les Palmiers', type: 'Primaire', niveaux: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'], adresse: '12 Rue des Saphirs, Libreville', telephone: '+241 01 72 34 56', email: 'palmiers@leguide.ga', directeur: 'Marie Koumba', effectif: 850, capacite: 1000 },
  { id: 2, nom: 'École Primaire Les Cocotiers', type: 'Primaire', niveaux: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'], adresse: '45 Avenue de l\'Indépendance, Libreville', telephone: '+241 01 73 45 67', email: 'cocotiers@leguide.ga', directeur: 'Jean-Paul Mba', effectif: 720, capacite: 900 },
  { id: 3, nom: 'École Primaire Les Frangipaniers', type: 'Primaire', niveaux: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'], adresse: '8 Boulevard Léon Mba, Port-Gentil', telephone: '+241 01 74 56 78', email: 'frangipaniers@leguide.ga', directeur: 'Sylvie Ndong', effectif: 680, capacite: 850 },
  { id: 4, nom: 'Lycée d\'Excellence Le Guide', type: 'Lycée', niveaux: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'], adresse: '100 Boulevard Triomphal, Libreville', telephone: '+241 01 75 67 89', email: 'lycee@leguide.ga', directeur: 'Dr. François Obiang', effectif: 1200, capacite: 1500 },
];

export const anneeScolaire = { id: 1, label: '2025-2026', debut: '2025-09-08', fin: '2026-06-30', active: true };

export const classes = [
  { id: 1, nom: 'CP-A', niveau: 'CP', etablissementId: 1, effectif: 32, professeurPrincipal: 'Mme Essono', salle: 'Salle 101' },
  { id: 2, nom: 'CP-B', niveau: 'CP', etablissementId: 1, effectif: 30, professeurPrincipal: 'M. Nguema', salle: 'Salle 102' },
  { id: 3, nom: 'CE1-A', niveau: 'CE1', etablissementId: 1, effectif: 34, professeurPrincipal: 'Mme Biyoghe', salle: 'Salle 201' },
  { id: 4, nom: 'CM2-A', niveau: 'CM2', etablissementId: 1, effectif: 28, professeurPrincipal: 'M. Ondo', salle: 'Salle 501' },
  { id: 5, nom: '6ème-A', niveau: '6ème', etablissementId: 4, effectif: 35, professeurPrincipal: 'M. Boussougou', salle: 'Salle A1' },
  { id: 6, nom: '6ème-B', niveau: '6ème', etablissementId: 4, effectif: 33, professeurPrincipal: 'Mme Moussavou', salle: 'Salle A2' },
  { id: 7, nom: '3ème-A', niveau: '3ème', etablissementId: 4, effectif: 30, professeurPrincipal: 'M. Mboumba', salle: 'Salle D1' },
  { id: 8, nom: 'Terminale S', niveau: 'Terminale', etablissementId: 4, effectif: 25, professeurPrincipal: 'Dr. Nziengui', salle: 'Salle G1' },
  { id: 9, nom: 'CE2-A', niveau: 'CE2', etablissementId: 2, effectif: 31, professeurPrincipal: 'Mme Ayo', salle: 'Salle 301' },
  { id: 10, nom: '2nde-A', niveau: '2nde', etablissementId: 4, effectif: 32, professeurPrincipal: 'M. Lendoye', salle: 'Salle E1' },
];

export const matieres = [
  { id: 1, nom: 'Mathématiques', abr: 'MATH', couleur: '#3498db', coefficient: 4 },
  { id: 2, nom: 'Français', abr: 'FR', couleur: '#e74c3c', coefficient: 4 },
  { id: 3, nom: 'Sciences', abr: 'SCI', couleur: '#27ae60', coefficient: 3 },
  { id: 4, nom: 'Histoire-Géographie', abr: 'HG', couleur: '#f39c12', coefficient: 2 },
  { id: 5, nom: 'Anglais', abr: 'ANG', couleur: '#f4a623', coefficient: 2 },
  { id: 6, nom: 'EPS', abr: 'EPS', couleur: '#7c3aed', coefficient: 1 },
  { id: 7, nom: 'Arts Plastiques', abr: 'AP', couleur: '#ec4899', coefficient: 1 },
  { id: 8, nom: 'Physique-Chimie', abr: 'PC', couleur: '#06b6d4', coefficient: 3 },
  { id: 9, nom: 'SVT', abr: 'SVT', couleur: '#10b981', coefficient: 3 },
  { id: 10, nom: 'Philosophie', abr: 'PHILO', couleur: '#8b5cf6', coefficient: 3 },
];

const prenoms = ['Aimée', 'Boris', 'Chantal', 'Didier', 'Estelle', 'Franck', 'Grâce', 'Hervé', 'Irène', 'Jacques', 'Karine', 'Léon', 'Monique', 'Narcisse', 'Olivia', 'Patrick', 'Rachelle', 'Stéphane', 'Thérèse', 'Ulrich', 'Valérie', 'William', 'Xavier', 'Yolande', 'Zoé', 'Armel', 'Béatrice', 'Cédric', 'Denise', 'Éric'];
const noms = ['Obame', 'Nguema', 'Mba', 'Ondo', 'Ndong', 'Koumba', 'Bongo', 'Nze', 'Eyene', 'Moussavou', 'Boussougou', 'Essono', 'Mboumba', 'Nziengui', 'Lendoye', 'Biyoghe', 'Minko', 'Allogho', 'Ayo', 'Zang'];

function generateMatricule(i) {
  return `LGE-${String(anneeScolaire.label.split('-')[0]).slice(-2)}${String(i).padStart(4, '0')}`;
}

export const eleves = Array.from({ length: 60 }, (_, i) => {
  const classeId = (i % 10) + 1;
  const classe = classes.find(c => c.id === classeId);
  const statuts = ['Actif', 'Actif', 'Actif', 'Actif', 'Actif', 'Actif', 'Actif', 'Actif', 'Transféré', 'Inactif'];
  return {
    id: i + 1,
    prenom: prenoms[i % prenoms.length],
    nom: noms[i % noms.length],
    matricule: generateMatricule(i + 1),
    dateNaissance: `${2010 + (i % 8)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    sexe: i % 2 === 0 ? 'M' : 'F',
    classeId,
    classe: classe?.nom || '',
    etablissementId: classe?.etablissementId || 1,
    statut: statuts[i % statuts.length],
    photo: null,
    allergies: i % 7 === 0 ? 'Arachides' : i % 11 === 0 ? 'Lactose' : null,
    contactUrgence: `+241 0${6 + (i % 3)} ${String(10 + i).padStart(2, '0')} ${String(30 + i).padStart(2, '0')} ${String(40 + i).padStart(2, '0')}`,
    responsable1: { nom: `${prenoms[(i + 5) % prenoms.length]} ${noms[i % noms.length]}`, lien: 'Père', telephone: `+241 07 ${String(10 + i).padStart(2, '0')} 00 00` },
    responsable2: { nom: `${prenoms[(i + 15) % prenoms.length]} ${noms[(i + 3) % noms.length]}`, lien: 'Mère', telephone: `+241 06 ${String(20 + i).padStart(2, '0')} 00 00` },
  };
});

export const enseignants = [
  { id: 1, prenom: 'Marie', nom: 'Essono', email: 'marie.essono@leguide.ga', telephone: '+241 07 11 22 33', specialite: 'Mathématiques', etablissementId: 1, contrat: 'Titulaire', matieres: [1, 3] },
  { id: 2, prenom: 'Jean-Paul', nom: 'Nguema', email: 'jp.nguema@leguide.ga', telephone: '+241 07 22 33 44', specialite: 'Français', etablissementId: 1, contrat: 'Titulaire', matieres: [2, 4] },
  { id: 3, prenom: 'Sylvie', nom: 'Biyoghe', email: 'sylvie.biyoghe@leguide.ga', telephone: '+241 07 33 44 55', specialite: 'Sciences', etablissementId: 1, contrat: 'Titulaire', matieres: [3, 9] },
  { id: 4, prenom: 'Roger', nom: 'Ondo', email: 'roger.ondo@leguide.ga', telephone: '+241 07 44 55 66', specialite: 'Mathématiques', etablissementId: 1, contrat: 'Contractuel', matieres: [1] },
  { id: 5, prenom: 'François', nom: 'Boussougou', email: 'f.boussougou@leguide.ga', telephone: '+241 07 55 66 77', specialite: 'Physique-Chimie', etablissementId: 4, contrat: 'Titulaire', matieres: [8, 1] },
  { id: 6, prenom: 'Claire', nom: 'Moussavou', email: 'c.moussavou@leguide.ga', telephone: '+241 07 66 77 88', specialite: 'Français', etablissementId: 4, contrat: 'Titulaire', matieres: [2, 10] },
  { id: 7, prenom: 'Pierre', nom: 'Mboumba', email: 'pierre.mboumba@leguide.ga', telephone: '+241 07 77 88 99', specialite: 'Histoire-Géo', etablissementId: 4, contrat: 'Titulaire', matieres: [4] },
  { id: 8, prenom: 'Patrick', nom: 'Nziengui', email: 'p.nziengui@leguide.ga', telephone: '+241 07 88 99 00', specialite: 'Mathématiques', etablissementId: 4, contrat: 'Titulaire', matieres: [1, 8] },
  { id: 9, prenom: 'Béatrice', nom: 'Ayo', email: 'b.ayo@leguide.ga', telephone: '+241 07 99 00 11', specialite: 'Anglais', etablissementId: 2, contrat: 'Titulaire', matieres: [5] },
  { id: 10, prenom: 'Cédric', nom: 'Lendoye', email: 'c.lendoye@leguide.ga', telephone: '+241 07 00 11 22', specialite: 'SVT', etablissementId: 4, contrat: 'Contractuel', matieres: [9, 3] },
];

export const familles = [
  { id: 1, nom: 'Famille Obame', pere: 'Patrick Obame', mere: 'Irène Ndong', enfants: [1, 11, 21], telephone: '+241 07 10 00 00', email: 'famille.obame@email.ga', solde: -150000 },
  { id: 2, nom: 'Famille Nguema', pere: 'Hervé Nguema', mere: 'Estelle Koumba', enfants: [2, 12], telephone: '+241 07 20 00 00', email: 'famille.nguema@email.ga', solde: 0 },
  { id: 3, nom: 'Famille Mba', pere: 'Franck Mba', mere: 'Chantal Essono', enfants: [3, 13, 23], telephone: '+241 06 30 00 00', email: 'famille.mba@email.ga', solde: -75000 },
  { id: 4, nom: 'Famille Ondo', pere: 'Didier Ondo', mere: 'Grâce Moussavou', enfants: [4], telephone: '+241 07 40 00 00', email: 'famille.ondo@email.ga', solde: 0 },
  { id: 5, nom: 'Famille Ndong', pere: 'Jacques Ndong', mere: 'Karine Biyoghe', enfants: [5, 15], telephone: '+241 06 50 00 00', email: 'famille.ndong@email.ga', solde: -200000 },
  { id: 6, nom: 'Famille Koumba', pere: 'Léon Koumba', mere: 'Monique Nze', enfants: [6, 16, 26], telephone: '+241 07 60 00 00', email: 'famille.koumba@email.ga', solde: 0 },
  { id: 7, nom: 'Famille Bongo', pere: 'Stéphane Bongo', mere: 'Rachelle Eyene', enfants: [7], telephone: '+241 07 70 00 00', email: 'famille.bongo@email.ga', solde: -500000 },
  { id: 8, nom: 'Famille Nze', pere: 'William Nze', mere: 'Valérie Allogho', enfants: [8, 18], telephone: '+241 06 80 00 00', email: 'famille.nze@email.ga', solde: 0 },
];

export const notes = (() => {
  const result = [];
  let id = 1;
  const types = ['Contrôle', 'Devoir', 'Examen', 'Oral', 'TP'];
  for (let eleveId = 1; eleveId <= 20; eleveId++) {
    for (let matId = 1; matId <= 5; matId++) {
      for (let n = 0; n < 3; n++) {
        result.push({
          id: id++,
          eleveId,
          matiereId: matId,
          type: types[n % types.length],
          note: Math.round((8 + Math.random() * 12) * 100) / 100,
          sur: 20,
          date: `2026-0${1 + n}-${String(5 + n * 8).padStart(2, '0')}`,
          trimestre: 1,
          commentaire: '',
        });
      }
    }
  }
  return result;
})();

export const factures = [
  { id: 1, numero: 'FAC-2026-001', familleId: 1, eleveId: 1, type: 'Scolarité', montant: 750000, paye: 600000, statut: 'Partiel', echeance: '2026-01-15', datePaiement: '2026-01-10' },
  { id: 2, numero: 'FAC-2026-002', familleId: 2, eleveId: 2, type: 'Scolarité', montant: 750000, paye: 750000, statut: 'Payé', echeance: '2026-01-15', datePaiement: '2026-01-08' },
  { id: 3, numero: 'FAC-2026-003', familleId: 3, eleveId: 3, type: 'Scolarité', montant: 750000, paye: 675000, statut: 'Partiel', echeance: '2026-01-15', datePaiement: '2026-01-12' },
  { id: 4, numero: 'FAC-2026-004', familleId: 4, eleveId: 4, type: 'Scolarité', montant: 750000, paye: 750000, statut: 'Payé', echeance: '2026-01-15', datePaiement: '2026-01-05' },
  { id: 5, numero: 'FAC-2026-005', familleId: 5, eleveId: 5, type: 'Scolarité', montant: 950000, paye: 500000, statut: 'Partiel', echeance: '2026-01-15', datePaiement: '2026-01-14' },
  { id: 6, numero: 'FAC-2026-006', familleId: 6, eleveId: 6, type: 'Scolarité', montant: 750000, paye: 750000, statut: 'Payé', echeance: '2026-01-15', datePaiement: '2026-01-03' },
  { id: 7, numero: 'FAC-2026-007', familleId: 7, eleveId: 7, type: 'Scolarité', montant: 950000, paye: 0, statut: 'Impayé', echeance: '2026-01-15', datePaiement: null },
  { id: 8, numero: 'FAC-2026-008', familleId: 8, eleveId: 8, type: 'Scolarité', montant: 950000, paye: 950000, statut: 'Payé', echeance: '2026-01-15', datePaiement: '2026-01-09' },
  { id: 9, numero: 'FAC-2026-009', familleId: 1, eleveId: 11, type: 'Inscription', montant: 200000, paye: 200000, statut: 'Payé', echeance: '2025-09-01', datePaiement: '2025-08-28' },
  { id: 10, numero: 'FAC-2026-010', familleId: 1, eleveId: 1, type: 'Cantine', montant: 50000, paye: 0, statut: 'Impayé', echeance: '2026-02-01', datePaiement: null },
  { id: 11, numero: 'FAC-2026-011', familleId: 5, eleveId: 15, type: 'Scolarité', montant: 950000, paye: 750000, statut: 'Partiel', echeance: '2026-01-15', datePaiement: '2026-01-20' },
  { id: 12, numero: 'FAC-2026-012', familleId: 3, eleveId: 13, type: 'Transport', montant: 150000, paye: 150000, statut: 'Payé', echeance: '2026-01-15', datePaiement: '2026-01-13' },
];

export const absences = (() => {
  const result = [];
  let id = 1;
  const motifs = ['Maladie', 'Raison familiale', 'Non justifié', 'Rendez-vous médical', 'Non justifié', 'Maladie'];
  for (let day = 1; day <= 15; day++) {
    const nbAbsents = 2 + Math.floor(Math.random() * 4);
    for (let a = 0; a < nbAbsents; a++) {
      const eleveId = 1 + Math.floor(Math.random() * 30);
      result.push({
        id: id++,
        eleveId,
        date: `2026-03-${String(day).padStart(2, '0')}`,
        type: Math.random() > 0.2 ? 'Absent' : 'Retard',
        justifie: Math.random() > 0.4,
        motif: motifs[Math.floor(Math.random() * motifs.length)],
        heureDebut: '08:00',
        heureFin: '17:00',
      });
    }
  }
  return result;
})();

export const documents = [
  { id: 1, nom: 'Règlement intérieur 2025-2026', type: 'PDF', categorie: 'Administratif', etablissementId: null, taille: '2.4 MB', date: '2025-08-15', auteur: 'Direction Générale', dossier: '/Administratif' },
  { id: 2, nom: 'Calendrier scolaire', type: 'PDF', categorie: 'Administratif', etablissementId: null, taille: '1.1 MB', date: '2025-08-20', auteur: 'Direction Générale', dossier: '/Administratif' },
  { id: 3, nom: 'Programme Mathématiques CM2', type: 'Word', categorie: 'Pédagogique', etablissementId: 1, taille: '850 KB', date: '2025-09-01', auteur: 'M. Ondo', dossier: '/Pédagogique/Primaire' },
  { id: 4, nom: 'Grille de frais 2025-2026', type: 'Excel', categorie: 'Financier', etablissementId: null, taille: '320 KB', date: '2025-07-10', auteur: 'Comptabilité', dossier: '/Financier' },
  { id: 5, nom: 'PV Conseil de classe T1 - 6ème A', type: 'PDF', categorie: 'Pédagogique', etablissementId: 4, taille: '1.5 MB', date: '2025-12-15', auteur: 'M. Boussougou', dossier: '/Pédagogique/Lycée' },
  { id: 6, nom: 'Contrat de travail - Nouveau prof', type: 'PDF', categorie: 'RH', etablissementId: 4, taille: '900 KB', date: '2026-01-05', auteur: 'RH', dossier: '/RH' },
  { id: 7, nom: 'Factures fournisseurs Janvier', type: 'Excel', categorie: 'Financier', etablissementId: 1, taille: '1.2 MB', date: '2026-02-01', auteur: 'Comptabilité', dossier: '/Financier' },
  { id: 8, nom: 'Photos journée portes ouvertes', type: 'Image', categorie: 'Communication', etablissementId: 2, taille: '15 MB', date: '2026-01-20', auteur: 'Communication', dossier: '/Communication' },
  { id: 9, nom: 'Cours SVT - Chapitre 3', type: 'PDF', categorie: 'Pédagogique', etablissementId: 4, taille: '4.2 MB', date: '2026-02-10', auteur: 'M. Lendoye', dossier: '/Pédagogique/Lycée' },
  { id: 10, nom: 'Rapport trimestriel DG', type: 'PDF', categorie: 'Administratif', etablissementId: null, taille: '3.8 MB', date: '2026-01-31', auteur: 'Direction Générale', dossier: '/Administratif' },
];

export const messages = [
  { id: 1, expediteur: { nom: 'Marie Essono', role: 'Enseignant' }, destinataire: 'Parents CP-A', sujet: 'Sortie pédagogique du 20 mars', contenu: 'Chers parents, nous organisons une sortie pédagogique au jardin botanique le 20 mars. Merci de compléter l\'autorisation.', date: '2026-03-15 09:30', lu: false, type: 'individuel' },
  { id: 2, expediteur: { nom: 'Direction Générale', role: 'DG' }, destinataire: 'Tous', sujet: 'Journée pédagogique - 25 mars', contenu: 'Une journée pédagogique est prévue le 25 mars. Les cours seront suspendus.', date: '2026-03-14 14:00', lu: true, type: 'groupe' },
  { id: 3, expediteur: { nom: 'Patrick Obame', role: 'Parent' }, destinataire: 'Mme Essono', sujet: 'Absence de Boris', contenu: 'Bonjour Madame, Boris sera absent demain pour un rendez-vous médical. Cordialement.', date: '2026-03-13 18:45', lu: true, type: 'individuel' },
  { id: 4, expediteur: { nom: 'Comptabilité', role: 'Admin' }, destinataire: 'Famille Bongo', sujet: 'Rappel de paiement', contenu: 'Nous vous rappelons que la facture FAC-2026-007 d\'un montant de 950 000 FCFA est en attente de règlement.', date: '2026-03-12 10:00', lu: false, type: 'individuel' },
  { id: 5, expediteur: { nom: 'M. Boussougou', role: 'Enseignant' }, destinataire: 'Parents 6ème-A', sujet: 'Résultats du contrôle de Physique', contenu: 'Les résultats du contrôle de physique du 10 mars sont disponibles sur la plateforme.', date: '2026-03-11 16:20', lu: true, type: 'groupe' },
  { id: 6, expediteur: { nom: 'Admissions', role: 'Admin' }, destinataire: 'Famille Minko', sujet: 'Dossier d\'admission accepté', contenu: 'Nous avons le plaisir de vous informer que le dossier d\'admission de votre enfant a été accepté.', date: '2026-03-10 11:00', lu: true, type: 'individuel' },
];

export const admissions = [
  { id: 1, candidat: 'Armel Minko', dateNaissance: '2016-05-12', niveau: 'CE1', etablissement: 'Les Palmiers', parent: 'Denise Minko', statut: 'Accepté', dateDepot: '2026-02-15', email: 'denise.minko@email.ga', etape: 10 },
  { id: 2, candidat: 'Zoé Allogho', dateNaissance: '2017-03-08', niveau: 'CP', etablissement: 'Les Cocotiers', parent: 'Éric Allogho', statut: 'En cours d étude', dateDepot: '2026-03-01', email: 'eric.allogho@email.ga', etape: 7 },
  { id: 3, candidat: 'Boris Zang', dateNaissance: '2013-11-22', niveau: '6ème', etablissement: 'Lycée Le Guide', parent: 'Xavier Zang', statut: 'Dossier soumis', dateDepot: '2026-03-05', email: 'xavier.zang@email.ga', etape: 5 },
  { id: 4, candidat: 'Grâce Eyene', dateNaissance: '2015-07-19', niveau: 'CE2', etablissement: 'Les Frangipaniers', parent: 'Ulrich Eyene', statut: 'Incomplet', dateDepot: '2026-03-10', email: 'ulrich.eyene@email.ga', etape: 6 },
  { id: 5, candidat: 'Léon Moussavou', dateNaissance: '2014-01-30', niveau: 'CM1', etablissement: 'Les Palmiers', parent: 'Yolande Moussavou', statut: 'Profil complet', dateDepot: '2026-03-12', email: 'yolande.moussavou@email.ga', etape: 3 },
  { id: 6, candidat: 'Thérèse Nze', dateNaissance: '2012-09-14', niveau: '5ème', etablissement: 'Lycée Le Guide', parent: 'Narcisse Nze', statut: 'Refusé', dateDepot: '2026-02-20', email: 'narcisse.nze@email.ga', etape: 8 },
];

export const emploiDuTemps = [
  { jour: 'Lundi', heure: '08:00', matiere: 'Mathématiques', enseignant: 'Dr. Nziengui', salle: 'G1', type: 'maths', duree: 2 },
  { jour: 'Lundi', heure: '10:00', matiere: 'Français', enseignant: 'Mme Moussavou', salle: 'G1', type: 'francais', duree: 2 },
  { jour: 'Lundi', heure: '14:00', matiere: 'Physique-Chimie', enseignant: 'M. Boussougou', salle: 'Labo 1', type: 'sciences', duree: 2 },
  { jour: 'Mardi', heure: '08:00', matiere: 'SVT', enseignant: 'M. Lendoye', salle: 'Labo 2', type: 'sciences', duree: 2 },
  { jour: 'Mardi', heure: '10:00', matiere: 'Histoire-Géo', enseignant: 'M. Mboumba', salle: 'G1', type: 'histoire', duree: 2 },
  { jour: 'Mardi', heure: '14:00', matiere: 'Anglais', enseignant: 'Mme Ayo', salle: 'G1', type: 'anglais', duree: 2 },
  { jour: 'Mercredi', heure: '08:00', matiere: 'Mathématiques', enseignant: 'Dr. Nziengui', salle: 'G1', type: 'maths', duree: 2 },
  { jour: 'Mercredi', heure: '10:00', matiere: 'EPS', enseignant: 'M. Ondo', salle: 'Terrain', type: 'eps', duree: 2 },
  { jour: 'Jeudi', heure: '08:00', matiere: 'Français', enseignant: 'Mme Moussavou', salle: 'G1', type: 'francais', duree: 2 },
  { jour: 'Jeudi', heure: '10:00', matiere: 'Physique-Chimie', enseignant: 'M. Boussougou', salle: 'Labo 1', type: 'sciences', duree: 2 },
  { jour: 'Jeudi', heure: '14:00', matiere: 'Philosophie', enseignant: 'Mme Moussavou', salle: 'G1', type: 'francais', duree: 2 },
  { jour: 'Vendredi', heure: '08:00', matiere: 'Anglais', enseignant: 'Mme Ayo', salle: 'G1', type: 'anglais', duree: 2 },
  { jour: 'Vendredi', heure: '10:00', matiere: 'SVT', enseignant: 'M. Lendoye', salle: 'Labo 2', type: 'sciences', duree: 2 },
  { jour: 'Vendredi', heure: '14:00', matiere: 'Arts Plastiques', enseignant: 'Mme Biyoghe', salle: 'Salle Art', type: 'eps', duree: 2 },
];

export const cahierTexte = [
  { id: 1, date: '2026-03-17', matiere: 'Mathématiques', classe: 'Terminale S', enseignant: 'Dr. Nziengui', lecon: 'Chapitre 8 : Intégrales - Calcul d\'aires', devoirs: 'Exercices 12 à 18 page 245', dateRemise: '2026-03-20' },
  { id: 2, date: '2026-03-17', matiere: 'Français', classe: 'Terminale S', enseignant: 'Mme Moussavou', lecon: 'Commentaire composé : Baudelaire, Les Fleurs du Mal', devoirs: 'Rédiger l\'introduction du commentaire', dateRemise: '2026-03-19' },
  { id: 3, date: '2026-03-14', matiere: 'Physique-Chimie', classe: 'Terminale S', enseignant: 'M. Boussougou', lecon: 'Chapitre 6 : Radioactivité et réactions nucléaires', devoirs: 'QCM de révision en ligne', dateRemise: '2026-03-17' },
  { id: 4, date: '2026-03-14', matiere: 'SVT', classe: 'Terminale S', enseignant: 'M. Lendoye', lecon: 'Immunologie : mécanismes de défense de l\'organisme', devoirs: 'Schéma bilan du cours', dateRemise: '2026-03-21' },
  { id: 5, date: '2026-03-13', matiere: 'Histoire-Géo', classe: 'Terminale S', enseignant: 'M. Mboumba', lecon: 'La décolonisation en Afrique subsaharienne', devoirs: 'Fiche de révision sur les dates clés', dateRemise: '2026-03-18' },
];

export const notifications = [
  { id: 1, titre: 'Absence signalée', message: 'Boris Obame a été marqué absent ce matin', date: '2026-03-17 08:15', type: 'warning', lu: false },
  { id: 2, titre: 'Paiement reçu', message: 'Famille Nguema — 750 000 FCFA reçu', date: '2026-03-16 14:30', type: 'success', lu: false },
  { id: 3, titre: 'Nouveau dossier admission', message: 'Dossier de Léon Moussavou soumis', date: '2026-03-16 10:00', type: 'info', lu: false },
  { id: 4, titre: 'Bulletin publié', message: 'Les bulletins du T1 sont disponibles pour la 6ème-A', date: '2026-03-15 16:00', type: 'info', lu: true },
  { id: 5, titre: 'Alerte impayé', message: 'Famille Bongo — Facture 950 000 FCFA en retard depuis 60 jours', date: '2026-03-14 09:00', type: 'danger', lu: true },
  { id: 6, titre: 'Nouveau message', message: 'Patrick Obame vous a envoyé un message', date: '2026-03-13 18:45', type: 'info', lu: true },
];

export const demoUsers = [
  { id: 1, nom: 'Directeur Général', prenom: 'Jean-Marie', email: 'dg@leguide.ga', role: 'Direction Générale', initials: 'JM', color: '#1e3a5f' },
  { id: 2, nom: 'Directrice', prenom: 'Marie', email: 'dir.palmiers@leguide.ga', role: 'Directeur d\'Établissement', etablissementId: 1, initials: 'MK', color: '#27ae60' },
  { id: 3, nom: 'Essono', prenom: 'Marie', email: 'marie.essono@leguide.ga', role: 'Enseignant', etablissementId: 1, initials: 'ME', color: '#3498db' },
  { id: 4, nom: 'Obame', prenom: 'Patrick', email: 'patrick.obame@email.ga', role: 'Parent', initials: 'PO', color: '#f4a623' },
  { id: 5, nom: 'Obame', prenom: 'Boris', email: 'boris.obame@eleve.leguide.ga', role: 'Élève', classeId: 1, initials: 'BO', color: '#7c3aed' },
  { id: 6, nom: 'Admin', prenom: 'Système', email: 'admin@leguide.ga', role: 'Administration Scolaire', initials: 'SA', color: '#e74c3c' },
];

export const actualites = [
  { id: 1, titre: 'Journée portes ouvertes le 5 avril', resume: 'Venez découvrir nos établissements et rencontrer nos équipes pédagogiques.', date: '2026-03-15', image: null, categorie: 'Événement' },
  { id: 2, titre: 'Résultats exceptionnels au BEPC 2025', resume: 'Le Lycée Le Guide affiche un taux de réussite de 98% au BEPC, le meilleur de la province.', date: '2026-03-10', image: null, categorie: 'Académique' },
  { id: 3, titre: 'Nouveau partenariat avec Alliance Française', resume: 'Un accord de partenariat a été signé pour renforcer l\'enseignement du français.', date: '2026-03-05', image: null, categorie: 'Partenariat' },
  { id: 4, titre: 'Inscriptions 2026-2027 ouvertes', resume: 'Les pré-inscriptions pour l\'année scolaire 2026-2027 sont désormais ouvertes en ligne.', date: '2026-03-01', image: null, categorie: 'Admissions' },
];
