import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { apiService } from "../../services/apiService";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Swal from 'sweetalert2';

export function UserDashboard() {
    const { user, login, logout } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, profile, loans

    // Données de l'API
    const [livres, setLivres] = useState([]);
    const [emprunts, setEmprunts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingEmprunts, setLoadingEmprunts] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [notification, setNotification] = useState(null);

    const [dashPage, setDashPage] = useState(1);
    const [loansActivePage, setLoansActivePage] = useState(1);
    const [loansHistoryPage, setLoansHistoryPage] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    // Formulaire de profil
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        password: "",
        adresse: user?.adresse || "",
        telephone: user?.telephone || ""
    });

    const showNotification = (msg, type = "success") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    const fetchEmprunts = async () => {
        if (!user) return;
        setLoadingEmprunts(true);
        try {
            const res = await apiService.get(`/api/emprunts/user/${user.id}`);
            setEmprunts(res.data);
        } catch (err) {
            console.error("Erreur chargement emprunts:", err);
        } finally {
            setLoadingEmprunts(false);
        }
    };

    useEffect(() => {
        fetchEmprunts();
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await apiService.put(`/api/auth/update-profile/${user.id}`, profileForm);
            login(res.data); // Mettre à jour le contexte utilisateur
            showNotification("✅ Profil mis à jour avec succès !", "success");
            setActiveTab("dashboard");
        } catch (err) {
            showNotification("❌ Erreur lors de la mise à jour du profil.", "danger");
        }
    };

    const handleRetourner = async (empruntId) => {
        setActionLoading(empruntId);
        try {
            await apiService.put(`/api/emprunts/${empruntId}/retour`);
            showNotification("✅ Livre rendu avec succès !", "success");
            fetchEmprunts();
        } catch (err) {
            showNotification(`❌ ${err.response?.data?.message || "Impossible de rendre le livre."}`, "danger");
        } finally {
            setActionLoading(null);
        }
    };

    const handleAnnuler = async (empruntId) => {
        Swal.fire({
            title: 'Annuler l\'emprunt',
            text: "Êtes-vous sûr de vouloir annuler cet emprunt ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Oui, annuler',
            cancelButtonText: 'Fermer',
            background: isDark ? '#1e2533' : '#fff',
            color: isDark ? '#fff' : '#000',
        }).then(async (result) => {
            if (result.isConfirmed) {
                setActionLoading(empruntId);
                try {
                    await apiService.put(`/api/emprunts/${empruntId}/annuler`);
                    Swal.fire({
                        icon: 'success',
                        title: 'Annulé !',
                        text: 'L\'emprunt a été annulé avec succès.',
                        background: isDark ? '#1e2533' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        confirmButtonColor: '#10b981'
                    });
                    fetchEmprunts();
                } catch (err) {
                    showNotification(`❌ ${err.response?.data?.message || "Impossible d'annuler cet emprunt."}`, "danger");
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const empruntsEnCours = emprunts.filter(e => e.statut === "EN_COURS" || e.statut === "RETARD");
    const historiqueEmprunts = emprunts.filter(e => e.statut === "RENDU" || e.statut === "ANNULE");

    const getStatutBadge = (statut) => {
        switch (statut) {
            case "EN_COURS": return <span className="badge rounded-pill px-3 py-2" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', fontSize: '0.72rem' }}>En cours</span>;
            case "RETARD": return <span className="badge rounded-pill px-3 py-2" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', fontSize: '0.72rem' }}>En retard</span>;
            case "RENDU": return <span className="badge rounded-pill px-3 py-2" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontSize: '0.72rem' }}>Rendu</span>;
            case "ANNULE": return <span className="badge rounded-pill px-3 py-2 bg-secondary" style={{ fontSize: '0.72rem' }}>Annulé</span>;
            default: return <span className="badge bg-secondary">{statut}</span>;
        }
    };

    const renderPagination = (currentPage, totalPages, onPageChange) => {
        if (totalPages <= 1) return null;
        return (
            <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination pagination-sm mb-0 gap-1">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button type="button" className="page-link rounded-3 border-0" 
                                style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#333' }}
                                onClick={() => onPageChange(currentPage - 1)}>
                            <i className="bi bi-chevron-left"></i>
                        </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                            <button type="button" className="page-link rounded-3 border-0 fw-semibold"
                                    style={page === currentPage
                                        ? { background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', minWidth: 32 }
                                        : { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#ccc' : '#555', minWidth: 32 }
                                    }
                                    onClick={() => onPageChange(page)}>
                                {page}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button type="button" className="page-link rounded-3 border-0"
                                style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#333' }}
                                onClick={() => onPageChange(currentPage + 1)}>
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="animate-fade-in">
                        <h2 className="fw-bold mb-4" style={{ letterSpacing: '-0.5px' }}>Vue d'ensemble</h2>

                        {/* Stats Cards */}
                        <div className="row g-4 mb-5">
                            <div className="col-md-4">
                                <div className={`rounded-4 p-4 h-100 ${isDark ? 'bg-dark' : 'bg-white'}`}
                                    style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                                            <i className="bi bi-book-half text-white fs-5"></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 small fw-semibold" style={{ opacity: 0.6 }}>Emprunts actifs</p>
                                            <h3 className="fw-bold mb-0" style={{ color: '#6366f1' }}>{empruntsEnCours.length}</h3>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab("loans")} className="btn btn-sm w-100 rounded-3 fw-semibold"
                                        style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'none' }}>
                                        Voir mes emprunts <i className="bi bi-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className={`rounded-4 p-4 h-100 ${isDark ? 'bg-dark' : 'bg-white'}`}
                                    style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                                            <i className="bi bi-exclamation-triangle text-white fs-5"></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 small fw-semibold" style={{ opacity: 0.6 }}>En retard</p>
                                            <h3 className="fw-bold mb-0" style={{ color: '#ef4444' }}>
                                                {emprunts.filter(e => e.statut === "RETARD").length}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="mb-0 small" style={{ opacity: 0.6 }}>Veuillez retourner les livres en retard</p>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className={`rounded-4 p-4 h-100 ${isDark ? 'bg-dark' : 'bg-white'}`}
                                    style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                                            <i className="bi bi-journal-check text-white fs-5"></i>
                                        </div>
                                        <div>
                                            <p className="mb-0 small fw-semibold" style={{ opacity: 0.6 }}>Livres rendus</p>
                                            <h3 className="fw-bold mb-0" style={{ color: '#10b981' }}>{historiqueEmprunts.length}</h3>
                                        </div>
                                    </div>
                                    <p className="mb-0 small" style={{ opacity: 0.6 }}>Total de votre historique</p>
                                </div>
                            </div>
                        </div>

                        {/* Infos du compte */}
                        <div className={`rounded-4 p-4 ${isDark ? 'bg-dark' : 'bg-white'}`}
                            style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div className="d-flex align-items-center gap-4">
                                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: 72, height: 72,
                                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                        fontSize: '1.8rem', color: '#fff', fontWeight: 700
                                    }}>
                                    {user?.firstName?.charAt(0)?.toUpperCase() || 'L'}
                                </div>
                                <div className="flex-grow-1">
                                    <h5 className="fw-bold mb-1 text-capitalize">{user?.firstName} {user?.lastName}</h5>
                                    <p className="mb-2 small" style={{ opacity: 0.6 }}>{user?.email}</p>
                                    <span className="badge rounded-pill px-3 py-2"
                                        style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <i className="bi bi-journal-bookmark me-1"></i>Lecteur
                                    </span>
                                </div>
                                <button onClick={() => setActiveTab("profile")}
                                    className="btn btn-sm rounded-3 px-4 fw-semibold d-none d-md-block"
                                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: 'none', color: isDark ? '#fff' : '#1a202c' }}>
                                    <i className="bi bi-pencil me-2"></i>Modifier
                                </button>
                            </div>
                        </div>

                        {/* Emprunts récents */}
                        {empruntsEnCours.length > 0 && (() => {
                            const DASH_PAGE_SIZE = 3;
                            const totalDashPages = Math.ceil(empruntsEnCours.length / DASH_PAGE_SIZE);
                            const paginatedDash = empruntsEnCours.slice((dashPage - 1) * DASH_PAGE_SIZE, dashPage * DASH_PAGE_SIZE);
                            return (
                                <div className="mt-4">
                                    <h5 className="fw-bold mb-3">Emprunts en cours</h5>
                                    <div className="d-flex flex-column gap-3">
                                        {paginatedDash.map(emp => (
                                            <div key={emp.id} className={`rounded-4 p-3 d-flex align-items-center gap-3 ${isDark ? 'bg-dark' : 'bg-white'}`}
                                                style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                                                <img src={emp.livreImageUrl || "https://img.icons8.com/color/48/book.png"}
                                                    style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 6 }} alt="" />
                                                <div className="flex-grow-1 min-width-0">
                                                    <p className="fw-bold mb-0 text-truncate">{emp.livreTitre}</p>
                                                    <div className="d-flex align-items-center gap-2 my-0.5">
                                                        <span className="badge bg-success bg-opacity-10 text-success fw-semibold px-2 py-0.5 rounded" style={{ fontSize: '0.72rem' }}>
                                                            {emp.livrePrix != null ? `${emp.livrePrix.toFixed(2)} DH` : "Gratuit"}
                                                        </span>
                                                    </div>
                                                    <small style={{ opacity: 0.55 }}>Emprunté le {emp.dateEmprunt} · Retour prévu {emp.dateRetourPrevue}</small>
                                                </div>
                                                {getStatutBadge(emp.statut)}
                                            </div>
                                        ))}
                                        {renderPagination(dashPage, totalDashPages, setDashPage)}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                );

            case "profile":
                return (
                    <div className="animate-fade-in">
                        <h2 className="fw-bold mb-4" style={{ letterSpacing: '-0.5px' }}>Modifier mon profil</h2>
                        <div className={`rounded-4 p-4 ${isDark ? 'bg-dark' : 'bg-white'}`}
                            style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <form onSubmit={handleUpdateProfile}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Prénom</label>
                                        <input
                                            type="text"
                                            className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`}
                                            value={profileForm.firstName}
                                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Nom</label>
                                        <input
                                            type="text"
                                            className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`}
                                            value={profileForm.lastName}
                                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Adresse e-mail</label>
                                    <input
                                        type="email"
                                        className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`}
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Numéro de téléphone</label>
                                    <input
                                        type="text"
                                        className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`}
                                        value={profileForm.telephone}
                                        onChange={(e) => setProfileForm({ ...profileForm, telephone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Adresse complète</label>
                                    <textarea
                                        className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`}
                                        rows="2"
                                        value={profileForm.adresse}
                                        onChange={(e) => setProfileForm({ ...profileForm, adresse: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Nouveau mot de passe <span className="fw-normal" style={{ opacity: 0.5 }}>(laisser vide pour ne pas modifier)</span></label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`}
                                            placeholder="••••••••"
                                            value={profileForm.password}
                                            onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                                            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                                        />
                                        <button
                                            type="button"
                                            className={`btn border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`}
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, zIndex: 5 }}
                                        >
                                            <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn px-5 py-2 rounded-3 fw-bold"
                                        style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none' }}>
                                        Enregistrer
                                    </button>
                                    <button type="button" onClick={() => setActiveTab("dashboard")}
                                        className={`btn px-4 py-2 rounded-3 fw-semibold ${isDark ? 'btn-outline-light' : 'btn-outline-secondary'}`}>
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );

            case "loans":
                return (
                    <div className="animate-fade-in">
                        <h2 className="fw-bold mb-4" style={{ letterSpacing: '-0.5px' }}>Mes emprunts</h2>

                        {/* Emprunts en cours */}
                        <div className={`rounded-4 p-4 mb-4 ${isDark ? 'bg-dark' : 'bg-white'}`}
                            style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <span className="rounded-3 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: 32, height: 32, background: 'rgba(245,158,11,0.15)' }}>
                                    <i className="bi bi-clock-history" style={{ color: '#f59e0b' }}></i>
                                </span>
                                Emprunts en cours
                                {empruntsEnCours.length > 0 && (
                                    <span className="badge rounded-pill ms-2" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 600 }}>
                                        {empruntsEnCours.length}
                                    </span>
                                )}
                            </h5>

                            {loadingEmprunts ? (
                                <div className="text-center py-4"><Loader /></div>
                            ) : empruntsEnCours.length > 0 ? (
                                <div className="table-responsive">
                                    <table className={`table align-middle ${isDark ? 'table-dark' : ''}`} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                        <thead>
                                            <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                                                <th className="border-0 py-3 fw-semibold" style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Livre</th>
                                                <th className="border-0 py-3 fw-semibold" style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date d'emprunt</th>
                                                <th className="border-0 py-3 fw-semibold" style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date limite</th>
                                                <th className="border-0 py-3 fw-semibold" style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut</th>
                                                <th className="border-0 py-3 fw-semibold" style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const ACTIVE_PAGE_SIZE = 5;
                                                const totalActivePages = Math.ceil(empruntsEnCours.length / ACTIVE_PAGE_SIZE);
                                                const paginatedActive = empruntsEnCours.slice((loansActivePage - 1) * ACTIVE_PAGE_SIZE, loansActivePage * ACTIVE_PAGE_SIZE);
                                                return paginatedActive.map(emp => (
                                                    <tr key={emp.id} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                                                        <td className="border-0 py-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <img src={emp.livreImageUrl || "https://img.icons8.com/color/48/book.png"}
                                                                    style={{ width: 32, height: 46, objectFit: 'cover', borderRadius: 4 }} alt="" />
                                                                <div className="d-flex flex-column">
                                                                    <span className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>{emp.livreTitre}</span>
                                                                    <span className="text-success small fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                                        {emp.livrePrix != null ? `${emp.livrePrix.toFixed(2)} DH` : "Gratuit"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="border-0 py-3 small">{emp.dateEmprunt}</td>
                                                        <td className="border-0 py-3 small">
                                                            <span className={emp.statut === "RETARD" ? "fw-bold" : ""} style={{ color: emp.statut === "RETARD" ? '#ef4444' : '#f59e0b' }}>
                                                                {emp.dateRetourPrevue}
                                                            </span>
                                                        </td>
                                                        <td className="border-0 py-3">{getStatutBadge(emp.statut)}</td>
                                                        <td className="border-0 py-3 d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm rounded-3 px-3 fw-semibold"
                                                                style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', fontSize: '0.8rem' }}
                                                                disabled={actionLoading === emp.id}
                                                                onClick={() => handleRetourner(emp.id)}
                                                            >
                                                                {actionLoading === emp.id ? (
                                                                    <><span className="spinner-border spinner-border-sm me-1"></span>...</>
                                                                ) : (
                                                                    <><i className="bi bi-arrow-return-left me-1"></i>Rendre</>
                                                                )}
                                                            </button>
                                                            <button
                                                                className="btn btn-sm rounded-3 px-2 d-flex align-items-center justify-content-center"
                                                                style={{ background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', fontSize: '0.9rem', width: '32px' }}
                                                                disabled={actionLoading === emp.id}
                                                                onClick={() => handleAnnuler(emp.id)}
                                                                title="Annuler l'emprunt"
                                                            >
                                                                {actionLoading === emp.id ? (
                                                                    <span className="spinner-border spinner-border-sm"></span>
                                                                ) : (
                                                                    <i className="bi bi-trash"></i>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                    {renderPagination(loansActivePage, Math.ceil(empruntsEnCours.length / 5), setLoansActivePage)}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-book display-4 d-block mb-3" style={{ opacity: 0.15 }}></i>
                                    <p className="fw-semibold mb-1" style={{ opacity: 0.5 }}>Aucun emprunt en cours</p>
                                    <button onClick={() => navigate('/home')} className="btn btn-sm mt-2 rounded-3 px-4 fw-semibold"
                                        style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none' }}>
                                        Parcourir le catalogue
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Historique des emprunts */}
                        <div className={`rounded-4 p-4 ${isDark ? 'bg-dark' : 'bg-white'}`}
                            style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <span className="rounded-3 d-inline-flex align-items-center justify-content-center"
                                    style={{ width: 32, height: 32, background: 'rgba(16,185,129,0.15)' }}>
                                    <i className="bi bi-journal-check" style={{ color: '#10b981' }}></i>
                                </span>
                                Historique des emprunts
                                {historiqueEmprunts.length > 0 && (
                                    <span className="badge rounded-pill ms-2" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600 }}>
                                        {historiqueEmprunts.length}
                                    </span>
                                )}
                            </h5>

                            {loadingEmprunts ? (
                                <div className="text-center py-4"><Loader /></div>
                            ) : historiqueEmprunts.length > 0 ? (
                                <div className="table-responsive">
                                    <table className={`table align-middle ${isDark ? 'table-dark' : ''}`}>
                                        <thead>
                                            <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                                                <th className="border-0 py-3 fw-semibold" style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Livre</th>
                                                <th className="border-0 py-3 fw-semibold" style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date d'emprunt</th>
                                                <th className="border-0 py-3 fw-semibold" style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date de retour</th>
                                                <th className="border-0 py-3 fw-semibold" style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const HISTORY_PAGE_SIZE = 5;
                                                const totalHistoryPages = Math.ceil(historiqueEmprunts.length / HISTORY_PAGE_SIZE);
                                                const paginatedHistory = historiqueEmprunts.slice((loansHistoryPage - 1) * HISTORY_PAGE_SIZE, loansHistoryPage * HISTORY_PAGE_SIZE);
                                                return paginatedHistory.map(emp => (
                                                    <tr key={emp.id} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                                                        <td className="border-0 py-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <img src={emp.livreImageUrl || "https://img.icons8.com/color/48/book.png"}
                                                                    style={{ width: 32, height: 46, objectFit: 'cover', borderRadius: 4 }} alt="" />
                                                                <div className="d-flex flex-column">
                                                                    <span className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>{emp.livreTitre}</span>
                                                                    <span className="text-success small fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                                        {emp.livrePrix != null ? `${emp.livrePrix.toFixed(2)} DH` : "Gratuit"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="border-0 py-3 small">{emp.dateEmprunt}</td>
                                                        <td className="border-0 py-3 small">{emp.dateRetourEffective}</td>
                                                        <td className="border-0 py-3">{getStatutBadge(emp.statut)}</td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                    {renderPagination(loansHistoryPage, Math.ceil(historiqueEmprunts.length / 5), setLoansHistoryPage)}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-clock-history display-4 d-block mb-3" style={{ opacity: 0.15 }}></i>
                                    <p className="fw-semibold mb-0" style={{ opacity: 0.5 }}>Aucun historique d'emprunt</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container py-5 mb-5">

            {/* Notification toast */}
            {notification && (
                <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999, maxWidth: '400px', animation: 'slideInRight 0.4s ease' }}>
                    <div className={`alert alert-${notification.type} border-0 shadow-lg rounded-4 d-flex align-items-center gap-3 px-4 py-3`}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{notification.msg}</span>
                        <button className="btn-close ms-auto" onClick={() => setNotification(null)}></button>
                    </div>
                </div>
            )}

            <h1 className="fw-bold mb-5" style={{ letterSpacing: '-0.5px', fontSize: '2rem' }}>
                <i className="bi bi-person-badge me-2" style={{ color: '#6366f1' }}></i>
                Mon Espace
            </h1>

            <div className="row g-4">
                {/* SIDEBAR */}
                <div className="col-lg-3 col-md-4">
                    <div className={`rounded-4 overflow-hidden ${isDark ? 'bg-dark' : 'bg-white'}`}
                        style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', position: 'sticky', top: '80px' }}>

                        {/* Avatar */}
                        <div className="p-4 text-center" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(79,70,229,0.05))' }}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>
                                {user?.firstName?.charAt(0)?.toUpperCase() || 'L'}
                            </div>
                            <p className="fw-bold mb-0 text-capitalize">{user?.firstName} {user?.lastName}</p>
                            <small style={{ opacity: 0.55 }}>{user?.email}</small>
                        </div>

                        {/* Nav items */}
                        <div className="py-2">
                            {[
                                { key: 'dashboard', icon: 'bi-speedometer2', label: 'Tableau de bord' },
                                { key: 'loans', icon: 'bi-book-half', label: 'Mes emprunts', badge: empruntsEnCours.length || null },
                                { key: 'profile', icon: 'bi-person-gear', label: 'Mon profil' },
                            ].map(item => (
                                <button key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`w-100 text-start px-4 py-3 border-0 fw-medium d-flex align-items-center gap-3 ${activeTab === item.key ? 'sidebar-active' : 'sidebar-inactive'}`}
                                    style={{
                                        background: activeTab === item.key
                                            ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)')
                                            : 'transparent',
                                        color: activeTab === item.key ? '#6366f1' : (isDark ? '#a0aec0' : '#5a6a85'),
                                        borderLeft: `3px solid ${activeTab === item.key ? '#6366f1' : 'transparent'}`,
                                        transition: 'all 0.2s ease',
                                        fontSize: '0.9rem'
                                    }}>
                                    <i className={`bi ${item.icon}`}></i>
                                    <span className="flex-grow-1">{item.label}</span>
                                    {item.badge > 0 && (
                                        <span className="badge rounded-pill" style={{ background: '#6366f1', fontSize: '0.7rem' }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}

                            <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', margin: '8px 16px' }}></div>

                            <button
                                onClick={() => { 
                                    Swal.fire({
                                        title: 'Déconnexion',
                                        text: "Voulez-vous vraiment vous déconnecter ?",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#ef4444',
                                        cancelButtonColor: '#6c757d',
                                        confirmButtonText: 'Oui, me déconnecter',
                                        cancelButtonText: 'Annuler'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            logout();
                                        }
                                    });
                                }}
                                className="w-100 text-start px-4 py-3 border-0 fw-medium d-flex align-items-center gap-3"
                                style={{ background: 'transparent', color: '#ef4444', fontSize: '0.9rem', transition: 'all 0.2s ease' }}>
                                <i className="bi bi-box-arrow-right"></i>
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>

                {/* CONTENU PRINCIPAL */}
                <div className="col-lg-9 col-md-8">
                    {renderTabContent()}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(60px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .sidebar-inactive:hover {
                    background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} !important;
                    color: ${isDark ? '#e2e8f0' : '#1a202c'} !important;
                }
            `}} />
        </div>
    );
}
