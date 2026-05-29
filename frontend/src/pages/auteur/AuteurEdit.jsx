import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { apiService } from "../../services/apiService.js";
import { ThemeContext } from "../../context/ThemeContext";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

export function AuteurEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const [formData, setFormData] = useState({ nom: "", prenom: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        apiService.get(`/api/auteurs/${id}`)
            .then(response => {
                setFormData({ nom: response.data.nom, prenom: response.data.prenom });
            })
            .catch(() => {
                Swal.fire("Erreur", "Impossible de charger cet auteur.", "error").then(() => navigate("/admin/auteur"));
            })
            .finally(() => setLoading(false));
    }, [id]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiService.put(`/api/auteurs/${id}`, formData);
            await Swal.fire({
                icon: "success",
                title: "Modifications enregistrées !",
                text: `${formData.prenom} ${formData.nom} a été mis à jour.`,
                confirmButtonColor: "#6366f1",
                timer: 2000,
                showConfirmButton: false
            });
            navigate("/admin/auteur");
        } catch (error) {
            const backendErrors = error.response?.data?.errors || error.response?.data || {};
            setErrors(backendErrors);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <Loader />;

    const cardStyle = {
        background: isDark ? "#1e2533" : "#fff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        borderRadius: "20px"
    };

    const inputStyle = (field) => ({
        background: isDark ? "#2d3748" : "#f8fafc",
        border: `1px solid ${errors[field] ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
        color: isDark ? "#e2e8f0" : "#1a202c",
        borderLeft: "none"
    });

    const addonStyle = (field) => ({
        background: isDark ? "#2d3748" : "#f8fafc",
        border: `1px solid ${errors[field] ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
        borderRight: "none"
    });

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
                    <li className="breadcrumb-item active">Modifier — {formData.prenom} {formData.nom}</li>
                </ol>
            </nav>

            <div className="p-4 p-md-5" style={cardStyle}>
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{ width: 52, height: 52, background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontSize: "1.3rem" }}>
                        {formData.prenom?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ letterSpacing: "-0.5px" }}>Modifier l'auteur</h2>
                        <p className="mb-0 small" style={{ opacity: 0.5 }}>
                            ID #{id} — {formData.prenom} {formData.nom}
                        </p>
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
                                <span className="input-group-text" style={addonStyle("prenom")}>
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
                                    style={inputStyle("prenom")}
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
                                <span className="input-group-text" style={addonStyle("nom")}>
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
                                    style={inputStyle("nom")}
                                />
                                {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Aperçu en direct */}
                    <div className="mb-5 p-3 rounded-3 d-flex align-items-center gap-3"
                        style={{ background: isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: 42, height: 42, background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontSize: "1rem" }}>
                            {formData.prenom?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                            <p className="mb-0 fw-semibold" style={{ color: "#6366f1" }}>
                                {formData.prenom} {formData.nom}
                            </p>
                            <small style={{ opacity: 0.5 }}>Aperçu des modifications</small>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-3 pt-2 border-top" style={{ borderColor: isDark ? "rgba(255,255,255,0.06) !important" : "rgba(0,0,0,0.06) !important" }}>
                        <button type="submit" disabled={submitting}
                            className="btn fw-bold d-flex align-items-center gap-2 px-4 py-2 rounded-3 mt-4"
                            style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
                            {submitting ? <><span className="spinner-border spinner-border-sm"></span> Mise à jour...</> : <><i className="bi bi-check-lg"></i> Enregistrer</>}
                        </button>
                        <button type="button" onClick={() => navigate("/admin/auteur")}
                            className="btn d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold mt-4"
                            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, color: isDark ? "#e2e8f0" : "#374151" }}>
                            <i className="bi bi-x-lg"></i> Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}