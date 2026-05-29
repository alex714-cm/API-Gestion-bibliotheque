import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { apiService } from "../../services/apiService";
import JButton from "../../components/JButton";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const isDark = theme === 'dark';

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await apiService.post("/api/auth/login", {
                email: email,
                password: password
            });

            const data = response.data;

            if (data) {
                login(data);
                if (data.role === "ADMIN") {
                    navigate("/admin/livre");
                } else {
                    navigate("/dashboard"); // Redirect User to their dedicated Dashboard
                }
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Votre email ou mot de passe est erroné");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
            <div className="col-lg-5 col-md-8 col-sm-11">
                <div className={`card shadow-lg border-0 p-5 rounded-4 transition-all ${isDark ? 'bg-secondary text-white' : 'bg-white text-dark'}`}>
                    
                    {/* Header Card */}
                    <div className="text-center mb-4">
                        <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-2 fw-semibold">
                            Espace Connexion
                        </span>
                        <h2 className="fw-bold mb-1 display-6">Livre<span className="text-primary">Moi</span></h2>
                        <p className="opacity-75 small">Accédez à votre bibliothèque en ligne</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger border-0 shadow-sm p-3 small text-center rounded-3 d-flex align-items-center justify-content-center gap-2 mb-4 animate-fade-in">
                            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Champ Email */}
                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Adresse E-mail</label>
                            <div className="input-group">
                                <span className={`input-group-text border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`}>
                                    <i className="bi bi-envelope"></i>
                                </span>
                                <input 
                                    type="email" 
                                    className={`form-control border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`}
                                    placeholder="nom@exemple.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        {/* Champ Mot de Passe */}
                        <div className="mb-4">
                            <label className="form-label small fw-semibold">Mot de passe</label>
                            <div className="input-group">
                                <span className={`input-group-text border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`}>
                                    <i className="bi bi-lock"></i>
                                </span>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className={`form-control border-0 ${isDark ? 'bg-dark text-white' : 'bg-light'}`}
                                    placeholder="Saisissez votre mot de passe" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        {/* Bouton de Soumission */}
                        <JButton 
                            type="submit" 
                            variant="primary" 
                            className="btn-lg w-100 fw-bold py-3 shadow mb-4 rounded-3" 
                            loading={loading}
                            icon="box-arrow-in-right"
                        >
                            Se connecter
                        </JButton>

                        <div className="text-center mb-3">
                            <a href="#" className="text-decoration-none small text-primary fw-medium">
                                Mot de passe oublié ?
                            </a>
                        </div>
                        
                        <div className="position-relative my-4">
                            <hr className="opacity-25" />
                            <span className={`position-absolute top-50 start-50 translate-middle px-3 small opacity-75 ${isDark ? 'bg-secondary' : 'bg-white'}`}>
                                Nouveau lecteur ?
                            </span>
                        </div>

                        <div className="text-center">
                            <Link to="/register" className="btn btn-outline-success btn-md fw-bold px-4 rounded-3 w-100 py-2">
                                Créer un compte LivreMoi
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Style CSS local pour l'animation simple */}
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