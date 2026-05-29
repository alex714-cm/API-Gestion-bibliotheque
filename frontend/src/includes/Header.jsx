import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

// Composant barre de recherche dans la navbar
function NavSearchBar({ navigate, isDark }) {
    const [q, setQ] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (q.trim()) {
            navigate(`/home?search=${encodeURIComponent(q.trim())}`);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="d-flex align-items-center nav-search-form" style={{ position: 'relative' }}>
            <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Rechercher par auteur, titre..."
                className="nav-search-input"
                style={{
                    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '50px',
                    padding: '7px 42px 7px 16px',
                    fontSize: '0.85rem',
                    color: isDark ? '#e2e8f0' : '#1a202c',
                    outline: 'none',
                    width: '230px',
                    transition: 'all 0.25s ease',
                }}
                onFocus={e => { e.target.style.width = '280px'; e.target.style.borderColor = isDark ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.5)'; }}
                onBlur={e => { e.target.style.width = '230px'; e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'; }}
            />
            <button
                type="submit"
                style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    border: 'none', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '0.8rem',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
                    transition: 'transform 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
            >
                <i className="bi bi-search"></i>
            </button>
        </form>
    );
}

export function Header() {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [catDropdownOpen, setCatDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const catDropdownRef = useRef(null);

    const isDark = theme === 'dark';
    const currentPath = location.pathname;

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setAccountDropdownOpen(false);
            }
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
                setCatDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Déterminer la navbar à afficher en fonction du rôle
    const renderNavbarContent = () => {
        const linkClass = (path, activeColorClass) => {
            const isActive = currentPath === path;
            if (isActive) {
                return `nav-link fw-bold px-3 py-2 rounded-3 active-link ${activeColorClass}`;
            }
            return `nav-link fw-medium px-3 py-2 rounded-3 text-nav-inactive`;
        };

        if (!user) {
            // ── NAVBAR PUBLIC / VISITEUR ──────────────────────────────────────
            return (
                <>
                    <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 logo-brand" to="/home">
                        <i className="bi bi-book-half text-primary logo-icon"></i>
                        <span className="logo-text">Livre<span className="text-primary">Moi</span></span>
                        <span className="badge badge-visitor small ms-1">Visiteur</span>
                    </Link>

                    <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
                            <li className="nav-item">
                                <Link className={linkClass('/home', 'text-primary bg-primary-subtle-custom')} to="/home">
                                    <i className="bi bi-house-door me-2"></i>Catalogue
                                </Link>
                            </li>
                            {/* Dropdown Catégories */}
                            <li className="nav-item dropdown-custom-wrapper" ref={catDropdownRef}>
                                <button
                                    className="btn btn-categories-dropdown d-flex align-items-center gap-2 nav-link fw-medium px-3 py-2 rounded-3 text-nav-inactive"
                                    onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                                >
                                    <i className="bi bi-tags me-1"></i>
                                    <span>Catégories</span>
                                    <i className={`bi bi-chevron-down dropdown-chevron ${catDropdownOpen ? 'rotated' : ''}`} style={{ fontSize: '0.65rem' }}></i>
                                </button>
                                {catDropdownOpen && (
                                    <div className="categories-dropdown-menu">
                                        <Link to="/programmation" className="categories-dropdown-item" onClick={() => setCatDropdownOpen(false)}>
                                            <span className="cat-icon bg-primary bg-opacity-10 text-primary"><i className="bi bi-code-slash"></i></span>
                                            Programmation
                                        </Link>
                                        <Link to="/litterature" className="categories-dropdown-item" onClick={() => setCatDropdownOpen(false)}>
                                            <span className="cat-icon bg-success bg-opacity-10 text-success"><i className="bi bi-book"></i></span>
                                            Littérature
                                        </Link>
                                        <Link to="/science" className="categories-dropdown-item" onClick={() => setCatDropdownOpen(false)}>
                                            <span className="cat-icon bg-warning bg-opacity-10 text-warning"><i className="bi bi-cpu"></i></span>
                                            Science
                                        </Link>
                                    </div>
                                )}
                            </li>
                        </ul>

                        <div className="d-flex align-items-center gap-3">
                            {/* Barre de recherche navbar */}
                            <NavSearchBar navigate={navigate} isDark={isDark} />

                            <button className="btn btn-theme-toggle rounded-circle" onClick={toggleTheme} title="Changer le thème">
                                <i className={`bi bi-${isDark ? 'sun-fill text-warning' : 'moon-stars-fill text-primary'}`}></i>
                            </button>

                            {/* Dropdown Mon Compte */}
                            <div className="account-dropdown-wrapper" ref={dropdownRef}>
                                <button
                                    className="btn btn-account-dropdown d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-bold"
                                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                                >
                                    <i className="bi bi-person-circle fs-5"></i>
                                    <span>Mon compte</span>
                                    <i className={`bi bi-chevron-down dropdown-chevron ${accountDropdownOpen ? 'rotated' : ''}`}></i>
                                </button>

                                {accountDropdownOpen && (
                                    <div className="account-dropdown-menu">
                                        <Link
                                            to="/login"
                                            className="account-dropdown-item"
                                            onClick={() => setAccountDropdownOpen(false)}
                                        >
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Se connecter
                                        </Link>
                                        <div className="account-dropdown-divider"></div>
                                        <Link
                                            to="/register"
                                            className="account-dropdown-item"
                                            onClick={() => setAccountDropdownOpen(false)}
                                        >
                                            <i className="bi bi-person-plus me-2"></i>
                                            Créer un compte
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            );
        } else if (user.role === 'USER') {
            // ── NAVBAR LECTEUR ────────────────────────────────────────
            return (
                <>
                    <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 logo-brand" to="/dashboard">
                        <i className="bi bi-journal-bookmark-fill text-info logo-icon"></i>
                        <span className="logo-text">Livre<span className="text-info">Moi</span></span>
                        <span className="badge badge-reader small ms-1">Lecteur</span>
                    </Link>

                    <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
                            <li className="nav-item">
                                <Link className={linkClass('/home', 'text-info bg-info-subtle-custom')} to="/home">
                                    <i className="bi bi-grid-1x2 me-2"></i>Catalogue
                                </Link>
                            </li>
                            {/* Dropdown Catégories */}
                            <li className="nav-item dropdown-custom-wrapper" ref={catDropdownRef}>
                                <button
                                    className="btn btn-categories-dropdown d-flex align-items-center gap-2 nav-link fw-medium px-3 py-2 rounded-3 text-nav-inactive"
                                    onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                                >
                                    <i className="bi bi-tags me-1"></i>
                                    <span>Catégories</span>
                                    <i className={`bi bi-chevron-down dropdown-chevron ${catDropdownOpen ? 'rotated' : ''}`} style={{ fontSize: '0.65rem' }}></i>
                                </button>
                                {catDropdownOpen && (
                                    <div className="categories-dropdown-menu">
                                        <Link to="/programmation" className="categories-dropdown-item" onClick={() => setCatDropdownOpen(false)}>
                                            <span className="cat-icon bg-primary bg-opacity-10 text-primary"><i className="bi bi-code-slash"></i></span>
                                            Programmation
                                        </Link>
                                        <Link to="/litterature" className="categories-dropdown-item" onClick={() => setCatDropdownOpen(false)}>
                                            <span className="cat-icon bg-success bg-opacity-10 text-success"><i className="bi bi-book"></i></span>
                                            Littérature
                                        </Link>
                                        <Link to="/science" className="categories-dropdown-item" onClick={() => setCatDropdownOpen(false)}>
                                            <span className="cat-icon bg-warning bg-opacity-10 text-warning"><i className="bi bi-cpu"></i></span>
                                            Science
                                        </Link>
                                    </div>
                                )}
                            </li>
                            <li className="nav-item">
                                <Link className={linkClass('/dashboard', 'text-info bg-info-subtle-custom')} to="/dashboard">
                                    <i className="bi bi-person-badge me-2"></i>Mon Espace
                                </Link>
                            </li>
                        </ul>

                        <div className="d-flex align-items-center gap-3">
                            {/* Barre de recherche navbar */}
                            <NavSearchBar navigate={navigate} isDark={isDark} />

                            <button className="btn btn-theme-toggle rounded-circle" onClick={toggleTheme} title="Changer le thème">
                                <i className={`bi bi-${isDark ? 'sun-fill text-warning' : 'moon-stars-fill text-info'}`}></i>
                            </button>

                            <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                                style={{
                                    background: isDark ? 'rgba(13,202,240,0.08)' : 'rgba(13,202,240,0.06)',
                                    border: '1px solid rgba(13,202,240,0.2)'
                                }}>
                                <i className="bi bi-person-circle text-info"></i>
                                <span className="small fw-semibold" style={{ color: isDark ? '#67e8f9' : '#0891b2' }}>
                                    {user.firstName}
                                </span>
                            </div>

                            <button
                                onClick={() => { logout(); navigate("/login"); }}
                                className="btn btn-logout px-4 py-2 rounded-pill fw-bold shadow-sm"
                            >
                                <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
                            </button>
                        </div>
                    </div>
                </>
            );
        } else {
            // ── NAVBAR ADMIN / GESTIONNAIRE ──────────────────────────────────
            return (
                <>
                    <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 logo-brand" to="/admin/livre">
                        <span className="logo-text">Livre<span className="text-danger">Moi</span></span>
                        <span className="badge badge-admin small ms-1">Admin</span>
                    </Link>

                    <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
                            <li className="nav-item">
                                <Link className={linkClass('/admin/dashboard', 'text-danger bg-danger-subtle-custom')} to="/admin/dashboard">
                                    <i className="bi bi-speedometer2 me-2"></i>Tableau de bord
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={linkClass('/admin/emprunts', 'text-danger bg-danger-subtle-custom')} to="/admin/emprunts">
                                    <i className="bi bi-arrow-left-right me-2"></i>Emprunts / Retours
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={linkClass('/admin/livre', 'text-danger bg-danger-subtle-custom')} to="/admin/livre">
                                    <i className="bi bi-book me-2"></i>Livres
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={linkClass('/admin/auteur', 'text-danger bg-danger-subtle-custom')} to="/admin/auteur">
                                    <i className="bi bi-people me-2"></i>Auteurs
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={linkClass('/admin/categorie', 'text-danger bg-danger-subtle-custom')} to="/admin/categorie">
                                    <i className="bi bi-tags me-2"></i>Catégories
                                </Link>
                            </li>
                        </ul>

                        <div className="d-flex align-items-center gap-3">
                            <button className="btn btn-theme-toggle rounded-circle" onClick={toggleTheme} title="Changer le thème">
                                <i className={`bi bi-${isDark ? 'sun-fill text-warning' : 'moon-stars-fill text-danger'}`}></i>
                            </button>
                            <span className="user-greeting small">
                                Admin: <b className="text-danger">{user.firstName}</b>
                            </span>
                            <button
                                onClick={() => { logout(); navigate("/login"); }}
                                className="btn btn-logout px-4 py-2 rounded-pill fw-bold shadow-sm"
                            >
                                <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
                            </button>
                        </div>
                    </div>
                </>
            );
        }
    };

    // Classe principale de la navbar suivant le thème
    const getNavbarClasses = () => {
        let base = "navbar navbar-expand-lg sticky-top px-4 py-3 custom-navbar ";
        if (isDark) {
            return base + "navbar-dark bg-dark-navbar border-bottom-dark";
        }
        return base + "navbar-light bg-light-navbar border-bottom-light";
    };

    return (
        <nav className={getNavbarClasses()}>
            <div className="container-fluid">
                {renderNavbarContent()}
            </div>

            {/* CSS Premium pour la Navbar */}
            <style dangerouslySetInnerHTML={{__html: `
                :root {
                    --nav-inactive-light: #5a6a85;
                    --nav-inactive-dark: #a0aec0;
                    --bg-navbar-light: rgba(255, 255, 255, 0.95);
                    --bg-navbar-dark: rgba(13, 17, 23, 0.95);
                    --border-navbar-light: rgba(226, 232, 240, 0.8);
                    --border-navbar-dark: rgba(45, 55, 72, 0.8);
                }

                .custom-navbar {
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bg-light-navbar {
                    background-color: var(--bg-navbar-light) !important;
                    box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
                }

                .bg-dark-navbar {
                    background-color: var(--bg-navbar-dark) !important;
                    box-shadow: 0 4px 20px -2px rgba(0,0,0,0.3);
                }

                .border-bottom-light {
                    border-bottom: 1px solid var(--border-navbar-light);
                }

                .border-bottom-dark {
                    border-bottom: 1px solid var(--border-navbar-dark);
                }

                .logo-brand {
                    letter-spacing: -0.5px;
                    transition: transform 0.2s ease;
                }
                .logo-brand:hover {
                    transform: scale(1.02);
                }
                .navbar-light .logo-text {
                    color: #1a202c;
                }
                .navbar-dark .logo-text {
                    color: #ffffff;
                }
                .logo-icon {
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                }

                .badge-visitor {
                    background-color: rgba(90, 106, 133, 0.15);
                    color: #5a6a85;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                }
                .badge-reader {
                    background-color: rgba(13, 202, 240, 0.15);
                    color: #0dcaf0;
                    font-weight: 700;
                    padding: 0.25rem 0.5rem;
                }
                .badge-admin {
                    background-color: rgba(220, 53, 69, 0.15);
                    color: #dc3545;
                    font-weight: 700;
                    padding: 0.25rem 0.5rem;
                }

                .text-nav-inactive {
                    transition: all 0.2s ease;
                }
                .navbar-light .text-nav-inactive {
                    color: var(--nav-inactive-light) !important;
                }
                .navbar-dark .text-nav-inactive {
                    color: var(--nav-inactive-dark) !important;
                }

                .text-nav-inactive:hover {
                    color: ${isDark ? '#fff' : '#1a202c'} !important;
                    background-color: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
                }

                .active-link {
                    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
                }

                .bg-primary-subtle-custom {
                    background-color: rgba(13, 110, 253, 0.1) !important;
                }
                .bg-info-subtle-custom {
                    background-color: rgba(13, 202, 240, 0.1) !important;
                }
                .bg-danger-subtle-custom {
                    background-color: rgba(220, 53, 69, 0.1) !important;
                }

                .btn-theme-toggle {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
                    background: transparent;
                    transition: all 0.2s ease;
                }
                .btn-theme-toggle:hover {
                    background-color: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
                    transform: rotate(15deg);
                }

                .btn-logout {
                    background-color: rgba(220, 53, 69, 0.1);
                    border: 1px solid rgba(220, 53, 69, 0.2);
                    color: #dc3545 !important;
                    transition: all 0.2s ease;
                    font-size: 0.875rem;
                }
                .btn-logout:hover {
                    background-color: #dc3545;
                    color: #fff !important;
                    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2) !important;
                }

                .user-greeting {
                    color: ${isDark ? '#e2e8f0' : '#4a5568'};
                }

                .account-dropdown-wrapper {
                    position: relative;
                }

                .btn-account-dropdown {
                    border: 1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'};
                    color: ${isDark ? '#e2e8f0' : '#1a202c'} !important;
                    background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 0.9rem;
                }
                .btn-account-dropdown:hover {
                    background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13, 110, 253, 0.08)'};
                    border-color: ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(13, 110, 253, 0.3)'};
                    color: ${isDark ? '#fff' : '#0d6efd'} !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(13, 110, 253, 0.12)'};
                }

                .dropdown-chevron {
                    font-size: 0.7rem;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .dropdown-chevron.rotated {
                    transform: rotate(180deg);
                }

                .account-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    min-width: 220px;
                    background: ${isDark ? 'rgba(22, 27, 34, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
                    border-radius: 12px;
                    padding: 6px;
                    box-shadow: 0 10px 40px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'},
                               0 2px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'};
                    z-index: 1050;
                    animation: dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes dropdownFadeIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .account-dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: ${isDark ? '#c9d1d9' : '#374151'};
                    text-decoration: none;
                    transition: all 0.15s ease;
                }
                .account-dropdown-item:hover {
                    background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13, 110, 253, 0.08)'};
                    color: ${isDark ? '#fff' : '#0d6efd'};
                    transform: translateX(2px);
                }
                .account-dropdown-item i {
                    font-size: 1rem;
                    opacity: 0.7;
                }
                .account-dropdown-item:hover i {
                    opacity: 1;
                }

                .account-dropdown-divider {
                    height: 1px;
                    margin: 4px 10px;
                    background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
                }

                .dropdown-custom-wrapper {
                    position: relative;
                }

                .btn-categories-dropdown {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                .categories-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    min-width: 240px;
                    background: ${isDark ? 'rgba(22, 27, 34, 0.95)' : 'rgba(255, 255, 255, 0.98)'};
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
                    border-radius: 12px;
                    padding: 6px;
                    box-shadow: 0 10px 40px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'},
                               0 2px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'};
                    z-index: 1050;
                    animation: dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .categories-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: ${isDark ? '#c9d1d9' : '#374151'};
                    text-decoration: none;
                    transition: all 0.15s ease;
                }

                .categories-dropdown-item:hover {
                    background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13, 110, 253, 0.08)'};
                    color: ${isDark ? '#fff' : '#0d6efd'};
                    transform: translateX(4px);
                }

                .cat-icon {
                    width: 30px;
                    height: 30px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    font-size: 0.9rem;
                }
            `}} />
        </nav>
    );
}