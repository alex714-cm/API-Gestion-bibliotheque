import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiService.js";
import JButton from "../../components/JButton";
import Loader from "../../components/Loader.jsx";
import Swal from 'sweetalert2';
import { ThemeContext } from "../../context/ThemeContext";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function AuteurIndex() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const loadData = () => {
        setLoading(true);
        apiService.get('/api/auteurs')
            .then(response => {
                setData(response.data);
                setFiltered(response.data);
                setCurrentPage(1);
            })
            .catch(err => console.error("Erreur de chargement :", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        const result = data.filter(a =>
            (a.nom || "").toLowerCase().includes(q) ||
            (a.prenom || "").toLowerCase().includes(q)
        );
        setFiltered(result);
        setCurrentPage(1);
    }, [search, data]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Voulez-vous vraiment supprimer cet auteur ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                apiService.delete(`/api/auteurs/${id}`)
                    .then(() => {
                        setData(prev => prev.filter(a => a.id !== id));
                        Swal.fire('Supprimé !', "L'auteur a été supprimé.", 'success');
                    })
                    .catch(() => Swal.fire('Erreur', "Impossible de supprimer cet auteur (vérifiez s'il est lié à des livres).", 'error'));
            }
        });
    };

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    const cardStyle = {
        background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
    };

    // Initials avatar helper
    const getInitials = (prenom, nom) => {
        return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
    };

    const avatarColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const getColor = (id) => avatarColors[(id || 0) % avatarColors.length];

    return (
        <div className="container-fluid px-4 py-4 mb-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px', fontSize: '1.6rem' }}>
                        <i className="bi bi-person-lines-fill me-2 text-primary"></i>Gestion des Auteurs
                    </h2>
                    <small style={{ opacity: 0.5 }}>Gérez les auteurs de la bibliothèque</small>
                </div>
                <div className="d-flex gap-2">
                    <JButton variant="light" icon="arrow-clockwise" onClick={loadData} loading={loading}>
                        Actualiser
                    </JButton>
                    <JButton variant="primary" icon="plus-lg" onClick={() => navigate('/admin/auteur/create')}>
                        Ajouter un Auteur
                    </JButton>
                </div>
            </div>

            {/* Card */}
            <div style={cardStyle} className="p-4">
                {/* Search + page size */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                    <div className="position-relative" style={{ maxWidth: 320, width: '100%' }}>
                        <i className="bi bi-search position-absolute" style={{ left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.45, fontSize: '0.9rem' }}></i>
                        <input
                            type="text"
                            className={`form-control rounded-pill ps-5 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-light border-0'}`}
                            placeholder="Rechercher un auteur..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ fontSize: '0.9rem' }}
                        />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <small className="text-muted fw-semibold">Afficher</small>
                        <select
                            className={`form-select form-select-sm rounded-3 ${isDark ? 'bg-dark text-white border-secondary' : 'border-0 bg-light'}`}
                            value={pageSize}
                            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            style={{ width: 'auto' }}
                        >
                            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <small className="text-muted fw-semibold">par page</small>
                    </div>
                </div>

                {/* Table */}
                {loading ? <Loader /> : (
                    <>
                        <div className="table-responsive">
                            <table className={`table align-middle mb-0 ${isDark ? 'table-dark' : ''}`}>
                                <thead>
                                    <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)', borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.15)'}` }}>
                                        <th className="border-0 py-3 fw-semibold ps-3" style={{ width: 60 }}>#</th>
                                        <th className="border-0 py-3 fw-semibold">Auteur</th>
                                        <th className="border-0 py-3 fw-semibold">Prénom</th>
                                        <th className="border-0 py-3 fw-semibold">Nom</th>
                                        <th className="border-0 py-3 fw-semibold text-end pe-3" style={{ width: 180 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-5 text-muted">
                                                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                                Aucun auteur trouvé.
                                            </td>
                                        </tr>
                                    ) : paginated.map((row, idx) => (
                                        <tr key={row.id}
                                            style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.03)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td className="border-0 py-3 ps-3">
                                                <span className="text-muted small fw-semibold">{(currentPage - 1) * pageSize + idx + 1}</span>
                                            </td>
                                            <td className="border-0 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                        style={{ width: 40, height: 40, background: `${getColor(row.id)}22`, color: getColor(row.id), fontWeight: 700, fontSize: '0.9rem' }}>
                                                        {getInitials(row.prenom, row.nom)}
                                                    </div>
                                                    <span className="fw-semibold" style={{ fontSize: '0.92rem' }}>
                                                        {row.prenom} {row.nom}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="border-0 py-3">
                                                <span className="text-muted">{row.prenom || '—'}</span>
                                            </td>
                                            <td className="border-0 py-3">
                                                <span className="text-muted">{row.nom || '—'}</span>
                                            </td>
                                            <td className="border-0 py-3 pe-3">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    <button
                                                        className="btn btn-sm rounded-3 d-flex align-items-center gap-1"
                                                        style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                                                        onClick={() => navigate('/admin/auteur/edit/' + row.id)}
                                                    >
                                                        <i className="bi bi-pencil-square"></i> Modifier
                                                    </button>
                                                    <button
                                                        className="btn btn-sm rounded-3 d-flex align-items-center gap-1"
                                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                                                        onClick={() => handleDelete(row.id)}
                                                    >
                                                        <i className="bi bi-trash"></i> Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="d-flex align-items-center justify-content-between mt-4 flex-wrap gap-3">
                            <small className="text-muted">
                                Affichage de <strong>{filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> à <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> sur <strong>{filtered.length}</strong> auteurs
                            </small>
                            {totalPages > 1 && (
                                <nav>
                                    <ul className="pagination pagination-sm mb-0 gap-1">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link rounded-3 border-0"
                                                style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#333' }}
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                        </li>
                                        {getPageNumbers().map((page, i) => (
                                            <li key={i} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link rounded-3 border-0 fw-semibold"
                                                    style={page === currentPage
                                                        ? { background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', minWidth: 36 }
                                                        : { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#ccc' : '#555', minWidth: 36 }
                                                    }
                                                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link rounded-3 border-0"
                                                style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#333' }}
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}