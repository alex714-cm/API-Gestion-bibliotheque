import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { AuthContext } from "../../context/AuthContext";
import { apiService } from "../../services/apiService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "../../components/Home.css";

export function CategoryPage({ categoryName, categoryDisplayName, categoryIcon, categoryThemeColor }) {
    const { theme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [livres, setLivres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [notification, setNotification] = useState(null);

    const isDark = theme === 'dark';

    const fetchLivres = async () => {
        setLoading(true);
        try {
            const response = await apiService.get(`/api/livres/categorie/${encodeURIComponent(categoryName)}`);
            setLivres(response.data);
        } catch (err) {
            console.error("Erreur chargement des livres:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLivres();
    }, [categoryName]);

    const showNotification = (msg, type = "success") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    const handleEmprunter = async (livre) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (livre.quantite <= 0) return;

        setActionLoading(livre.id);
        try {
            await apiService.post("/api/emprunts", {
                livreId: livre.id,
                userId: user.id
            });
            Swal.fire({
                icon: 'success',
                title: 'Félicitations !',
                html: `Vous avez emprunté <b>"${livre.titre}"</b> avec succès !<br/><br/>Rendez-vous dans <b>Mon Espace</b> pour le consulter.`,
                showCancelButton: true,
                confirmButtonColor: '#6366f1',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Aller à Mon Espace',
                cancelButtonText: 'Continuer d\'explorer',
                background: isDark ? '#1e2533' : '#fff',
                color: isDark ? '#fff' : '#000',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/dashboard');
                }
            });
            fetchLivres();
        } catch (err) {
            const msg = err.response?.data?.message || "Impossible d'emprunter ce livre.";
            showNotification(`❌ ${msg}`, "danger");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className={`home-store-container container-fluid py-0 ${isDark ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{ minHeight: '100vh' }}>

            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
                    maxWidth: '420px', animation: 'slideInRight 0.4s ease'
                }}>
                    <div className={`alert alert-${notification.type} shadow-lg border-0 rounded-4 d-flex align-items-center gap-3 px-4 py-3`}
                        style={{ backdropFilter: 'blur(10px)' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{notification.msg}</span>
                        <button className="btn-close ms-auto" onClick={() => setNotification(null)}></button>
                    </div>
                </div>
            )}

            <div className="container py-0 mt-0">
                {/* Back button and breadcrumb */}
                <div className="mb-4">
                    <button onClick={() => navigate('/home')} className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${isDark ? 'btn-outline-light' : 'btn-outline-secondary'}`}>
                        <i className="bi bi-arrow-left me-2"></i>Retour au catalogue
                    </button>
                </div>

                {/* Hero / Header Section */}
                <div className={`rounded-4 p-5 mb-5 text-white shadow-lg d-flex align-items-center`}
                    style={{
                        background: `linear-gradient(135deg, ${categoryThemeColor[0]} 0%, ${categoryThemeColor[1]} 100%)`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                    <div style={{ position: 'absolute', right: '-30px', bottom: '-40px', opacity: 0.15, fontSize: '12rem' }}>
                        <i className={`bi ${categoryIcon}`}></i>
                    </div>

                    <div className="position-relative" style={{ zIndex: 2 }}>
                        <h1 className="display-4 fw-bold mb-3 d-flex align-items-center gap-3">
                            <i className={`bi ${categoryIcon}`}></i>
                            <span>{categoryDisplayName}</span>
                        </h1>
                        <p className="lead mb-0 opacity-90" style={{ maxWidth: '600px' }}>
                            Découvrez toutes nos sélections de livres consacrées à la thématique <b>{categoryDisplayName}</b>. Empruntez vos préférés en un seul clic !
                        </p>
                    </div>
                </div>

                {/* Stats Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold m-0" style={{ letterSpacing: '-0.3px' }}>
                            Livres disponibles
                        </h3>
                        <div className="bg-primary rounded mt-1" style={{ height: '3px', width: '50px' }}></div>
                    </div>
                    <span className={`badge px-3 py-2 rounded-pill ${isDark ? 'bg-primary bg-opacity-25 text-primary' : 'bg-primary bg-opacity-10 text-primary'}`}
                        style={{ fontWeight: 600 }}>
                        {livres.length} livre{livres.length > 1 ? 's' : ''} trouvé{livres.length > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Books Grid */}
                <div className="row g-4">
                    {loading ? (
                        <div className="col-12 text-center py-5">
                            <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }} role="status"></div>
                            <p className="mt-3 fw-medium" style={{ opacity: 0.6 }}>Chargement de la collection...</p>
                        </div>
                    ) : livres.length > 0 ? (
                        livres.map((livre) => (
                            <div className="col-xl-3 col-lg-4 col-md-6" key={livre.id}>
                                <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden book-card position-relative ${isDark ? 'bg-dark' : 'bg-white'}`}
                                    style={{
                                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} !important`
                                    }}>

                                    {/* Availability badge */}
                                    <span className={`position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-2`}
                                        style={{
                                            zIndex: 2,
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            background: livre.quantite > 0
                                                ? 'linear-gradient(135deg,#10b981,#059669)'
                                                : 'linear-gradient(135deg,#ef4444,#dc2626)',
                                            boxShadow: livre.quantite > 0
                                                ? '0 2px 8px rgba(16,185,129,0.35)'
                                                : '0 2px 8px rgba(239,68,68,0.35)'
                                        }}>
                                        {livre.quantite > 0 ? `Disponible (${livre.quantite})` : 'Indisponible'}
                                    </span>

                                    {/* Book cover */}
                                    <div className="text-center p-4" style={{
                                        background: isDark
                                            ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                                            : 'linear-gradient(180deg, #f8faff 0%, #f0f4ff 100%)',
                                        minHeight: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <img
                                            src={livre.imageUrl || "https://img.icons8.com/color/96/book.png"}
                                            alt={livre.titre}
                                            style={{
                                                height: '180px',
                                                maxWidth: '130px',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                transition: 'transform 0.3s ease'
                                            }}
                                            className="book-cover-img"
                                        />
                                    </div>

                                    <div className="card-body d-flex flex-column p-4 pt-3">
                                        <h6 className="fw-bold mb-1 text-truncate" title={livre.titre}
                                            style={{ fontSize: '1rem', letterSpacing: '-0.2px' }}>
                                            {livre.titre}
                                        </h6>
                                        <p className="small mb-2 d-flex align-items-center gap-1" style={{ color: '#6366f1', fontWeight: 600 }}>
                                            <i className="bi bi-person-fill"></i>
                                            {livre.nomAuteur || "Auteur inconnu"}
                                        </p>

                                        {/* Prix du livre */}
                                        <div className="mb-2">
                                            <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2.5 py-1.5 rounded-3" style={{ fontSize: '0.82rem' }}>
                                                <i className="bi bi-tag-fill me-1"></i>
                                                {livre.prix != null ? `${livre.prix.toFixed(2)} DH` : "Gratuit"}
                                            </span>
                                        </div>

                                        <p className="small mb-0 flex-grow-1" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: '2',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            opacity: 0.65,
                                            lineHeight: 1.6,
                                            fontSize: '0.82rem'
                                        }}>
                                            {livre.description || "Aucune description disponible."}
                                        </p>

                                        {/* Emprunt button */}
                                        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                                            <button
                                                className={`btn w-100 rounded-3 fw-bold py-2 emprunt-btn ${livre.quantite <= 0 ? 'btn-secondary' : ''}`}
                                                disabled={livre.quantite <= 0 || actionLoading === livre.id}
                                                onClick={() => handleEmprunter(livre)}
                                                style={livre.quantite > 0 ? {
                                                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                                    border: 'none',
                                                    color: '#fff',
                                                    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                                                    transition: 'all 0.25s ease'
                                                } : {}}
                                            >
                                                {actionLoading === livre.id ? (
                                                    <><span className="spinner-border spinner-border-sm me-2"></span>En cours...</>
                                                ) : livre.quantite <= 0 ? (
                                                    <><i className="bi bi-x-circle me-2"></i>Indisponible</>
                                                ) : !user ? (
                                                    <><i className="bi bi-box-arrow-in-right me-2"></i>Connectez-vous</>
                                                ) : (
                                                    <><i className="bi bi-book me-2"></i>Emprunter</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className={`rounded-4 p-5 ${isDark ? 'bg-dark' : 'bg-white'}`}
                                style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                                <i className="bi bi-journal-x display-3 text-muted mb-3 d-block" style={{ opacity: 0.3 }}></i>
                                <h5 className="fw-bold mb-2">Aucun livre disponible</h5>
                                <p className="text-muted mb-0">
                                    Il n'y a pas encore de livres enregistrés dans cette catégorie.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(60px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .book-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 48px rgba(0,0,0,0.12) !important;
                }
                .book-card:hover .book-cover-img {
                    transform: scale(1.05);
                }
                .emprunt-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(99,102,241,0.5) !important;
                }
                .emprunt-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
            `}} />
        </div>
    );
}

// Spécificités des pages individuelles pour l'export direct
export function ProgrammationPage() {
    return <CategoryPage categoryName="Programmation" categoryDisplayName="Programmation" categoryIcon="bi-code-slash" categoryThemeColor={["#6366f1", "#4f46e5"]} />;
}

export function LitteraturePage() {
    return <CategoryPage categoryName="Litterature" categoryDisplayName="Littérature" categoryIcon="bi-book" categoryThemeColor={["#10b981", "#059669"]} />;
}

export function SciencePage() {
    return <CategoryPage categoryName="Science" categoryDisplayName="Science" categoryIcon="bi-cpu" categoryThemeColor={["#f59e0b", "#d97706"]} />;
}
