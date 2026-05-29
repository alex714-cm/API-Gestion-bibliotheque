import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

export function Footer() {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    return (
        <footer style={{
            background: isDark ? '#0d1117' : '#1a1f2e',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)'}`,
            marginTop: 'auto'
        }} className="py-5">
            <div className="container">
                <div className="row g-5">

                    {/* Colonne 1 : Brand */}
                    <div className="col-lg-4 col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-book-half text-primary fs-4"></i>
                            <h4 className="text-white fw-bold mb-0">
                                Livre<span className="text-primary">Moi</span>
                            </h4>
                        </div>
                        <p className="small mb-4" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
                            Système de gestion de bibliothèque — empruntez, rendez et suivez vos livres.
                            Catalogue complet avec recherche par titre, auteur ou catégorie.
                        </p>
                        <div className="d-flex gap-2">
                            {['facebook', 'twitter-x', 'instagram', 'linkedin'].map(icon => (
                                <a key={icon} href="#"
                                    className="d-flex align-items-center justify-content-center rounded-3 text-decoration-none"
                                    style={{
                                        width: 36, height: 36,
                                        background: 'rgba(255,255,255,0.06)',
                                        color: 'rgba(255,255,255,0.5)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
                                        e.currentTarget.style.color = '#818cf8';
                                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    }}
                                >
                                    <i className={`bi bi-${icon} small`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Colonne 2 : Navigation */}
                    <div className="col-lg-2 col-md-6 col-6">
                        <h6 className="text-white fw-bold mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.9 }}>
                            Navigation
                        </h6>
                        <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                            {[
                                { to: '/home', label: 'Catalogue' },
                                { to: '/login', label: 'Se connecter' },
                                { to: '/register', label: "S'inscrire" },
                                { to: '/dashboard', label: 'Mon Espace' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to}
                                        className="text-decoration-none small footer-link"
                                        style={{ color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s ease' }}>
                                        <i className="bi bi-chevron-right me-1" style={{ fontSize: '0.65rem', opacity: 0.5 }}></i>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Colonne 3 : Services */}
                    <div className="col-lg-3 col-md-6 col-6">
                        <h6 className="text-white fw-bold mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.9 }}>
                            Services
                        </h6>
                        <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                            {[
                                { icon: 'book', label: 'Emprunt de livres' },
                                { icon: 'arrow-return-left', label: 'Retour de livres' },
                                { icon: 'search', label: 'Recherche avancée' },
                                { icon: 'clock-history', label: 'Historique des emprunts' },
                                { icon: 'person-badge', label: 'Espace lecteur' },
                            ].map(item => (
                                <li key={item.label} className="d-flex align-items-center gap-2 small" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                    <i className={`bi bi-${item.icon}`} style={{ color: '#6366f1', opacity: 0.8, fontSize: '0.75rem' }}></i>
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Colonne 4 : Contact & Horaires */}
                    <div className="col-lg-3 col-md-6">
                        <h6 className="text-white fw-bold mb-3" style={{ letterSpacing: '0.5px', fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.9 }}>
                            Contact
                        </h6>
                        <div className="d-flex flex-column gap-3">
                            {[
                                { icon: 'geo-alt-fill', text: 'Boulevard Mohammed V, Rabat' },
                                { icon: 'telephone-fill', text: '+212 06 00 00 00' },
                                { icon: 'envelope-fill', text: 'contact@bibliotheque.ma' },
                            ].map(item => (
                                <div key={item.text} className="d-flex align-items-start gap-2 small" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                    <i className={`bi bi-${item.icon} mt-1 flex-shrink-0`} style={{ color: '#6366f1', fontSize: '0.75rem' }}></i>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 rounded-3 p-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <p className="mb-2 small fw-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                <i className="bi bi-clock me-2" style={{ color: '#6366f1' }}></i>Horaires
                            </p>
                            <div className="d-flex flex-column gap-1">
                                <div className="d-flex justify-content-between small">
                                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Lun – Ven</span>
                                    <span className="text-white fw-semibold">09:00 – 18:00</span>
                                </div>
                                <div className="d-flex justify-content-between small">
                                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Samedi</span>
                                    <span className="text-white fw-semibold">09:00 – 16:00</span>
                                </div>
                                <div className="d-flex justify-content-between small">
                                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Dimanche</span>
                                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Fermé</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '40px 0 24px' }} />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small">
                    <p className="mb-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        © {new Date().getFullYear()} LivreMoi — Gestion d'une bibliothèque. API REST · Spring Boot · React.
                    </p>
                    <p className="mb-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Fait avec <i className="bi bi-heart-fill mx-1" style={{ color: '#6366f1' }}></i> pour les passionnés de lecture.
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .footer-link:hover {
                    color: rgba(255,255,255,0.85) !important;
                    padding-left: 4px;
                }
            `}} />
        </footer>
    );
}
