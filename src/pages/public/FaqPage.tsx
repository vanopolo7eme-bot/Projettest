import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Accordion from '../../components/ui/Accordion';
import { HelpCircle, Search, BookOpen, CreditCard, GraduationCap, Monitor, ArrowRight } from 'lucide-react';

const faqCategories = [
  {
    id: 'inscriptions',
    label: 'Inscriptions & Admissions',
    icon: <GraduationCap size={20} />,
    color: '#1e3a5f',
    bg: '#e8f0fe',
    items: [
      { question: 'Comment pré-inscrire mon enfant ?', answer: 'Rendez-vous sur notre page de pré-inscription en ligne. Remplissez le formulaire avec les informations de votre enfant et téléchargez les documents requis (acte de naissance, carnet de vaccinations, bulletins scolaires). Vous recevrez un email de confirmation sous 48h.' },
      { question: 'Quels sont les documents requis pour l\'inscription ?', answer: 'Les documents nécessaires sont : acte de naissance de l\'enfant, bulletins scolaires des 2 dernières années, carnet de vaccinations à jour, 4 photos d\'identité, copie de la pièce d\'identité du responsable légal, et justificatif de domicile.' },
      { question: 'Quels sont les critères de sélection ?', answer: 'L\'admission est basée sur l\'examen du dossier scolaire, un test d\'évaluation (mathématiques et français), et un entretien avec la direction. Nous privilégions la motivation, le sérieux et le potentiel de l\'élève.' },
      { question: 'Peut-on visiter les établissements avant l\'inscription ?', answer: 'Oui ! Nous organisons des journées portes ouvertes régulièrement. Vous pouvez également demander une visite individuelle en contactant l\'établissement de votre choix. Les dates sont publiées dans la section Actualités.' },
    ]
  },
  {
    id: 'scolarite',
    label: 'Scolarité & Vie Scolaire',
    icon: <BookOpen size={20} />,
    color: '#3b82f6',
    bg: '#dbeafe',
    items: [
      { question: 'Comment consulter les notes de mon enfant ?', answer: 'Connectez-vous à votre espace parent avec vos identifiants. Accédez à la section "Notes & Bulletins" dans le menu Académique. Vous y trouverez les notes détaillées par matière ainsi que les bulletins trimestriels.' },
      { question: 'Comment justifier une absence ?', answer: 'Prévenez l\'établissement par téléphone ou via la messagerie de la plateforme dans les 48h. Fournissez un justificatif (certificat médical, etc.) au retour de l\'élève. Les absences non justifiées sont signalées automatiquement.' },
      { question: 'Comment contacter un enseignant ?', answer: 'Utilisez la messagerie intégrée de la plateforme : section Communication > Messages. Sélectionnez l\'enseignant comme destinataire et rédigez votre message. Le délai de réponse moyen est de 24 à 48h ouvrées.' },
      { question: 'Quels sont les horaires de cours ?', answer: 'Les cours se déroulent de 7h30 à 12h30 et de 14h00 à 16h00 du lundi au vendredi. Le mercredi après-midi est consacré aux activités périscolaires. L\'emploi du temps détaillé est disponible dans votre espace connecté.' },
    ]
  },
  {
    id: 'paiements',
    label: 'Frais & Paiements',
    icon: <CreditCard size={20} />,
    color: '#27ae60',
    bg: '#d1fae5',
    items: [
      { question: 'Quels sont les frais de scolarité ?', answer: 'Les frais varient selon le niveau : Primaire (750 000 FCFA/an), Collège (850 000 FCFA/an), Lycée (950 000 FCFA/an). Ces montants incluent les frais pédagogiques. L\'inscription, la cantine et le transport sont facturés séparément.' },
      { question: 'Quels modes de paiement sont acceptés ?', answer: 'Nous acceptons : virement bancaire, chèque, espèces à la comptabilité, et paiement mobile (Airtel Money, Moov Money). Les paiements échelonnés en 3 ou 4 fois sont possibles sur demande.' },
      { question: 'Comment consulter mes factures ?', answer: 'Connectez-vous à votre espace parent et accédez à la section Finance. Vous y retrouverez l\'historique de vos factures, les montants payés et le solde restant. Vous pouvez télécharger chaque facture au format PDF.' },
      { question: 'Y a-t-il des réductions pour les fratries ?', answer: 'Oui, une réduction de 10% est accordée à partir du deuxième enfant inscrit. Pour les familles de 3 enfants ou plus, la réduction passe à 15% sur l\'ensemble des frais de scolarité.' },
    ]
  },
  {
    id: 'plateforme',
    label: 'Plateforme & Technique',
    icon: <Monitor size={20} />,
    color: '#f4a623',
    bg: '#fef3c7',
    items: [
      { question: 'Comment accéder à mon espace connecté ?', answer: 'Rendez-vous sur la page d\'accueil et cliquez sur "Espace connecté". Saisissez l\'email et le mot de passe fournis par l\'établissement. En cas de première connexion, un email d\'activation vous a été envoyé.' },
      { question: 'J\'ai oublié mon mot de passe, que faire ?', answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Saisissez votre adresse email et vous recevrez un lien de réinitialisation. Si vous ne recevez pas l\'email, contactez l\'administration de votre établissement.' },
      { question: 'La plateforme est-elle accessible sur mobile ?', answer: 'Oui, la plateforme est entièrement responsive et s\'adapte à tous les écrans (ordinateur, tablette, smartphone). Aucune application à télécharger, tout fonctionne depuis votre navigateur web.' },
    ]
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('inscriptions');

  const currentCategory = faqCategories.find(c => c.id === activeCategory);
  const filteredItems = currentCategory?.items.filter(item =>
    !search || item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const allItems = faqCategories.flatMap(c => c.items);
  const searchItems = search
    ? allItems.filter(item => item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="fade-in">
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f2137 0%, #1e3a5f 50%, #2d5a8e 100%)', padding: '64px 80px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 20% 80%, rgba(244,166,35,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <HelpCircle size={32} color="#f4a623" />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>Questions fréquentes</h1>
          <p style={{ fontSize: '16px', opacity: 0.8, maxWidth: '500px', margin: '0 auto 28px' }}>Trouvez rapidement les réponses à vos questions sur nos établissements et services.</p>
          <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              placeholder="Rechercher dans la FAQ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 18px 14px 46px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', color: 'white', fontSize: '15px', outline: 'none', backdropFilter: 'blur(8px)' }}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '48px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        {search ? (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              {searchItems.length} résultat{searchItems.length > 1 ? 's' : ''} pour « {search} »
            </h2>
            {searchItems.length > 0 ? (
              <Accordion items={searchItems} />
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                <HelpCircle size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>Aucune question ne correspond à votre recherche.</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
            {/* Category sidebar */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Catégories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {faqCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                      border: 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                      background: activeCategory === cat.id ? cat.bg : 'transparent',
                      color: activeCategory === cat.id ? cat.color : '#4b5563',
                      fontWeight: activeCategory === cat.id ? 700 : 500,
                      fontSize: '14px', transition: 'all 0.2s ease',
                    }}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.6 }}>{cat.items.length}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '44px', height: '44px', background: currentCategory?.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentCategory?.color }}>
                  {currentCategory?.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{currentCategory?.label}</h2>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>{currentCategory?.items.length} questions</p>
                </div>
              </div>
              <Accordion items={filteredItems} />
            </div>
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{ background: '#f8fafc', padding: '48px 80px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px', color: '#1e3a5f' }}>Vous n'avez pas trouvé votre réponse ?</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>N'hésitez pas à nous contacter, notre équipe vous répondra dans les meilleurs délais.</p>
        <Link to="/contact" className="btn btn-primary btn-lg">Nous contacter <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}
