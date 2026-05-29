import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiService";
import JButton from "../../components/JButton";
import Loader from "../../components/Loader";
import Swal from 'sweetalert2';
import { ThemeContext } from "../../context/ThemeContext";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function LivreIndex() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const loadData = () => {
    setLoading(true);
    apiService.get('/api/livres')
      .then(res => {
        setData(res.data);
        setFiltered(res.data);
        setCurrentPage(1);
      })
      .catch(err => console.error("Erreur chargement:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const result = data.filter(l =>
      (l.titre || "").toLowerCase().includes(q) ||
      (l.nomAuteur || l.auteurNomComplet || "").toLowerCase().includes(q) ||
      (l.categories || []).join(' ').toLowerCase().includes(q)
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, data]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous vraiment supprimer ce livre ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        apiService.delete(`/api/livres/${id}`)
          .then(() => {
            setData(prev => prev.filter(item => item.id !== id));
            Swal.fire('Supprimé !', 'Le livre a été supprimé.', 'success');
          })
          .catch(() => Swal.fire('Erreur', "Impossible de supprimer ce livre.", 'error'));
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

  return (
    <div className="container-fluid px-4 py-4 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px', fontSize: '1.6rem' }}>
            <i className="bi bi-book-half me-2 text-primary"></i>Catalogue des Livres
          </h2>
          <small style={{ opacity: 0.5 }}>Gérez le catalogue de la bibliothèque</small>
        </div>
        <div className="d-flex gap-2">
          <JButton variant="light" icon="arrow-clockwise" onClick={loadData} loading={loading}>
            Actualiser
          </JButton>
          <JButton variant="primary" icon="plus-lg" onClick={() => navigate('/admin/livre/create')}>
            Nouveau Livre
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
              placeholder="Rechercher un livre, auteur..."
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
                    <th className="border-0 py-3 fw-semibold ps-3" style={{ width: 70 }}>Couv.</th>
                    <th className="border-0 py-3 fw-semibold">Titre</th>
                    <th className="border-0 py-3 fw-semibold">Auteur</th>
                    <th className="border-0 py-3 fw-semibold">Catégorie</th>
                    <th className="border-0 py-3 fw-semibold text-center" style={{ width: 120 }}>Prix (DH)</th>
                    <th className="border-0 py-3 fw-semibold text-center" style={{ width: 130 }}>Stock</th>
                    <th className="border-0 py-3 fw-semibold text-end pe-3" style={{ width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                        Aucun livre trouvé.
                      </td>
                    </tr>
                  ) : paginated.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="border-0 py-2 ps-3">
                        <img
                          src={row.imageUrl || 'https://placehold.jp/24/cccccc/ffffff/40x60.png?text=No+Cover'}
                          alt={row.titre}
                          className="rounded-2 shadow-sm"
                          style={{ width: 36, height: 52, objectFit: 'cover' }}
                        />
                      </td>
                      <td className="border-0 py-2">
                        <span className="fw-semibold" style={{ fontSize: '0.92rem' }}>{row.titre}</span>
                      </td>
                      <td className="border-0 py-2">
                        <span className="text-muted small">
                          {row.nomAuteur || row.auteurNomComplet || (row.auteur ? `${row.auteur.prenom || ''} ${row.auteur.nom || ''}`.trim() : 'Inconnu')}
                        </span>
                      </td>
                      <td className="border-0 py-2">
                        {row.categories && row.categories.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {row.categories.map((cat, i) => (
                              <span key={i} className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', fontSize: '0.72rem', fontWeight: 600 }}>
                                {cat}
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-muted small">—</span>}
                      </td>
                      <td className="border-0 py-2 text-center">
                        <span className="fw-bold" style={{ color: '#6366f1' }}>{row.prix || '—'}</span>
                      </td>
                      <td className="border-0 py-2 text-center">
                        <span className={`badge rounded-pill px-3 py-2 ${row.quantite > 0 ? 'bg-success' : 'bg-danger'}`}
                          style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                          {row.quantite > 0 ? `${row.quantite} dispo.` : 'Indisponible'}
                        </span>
                      </td>
                      <td className="border-0 py-2 pe-3">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm rounded-3 d-flex align-items-center gap-1"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                            onClick={() => navigate(`/admin/livre/edit/${row.id}`)}
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
                Affichage de <strong>{filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> à <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> sur <strong>{filtered.length}</strong> livres
              </small>
              {totalPages > 1 && (
                <nav>
                  <ul className="pagination pagination-sm mb-0 gap-1">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link rounded-3 border-0" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#333' }} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
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
                      <button className="page-link rounded-3 border-0" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDark ? '#fff' : '#333' }} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
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