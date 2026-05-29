import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiService";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import JButton from "../../components/JButton";
import Swal from 'sweetalert2';

export function Register() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "USER",
        adresse: "",
        telephone: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await apiService.post("/api/auth/register", formData); 
            console.log("Success:", response.data);
            
            await Swal.fire({
                title: 'Succès !',
                text: 'Votre compte LivreMoi a été créé avec succès ! Connectez-vous maintenant.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#10b981'
            });
            navigate("/login");
        } catch (err) {
            console.error("Détails Erreur:", err);
            const errorMsg = err.response?.data || "Erreur lors de la création du compte.";
            setError(typeof errorMsg === 'string' ? errorMsg : (errorMsg.message || "Serveur inaccessible."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
            <div className="col-lg-6 col-md-8 col-sm-11">
                <div className={`card shadow-lg border-0 p-5 rounded-4 transition-all ${isDark ? 'bg-secondary text-white' : 'bg-white text-dark'}`}>
                    
                    {/* Header Card */}
                    <div className="text-center mb-4">
                        <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill mb-2 fw-semibold">
                            Inscription Gratuite
                        </span>
                        <h2 className="fw-bold mb-1">Créer un compte</h2>
                        <p className="opacity-75 small text-muted">Rejoignez LivreMoi pour commencer à lire dès aujourd'hui.</p>
                    </div>

                    <hr className="opacity-25" />
                    
                    {error && (
                        <div className="alert alert-danger border-0 shadow-sm p-3 small text-center rounded-3 d-flex align-items-center justify-content-center gap-2 mb-4 animate-fade-in">
                            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>


                        {/* Nom complet */}
                        <div className="row mb-3">
                            <div className="col">
                                <label className="form-label small fw-semibold">Prénom</label>
                                <input 
                                    name="firstName" 
                                    type="text" 
                                    className={`form-control border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`} 
                                    placeholder="Prénom" 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <div className="col">
                                <label className="form-label small fw-semibold">Nom</label>
                                <input 
                                    name="lastName" 
                                    type="text" 
                                    className={`form-control border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`} 
                                    placeholder="Nom de famille" 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Adresse E-mail</label>
                            <input 
                                name="email" 
                                type="email" 
                                className={`form-control border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`} 
                                placeholder="votre.email@exemple.com" 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        {/* Téléphone */}
                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Numéro de téléphone</label>
                            <input 
                                name="telephone" 
                                type="text" 
                                className={`form-control border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`} 
                                placeholder="06XXXXXXXX" 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        {/* Adresse */}
                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Adresse complète</label>
                            <textarea 
                                name="adresse" 
                                className={`form-control border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`} 
                                placeholder="Votre adresse..." 
                                rows="2"
                                onChange={handleChange} 
                                required 
                            ></textarea>
                        </div>

                        {/* Mot de Passe */}
                        <div className="mb-4">
                            <label className="form-label small fw-semibold">Mot de passe</label>
                            <div className="input-group">
                                <input 
                                    name="password" 
                                    type={showPassword ? "text" : "password"} 
                                    className={`form-control border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`} 
                                    placeholder="Minimum 6 caractères" 
                                    onChange={handleChange} 
                                    required 
                                />
                                <button
                                    type="button"
                                    className={`btn border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`}
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ zIndex: 5 }}
                                >
                                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                </button>
                            </div>
                        </div>

                        {/* Bouton de Validation */}
                        <div className="text-center mt-4">
                            <JButton 
                                type="submit" 
                                variant="success"
                                className="btn-lg fw-bold px-5 shadow-sm rounded-3 w-100 py-3"
                                loading={loading}
                                icon="person-plus"
                            >
                                Créer mon compte Lecteur
                            </JButton>
                        </div>

                        <div className="text-center mt-4">
                            <Link to="/login" className="text-decoration-none small text-primary fw-medium">
                                Déjà inscrit sur LivreMoi ? Se connecter
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
            `}} />
        </div>
    );
}