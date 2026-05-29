import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiService.js";
import { ThemeContext } from "../../context/ThemeContext";
import Swal from "sweetalert2";

export function AuteurCreate() {
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ nom: "", prenom: "" });
    const [errors, setErrors] = useState({});

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await apiService.post("/api/auteurs", formData);
            await Swal.fire({
                icon: "success",
                title: "Auteur ajouté !",
                text: `${formData.prenom} ${formData.nom} a été créé avec succès.`,
                confirmButtonColor: "#6366f1",
                timer: 2000,
                showConfirmButton: false
            });
            navigate("/admin/auteur");
        } catch (error) {
            const backendErrors = error.response?.data || {};
            setErrors(backendErrors);
        } finally {
            setLoading(false);
        }
    }

    const cardStyle = {
        background: isDark ? "#1e2533" : "#fff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        borderRadius: "20px"
    };

    return (
        <div className="container py-5" style={{ maxWidth: 640 }}>
            {/* Breadcrumb */}
            <nav className="mb-4">
                <ol className="breadcrumb" style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                    <li className="breadcrumb-item">
                        <span className="text-decoration-none" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/auteur")}>
                            <i className="bi bi-people me-1"></i>Auteurs
                        </span>
                    </li>
                    <li className="breadcrumb-item active">Nouvel auteur</li>
                </ol>
            </nav>

            <div className="p-4 p-md-5" style={cardStyle}>
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 52, height: 52, background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                        <i className="bi bi-person-plus-fill text-white fs-4"></i>
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ letterSpacing: "-0.5px" }}>Nouvel auteur</h2>
                        <p className="mb-0 small" style={{ opacity: 0.5 }}>Remplissez les informations ci-dessous</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-4 mb-4">
                        {/* Prénom */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-uppercase" style={{ letterSpacing: "0.5px", opacity: 0.7 }}>
                                Prénom
                            </label>
                            <div className="input-group">
                                <span className="input-group-text" style={{
                                    background: isDark ? "#2d3748" : "#f8fafc",
                                    border: `1px solid ${errors.prenom ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
                                    borderRight: "none"
                                }}>
                                    <i className="bi bi-person" style={{ opacity: 0.5 }}></i>
                                </span>
                                <input
                                    type="text"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    placeholder="Ex: Victor"
                                    required
                                    className={`form-control ${errors.prenom ? "is-invalid" : ""}`}
                                    style={{
                                        background: isDark ? "#2d3748" : "#f8fafc",
                                        border: `1px solid ${errors.prenom ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
                                        color: isDark ? "#e2e8f0" : "#1a202c",
                                        borderLeft: "none"
                                    }}
                                />
                                {errors.prenom && <div className="invalid-feedback">{errors.prenom}</div>}
                            </div>
                        </div>

                        {/* Nom */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-uppercase" style={{ letterSpacing: "0.5px", opacity: 0.7 }}>
                                Nom de famille
                            </label>
                            <div className="input-group">
                                <span className="input-group-text" style={{
                                    background: isDark ? "#2d3748" : "#f8fafc",
                                    border: `1px solid ${errors.nom ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
                                    borderRight: "none"
                                }}>
                                    <i className="bi bi-person-badge" style={{ opacity: 0.5 }}></i>
                                </span>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    placeholder="Ex: Hugo"
                                    required
                                    className={`form-control ${errors.nom ? "is-invalid" : ""}`}
                                    style={{
                                        background: isDark ? "#2d3748" : "#f8fafc",
                                        border: `1px solid ${errors.nom ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
                                        color: isDark ? "#e2e8f0" : "#1a202c",
                                        borderLeft: "none"
                                    }}
                                />
                                {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    {(formData.prenom || formData.nom) && (
                        <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-3"
                            style={{ background: isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                style={{ width: 42, height: 42, background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontSize: "1rem" }}>
                                {formData.prenom?.charAt(0)?.toUpperCase() || formData.nom?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <p className="mb-0 fw-semibold" style={{ color: "#6366f1" }}>
                                    {formData.prenom} {formData.nom}
                                </p>
                                <small style={{ opacity: 0.5 }}>Aperçu de l'auteur</small>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="d-flex gap-3 pt-2">
                        <button type="submit" disabled={loading}
                            className="btn fw-bold d-flex align-items-center gap-2 px-4 py-2 rounded-3"
                            style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
                            {loading ? <><span className="spinner-border spinner-border-sm"></span> Enregistrement...</> : <><i className="bi bi-check-lg"></i> Créer l'auteur</>}
                        </button>
                        <button type="button" onClick={() => navigate("/admin/auteur")}
                            className="btn d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold"
                            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, color: isDark ? "#e2e8f0" : "#374151" }}>
                            <i className="bi bi-x-lg"></i> Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}