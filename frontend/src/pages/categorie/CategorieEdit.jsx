import { useEffect, useState, useContext } from "react";
import { apiService } from "../../services/apiService";
import { useNavigate, useParams } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

export function CategorieEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const [libelle, setLibelle] = useState("");
    const [originalLibelle, setOriginalLibelle] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        apiService.get(`/api/categories/${id}`)
            .then(res => {
                if (isMounted) {
                    setLibelle(res.data.libelle);
                    setOriginalLibelle(res.data.libelle);
                    setError(null);
                }
            })
            .catch(err => {
                if (isMounted) setError("Impossible de charger cette catégorie.");
            })
            .finally(() => { if (isMounted) setLoading(false); });
        return () => { isMounted = false; };
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!libelle.trim()) { setError("Le libellé est obligatoire."); return; }
        setSubmitting(true);
        setError(null);
        try {
            await apiService.put(`/api/categories/${id}`, { libelle });
            await Swal.fire({
                icon: "success",
                title: "Catégorie mise à jour !",
                text: `"${libelle}" a bien été modifiée.`,
                confirmButtonColor: "#10b981",
                timer: 2000,
                showConfirmButton: false
            });
            navigate("/admin/categorie");
        } catch (err) {
            setError("Erreur lors de la mise à jour.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    const cardStyle = {
        background: isDark ? "#1e2533" : "#fff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        borderRadius: "20px"
    };

    const isModified = libelle !== originalLibelle;

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
                    <li className="breadcrumb-item active">Modifier — {originalLibelle}</li>
                </ol>
            </nav>

            <div className="p-4 p-md-5" style={cardStyle}>
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 52, height: 52, background: "linear-gradient(135deg,#10b981,#059669)" }}>
                        <i className="bi bi-pencil-square text-white fs-4"></i>
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ letterSpacing: "-0.5px" }}>Modifier la catégorie</h2>
                        <p className="mb-0 small" style={{ opacity: 0.5 }}>ID #{id} — <span style={{ color: "#10b981" }}>{originalLibelle}</span></p>
                    </div>
                </div>

                {error && (
                    <div className="alert rounded-3 mb-4 d-flex align-items-center gap-2 border-0"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                        <i className="bi bi-exclamation-circle-fill"></i>
                        <span>{error}</span>
                    </div>
                )}

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
                                className="form-control form-control-lg"
                                style={{
                                    background: isDark ? "#2d3748" : "#f8fafc",
                                    border: `1px solid ${error ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
                                    color: isDark ? "#e2e8f0" : "#1a202c",
                                    borderLeft: "none"
                                }}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Statut de modification */}
                    {isModified ? (
                        <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-3"
                            style={{ background: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.06)", border: "1px dashed rgba(245,158,11,0.4)" }}>
                            <i className="bi bi-arrow-left-right" style={{ color: "#f59e0b" }}></i>
                            <div className="small">
                                <span style={{ opacity: 0.5, textDecoration: "line-through" }}>{originalLibelle}</span>
                                <i className="bi bi-arrow-right mx-2" style={{ opacity: 0.4 }}></i>
                                <span className="fw-semibold" style={{ color: "#f59e0b" }}>{libelle}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 p-3 rounded-3 d-flex align-items-center gap-2"
                            style={{ background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                            <i className="bi bi-check2-circle" style={{ color: "#10b981" }}></i>
                            <small style={{ opacity: 0.6 }}>Aucune modification en cours.</small>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="d-flex gap-3 pt-3 border-top" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                        <button type="submit" disabled={submitting || !isModified}
                            className="btn fw-bold d-flex align-items-center gap-2 px-4 py-2 rounded-3 mt-3"
                            style={{
                                background: isModified ? "linear-gradient(135deg,#10b981,#059669)" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                                color: isModified ? "#fff" : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"),
                                border: "none",
                                boxShadow: isModified ? "0 4px 14px rgba(16,185,129,0.35)" : "none",
                                cursor: isModified ? "pointer" : "not-allowed"
                            }}>
                            {submitting
                                ? <><span className="spinner-border spinner-border-sm"></span> Mise à jour...</>
                                : <><i className="bi bi-check-lg"></i> Enregistrer</>}
                        </button>
                        <button type="button" onClick={() => navigate("/admin/categorie")}
                            className="btn d-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold mt-3"
                            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, color: isDark ? "#e2e8f0" : "#374151" }}>
                            <i className="bi bi-x-lg"></i> Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}