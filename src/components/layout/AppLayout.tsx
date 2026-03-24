import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard, GraduationCap, Users, School, Building2, BookOpen,
  CalendarDays, ClipboardCheck, FileText, DollarSign, FolderOpen,
  MessageSquare, UserPlus, BarChart3, Settings, LogOut, Menu, X,
  Search, Bell, ChevronDown, UserCircle, ChevronRight, Briefcase,
  Sun, Moon, PanelLeftClose, PanelLeft, Calendar
} from 'lucide-react';
import { notifications as notifData } from '../../data/mockData';
import SearchResults from '../ui/SearchResults';
import Toast from '../ui/Toast';

const menuItems = [
  { section: 'PRINCIPAL', items: [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire', 'Enseignant', 'Parent', 'Élève'] },
  ]},
  { section: 'ERP SCOLAIRE', items: [
    { label: 'Établissements', icon: Building2, path: '/erp/etablissements', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire'] },
    { label: 'Élèves', icon: GraduationCap, path: '/erp/eleves', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire', 'Enseignant'] },
    { label: 'Familles', icon: Users, path: '/erp/familles', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire'] },
    { label: 'Personnel', icon: Briefcase, path: '/erp/personnel', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire'] },
    { label: 'Classes', icon: School, path: '/erp/classes', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire', 'Enseignant'] },
  ]},
  { section: 'ACADÉMIQUE', items: [
    { label: 'Emploi du temps', icon: CalendarDays, path: '/academique/emploi-du-temps', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Enseignant', 'Élève', 'Parent'] },
    { label: 'Appel & Absences', icon: ClipboardCheck, path: '/academique/appel', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Enseignant', 'Administration Scolaire'] },
    { label: 'Notes & Bulletins', icon: FileText, path: '/academique/notes', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Enseignant', 'Parent', 'Élève'] },
    { label: 'Cahier de texte', icon: BookOpen, path: '/academique/cahier-texte', roles: ['Enseignant', 'Parent', 'Élève', 'Directeur d\'Établissement'] },
    { label: 'Calendrier scolaire', icon: Calendar, path: '/academique/calendrier', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Enseignant', 'Administration Scolaire', 'Parent', 'Élève'] },
    { label: 'Conseils de classe', icon: ClipboardCheck, path: '/academique/conseils-classe', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Enseignant', 'Administration Scolaire'] },
  ]},
  { section: 'GESTION', items: [
    { label: 'Finance', icon: DollarSign, path: '/finance', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire', 'Parent'] },
    { label: 'Documents (GED)', icon: FolderOpen, path: '/ged', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire', 'Enseignant'] },
    { label: 'Communication', icon: MessageSquare, path: '/communication', badge: 3, roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire', 'Enseignant', 'Parent', 'Élève'] },
    { label: 'Admissions', icon: UserPlus, path: '/admissions', roles: ['Direction Générale', 'Directeur d\'Établissement', 'Administration Scolaire'] },
  ]},
  { section: 'PILOTAGE', items: [
    { label: 'Tableaux de bord', icon: BarChart3, path: '/tableaux-de-bord', roles: ['Direction Générale', 'Directeur d\'Établissement'] },
  ]},
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifData.filter(n => !n.lu).length;

  // Close search results when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenu = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(user?.role))
  })).filter(section => section.items.length > 0);

  return (
    <div className="app-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">LG</div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <div className="sidebar-logo-title">LE GUIDE</div>
              <div className="sidebar-logo-sub">DE NOS ENFANTS</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="sidebar-user">
            <div className="avatar avatar-sm" style={{ background: user?.color || '#1e3a5f', color: 'white' }}>
              {user?.initials || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.prenom} {user?.nom}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {filteredMenu.map((section, si) => (
            <div key={si}>
              {!collapsed && <div className="sidebar-section-title">{section.section}</div>}
              {section.items.map((item, ii) => (
                <Link
                  key={ii}
                  to={item.path}
                  className={`sidebar-nav-item ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && <span className="sidebar-nav-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/parametres" className="sidebar-nav-item" onClick={() => setMobileOpen(false)} title={collapsed ? 'Paramètres' : undefined}>
            <Settings size={18} />
            {!collapsed && <span>Paramètres</span>}
          </Link>
          <div className="sidebar-nav-item" onClick={handleLogout} style={{ cursor: 'pointer' }} title={collapsed ? 'Déconnexion' : undefined}>
            <LogOut size={18} />
            {!collapsed && <span>Déconnexion</span>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="header">
          <button className="header-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={20} />
          </button>

          {/* Sidebar collapse toggle */}
          <button className="header-toggle sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>

          <div className="header-search" ref={searchRef} style={{ position: 'relative' }}>
            <Search size={16} className="header-search-icon" />
            <input
              type="text"
              placeholder="Rechercher un élève, une classe, un document..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
            />
            {searchFocused && searchQuery.length >= 2 && (
              <SearchResults query={searchQuery} onClose={() => { setSearchFocused(false); setSearchQuery(''); }} />
            )}
          </div>

          <div className="header-actions">
            {/* Dark mode toggle */}
            <button className="header-icon-btn" onClick={toggleTheme} title={isDark ? 'Mode clair' : 'Mode sombre'}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="dropdown" style={{ position: 'relative' }}>
              <button className="header-icon-btn" onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}>
                <Bell size={20} />
                {unreadNotifs > 0 && <span className="header-notif-badge">{unreadNotifs}</span>}
              </button>
              {showNotif && (
                <div className="dropdown-menu notif-dropdown" style={{ right: 0 }}>
                  <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Notifications</span>
                    <span className="badge badge-primary">{unreadNotifs} nouvelles</span>
                  </div>
                  {notifData.slice(0, 5).map(n => (
                    <div key={n.id} className={`notif-item ${!n.lu ? 'unread' : ''}`} onClick={() => setShowNotif(false)}>
                      {!n.lu && <div className="notif-dot" />}
                      <div style={{ flex: 1 }}>
                        <div className="notif-title">{n.titre}</div>
                        <div className="notif-desc">{n.message}</div>
                        <div className="notif-time">{n.date}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid #e0e6ed' }}>
                    <button className="btn btn-sm btn-secondary" style={{ fontSize: '12px' }}>Voir toutes les notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="dropdown" style={{ position: 'relative' }}>
              <div className="header-user" onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}>
                <div className="avatar avatar-sm" style={{ background: user?.color || '#1e3a5f', color: 'white', fontSize: '11px' }}>
                  {user?.initials || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="header-user-name">{user?.prenom} {user?.nom}</span>
                  <span className="header-user-role">{user?.role}</span>
                </div>
                <ChevronDown size={14} style={{ color: '#9ca3af' }} />
              </div>
              {showUserMenu && (
                <div className="dropdown-menu" style={{ right: 0, minWidth: '200px' }}>
                  <Link to="/profil" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <UserCircle size={16} /> Mon profil
                  </Link>
                  <Link to="/parametres" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <Settings size={16} /> Paramètres
                  </Link>
                  <div className="dropdown-divider" />
                  <div className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={16} /> Déconnexion
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-body">
          <Outlet />
        </div>
      </div>

      {/* Toast notifications */}
      <Toast />

      {/* Mobile overlay */}
      {mobileOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} onClick={() => setMobileOpen(false)} />}
    </div>
  );
}
