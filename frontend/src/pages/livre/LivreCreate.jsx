import { useEffect, useState, useContext } from "react";
import { apiService } from "../../services/apiService";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import Swal from "sweetalert2";

export default function LivreCreate() {
    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const [loading, setLoading] = useState(false);
    const [auteurs, setAuteurs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [catOpen, setCatOpen] = useState(false);

    const [formData, setFormData] = useState({
        titre: "",
        prix: "",
        description: "",
        imageUrl: "",
        quantite: 0,
        auteurId: "",
        categorieIds: []
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        Promise.all([
            apiService.get("/api/auteurs"),
            apiService.get("/api/categories")
        ]).then(([auteursRes, categoriesRes]) => {
            // Trier les auteurs par ID décroissant (le plus récent en premier)
            const sorted = [...auteursRes.data].sort((a, b) => b.id - a.id);
            setAuteurs(sorted);
            setCategories(categoriesRes.data);
        }).catch(err => console.error("Erreur chargement:", err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleCategories = (e) => {
        const value = String(e.target.value);
        setFormData(prev => ({
            ...prev,
            categorieIds: e.target.checked
                ? [...prev.categorieIds, value]
                : prev.categorieIds.filter(id => id !== value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation basique
        const newErrors = {};
        if (!formData.titre.trim()) newErrors.titre = "Le titre est obligatoire.";
        if (!formData.auteurId) newErrors.auteurId = "Sélectionnez un auteur.";
        if (!formData.prix || isNaN(formData.prix)) newErrors.prix = "Un prix valide est requis.";
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setLoading(true);
        try {
            await apiService.post("/api/livres", {
                ...formData,
                prix: parseFloat(formData.prix),
                quantite: parseInt(formData.quantite, 10),
                auteurId: parseInt(formData.auteurId, 10),
                categorieIds: formData.categorieIds.map(id => parseInt(id, 10))
            });
            await Swal.fire({
                icon: "success",
                title: "Livre ajouté !",
                text: `"${formData.titre}" est maintenant dans le catalogue.`,
                confirmButtonColor: "#6366f1",
                timer: 2200,
                showConfirmButton: false
            });
            navigate("/admin/livre");
        } catch (err) {
            Swal.fire("Erreur", err.response?.data?.message || "Erreur lors de la création du livre.", "error");
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

    const inputBase = (field) => ({
        background: isDark ? "#2d3748" : "#f8fafc",
        border: `1px solid ${errors[field] ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
        color: isDark ? "#e2e8f0" : "#1a202c",
        borderRadius: "10px"
    });

    const addonBase = (field) => ({
        background: isDark ? "#2d3748" : "#f8fafc",
        border: `1px solid ${errors[field] ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0")}`,
        borderRight: "none",
        borderRadius: "10px 0 0 10px"
    });

    const inputWithAddon = (field) => ({ ...inputBase(field), borderLeft: "none", borderRadius: "0 10px 10px 0" });

    const labelClass = "form-label fw-semibold small text-uppercase mb-2";
    const labelStyle = { letterSpacing: "0.5px", opacity: 0.6 };

    return (
        <div className="container py-5 mb-5" style={{ maxWidth: 860 }}>
            {/* Breadcrumb */}
            <nav className="mb-4">
                <ol className="breadcrumb" style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                    <li className="breadcrumb-item">
                        <span style={{ cursor: "pointer" }} onClick={() => navigate("/admin/livre")}>
                            <i className="bi bi-book me-1"></i>Livres
                        </span>
                    </li>
                    <li className="breadcrumb-item active">Nouveau livre</li>
                </ol>
            </nav>

            <div className="p-4 p-md-5" style={cardStyle}>
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 52, height: 52, background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                        <i className="bi bi-book-fill text-white fs-4"></i>
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ letterSpacing: "-0.5px" }}>Ajouter un livre</h2>
                        <p className="mb-0 small" style={{ opacity: 0.5 }}>Remplissez les informations du nouveau livre</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* === SECTION 1 : Informations principales === */}
                    <div className="mb-2 pb-2">
                        <p className="fw-bold small mb-3" style={{ color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                            <i className="bi bi-info-circle me-2"></i>Informations générales
                        </p>
                        <div className="row g-4">
                            {/* Titre */}
                            <div className="col-12">
                                <label className={labelClass} style={labelStyle}>Titre du livre</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={addonBase("titre")}>
                                        <i className="bi bi-fonts" style={{ opacity: 0.5 }}></i>
                                    </span>
                                    <input type="text" name="titre" value={formData.titre} onChange={handleChange}
                                        placeholder="Ex: Le Petit Prince" required
                                        className={`form-control form-control-lg ${errors.titre ? "is-invalid" : ""}`}
                                        style={inputWithAddon("titre")} />
                                    {errors.titre && <div className="invalid-feedback">{errors.titre}</div>}
                                </div>
                            </div>

                            {/* Auteur */}
                            <div className="col-md-6">
                                <label className={labelClass} style={labelStyle}>Auteur</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={addonBase("auteurId")}>
                                        <i className="bi bi-person-fill" style={{ opacity: 0.5 }}></i>
                                    </span>
                                    <select name="auteurId" value={formData.auteurId} onChange={handleChange} required
                                        className={`form-select ${errors.auteurId ? "is-invalid" : ""}`}
                                        style={inputWithAddon("auteurId")}>
                                        <option value="">Sélectionner un auteur…</option>
                                        {auteurs.length > 0 && (
                                            <option key={auteurs[0].id} value={auteurs[0].id}>
                                                ★ {auteurs[0].prenom} {auteurs[0].nom} (ajouté récemment)
                                            </option>
                                        )}
                                        {auteurs.length > 1 && <option disabled>──────────────────</option>}
                                        {auteurs.slice(1).map(a => (
                                            <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>
                                        ))}
                                    </select>
                                    {errors.auteurId && <div className="invalid-feedback">{errors.auteurId}</div>}
                                </div>
                            </div>

                            {/* Prix */}
                            <div className="col-md-3">
                                <label className={labelClass} style={labelStyle}>Prix (DH)</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={addonBase("prix")}>
                                        <i className="bi bi-currency-exchange" style={{ opacity: 0.5 }}></i>
                                    </span>
                                    <input type="number" name="prix" step="0.01" min="0" value={formData.prix} onChange={handleChange}
                                        placeholder="0.00"
                                        className={`form-control ${errors.prix ? "is-invalid" : ""}`}
                                        style={inputWithAddon("prix")} />
                                    {errors.prix && <div className="invalid-feedback">{errors.prix}</div>}
                                </div>
                            </div>

                            {/* Quantité */}
                            <div className="col-md-3">
                                <label className={labelClass} style={labelStyle}>Stock initial</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={addonBase("quantite")}>
                                        <i className="bi bi-box-seam" style={{ opacity: 0.5 }}></i>
                                    </span>
                                    <input type="number" name="quantite" min="0" value={formData.quantite} onChange={handleChange}
                                        className="form-control" style={inputWithAddon("quantite")} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", margin: "2rem 0" }} />

                    {/* === SECTION 2 : Couverture & Catégories === */}
                    <div className="mb-2 pb-2">
                        <p className="fw-bold small mb-3" style={{ color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                            <i className="bi bi-image me-2"></i>Couverture & Catégories
                        </p>
                        <div className="row g-4">
                            {/* Image URL + Aperçu */}
                            <div className="col-md-8">
                                <label className={labelClass} style={labelStyle}>URL de la couverture</label>
                                <div className="input-group">
                                    <span className="input-group-text" style={addonBase("imageUrl")}>
                                        <i className="bi bi-link-45deg" style={{ opacity: 0.5 }}></i>
                                    </span>
                                    <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                                        placeholder="https://..."
                                        className="form-control"
                                        style={inputWithAddon("imageUrl")} />
                                </div>
                                <small className="mt-1 d-block" style={{ opacity: 0.4 }}>Laisser vide pour l'image par défaut.</small>
                            </div>

                            {/* Aperçu couverture */}
                            <div className="col-md-4 d-flex align-items-end">
                                <div className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center"
                                    style={{ width: "100%", height: 140, background: isDark ? "#2d3748" : "#f0f4ff", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Aperçu" style={{ height: "100%", objectFit: "contain" }}
                                            onError={(e) => { e.target.src = "https://img.icons8.com/color/96/book.png"; }} />
                                    ) : (
                                        <div className="text-center" style={{ opacity: 0.3 }}>
                                            <i className="bi bi-image fs-1 d-block"></i>
                                            <small>Aperçu</small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Catégories multi-select */}
                            <div className="col-12">
                                <label className={labelClass} style={labelStyle}>Catégories thématiques</label>
                                <div className="position-relative">
                                    <button type="button"
                                        onClick={() => setCatOpen(!catOpen)}
                                        className="btn w-100 text-start d-flex justify-content-between align-items-center py-2 px-3"
                                        style={{ ...inputBase("categorieIds"), border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`, borderRadius: "10px" }}>
                                        <span style={{ opacity: formData.categorieIds.length > 0 ? 1 : 0.4 }}>
                                            {formData.categorieIds.length > 0
                                                ? <>{formData.categorieIds.length} catégorie(s) sélectionnée(s) — {categories.filter(c => formData.categorieIds.includes(String(c.id))).map(c => c.libelle).join(", ")}</>
                                                : "Choisir des catégories…"}
                                        </span>
                                        <i className={`bi bi-chevron-${catOpen ? "up" : "down"} small`} style={{ opacity: 0.5 }}></i>
                                    </button>

                                    {catOpen && (
                                        <div className="position-absolute w-100 rounded-3 overflow-hidden mt-1 py-1"
                                            style={{ background: isDark ? "#1e2533" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`, boxShadow: "0 12px 30px rgba(0,0,0,0.12)", maxHeight: 200, overflowY: "auto", zIndex: 99 }}>
                                            {categories.map(c => (
                                                <label key={c.id} className="d-flex align-items-center gap-3 px-4 py-2 cursor-pointer"
                                                    style={{ cursor: "pointer", transition: "background 0.15s" }}
                                                    onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.06)"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                    <input type="checkbox" className="form-check-input"
                                                        value={c.id}
                                                        checked={formData.categorieIds.includes(String(c.id))}
                                                        onChange={handleCategories}
                                                        style={{ accentColor: "#6366f1" }} />
                                                    <span className="fw-medium">{c.libelle}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", margin: "2rem 0" }} />

                    {/* === SECTION 3 : Description === */}
                    <div className="mb-5">
                        <p className="fw-bold small mb-3" style={{ color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                            <i className="bi bi-text-paragraph me-2"></i>Description
                        </p>
                        <textarea name="description" rows="4" value={formData.description} onChange={handleChange}
                            placeholder="Résumé du livre, synopsis, notes importantes…"
                            className="form-control"
                            style={{ ...inputBase("description"), resize: "vertical", lineHeight: "1.7" }}>
                        </textarea>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-3">
                        <button type="submit" disabled={loading}
                            className="btn fw-bold d-flex align-items-center gap-2 px-5 py-2 rounded-3"
                            style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
                            {loading
                                ? <><span className="spinner-border spinner-border-sm"></span> Enregistrement...</>
                                : <><i className="bi bi-plus-circle-fill"></i> Ajouter le livre</>}
                        </button>
                        <button type="button" onClick={() => navigate("/livre")}
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