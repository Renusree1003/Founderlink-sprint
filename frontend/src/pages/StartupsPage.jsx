import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { getStartups, createStartup, updateStartup, deleteStartup, toMessage, getFileUrl } from "../lib/api";
import { Plus, Rocket, Edit2, Trash2, User as UserIcon, Filter, ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function StartupsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", domain: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingStartup, setEditingStartup] = useState(null);
  
  // Pagination and Filtering State
  const [pagination, setPagination] = useState({ totalPages: 0, totalElements: 0 });
  const page = parseInt(searchParams.get("page") || "0");
  const query = searchParams.get("query") || "";
  const domain = searchParams.get("domain") || "";
  const sortBy = searchParams.get("sortBy") || "id";
  const direction = searchParams.get("direction") || "DESC";

  const role = user?.role || "";
  const userId = Number(user?.sub || user?.userId || 0);

  const fetchAll = useCallback(() => {
    setLoading(true);
    getStartups({ query, domain, page, sortBy, direction })
      .then((data) => {
        setStartups(data.content || []);
        setPagination({ 
          totalPages: data.totalPages, 
          totalElements: data.totalElements 
        });
      })
      .catch(() => setStartups([]))
      .finally(() => setLoading(false));
  }, [query, domain, page, sortBy, direction]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset page if filters change
    if (key !== "page") newParams.delete("page");
    setSearchParams(newParams);
  };

  async function onSaveStartup(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const ownerName = profile?.name || `User #${userId}`;
    try {
      if (editingStartup) {
        await updateStartup(editingStartup.id, { ...form, ownerName });
      } else {
        await createStartup({ ...form, userId, ownerName });
      }
      setShowModal(false);
      setEditingStartup(null);
      setForm({ title: "", description: "", domain: "" });
      fetchAll();
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function onEdit(e, startup) {
    e.preventDefault();
    e.stopPropagation();
    setEditingStartup(startup);
    setForm({ title: startup.title, description: startup.description, domain: startup.domain });
    setShowModal(true);
  }

  async function onDelete(e, id) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this startup?")) return;
    try {
      await deleteStartup(id);
      fetchAll();
    } catch (err) {
      alert(toMessage(err));
    }
  }

  return (
    <Layout title="Startups">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Startup Directory</h2>
          <p>Browse and manage all startups on the platform</p>
        </div>
        {(role === "FOUNDER" || role === "ADMIN") && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create Startup
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div className="filter-group main-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search startups..." 
            value={query}
            onChange={(e) => updateParam("query", e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={16} />
          <select value={domain} onChange={(e) => updateParam("domain", e.target.value)}>
            <option value="">All Domains</option>
            <option value="FinTech">FinTech</option>
            <option value="HealthTech">HealthTech</option>
            <option value="SaaS">SaaS</option>
            <option value="AI">AI/ML</option>
            <option value="EdTech">EdTech</option>
          </select>
        </div>

        <div className="filter-group">
          <select value={`${sortBy}-${direction}`} onChange={(e) => {
            const [field, dir] = e.target.value.split("-");
            updateParam("sortBy", field);
            updateParam("direction", dir);
          }}>
            <option value="id-DESC">Newest First</option>
            <option value="id-ASC">Oldest First</option>
            <option value="title-ASC">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {query && (
        <div className="search-status">
          Showing results for "<strong>{query}</strong>" in <strong>{domain || "All Domains"}</strong>
          <button className="btn-link" onClick={() => { setSearchParams({}); }}>Clear all filters</button>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : startups.length === 0 ? (
        <EmptyState icon={Rocket} title="No Startups Yet" subtitle="Be the first to create a startup on the platform.">
          {(role === "FOUNDER" || role === "ADMIN") && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create Startup
            </button>
          )}
        </EmptyState>
      ) : (
        <div className="grid-3">
          {startups.map((s) => (
            <Link to={`/startups/${s.id}`} key={s.id} className="startup-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="startup-card-logo">
                {s.logoUrl ? (
                  <img src={getFileUrl(s.logoUrl)} alt={s.title + " logo"} className="startup-logo-thumb" />
                ) : (
                  <div className="startup-logo-placeholder"><Rocket size={28} /></div>
                )}
              </div>
              <div className="startup-card-header">
                <h3>{s.title || "Untitled"}</h3>
                <span className={`badge ${s.status === "ACCEPTED" ? "badge-success" : s.status === "PENDING" ? "badge-pending" : "badge-warning"}`}>
                  {s.status || "PENDING"}
                </span>
              </div>
              
              <p>{s.description || "No description provided."}</p>
              
              <div className="startup-meta">
                <div className="startup-meta-row">
                  <div className="startup-tags">
                    {s.domain && <span className="startup-tag">{s.domain}</span>}
                  </div>
                  <span className="startup-owner">
                    <UserIcon size={14} /> {s.ownerName || `User #${s.userId}`}
                  </span>
                </div>
                
                {(s.userId === userId || role === "ADMIN") && (
                  <div className="startup-meta-row">
                    <div className="owner-indicator">
                      <Rocket size={12} /> {s.userId === userId ? "Owner" : "Actions"}
                    </div>
                    <div className="startup-actions">
                      {role === "ADMIN" && s.status === "PENDING" && (
                        <>
                          <button className="btn btn-sm" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "var(--status-success)", border: "1px solid rgba(16,185,129,0.2)" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateStartup(s.id, { ...s, status: "ACCEPTED" }).then(fetchAll); }} title="Approve">
                            Approve
                          </button>
                          <button className="btn btn-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--status-danger)", border: "1px solid rgba(239,68,68,0.2)" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateStartup(s.id, { ...s, status: "REJECTED" }).then(fetchAll); }} title="Reject">
                            Reject
                          </button>
                        </>
                      )}
                      <button className="btn-action" onClick={(e) => onEdit(e, s)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-action delete" onClick={(e) => onDelete(e, s.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-ghost" 
            disabled={page === 0}
            onClick={() => updateParam("page", page - 1)}
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          <div className="page-info">
            Page {page + 1} of {pagination.totalPages}
          </div>
          
          <button 
            className="btn btn-ghost" 
            disabled={page >= pagination.totalPages - 1}
            onClick={() => updateParam("page", page + 1)}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

      {showModal && (
        <Modal title={editingStartup ? "Edit Startup" : "Create Startup"} onClose={() => { setShowModal(false); setEditingStartup(null); }}>
          <form onSubmit={onSaveStartup}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Domain</label>
                <input className="form-input" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="e.g. FinTech, HealthTech" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {error && <p className="error-msg">{error}</p>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingStartup(null); }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingStartup ? "Update Startup" : "Create Startup"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
