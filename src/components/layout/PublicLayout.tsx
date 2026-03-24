import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';

export default function PublicLayout() {
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();

  const links = [
    { label: 'Accueil', path: '/' },
    { label: 'Nos Établissements', path: '/nos-etablissements' },
    { label: 'Admissions', path: '/preinscription' },
    { label: 'Actualités', path: '/actualites' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="public-nav">
        <Link to="/" className="public-nav-logo">
          <div className="public-nav-logo-icon">LG</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e3a5f' }}>LE GUIDE</div>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>DE NOS ENFANTS</div>
          </div>
        </Link>

        <div className="public-nav-links" style={mobileNav ? { display: 'flex', flexDirection: 'column', position: 'absolute', top: '70px', left: 0, right: 0, background: 'white', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100 } : {}}>
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`public-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileNav(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/login" className="btn btn-primary" onClick={() => setMobileNav(false)}>
            Espace connecté
          </Link>
        </div>

        <button className="btn-ghost" style={{ display: 'none' }} onClick={() => setMobileNav(!mobileNav)}>
          {mobileNav ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <div className="public-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: '#f4a623', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1e3a5f', fontSize: '18px' }}>LG</div>
              <div>
                <div style={{ fontWeight: 700, color: 'white' }}>LE GUIDE DE NOS ENFANTS</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Groupe Scolaire d'Excellence</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, maxWidth: '350px' }}>
              Un groupe scolaire engagé pour l'excellence éducative, formant les leaders de demain avec des valeurs d'intégrité, de travail et d'ouverture sur le monde.
            </p>
          </div>
          <div>
            <h4>Établissements</h4>
            <ul>
              <li><a href="#!">École Les Palmiers</a></li>
              <li><a href="#!">École Les Cocotiers</a></li>
              <li><a href="#!">École Les Frangipaniers</a></li>
              <li><a href="#!">Lycée Le Guide</a></li>
            </ul>
          </div>
          <div>
            <h4>Liens rapides</h4>
            <ul>
              <li><Link to="/preinscription">Pré-inscription</Link></li>
              <li><Link to="/login">Espace parents</Link></li>
              <li><Link to="/login">Espace enseignants</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> +241 01 72 34 56</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> contact@leguide.ga</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> Libreville, Gabon</li>
            </ul>
          </div>
        </div>
        <div className="public-footer-bottom">
          <span>© 2026 LE GUIDE DE NOS ENFANTS. Tous droits réservés.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#!" style={{ color: 'rgba(255,255,255,0.5)' }}>Mentions légales</a>
            <a href="#!" style={{ color: 'rgba(255,255,255,0.5)' }}>Politique de confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
