import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { apiService } from "../../services/apiService";
import Swal from 'sweetalert2';

export function AdminEmpruntIndex() {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const [emprunts, setEmprunts] = useState([]);
    const [stats, setStats] = useState({
        totalLivres: 0,
        totalUsers: 0,
        totalEmprunts: 0,
        empruntsEnCours: 0,
        empruntsRendus: 0,
        empruntsRetards: 0
    });
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [notification, setNotification] = useState(null);

    const showNotification = (msg, type = "success") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await apiService.get("/api/emprunts/stats");
            setStats(res.data);
        } catch (err) {
            console.error("Erreur chargement statistiques:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchEmprunts = async () => {
        setLoading(true);
        try {
            const res = await apiService.get("/api/emprunts");
            setEmprunts(res.data);
        } catch (err) {
            console.error("Erreur chargement emprunts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmprunts();
        fetchStats();
    }, []);

    const handleValiderRetour = async (empruntId) => {
        Swal.fire({
            title: 'Confirmation',
            text: "Confirmer le retour de ce livre ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Oui, confirmer',
            cancelButtonText: 'Annuler'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setActionLoadingId(empruntId);
                try {
                    await apiService.put(`/api/emprunts/${empruntId}/retour`);
                    showNotification("✅ Retour enregistré ! Le stock du livre a été mis à jour.", "success");
                    fetchEmprunts();
                    fetchStats();
                } catch (err) {
                    showNotification("❌ Erreur lors de l'enregistrement du retour.", "danger");
                } finally {
                    setActionLoadingId(null);
                }
            }
        });
    };

    const handleModifierDate = async (empruntId, currentDate) => {
        const { value: date } = await Swal.fire({
            title: 'Modifier la date',
            text: 'Choisissez la nouvelle date de retour prévue',
            input: 'date',
            inputValue: currentDate,
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Mettre à jour',
            cancelButtonText: 'Annuler',
            inputValidator: (value) => {
                if (!value) {
                    return 'Vous devez choisir une date !';
                }
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0,0,0,0);
                if (selectedDate <= today) {
                    return 'La nouvelle date doit être obligatoirement dans le futur.';
                }
            }
        });

        if (date) {
            setActionLoadingId(empruntId);
            try {
                await apiService.put(`/api/emprunts/${empruntId}/date-retour`, { dateRetourPrevue: date });
                Swal.fire({
                    icon: 'success',
                    title: 'Mise à jour réussie',
                    text: 'Date de retour mise à jour avec succès !',
                    confirmButtonColor: '#10b981',
                    background: isDark ? '#1e2533' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    confirmButtonText: 'Fermer'
                });
                fetchEmprunts();
                fetchStats();
            } catch (err) {
                showNotification("❌ Erreur lors de la mise à jour de la date.", "danger");
            } finally {
                setActionLoadingId(null);
            }
        }
    };

    const filteredEmprunts = emprunts.filter(emp => {
        if (statusFilter === "ALL") return true;
        if (statusFilter === "EN_COURS") return emp.statut === "EN_COURS" || emp.statut === "RETARD";
        return emp.statut === statusFilter;
    });

    const statCards = [
        { label: "Total Livres",     value: stats.totalLivres,     icon: "book-half",            color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
        { label: "Lecteurs",         value: stats.totalUsers,      icon: "people-fill",          color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)'  },
        { label: "Transactions",     value: stats.totalEmprunts,   icon: "arrow-left-right",     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
        { label: "En cours",         value: stats.empruntsEnCours, icon: "clock-history",        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
        { label: "Rendus",           value: stats.empruntsRendus,  icon: "check-circle-fill",    color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
        { label: "Retards",          value: stats.empruntsRetards, icon: "exclamation-triangle-fill", color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    ];

    const getStatutConfig = (statut) => {
        switch (statut) {
            case "EN_COURS": return { label: "En cours",  bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' };
            case "RETARD":   return { label: "En retard", bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' };
            case "RENDU":    return { label: "Rendu",      bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
            case "ANNULE":   return { label: "Annulé par l'utilisateur", bg: 'rgba(108,117,125,0.15)', color: '#6c757d' };
            default:         return { label: statut,       bg: 'rgba(128,128,128,0.15)', color: '#888' };
        }
    };

    const filters = [
        { key: "ALL",      label: "Tous",     count: emprunts.length },
        { key: "EN_COURS", label: "En cours", count: emprunts.filter(e => e.statut === "EN_COURS" || e.statut === "RETARD").length },
        { key: "RENDU",    label: "Rendus",   count: emprunts.filter(e => e.statut === "RENDU").length },
        { key: "RETARD",   label: "Retards",  count: emprunts.filter(e => e.statut === "RETARD").length },
        { key: "ANNULE",   label: "Annulés",  count: emprunts.filter(e => e.statut === "ANNULE").length },
    ];

    return (
        <div className="container-fluid py-4 px-4 px-lg-5 mb-5">

            {/* Toast Notification */}
            {notification && (
                <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999, maxWidth: '420px', animation: 'slideInRight 0.4s ease' }}>
                    <div className={`alert alert-${notification.type} border-0 shadow-lg rounded-4 d-flex align-items-center gap-3 px-4 py-3`}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{notification.msg}</span>
                        <button className="btn-close ms-auto" onClick={() => setNotification(null)}></button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-5 flex-wrap gap-3">
                <div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="rounded-3 d-flex align-items-center justify-content-center"
                            style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                            <i className="bi bi-arrow-left-right text-white fs-5"></i>
                        </div>
                        <div>
                            <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>Gestion des Emprunts</h2>
                            <p className="mb-0 small" style={{ opacity: 0.55 }}>Emprunts, retours & historique des transactions</p>
                        </div>
                    </div>
                </div>
                <button
                    className="btn rounded-3 px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                    style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        color: isDark ? '#e2e8f0' : '#374151',
                        fontSize: '0.875rem'
                    }}
                    onClick={() => { fetchEmprunts(); fetchStats(); }}
                    disabled={loading || statsLoading}
                >
                    <i className={`bi bi-arrow-clockwise ${(loading || statsLoading) ? 'spin' : ''}`}></i>
                    Actualiser
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-5">
                {statCards.map((card) => (
                    <div className="col-xl-2 col-lg-4 col-md-4 col-6" key={card.label}>
                        <div className={`rounded-4 p-4 h-100 ${isDark ? 'bg-dark' : 'bg-white'}`}
                            style={{
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{ width: 38, height: 38, background: card.bg }}>
                                    <i className={`bi bi-${card.icon}`} style={{ color: card.color, fontSize: '1rem' }}></i>
                                </div>
                            </div>
                            <h3 className="fw-bold mb-1" style={{ color: card.color, fontSize: '1.8rem' }}>
                                {statsLoading ? <span className="placeholder col-4"></span> : card.value}
                            </h3>
                            <p className="mb-0 small fw-semibold" style={{ opacity: 0.55 }}>{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tableau */}
            <div className={`rounded-4 overflow-hidden ${isDark ? 'bg-dark' : 'bg-white'}`}
                style={{
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                }}>

                {/* Table Header with filters */}
                <div className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-3"
                    style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <div>
                        <h5 className="fw-bold mb-0">Historique des transactions</h5>
                        <p className="mb-0 small" style={{ opacity: 0.5 }}>{filteredEmprunts.length} enregistrement(s)</p>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        {filters.map(f => (
                            <button key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className="btn btn-sm rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                                style={{
                                    background: statusFilter === f.key
                                        ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
                                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                                    border: `1px solid ${statusFilter === f.key ? 'transparent' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                                    color: statusFilter === f.key ? '#fff' : (isDark ? '#a0aec0' : '#5a6a85'),
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s ease'
                                }}>
                                {f.label}
                                {f.count > 0 && (
                                    <span className="badge rounded-pill" style={{
                                        background: statusFilter === f.key ? 'rgba(255,255,255,0.25)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                                        color: statusFilter === f.key ? '#fff' : 'inherit',
                                        fontSize: '0.65rem',
                                        padding: '2px 7px'
                                    }}>
                                        {f.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table content */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" style={{ color: '#6366f1', width: '2.5rem', height: '2.5rem' }} role="status"></div>
                        <p className="mt-3 fw-semibold" style={{ opacity: 0.5 }}>Chargement des transactions...</p>
                    </div>
                ) : filteredEmprunts.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table mb-0 align-middle" style={{ fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                    {['Livre', 'Lecteur', "Date d'emprunt", 'Retour prévu', 'Date de retour', 'Statut', 'Action'].map(h => (
                                        <th key={h} className="border-0 py-3 px-4 fw-semibold"
                                            style={{ opacity: 0.5, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmprunts.map((emp) => {
                                    const estActif = emp.statut === "EN_COURS" || emp.statut === "RETARD";
                                    const statutConfig = getStatutConfig(emp.statut);
                                    return (
                                        <tr key={emp.id}
                                            style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>

                                            {/* Livre */}
                                            <td className="border-0 py-3 px-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div style={{ width: 36, height: 50, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: isDark ? '#1e2533' : '#f0f4ff' }}>
                                                        <img
                                                            src={emp.livreImageUrl || "https://img.icons8.com/color/48/book.png"}
                                                            alt=""
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <span className="fw-semibold text-truncate" style={{ maxWidth: '160px' }} title={emp.livreTitre}>
                                                        {emp.livreTitre}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Lecteur */}
                                            <td className="border-0 py-3 px-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                        style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', fontSize: '0.75rem', color: '#fff', fontWeight: 700 }}>
                                                        {emp.userNomComplet?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="mb-0 fw-semibold" style={{ fontSize: '0.83rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {emp.userNomComplet}
                                                        </p>
                                                        <p className="mb-0" style={{ fontSize: '0.72rem', opacity: 0.5 }}>{emp.userEmail}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date emprunt */}
                                            <td className="border-0 py-3 px-4" style={{ opacity: 0.7 }}>{emp.dateEmprunt}</td>

                                            {/* Retour prévu */}
                                            <td className="border-0 py-3 px-4">
                                                <span style={{
                                                    color: emp.statut === "RETARD" ? '#ef4444' : (isDark ? '#e2e8f0' : '#374151'),
                                                    fontWeight: emp.statut === "RETARD" ? 700 : 400
                                                }}>
                                                    {emp.dateRetourPrevue}
                                                    {emp.statut === "RETARD" && <i className="bi bi-exclamation-circle ms-1" style={{ fontSize: '0.75rem' }}></i>}
                                                </span>
                                            </td>

                                            {/* Date retour effective */}
                                            <td className="border-0 py-3 px-4" style={{ opacity: 0.7 }}>
                                                {emp.dateRetourEffective || <span style={{ opacity: 0.35 }}>—</span>}
                                            </td>

                                            {/* Statut */}
                                            <td className="border-0 py-3 px-4">
                                                <span className="badge rounded-pill px-3 py-2"
                                                    style={{ background: statutConfig.bg, color: statutConfig.color, fontSize: '0.72rem', fontWeight: 700 }}>
                                                    {statutConfig.label}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="border-0 py-3 px-4 text-center">
                                                {estActif ? (
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-sm rounded-3 px-3 fw-semibold d-flex align-items-center gap-2"
                                                            style={{
                                                                background: 'linear-gradient(135deg,#10b981,#059669)',
                                                                border: 'none', color: '#fff',
                                                                fontSize: '0.78rem',
                                                                boxShadow: '0 3px 10px rgba(16,185,129,0.3)',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            disabled={actionLoadingId === emp.id}
                                                            onClick={() => handleValiderRetour(emp.id)}
                                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                        >
                                                            {actionLoadingId === emp.id ? (
                                                                <><span className="spinner-border spinner-border-sm"></span></>
                                                            ) : (
                                                                <><i className="bi bi-arrow-return-left"></i> Rendu</>
                                                            )}
                                                        </button>
                                                        <button
                                                            className="btn btn-sm rounded-3 px-3 fw-semibold d-flex align-items-center gap-2"
                                                            style={{
                                                                background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                                                                border: 'none', color: '#fff',
                                                                fontSize: '0.78rem',
                                                                boxShadow: '0 3px 10px rgba(59,130,246,0.3)',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            disabled={actionLoadingId === emp.id}
                                                            onClick={() => handleModifierDate(emp.id, emp.dateRetourPrevue)}
                                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                            title="Modifier la date de retour prévue"
                                                        >
                                                            <i className="bi bi-calendar-event"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="d-flex align-items-center justify-content-center gap-1" style={{ opacity: 0.35, fontSize: '0.78rem' }}>
                                                        <i className="bi bi-check2-all"></i> Terminé
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <i className="bi bi-inbox display-3 d-block mb-3" style={{ opacity: 0.12 }}></i>
                        <p className="fw-semibold mb-1" style={{ opacity: 0.5 }}>Aucune transaction trouvée</p>
                        <p className="small mb-0" style={{ opacity: 0.35 }}>
                            {statusFilter !== "ALL" ? "Essayez un autre filtre." : "Aucun emprunt enregistré pour le moment."}
                        </p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(60px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin { animation: spin 1s linear infinite; }
            `}} />
        </div>
    );
}
