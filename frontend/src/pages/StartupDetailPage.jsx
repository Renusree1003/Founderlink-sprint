import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import {
  getStartupById, getTeamByStartup, getInvestmentsByStartup,
  inviteTeamMember, createInvestment, toMessage,
  uploadStartupLogo, uploadPitchDeck, getFileUrl,
  createStripeSession
} from "../lib/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, HandCoins, UserPlus, DollarSign, MessageCircle, Upload, FileText, Image as ImageIcon } from "lucide-react";

export default function StartupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "";
  const userId = user?.sub || user?.userId;

  const [startup, setStartup] = useState(null);
  const [team, setTeam] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [tab, setTab] = useState("team");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showInvite, setShowInvite] = useState(false);
  const [showInvest, setShowInvest] = useState(false);
  const [inviteForm, setInviteForm] = useState({ userId: "", role: "COFOUNDER" });
  const [investForm, setInvestForm] = useState({ amount: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // File upload state
  const [uploading, setUploading] = useState("");
  const logoInputRef = useRef(null);
  const deckInputRef = useRef(null);

  useEffect(() => { fetchAll(); }, [id]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [s, t, inv] = await Promise.allSettled([
        getStartupById(id),
        getTeamByStartup(id),
        getInvestmentsByStartup(id)
      ]);
      if (s.status === "fulfilled") setStartup(s.value);
      setTeam(t.status === "fulfilled" && Array.isArray(t.value) ? t.value : []);
      setInvestments(inv.status === "fulfilled" && Array.isArray(inv.value) ? inv.value : []);
    } finally { setLoading(false); }
  }

  async function onInvite(e) {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await inviteTeamMember({ startupId: Number(id), userId: Number(inviteForm.userId), role: inviteForm.role });
      setShowInvite(false);
      setInviteForm({ userId: "", role: "COFOUNDER" });
      fetchAll();
    } catch (err) { setMsg(toMessage(err)); }
    finally { setSaving(false); }
  }

  async function onInvest(e) {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const { sessionUrl } = await createStripeSession({ 
        startupId: Number(id), 
        investorId: Number(userId), 
        amount: Number(investForm.amount) 
      });
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error("Could not create payment session");
      }
    } catch (err) { setMsg(toMessage(err)); }
    finally { setSaving(false); }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("logo");
    setMsg("");
    try {
      const result = await uploadStartupLogo(id, file);
      setStartup(prev => ({ ...prev, logoUrl: result.logoUrl }));
    } catch (err) { setMsg(toMessage(err)); }
    finally { setUploading(""); }
  }

  async function handleDeckUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("deck");
    setMsg("");
    try {
      const result = await uploadPitchDeck(id, file);
      setStartup(prev => ({ ...prev, pitchDeckUrl: result.pitchDeckUrl }));
    } catch (err) { setMsg(toMessage(err)); }
    finally { setUploading(""); }
  }

  const canEdit = role === "FOUNDER" || role === "ADMIN";

  if (loading) return <Layout title="Startup"><div className="loading-center"><div className="spinner" /></div></Layout>;
  if (!startup) return <Layout title="Startup"><p style={{ color: "var(--text-muted)" }}>Startup not found.</p></Layout>;

  return (
    <Layout title={startup.title || "Startup Detail"}>
      <Link to="/startups" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "1rem", fontSize: "0.85rem" }}>
        <ArrowLeft size={16} /> Back to Startups
      </Link>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-top">
          {/* Logo */}
          <div className="detail-logo-area">
            {startup.logoUrl ? (
              <img src={getFileUrl(startup.logoUrl)} alt={startup.title + " logo"} className="detail-logo" />
            ) : (
              <div className="detail-logo-placeholder"><ImageIcon size={36} /></div>
            )}
            {canEdit && (
              <>
                <button
                  className="btn btn-ghost btn-xs upload-logo-btn"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading === "logo"}
                >
                  {uploading === "logo" ? <><div className="spinner-sm" /> Uploading…</> : <><Upload size={14} /> {startup.logoUrl ? "Change Logo" : "Upload Logo"}</>}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} hidden />
              </>
            )}
          </div>

          {/* Title & Description */}
          <div className="detail-info">
            <h1>{startup.title}</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>{startup.description || "No description"}</p>
            <div className="detail-meta">
              {startup.domain && <span className="badge badge-info">🏷 {startup.domain}</span>}
              <span className={`badge ${startup.status === "ACCEPTED" ? "badge-success" : "badge-pending"}`}>{startup.status}</span>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Created by {startup.ownerName || `User #${startup.userId}`}</span>
              {userId !== startup.userId && (
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => navigate("/messages", { state: { targetUserId: startup.userId } })}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: "0.5rem", padding: "2px 8px", fontSize: "0.75rem" }}
                >
                  <MessageCircle size={14} /> Message Founder
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pitch Deck Section */}
        <div className="pitch-deck-section">
          {startup.pitchDeckUrl ? (
            <a
              href={getFileUrl(startup.pitchDeckUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm pitch-deck-btn"
            >
              <FileText size={16} /> Download Pitch Deck
            </a>
          ) : (
            <span className="pitch-deck-empty"><FileText size={14} /> No pitch deck uploaded</span>
          )}
          {canEdit && (
            <>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => deckInputRef.current?.click()}
                disabled={uploading === "deck"}
              >
                {uploading === "deck" ? <><div className="spinner-sm" /> Uploading…</> : <><Upload size={14} /> {startup.pitchDeckUrl ? "Replace Deck" : "Upload Deck (PDF)"}</>}
              </button>
              <input ref={deckInputRef} type="file" accept="application/pdf" onChange={handleDeckUpload} hidden />
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn${tab === "team" ? " active" : ""}`} onClick={() => setTab("team")}>
          <Users size={16} style={{ marginRight: 6 }} /> Team ({team.length})
        </button>
        <button className={`tab-btn${tab === "investments" ? " active" : ""}`} onClick={() => setTab("investments")}>
          <HandCoins size={16} style={{ marginRight: 6 }} /> Investments ({investments.length})
        </button>
      </div>

      {msg && <p className="error-msg" style={{ marginBottom: "1rem" }}>{msg}</p>}

      {/* Team Tab */}
      {tab === "team" && (
        <div>
          {(role === "FOUNDER" || role === "ADMIN") && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(true)} style={{ marginBottom: "1rem" }}>
              <UserPlus size={16} /> Invite Member
            </button>
          )}
          {team.length === 0 ? (
            <EmptyState icon={Users} title="No Team Members" subtitle="Invite co-founders to build your team." />
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="data-table">
                <thead><tr><th>ID</th><th>User ID</th><th>Role</th></tr></thead>
                <tbody>
                  {team.map((t) => (
                    <tr key={t.id}>
                      <td>#{t.id}</td>
                      <td>User #{t.userId}</td>
                      <td><span className={`badge ${t.role === "FOUNDER" ? "badge-success" : "badge-pending"}`}>{t.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Investments Tab */}
      {tab === "investments" && (
        <div>
          {(role === "INVESTOR" || role === "ADMIN") && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowInvest(true)} style={{ marginBottom: "1rem" }}>
              <DollarSign size={16} /> Invest
            </button>
          )}
          {investments.length === 0 ? (
            <EmptyState icon={HandCoins} title="No Investments" subtitle="This startup hasn't received any investments yet." />
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="data-table">
                <thead><tr><th>ID</th><th>Investor</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {investments.map((inv) => (
                    <tr key={inv.id}>
                      <td>#{inv.id}</td>
                      <td>User #{inv.investorId}</td>
                      <td style={{ fontWeight: 600 }}>₹{inv.amount?.toLocaleString("en-IN")}</td>
                      <td><span className={`badge ${inv.status === "APPROVED" ? "badge-success" : "badge-pending"}`}>{inv.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <Modal title="Invite Team Member" onClose={() => setShowInvite(false)}>
          <form onSubmit={onInvite}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">User ID</label>
                <input className="form-input" type="number" value={inviteForm.userId} onChange={(e) => setInviteForm({ ...inviteForm, userId: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                  <option value="COFOUNDER">Co-Founder</option>
                  <option value="FOUNDER">Founder</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Inviting…" : "Send Invite"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invest Modal */}
      {showInvest && (
        <Modal title="Make Investment" onClose={() => setShowInvest(false)}>
          <form onSubmit={onInvest}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input className="form-input" type="number" min="1" value={investForm.amount} onChange={(e) => setInvestForm({ ...investForm, amount: e.target.value })} required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowInvest(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Investing…" : "Confirm Investment"}</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
