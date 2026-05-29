import { useContext, useEffect, useState, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { AuthContext } from "../context/AuthContext";
import { apiService } from "../services/apiService";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import "../components/Home.css";

export function Home() {
    const { theme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [livres, setLivres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("titre");
    const [actionLoading, setActionLoading] = useState(null);
    const [notification, setNotification] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [mostBorrowed, setMostBorrowed] = useState([]);
    const [recentBooks, setRecentBooks] = useState([]);
    const [randomBooks, setRandomBooks] = useState([]);
    const [selectedLivreDetails, setSelectedLivreDetails] = useState(null);

    const recentScrollRef = useRef(null);

    const scrollRecent = (direction) => {
        if (recentScrollRef.current) {
            const amount = 300;
            recentScrollRef.current.scrollBy({
                left: direction === 'left' ? -amount : amount,
                behavior: 'smooth'
            });
        }
    };

    const isDark = theme === 'dark';

    const fetchLivres = async (query = "", type = "titre", cat = "") => {
        setLoading(true);
        try {
            let endpoint = "/api/livres";
            if (cat) {
                endpoint = `/api/livres/categorie/${encodeURIComponent(cat)}`;
            } else if (query.trim() !== "") {
                endpoint = `/api/livres/search?motcle=${encodeURIComponent(query)}`;
            }
            const response = await apiService.get(endpoint);
            const allLivres = response.data;
            setLivres(allLivres);

            // Compute statistics if fetching the main catalog without search query or category
            if (!cat && query.trim() === "") {
                try {
                    const empruntsRes = await apiService.get("/api/emprunts");
                    const allEmprunts = empruntsRes.data;

                    // Count borrowings per book ID
                    const borrowCounts = {};
                    allEmprunts.forEach(emp => {
                        const lid = emp.livreId;
                        borrowCounts[lid] = (borrowCounts[lid] || 0) + 1;
                    });

                    // Map to book objects and sort
                    const booksWithCounts = allLivres.map(livre => ({
                        ...livre,
                        borrowCount: borrowCounts[livre.id] || 0
                    }));

                    // Sort by borrowCount descending
                    const sortedByBorrow = [...booksWithCounts]
                        .filter(b => b.borrowCount > 0)
                        .sort((a, b) => b.borrowCount - a.borrowCount);

                    // If no books have been borrowed yet, take some books as default
                    const topBorrowed = sortedByBorrow.length > 0 
                        ? sortedByBorrow.slice(0, 4) 
                        : allLivres.slice(0, 4);

                    // Recently added: sort by ID descending
                    const recent = [...allLivres]
                        .sort((a, b) => b.id - a.id)
                        .slice(0, 10);

                    setMostBorrowed(topBorrowed);
                    setRecentBooks(recent);

                    // 10 livres aléatoires
                    const shuffled = [...allLivres].sort(() => Math.random() - 0.5).slice(0, 10);
                    setRandomBooks(shuffled);
                } catch (err) {
                    console.error("Erreur calcul stats emprunts:", err);
                    // Fallback
                    setMostBorrowed(allLivres.slice(0, 4));
                    setRecentBooks([...allLivres].sort((a, b) => b.id - a.id).slice(0, 10));
                    setRandomBooks([...allLivres].sort(() => Math.random() - 0.5).slice(0, 10));
                }
            }
        } catch (err) {
            console.error("Erreur chargement des livres:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const catParam = params.get("categorie");
        const searchParam = params.get("search");
        if (catParam) {
            setSelectedCategory(catParam);
            setSearchQuery("");
            fetchLivres("", "titre", catParam);
        } else if (searchParam) {
            setSelectedCategory("");
            setSearchQuery(searchParam);
            fetchLivres(searchParam, "titre");
        } else {
            setSelectedCategory("");
            setSearchQuery("");
            fetchLivres();
        }
    }, [location.search]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSelectedCategory("");
        fetchLivres(searchQuery, searchType);
    };

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
            fetchLivres(searchQuery, searchType);
        } catch (err) {
            const msg = err.response?.data?.message || "Impossible d'emprunter ce livre.";
            showNotification(`❌ ${msg}`, "danger");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className={`home-store-container container-fluid py-2 ${isDark ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{ minHeight: '100vh' }}>

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

            <div className="container py-2 mt-1">

                {/* Hero Section */}
                <div className="row align-items-center mb-5 pb-4">
                    <div className="col-md-7">
                        <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1px', lineHeight: 1.15 }}>
                            Découvrez & <span className="text-primary">Empruntez</span>
                            <br />vos livres
                        </h1>
                        <p className="lead mb-4" style={{ opacity: 0.7, maxWidth: '480px', lineHeight: 1.7 }}>
                            Accédez à notre collection complète. Recherchez par titre, auteur ou catégorie
                            et empruntez vos œuvres préférées en un clic.
                        </p>
                        {!user && (
                            <button
                                onClick={() => navigate('/login')}
                                className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow"
                                style={{ fontSize: '1rem', letterSpacing: '0.3px' }}
                            >
                                <i className="bi bi-book-half me-2"></i>
                                Commencer à emprunter
                            </button>
                        )}
                    </div>
                    <div className="col-md-5 text-center d-none d-md-block">
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(13,110,253,0.12) 0%, rgba(111,66,193,0.12) 100%)',
                            borderRadius: '32px',
                            padding: '40px',
                            display: 'inline-block'
                        }}>
                            <img
                                src="https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books-illustration_23-2149341898.jpg"
                                alt="Bibliothèque"
                                className="img-fluid rounded-4 shadow-lg"
                                style={{ maxHeight: '280px', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Section 10 Livres Aléatoires ── */}
                <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="fw-bold m-0" style={{ letterSpacing: '-0.5px', fontSize: '1.5rem' }}>
                                <i className="bi bi-shuffle me-2 text-primary" style={{ fontSize: '1.2rem' }}></i>
                                Découverte aléatoire
                            </h2>

                        </div>
                        <button
                            className="btn btn-sm rounded-pill px-4 fw-semibold"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
                            onClick={() => {
                                const shuffled = [...livres].sort(() => Math.random() - 0.5).slice(0, 10);
                                setRandomBooks(shuffled);
                            }}
                        >
                            <i className="bi bi-arrow-repeat me-1"></i> Mélanger
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {randomBooks.map((livre) => (
                                <div key={livre.id} className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-1-5">
                                    <div
                                        className="random-book-card position-relative overflow-hidden rounded-4 shadow-sm"
                                        style={{ cursor: 'pointer', height: '220px' }}
                                        onClick={() => setSelectedLivreDetails(livre)}
                                    >
                                        <img
                                            src={livre.imageUrl || 'https://img.icons8.com/color/96/book.png'}
                                            alt={livre.titre}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                                            className="random-book-img"
                                        />
                                        {/* Gradient overlay always visible at bottom */}
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                                            padding: '40px 10px 10px'
                                        }}>
                                            <p className="text-white fw-bold mb-0 small text-truncate" style={{ fontSize: '0.78rem' }}>{livre.titre}</p>
                                            <p className="text-white-50 mb-0" style={{ fontSize: '0.68rem' }}>{livre.nomAuteur || 'Auteur inconnu'}</p>
                                        </div>
                                        {/* Stock badge */}
                                        <span className="position-absolute top-0 start-0 m-2 badge rounded-pill"
                                            style={{
                                                fontSize: '0.6rem', fontWeight: 700,
                                                background: livre.quantite > 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                                                backdropFilter: 'blur(4px)'
                                            }}>
                                            {livre.quantite > 0 ? `${livre.quantite} dispo.` : 'Indispo.'}
                                        </span>
                                        {/* Hover click icon */}
                                        <div className="random-book-hover-icon position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center rounded-circle"
                                            style={{
                                                width: 44, height: 44,
                                                background: 'rgba(255,255,255,0.2)',
                                                backdropFilter: 'blur(8px)',
                                                opacity: 0, transition: 'opacity 0.3s ease'
                                            }}>
                                            <i className="bi bi-eye-fill text-white fs-5"></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>



                {/* Conditional Catalog Display */}
                {selectedCategory || searchQuery.trim() !== "" ? (
                    <>
                        {/* Stats Header for search/category */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold m-0" style={{ letterSpacing: '-0.3px' }}>
                                    {selectedCategory ? `Catégorie : ${selectedCategory}` : `Résultats pour "${searchQuery}"`}
                                </h3>
                                <div className="bg-primary rounded mt-1" style={{ height: '3px', width: '50px' }}></div>
                            </div>
                            <span className={`badge px-3 py-2 rounded-pill ${isDark ? 'bg-primary bg-opacity-25 text-primary' : 'bg-primary bg-opacity-10 text-primary'}`}
                                style={{ fontWeight: 600 }}>
                                {livres.length} livre{livres.length > 1 ? 's' : ''} trouvé{livres.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Search Results Grid */}
                        <div className="row g-4">
                            {loading ? (
                                <div className="col-12 text-center py-5">
                                    <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }} role="status"></div>
                                    <p className="mt-3 fw-medium" style={{ opacity: 0.6 }}>Recherche en cours...</p>
                                </div>
                            ) : livres.length > 0 ? (
                                livres.map((livre) => (
                                    <div className="col-xl-3 col-lg-4 col-md-6" key={livre.id}>
                                        <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden book-card position-relative ${isDark ? 'bg-dark' : 'bg-white'}`}
                                            style={{
                                                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} !important`
                                            }}>

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

                                            <div className="text-center p-4" style={{
                                                background: isDark
                                                    ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                                                    : 'linear-gradient(180deg, #f8faff 0%, #f0f4ff 100%)',
                                                minHeight: '200px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <img src={livre.imageUrl || "https://img.icons8.com/color/96/book.png"} alt={livre.titre}
                                                    style={{ height: '180px', maxWidth: '130px', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                                                    className="book-cover-img" />
                                            </div>

                                            <div className="card-body d-flex flex-column p-4 pt-3">
                                                {livre.nomCategorie && (
                                                    <span className={`badge rounded-pill px-2 py-1 mb-2 align-self-start ${isDark ? 'bg-primary bg-opacity-25 text-primary' : 'bg-primary bg-opacity-10 text-primary'}`}
                                                        style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                                        {livre.nomCategorie}
                                                    </span>
                                                )}
                                                <h6 className="fw-bold mb-1 text-truncate" title={livre.titre}>{livre.titre}</h6>
                                                <p className="small mb-2 d-flex align-items-center gap-1" style={{ color: '#6366f1', fontWeight: 600 }}>
                                                    <i className="bi bi-person-fill"></i>{livre.nomAuteur || "Auteur inconnu"}
                                                </p>
                                                <div className="mb-2">
                                                    <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2.5 py-1.5 rounded-3" style={{ fontSize: '0.82rem' }}>
                                                        <i className="bi bi-tag-fill me-1"></i>{livre.prix != null ? `${livre.prix.toFixed(2)} DH` : "Gratuit"}
                                                    </span>
                                                </div>
                                                <p className="small mb-0 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: 0.65, fontSize: '0.82rem' }}>
                                                    {livre.description || "Aucune description disponible."}
                                                </p>
                                                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                                                    <button className={`btn w-100 rounded-3 fw-bold py-2 emprunt-btn ${livre.quantite <= 0 ? 'btn-secondary' : ''}`}
                                                        disabled={livre.quantite <= 0 || actionLoading === livre.id}
                                                        onClick={() => handleEmprunter(livre)}
                                                        style={livre.quantite > 0 ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' } : {}}>
                                                        {actionLoading === livre.id ? "En cours..." : livre.quantite <= 0 ? "Indisponible" : !user ? "Connectez-vous" : "Emprunter"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center py-5">
                                    <div className={`rounded-4 p-5 ${isDark ? 'bg-dark' : 'bg-white'}`} style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                                        <i className="bi bi-search display-3 text-muted mb-3 d-block" style={{ opacity: 0.3 }}></i>
                                        <h5 className="fw-bold mb-2">Aucun livre trouvé</h5>
                                        <p className="text-muted mb-0">Aucun résultat pour cette recherche. Essayez d'autres mots-clés.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* 1. Section: Les meilleurs livres empruntés */}
                        <div className="mb-5 pb-3">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2 className="fw-bold m-0" style={{ letterSpacing: '-0.5px' }}>
                                        Les meilleurs livres empruntés
                                    </h2>
                                    <p className="text-muted small mb-0">Les ouvrages les plus demandés et adorés par nos lecteurs.</p>
                                </div>
                            </div>

                            <div className="row g-4">
                                {loading ? (
                                    <div className="col-12 text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                ) : mostBorrowed.length > 0 ? (
                                    mostBorrowed.map((livre, idx) => (
                                        <div className="col-xl-3 col-lg-4 col-md-6" key={livre.id}>
                                            <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden book-card position-relative ${isDark ? 'bg-dark' : 'bg-white'}`}
                                                style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} !important` }}>
                                                
                                                <span className={`position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-2`}
                                                    style={{
                                                        zIndex: 2,
                                                        fontSize: '0.72rem',
                                                        fontWeight: 700,
                                                        background: livre.quantite > 0 ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
                                                        boxShadow: livre.quantite > 0 ? '0 2px 8px rgba(16,185,129,0.35)' : '0 2px 8px rgba(239,68,68,0.35)'
                                                    }}>
                                                    {livre.quantite > 0 ? `Disponible (${livre.quantite})` : 'Indisponible'}
                                                </span>

                                                <div className="text-center p-4" style={{
                                                    background: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' : 'linear-gradient(180deg, #f8faff 0%, #f0f4ff 100%)',
                                                    minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <img src={livre.imageUrl || "https://img.icons8.com/color/96/book.png"} alt={livre.titre}
                                                        style={{ height: '180px', maxWidth: '130px', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                                                        className="book-cover-img" />
                                                </div>

                                                <div className="card-body d-flex flex-column p-4 pt-3">
                                                    {livre.nomCategorie && (
                                                        <span className={`badge rounded-pill px-2 py-1 mb-2 align-self-start ${isDark ? 'bg-primary bg-opacity-25 text-primary' : 'bg-primary bg-opacity-10 text-primary'}`}
                                                            style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                                            {livre.nomCategorie}
                                                        </span>
                                                    )}
                                                    <h6 className="fw-bold mb-1 text-truncate" title={livre.titre}>{livre.titre}</h6>
                                                    <p className="small mb-2 d-flex align-items-center gap-1" style={{ color: '#6366f1', fontWeight: 600 }}>
                                                        <i className="bi bi-person-fill"></i>{livre.nomAuteur || "Auteur inconnu"}
                                                    </p>
                                                    <div className="mb-2 d-flex align-items-center gap-2">
                                                        <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2.5 py-1.5 rounded-3" style={{ fontSize: '0.82rem' }}>
                                                            <i className="bi bi-tag-fill me-1"></i>{livre.prix != null ? `${livre.prix.toFixed(2)} DH` : "Gratuit"}
                                                        </span>
                                                    </div>
                                                    <p className="small mb-0 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: 0.65, fontSize: '0.82rem' }}>
                                                        {livre.description || "Aucune description disponible."}
                                                    </p>
                                                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                                                        <button className={`btn w-100 rounded-3 fw-bold py-2 emprunt-btn ${livre.quantite <= 0 ? 'btn-secondary' : ''}`}
                                                            disabled={livre.quantite <= 0 || actionLoading === livre.id}
                                                            onClick={() => handleEmprunter(livre)}
                                                            style={livre.quantite > 0 ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' } : {}}>
                                                            {actionLoading === livre.id ? "En cours..." : livre.quantite <= 0 ? "Indisponible" : !user ? "Connectez-vous" : "Emprunter"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-4">
                                        <p className="text-muted">Aucun livre emprunté pour le moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Section: Livres ajoutés récemment (Slider moderne) */}
                        <div className="mb-5">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2 className="fw-bold m-0" style={{ letterSpacing: '-0.5px' }}>
                                        Livres ajoutés récemment
                                    </h2>
                                    <p className="text-muted small mb-0">Découvrez nos dernières acquisitions en exclusivité.</p>
                                </div>
                                {/* Navigation buttons for slider */}
                                <div className="d-flex gap-2">
                                    <button onClick={() => scrollRecent('left')} className={`btn rounded-circle p-2 d-flex align-items-center justify-content-center ${isDark ? 'btn-outline-light' : 'btn-outline-dark'}`} style={{ width: '40px', height: '40px' }}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                    <button onClick={() => scrollRecent('right')} className={`btn rounded-circle p-2 d-flex align-items-center justify-content-center ${isDark ? 'btn-outline-light' : 'btn-outline-dark'}`} style={{ width: '40px', height: '40px' }}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>

                            <div ref={recentScrollRef} className="d-flex flex-row overflow-x-auto gap-4 py-3 scrollbar-hidden" style={{ scrollBehavior: 'smooth' }}>
                                {loading ? (
                                    <div className="py-5 w-100 text-center"><div className="spinner-border text-primary"></div></div>
                                ) : recentBooks.length > 0 ? (
                                    recentBooks.map((livre) => (
                                        <div key={livre.id} className="flex-shrink-0 recent-cover-wrapper" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                            onClick={() => setSelectedLivreDetails(livre)}>
                                            <div className="position-relative overflow-hidden rounded-4 shadow-sm" style={{ height: '240px', width: '165px' }}>
                                                <img src={livre.imageUrl || "https://img.icons8.com/color/96/book.png"} alt={livre.titre}
                                                    style={{ height: '100%', width: '100%', objectFit: 'cover', transition: 'all 0.4s ease' }}
                                                    className="recent-cover-img" />
                                                <div className="recent-overlay d-flex flex-column justify-content-end p-2 position-absolute top-0 start-0 w-100 h-100" style={{
                                                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)',
                                                    opacity: 0, transition: 'all 0.3s ease'
                                                }}>
                                                    <span className="text-white fw-bold small text-truncate d-block">{livre.titre}</span>
                                                    <span className="text-white-50 extra-small text-truncate d-block">{livre.nomAuteur}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 w-100 text-center text-muted">Aucune nouveauté à afficher.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Modal Moderne ── */}
            {selectedLivreDetails && (
                <div
                    className="modal-custom-backdrop d-flex align-items-center justify-content-center"
                    onClick={() => setSelectedLivreDetails(null)}
                    style={{ paddingTop: '60px', paddingBottom: '20px' }}
                >
                    <div
                        className={`modal-custom-container rounded-5 overflow-hidden ${isDark ? 'text-white' : 'text-dark'}`}
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: 640, width: '94%',
                            background: isDark ? 'rgba(15,17,26,0.98)' : '#fff',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
                            animation: 'modalSlideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
                            border: isDark ? '1px solid rgba(255,255,255,0.07)' : 'none'
                        }}
                    >
                        {/* Top banner image */}
                        <div className="position-relative" style={{ height: 200, overflow: 'hidden', background: '#0d0d1a' }}>
                            <img
                                src={selectedLivreDetails.imageUrl || 'https://img.icons8.com/color/96/book.png'}
                                alt={selectedLivreDetails.titre}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, filter: 'blur(8px) scale(1.1)', transform: 'scale(1.1)' }}
                            />
                            {/* Book cover centered */}
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                <img
                                    src={selectedLivreDetails.imageUrl || 'https://img.icons8.com/color/96/book.png'}
                                    alt={selectedLivreDetails.titre}
                                    style={{ height: 170, maxWidth: 120, objectFit: 'cover', borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
                                />
                            </div>
                            {/* Close button */}
                            <button
                                className="position-absolute top-0 end-0 m-3 btn rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: 'none', color: '#fff', fontSize: '1.1rem' }}
                                onClick={() => setSelectedLivreDetails(null)}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                            {/* Stock badge */}
                            <span
                                className="position-absolute top-0 start-0 m-3 badge rounded-pill px-3 py-2"
                                style={{
                                    fontWeight: 700, fontSize: '0.72rem',
                                    background: selectedLivreDetails.quantite > 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                                    backdropFilter: 'blur(4px)'
                                }}
                            >
                                {selectedLivreDetails.quantite > 0 ? `✓ Disponible — ${selectedLivreDetails.quantite} ex.` : '✗ Indisponible'}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 pt-3">
                            <h4 className="fw-bold mb-1" style={{ letterSpacing: '-0.3px' }}>{selectedLivreDetails.titre}</h4>
                            <p className="mb-3 d-flex align-items-center gap-2" style={{ color: '#6366f1', fontWeight: 600 }}>
                                <i className="bi bi-person-fill"></i>
                                {selectedLivreDetails.nomAuteur || 'Auteur inconnu'}
                            </p>

                            {/* Category badges */}
                            {selectedLivreDetails.categories && selectedLivreDetails.categories.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {selectedLivreDetails.categories.map((cat, i) => (
                                        <span key={i} className="badge rounded-pill px-3 py-1"
                                            style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', fontWeight: 600, fontSize: '0.78rem' }}>
                                            <i className="bi bi-tag-fill me-1"></i>{cat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Description */}
                            <p className="small mb-4"
                                style={{
                                    opacity: 0.75, lineHeight: 1.7,
                                    maxHeight: 90, overflowY: 'auto',
                                    borderLeft: '3px solid rgba(99,102,241,0.4)',
                                    paddingLeft: 12
                                }}>
                                {selectedLivreDetails.description || 'Aucune description disponible.'}
                            </p>

                            {/* Price + action */}
                            <div className="d-flex align-items-center gap-3">
                                <div className="flex-grow-1">
                                    <span className="fw-bold" style={{ color: '#10b981', fontSize: '1.25rem' }}>
                                        {selectedLivreDetails.prix != null ? `${selectedLivreDetails.prix.toFixed(2)} DH` : 'Gratuit'}
                                    </span>
                                </div>
                                <button
                                    className={`btn rounded-3 fw-bold px-4 py-2 flex-shrink-0 emprunt-btn ${selectedLivreDetails.quantite <= 0 ? 'btn-secondary' : ''}`}
                                    disabled={selectedLivreDetails.quantite <= 0 || actionLoading === selectedLivreDetails.id}
                                    onClick={() => { handleEmprunter(selectedLivreDetails); setSelectedLivreDetails(null); }}
                                    style={selectedLivreDetails.quantite > 0 ? {
                                        background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                        border: 'none', color: '#fff',
                                        boxShadow: '0 4px 16px rgba(99,102,241,0.45)'
                                    } : {}}
                                >
                                    <i className="bi bi-book me-2"></i>
                                    {actionLoading === selectedLivreDetails.id
                                        ? 'En cours...'
                                        : selectedLivreDetails.quantite <= 0
                                            ? 'Indisponible'
                                            : !user ? 'Se connecter' : 'Emprunter'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

                /* Scrollbar-hidden helper class */
                .scrollbar-hidden {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                .scrollbar-hidden::-webkit-scrollbar {
                    display: none;  /* Chrome, Safari and Opera */
                }

                /* Recent slider hover styles */
                .recent-cover-wrapper:hover {
                    transform: scale(1.08) translateY(-4px);
                }
                .recent-cover-wrapper:hover .recent-cover-img {
                    transform: scale(1.08);
                }
                .recent-cover-wrapper:hover .recent-overlay {
                    opacity: 1 !important;
                }

                /* Random books grid */
                .random-book-card {
                    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease;
                }
                .random-book-card:hover {
                    transform: scale(1.06) translateY(-6px);
                    box-shadow: 0 20px 48px rgba(0,0,0,0.22) !important;
                }
                .random-book-card:hover .random-book-img {
                    transform: scale(1.08);
                }
                .random-book-card:hover .random-book-hover-icon {
                    opacity: 1 !important;
                }
                @media (min-width: 1200px) {
                    .col-xl-1-5 { flex: 0 0 auto; width: 20%; }
                }

                /* Custom popup modal styles */
                .modal-custom-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 1050;
                    animation: fadeIn 0.25s ease;
                }
                .modal-custom-container {
                    z-index: 1060;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.3);
                }
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}} />
        </div>
    );
}