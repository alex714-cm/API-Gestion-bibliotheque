import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiService";
import { ThemeContext } from "../../context/ThemeContext";
import Swal from "sweetalert2";

export function CategorieCreate() {
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const [libelle, setLibelle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!libelle.trim()) { setError("Le libellé est obligatoire."); return; }
        setLoading(true);
        setError(null);
        try {
            await apiService.post("/api/categories", { libelle });
            await Swal.fire({
                icon: "success",
                title: "Catégorie créée !",
                text: `"${libelle}" a été ajoutée au catalogue.`,
                confirmButtonColor: "#10b981",
                timer: 2000,
                showConfirmButton: false
            });
            navigate("/admin/categorie");
        } catch (err) {
            setError(err.response?.data?.details?.[0] || "Erreur lors de la création.");
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        background: isDark ? "#1e2533" : "#fff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        borderRadius: "20px"
    };

    const inputStyle = {
        background: isDark ? "#2d3748" : "#f8fafc",
        border: `1px solid ${error ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
        color: isDark ? "#e2e8f0" : "#1a202c",
        borderLeft: "none",
        fontSize: "1rem",
        padding: "0.65rem 1rem"
    };

    return (
        <div className="container py-5" style={{ maxWidth: 560 }}>
            {/* Breadcrumb */}
            <nav className="mb-4">
                <ol className="breadcrumb" style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                    <li className="breadcrumb-item">
                        <span style={{ cursor: "pointer" }} onClick={() => navigate("/admin/categorie")}>
                            <i className="bi bi-tags me-1"></i>Catégories
                        </span>
                    </li>
                    <li className="breadcrumb-item active">Nouvelle catégorie</li>
                </ol>
            </nav>

            <div className="p-4 p-md-5" style={cardStyle}>
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 52, height: 52, background: "linear-gradient(135deg,#10b981,#059669)" }}>
                        <i className="bi bi-tag-fill text-white fs-4"></i>
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ letterSpacing: "-0.5px" }}>Nouvelle catégorie</h2>
                        <p className="mb-0 small" style={{ opacity: 0.5 }}>Ajoutez une thématique au catalogue</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label className="form-label fw-semibold small text-uppercase" style={{ letterSpacing: "0.5px", opacity: 0.7 }}>
                            Libellé de la catégorie
                        </label>
                        <div className="input-group">
                            <span className="input-group-text" style={{
                                background: isDark ? "#2d3748" : "#f8fafc",
                                border: `1px solid ${error ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
                                borderRight: "none"
                            }}>
                                <i className="bi bi-tag" style={{ opacity: 0.5, color: "#10b981" }}></i>
                            </span>
                            <input
                                type="text"
                                value={libelle}
                                onChange={(e) => { setLibelle(e.target.value); setError(null); }}
                                placeholder="Ex: Informatique, Roman, Science…"
                                className={`form-control form-control-lg ${error ? "is-invalid" : ""}`}
                                style={inputStyle}
                                autoFocus
                            />
                            {error && <div className="invalid-feedback">{error}</div>}
                        </div>
                        <small className="mt-2 d-block" style={{ opacity: 0.4 }}>
                            Ce nom apparaîtra dans le catalogue des livres.
                        </small>
                    </div>

                    {/* Aperçu */}
                    {libelle.trim() && (
                        <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-3"
                            style={{ background: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                            <i className="bi bi-tag-fill fs-5" style={{ color: "#10b981" }}></i>
                            <div>
                                <p className="mb-0 fw-semibold" style={{ color: "#10b981" }}>{libelle}</p>
                                <small style={{ opacity: 0.5 }}>Aperçu de la catégorie</small>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="d-flex gap-3 pt-2">
                        <button type="submit" disabled={loading}
                            className="btn fw-bold d-flex align-items-center gap-2 px-4 py-2 rounded-3"
                            style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}>
                            {loading
                                ? <><span className="spinner-border spinner-border-sm"></span> Enregistrement...</>
                                : <><i className="bi bi-check-lg"></i> Créer la catégorie</>}
                        </button>
                        <button type="button" onClick={() => navigate("/admin/categorie")}
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