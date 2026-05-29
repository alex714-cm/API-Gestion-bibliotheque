import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { apiService } from "../../services/apiService";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Swal from 'sweetalert2';

export function AdminDashboard() {
    const { user, login, logout } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, profile

    const [showPassword, setShowPassword] = useState(false);

    const [stats, setStats] = useState(null);
    const [livresAlert, setLivresAlert] = useState([]);
    const [emprunteurs, setEmprunteurs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Profile form
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        password: "",
        adresse: user?.adresse || "",
        telephone: user?.telephone || ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsRes = await apiService.get('/api/emprunts/stats');
            setStats(statsRes.data);

            const livresRes = await apiService.get('/api/livres');
            const livresBasStock = livresRes.data.filter(l => l.quantite <= 6);
            setLivresAlert(livresBasStock);

            const empruntsRes = await apiService.get('/api/emprunts');
            // Récupérer les emprunteurs (utilisateurs avec emprunts EN_COURS ou RETARD)
            const empruntsActifs = empruntsRes.data.filter(e => e.statut === "EN_COURS" || e.statut === "RETARD");
            
            // Dédoublonner par userId
            const mapUsers = new Map();
            empruntsActifs.forEach(e => {
                if (!mapUsers.has(e.userId)) {
                    mapUsers.set(e.userId, {
                        nomComplet: e.userNomComplet,
                        email: e.userEmail,
                        livresCount: 1
                    });
                } else {
                    const u = mapUsers.get(e.userId);
                    u.livresCount++;
                }
            });
            setEmprunteurs(Array.from(mapUsers.values()));

        } catch (error) {
            console.error("Erreur chargement dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showAllLowStock = () => {
        const listHtml = livresAlert.map(l => 
            `<div style="text-align: left; padding: 10px 14px; margin-bottom: 8px; border-radius: 8px; background: ${isDark ? '#2d3748' : '#f8f9fa'}; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #ffc107;">
                <span style="font-weight: 600; color: ${isDark ? '#e2e8f0' : '#2d3748'};">${l.titre}</span>
                <span class="badge bg-warning text-dark rounded-pill fw-bold" style="padding: 6px 12px;">${l.quantite} restant(s)</span>
             </div>`
        ).join('');

        Swal.fire({
            title: '<strong>Tous les livres en stock critique</strong>',
            icon: 'warning',
            html: `
                <div style="max-height: 350px; overflow-y: auto; padding-right: 5px; margin-top: 15px;">
                    ${listHtml}
                </div>
            `,
            showCloseButton: true,
            confirmButtonText: 'Fermer',
            confirmButtonColor: '#dc3545',
            background: isDark ? '#1a202c' : '#fff',
            color: isDark ? '#fff' : '#000',
            customClass: {
                popup: 'rounded-4'
            }
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await apiService.put(`/api/auth/update-profile/${user.id}`, profileForm);
            login(res.data);
            Swal.fire('Succès', 'Profil mis à jour avec succès !', 'success');
            setActiveTab("dashboard");
        } catch (err) {
            Swal.fire('Erreur', 'Erreur lors de la mise à jour du profil.', 'error');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="animate-fade-in">
                        <h2 className="fw-bold mb-4" style={{ letterSpacing: '-0.5px' }}>Tableau de bord Administrateur</h2>

                        {/* Alerte de stock */}
                        {livresAlert.length > 0 && (
                            <div className="alert alert-warning border-warning shadow-sm rounded-4 mb-4 d-flex align-items-start gap-3 p-4">
                                <i className="bi bi-exclamation-triangle-fill fs-3 text-warning"></i>
                                <div>
                                    <h5 className="alert-heading fw-bold">Alerte Stock Critique</h5>
                                    <p className="mb-0 small">
                                        Attention, <strong>{livresAlert.length}</strong> livre(s) ont un stock inférieur ou égal à 6 exemplaires restants.
                                    </p>
                                    <ul className="mt-2 mb-0 small ps-3">
                                        {livresAlert.slice(0, 3).map(l => (
                                            <li key={l.id}><strong>{l.titre}</strong> - Seulement {l.quantite} restant(s)</li>
                                        ))}
                                        {livresAlert.length > 3 && (
                                            <li className="list-unstyled mt-2">
                                                <button 
                                                    onClick={showAllLowStock} 
                                                    className="btn btn-sm btn-outline-warning border-2 rounded-pill px-3 py-1 fw-bold"
                                                    style={{ fontSize: '0.8rem', transition: 'all 0.2s' }}
                                                >
                                                    <i className="bi bi-eye-fill me-1"></i>
                                                    ...et {livresAlert.length - 3} autre(s) (Cliquez pour voir)
                                                </button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {loading ? <Loader /> : (
                            <>
                                {/* Stats Cards */}
                                <div className="row g-4 mb-5">
                                    <div className="col-md-4">
                                        <div className={`rounded-4 p-4 h-100 ${isDark ? 'bg-dark' : 'bg-white'}`} style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                                                    <i className="bi bi-people-fill text-white fs-5"></i>
                                                </div>
                                                <div>
                                                    <p className="mb-0 small fw-semibold" style={{ opacity: 0.6 }}>Utilisateurs inscrits</p>
                                                    <h3 className="fw-bold mb-0" style={{ color: '#0ea5e9' }}>{stats?.totalUsers || 0}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/livre')}>
                                        <div className={`rounded-4 p-4 h-100 ${isDark ? 'bg-dark' : 'bg-white'}`} style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                                                    <i className="bi bi-book-half text-white fs-5"></i>
                                                </div>
                                                <div>
                                                    <p className="mb-0 small fw-semibold" style={{ opacity: 0.6 }}>Livres dans la BD</p>
                                                    <h3 className="fw-bold mb-0" style={{ color: '#6366f1' }}>{stats?.totalLivres || 0}</h3>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-end">
                                                <span className="small text-primary fw-bold">Voir les livres <i className="bi bi-arrow-right"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className={`rounded-4 p-4 h-100 ${isDark ? 'bg-dark' : 'bg-white'}`} style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                                                    <i className="bi bi-arrow-left-right text-white fs-5"></i>
                                                </div>
                                                <div>
                                                    <p className="mb-0 small fw-semibold" style={{ opacity: 0.6 }}>Livres empruntés</p>
                                                    <h3 className="fw-bold mb-0" style={{ color: '#f59e0b' }}>{stats?.empruntsEnCours || 0}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Liste des emprunteurs */}
                                <div className={`rounded-4 p-4 ${isDark ? 'bg-dark' : 'bg-white'}`} style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                    <h5 className="fw-bold mb-4"><i className="bi bi-person-lines-fill me-2 text-primary"></i>Utilisateurs ayant des emprunts en cours</h5>
                                    
                                    {emprunteurs.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className={`table align-middle ${isDark ? 'table-dark' : ''}`}>
                                                <thead>
                                                    <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                                                        <th className="border-0 py-3 fw-semibold">Lecteur</th>
                                                        <th className="border-0 py-3 fw-semibold">Email</th>
                                                        <th className="border-0 py-3 fw-semibold text-center">Livres empruntés</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emprunteurs.map((emp, idx) => (
                                                        <tr key={idx} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                                                            <td className="border-0 py-3 fw-bold">{emp.nomComplet}</td>
                                                            <td className="border-0 py-3 text-muted">{emp.email}</td>
                                                            <td className="border-0 py-3 text-center">
                                                                <span className="badge bg-primary rounded-pill">{emp.livresCount}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                            Aucun utilisateur n'a d'emprunt en cours actuellement.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                );
            case "profile":
                return (
                    <div className="animate-fade-in">
                        <h2 className="fw-bold mb-4" style={{ letterSpacing: '-0.5px' }}>Modifier mon profil (Administrateur)</h2>
                        <div className={`rounded-4 p-4 ${isDark ? 'bg-dark' : 'bg-white'}`} style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <form onSubmit={handleUpdateProfile}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Prénom</label>
                                        <input type="text" className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`} value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold">Nom</label>
                                        <input type="text" className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`} value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Adresse e-mail</label>
                                    <input type="email" className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`} value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Numéro de téléphone</label>
                                    <input type="text" className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`} value={profileForm.telephone} onChange={(e) => setProfileForm({ ...profileForm, telephone: e.target.value })} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Adresse complète</label>
                                    <textarea className={`form-control rounded-3 border-0 ${isDark ? 'bg-secondary text-white' : 'bg-light'}`} rows="2" value={profileForm.adresse} onChange={(e) => setProfileForm({ ...profileForm, adresse: e.target.value })} required ></textarea>
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
                                    <button type="submit" className="btn px-5 py-2 rounded-3 fw-bold" style={{ background: 'linear-gradient(135deg,#dc3545,#b02a37)', color: '#fff', border: 'none' }}>
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="container py-5 mb-5">
            <h1 className="fw-bold mb-5 text-danger" style={{ letterSpacing: '-0.5px', fontSize: '2rem' }}>
                Espace Administrateur
            </h1>
            <div className="row g-4">
                <div className="col-lg-3 col-md-4">
                    <div className={`rounded-4 overflow-hidden ${isDark ? 'bg-dark' : 'bg-white'}`} style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', position: 'sticky', top: '80px' }}>
                        <div className="p-4 text-center" style={{ background: 'linear-gradient(135deg,rgba(220,53,69,0.1),rgba(220,53,69,0.05))' }}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#dc3545,#b02a37)', fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>
                                {user?.firstName?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <p className="fw-bold mb-0 text-capitalize">{user?.firstName} {user?.lastName}</p>
                            <small className="text-danger fw-bold">Admin</small>
                        </div>
                        <div className="py-2">
                            <button onClick={() => setActiveTab("dashboard")} className={`w-100 text-start px-4 py-3 border-0 fw-medium d-flex align-items-center gap-3`} style={{ background: activeTab === "dashboard" ? (isDark ? 'rgba(220,53,69,0.15)' : 'rgba(220,53,69,0.08)') : 'transparent', color: activeTab === "dashboard" ? '#dc3545' : (isDark ? '#a0aec0' : '#5a6a85'), borderLeft: `3px solid ${activeTab === "dashboard" ? '#dc3545' : 'transparent'}`, transition: 'all 0.2s ease' }}>
                                <i className="bi bi-speedometer2"></i><span className="flex-grow-1">Tableau de bord</span>
                            </button>
                            <button onClick={() => setActiveTab("profile")} className={`w-100 text-start px-4 py-3 border-0 fw-medium d-flex align-items-center gap-3`} style={{ background: activeTab === "profile" ? (isDark ? 'rgba(220,53,69,0.15)' : 'rgba(220,53,69,0.08)') : 'transparent', color: activeTab === "profile" ? '#dc3545' : (isDark ? '#a0aec0' : '#5a6a85'), borderLeft: `3px solid ${activeTab === "profile" ? '#dc3545' : 'transparent'}`, transition: 'all 0.2s ease' }}>
                                <i className="bi bi-person-gear"></i><span className="flex-grow-1">Mon profil</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-lg-9 col-md-8">
                    {renderTabContent()}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
